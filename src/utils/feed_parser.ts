import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';

export interface ParsedFeedItem {
  title: string;
  link: string;
  price: number;
  stock: number;
  ean: string | null;
}

interface StoreGameInsertRow {
  store_id: string;
  bgg_id: number;
  store_product_url: string;
  price: number;
  stock: number;
  edition_language: string;
  last_updated_at: string;
}

export function parseGoogleFeed(xmlContent: string): ParsedFeedItem[] {
  const items: ParsedFeedItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xmlContent)) !== null) {
    const itemBlock = match[1];

    const getTagValue = (tag: string) => {
      const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`);
      const m = regex.exec(itemBlock);
      return m ? m[1].trim() : null;
    };

    const title = getTagValue('title') || '';
    const link = getTagValue('link') || '';

    const rawPrice = getTagValue('g:price') || '';
    const price = parseFloat(rawPrice.replace(/[^\d.]/g, '')) || 0;

    const availability = getTagValue('g:availability') || 'out of stock';
    const stock = availability.toLowerCase().includes('in stock') ? 1 : 0;

    const ean = getTagValue('g:gtin') || null;

    items.push({ title, link, price, stock, ean });
  }

  return items;
}

function detectLanguage(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('portug')) return 'pt';
  if (lower.includes('english') || lower.includes('ingl')) return 'en';
  return 'es'; // default locale matching Iberian/LATAM
}

interface QueueInsertRow {
  store_id: string;
  ean: string | null;
  title: string;
  store_product_url: string;
  status: string;
  created_at: string;
}

export async function syncStoreCatalog(storeId: string, items: ParsedFeedItem[]) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const stats = { processed: 0, matched: 0, unmatched: 0, queued: 0 };
  const buffer: StoreGameInsertRow[] = [];
  const queueBuffer: QueueInsertRow[] = [];
  const BATCH_LIMIT = 500;

  for (const item of items) {
    stats.processed++;
    let matchedGame = null;

    // 1. Match by EAN barcode first
    if (item.ean) {
      const { data, error } = await supabase
        .from('bgg_games_cache')
        .select('bgg_id, name')
        .eq('ean', item.ean)
        .single();
      
      if (data && !error) {
        matchedGame = data;
      }
    }

    // 2. Fallback to case-insensitive name match
    if (!matchedGame && item.title) {
      // Clean title from common suffixes or editions details
      const cleanTitle = item.title.toLowerCase().split('(')[0].split(' - ')[0].trim();
      const { data, error } = await supabase
        .from('bgg_games_cache')
        .select('bgg_id, name')
        .ilike('name', `%${cleanTitle}%`)
        .limit(1);

      if (data && data.length > 0 && !error) {
        matchedGame = data[0];
      }
    }

    if (matchedGame) {
      stats.matched++;
      buffer.push({
        store_id: storeId,
        bgg_id: matchedGame.bgg_id,
        store_product_url: item.link,
        price: item.price,
        stock: item.stock,
        edition_language: detectLanguage(item.title),
        last_updated_at: new Date().toISOString(),
      });
    } else {
      stats.unmatched++;
      stats.queued++;
      queueBuffer.push({
        store_id: storeId,
        ean: item.ean || null,
        title: item.title || 'Unknown Title',
        store_product_url: item.link || '',
        status: 'pending',
        created_at: new Date().toISOString(),
      });
    }

    // Upsert matched batch if threshold reached
    if (buffer.length >= BATCH_LIMIT) {
      const { error } = await supabase
        .from('store_games')
        .upsert([...buffer], { onConflict: 'store_id,bgg_id' });
      
      if (error) {
        console.error('[syncStoreCatalog] Batch upsert failed:', error.message);
      }
      buffer.length = 0; // Clear buffer
    }

    // Upsert unmapped queue batch if threshold reached
    if (queueBuffer.length >= BATCH_LIMIT) {
      const { error } = await supabase
        .from('bgg_metadata_queue')
        .upsert([...queueBuffer], { onConflict: 'store_id,store_product_url' });
      
      if (error) {
        console.error('[syncStoreCatalog] Queue batch upsert failed:', error.message);
      }
      queueBuffer.length = 0;
    }
  }

  // Upsert remaining matched buffer items
  if (buffer.length > 0) {
    const { error } = await supabase
      .from('store_games')
      .upsert([...buffer], { onConflict: 'store_id,bgg_id' });
    
    if (error) {
      console.error('[syncStoreCatalog] Final buffer upsert failed:', error.message);
    }
  }

  // Upsert remaining unmapped queue buffer items
  if (queueBuffer.length > 0) {
    const { error } = await supabase
      .from('bgg_metadata_queue')
      .upsert([...queueBuffer], { onConflict: 'store_id,store_product_url' });
    
    if (error) {
      console.error('[syncStoreCatalog] Final queue buffer upsert failed:', error.message);
    }
  }

  // Update store sync diagnostics stats
  await supabase
    .from('stores')
    .update({
      feed_status: 'success',
      feed_last_processed_count: stats.processed,
      feed_last_matched_count: stats.matched,
      feed_last_unmatched_count: stats.unmatched,
      last_updated_at: new Date().toISOString(),
    })
    .eq('id', storeId);

  return stats;
}
