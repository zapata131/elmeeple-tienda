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

export function isLikelyBoardGame(title: string, contentBlock: string = ''): boolean {
  const lower = `${title} ${contentBlock}`.toLowerCase();

  const NON_BOARD_GAME_KEYWORDS = [
    'funda', 'sleeves', 'micas', 'protector de cartas', 'perfect fit',
    'pintura', 'vallejo', 'citadel', 'army painter', 'pincel', 'aerógrafo', 'primer', 'barniz', 'diluyente',
    'rompecabezas', 'puzzle',
    'booster', 'sobre mtg', 'sobre pokémon', 'sobre lorcana', 'display de sobres', 'caja de sobres', 'tcg sobre',
    'set de dados', 'torre de dados', 'dados d&d', 'dado d20',
    'tapete', 'playmat', 'inserto folded space', 'organizador de madera', 'token de acrílico',
  ];

  for (const kw of NON_BOARD_GAME_KEYWORDS) {
    if (lower.includes(kw)) {
      return false;
    }
  }
  return true;
}

export function parseGoogleFeed(xmlContent: string): ParsedFeedItem[] {
  const items: ParsedFeedItem[] = [];
  const entryRegex = /<(?:item|entry)[^>]*>([\s\S]*?)<\/(?:item|entry)>/gi;
  let match;

  while ((match = entryRegex.exec(xmlContent)) !== null) {
    const block = match[1];

    const getTagValue = (tagPattern: string) => {
      const regex = new RegExp(`<${tagPattern}[^>]*>([\\s\\S]*?)<\\/${tagPattern.split(' ')[0].replace(/[^a-zA-Z0-9:-]/g, '')}>`, 'i');
      const m = regex.exec(block);
      return m ? m[1].trim() : null;
    };

    const title = getTagValue('title') || '';

    let link = getTagValue('link') || '';
    if (!link) {
      const linkMatch = /<link[^>]*?href=["']([^"']+)["']/i.exec(block);
      if (linkMatch) link = linkMatch[1];
    }

    let rawPrice = getTagValue('s:price') || getTagValue('g:price') || getTagValue('price') || '';
    if (!rawPrice) {
      const priceMatch = /price[^0-9]*([0-9]+(?:\.[0-9]{2})?)/i.exec(block);
      if (priceMatch) rawPrice = priceMatch[1];
    }
    const price = parseFloat(rawPrice.replace(/[^\d.]/g, '')) || 0;

    const availability = getTagValue('g:availability') || block;
    const stock = availability.toLowerCase().includes('out of stock') || availability.toLowerCase().includes('agotado') ? 0 : 1;
    const ean = getTagValue('g:gtin') || getTagValue('s:sku') || null;

    if (title && price > 0 && isLikelyBoardGame(title, block)) {
      items.push({ title, link, price, stock, ean });
    }
  }

  return items;
}

export async function fetchFullStoreFeed(feedUrl: string): Promise<ParsedFeedItem[]> {
  const allItems: ParsedFeedItem[] = [];
  
  if (feedUrl.includes('.atom')) {
    const baseUrl = feedUrl.split('?')[0];
    for (let page = 1; page <= 15; page++) {
      try {
        const pageUrl = `${baseUrl}?page=${page}`;
        const res = await fetch(pageUrl, { headers: { 'User-Agent': 'MeeplePreciosBot/1.0' } });
        if (!res.ok) break;
        const xml = await res.text();
        const items = parseGoogleFeed(xml);
        if (items.length === 0) break;
        allItems.push(...items);
        await new Promise((resolve) => setTimeout(resolve, 1500)); // 1.5s delay to respect Cloudflare rate limits
      } catch (err) {
        console.warn(`[Feed Fetcher] Page ${page} failed for ${baseUrl}:`, err);
        break;
      }
    }
    return allItems;
  }

  const res = await fetch(feedUrl, { headers: { 'User-Agent': 'MeeplePreciosBot/1.0' } });
  if (res.ok) {
    const xml = await res.text();
    return parseGoogleFeed(xml);
  }
  return [];
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
