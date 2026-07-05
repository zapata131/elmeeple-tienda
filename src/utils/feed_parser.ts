import { createClient } from '@supabase/supabase-js';
import { fetch as undiciFetch } from 'undici';

function getFetch(): typeof fetch {
  if (typeof globalThis.fetch !== 'undefined') {
    return globalThis.fetch;
  }
  if (typeof clearImmediate !== 'undefined') {
    return undiciFetch as unknown as typeof fetch;
  }
  return ((_url: string) => Promise.resolve({ ok: false, status: 500, text: () => Promise.resolve('') })) as unknown as typeof fetch;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';

export interface ParsedFeedItem {
  title: string;
  link: string;
  price: number;
  stock: number;
  ean: string | null;
  language?: string;
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

export function detectLanguage(title: string, contentBlock: string = ''): string {
  const getTagValue = (tagPattern: string) => {
    const regex = new RegExp(`<${tagPattern}[^>]*>([\\s\\S]*?)<\\/${tagPattern.split(' ')[0].replace(/[^a-zA-Z0-9:-]/g, '')}>`, 'i');
    const m = regex.exec(contentBlock);
    return m ? m[1].trim().toLowerCase() : '';
  };

  const explicitLang = getTagValue('g:language') || getTagValue('language') || '';
  if (explicitLang.includes('es') || explicitLang.includes('spa') || explicitLang.includes('espa')) return 'es';
  if (explicitLang.includes('en') || explicitLang.includes('eng') || explicitLang.includes('ingl')) return 'en';
  if (explicitLang.includes('de') || explicitLang.includes('ger') || explicitLang.includes('alem')) return 'de';
  if (explicitLang.includes('pt') || explicitLang.includes('por')) return 'pt';
  if (explicitLang.includes('fr') || explicitLang.includes('fre') || explicitLang.includes('fran')) return 'fr';
  if (explicitLang.includes('multi')) return 'multi';

  const combined = `${title} ${contentBlock}`.toLowerCase();
  if (combined.includes('multilingüe') || combined.includes('multilanguage') || combined.includes('idioma independiente') || combined.includes('independiente del idioma')) return 'multi';
  if (combined.includes('edición en inglés') || combined.includes('edicion en ingles') || combined.includes('english edition') || (combined.includes('inglés') && !combined.includes('español'))) return 'en';
  if (combined.includes('edición en alemán') || combined.includes('german edition')) return 'de';
  if (combined.includes('portug')) return 'pt';
  if (combined.includes('edición en español') || combined.includes('edicion en espanol') || combined.includes('spanish edition') || combined.includes('en español')) return 'es';

  return 'es'; // default locale matching Iberian/LATAM catalog
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

    const getPriceValue = () => {
      const sPriceMatch = /<s:price[^>]*>([0-9.,]+)<\/s:price>/i.exec(block);
      if (sPriceMatch) return sPriceMatch[1];
      const gPriceMatch = /<g:price[^>]*>([0-9.,]+)/i.exec(block);
      if (gPriceMatch) return gPriceMatch[1];
      const priceMatch = /<price[^>]*>([0-9.,]+)/i.exec(block);
      if (priceMatch) return priceMatch[1];
      const fallbackMatch = /currency=["'][A-Z]{3}["'][^>]*>([0-9.,]+)/i.exec(block);
      return fallbackMatch ? fallbackMatch[1] : '';
    };

    const rawPrice = getPriceValue();
    const price = parseFloat(rawPrice.replace(/,/g, '')) || 0;

    const availability = getTagValue('g:availability') || block;
    const stock = availability.toLowerCase().includes('out of stock') || availability.toLowerCase().includes('agotado') ? 0 : 1;
    const ean = getTagValue('g:gtin') || getTagValue('s:sku') || null;
    const language = detectLanguage(title, block);

    if (title && price > 0 && isLikelyBoardGame(title, block)) {
      items.push({ title, link, price, stock, ean, language });
    }
  }

  return items;
}

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Accept': 'application/atom+xml,application/xml,text/xml;q=0.9,text/html;q=0.8,*/*;q=0.7',
  'Accept-Language': 'es-MX,es;q=0.9,en-US;q=0.8,en;q=0.7',
  'Cache-Control': 'no-cache',
};

export async function fetchFullStoreFeed(feedUrl: string): Promise<ParsedFeedItem[]> {
  const allItems: ParsedFeedItem[] = [];

  if (feedUrl.includes('.atom')) {
    const baseUrl = feedUrl.split('?')[0];
    let page = 1;
    const seenLinks = new Set<string>();
    const MAX_SAFETY_PAGES = 500; // Covers 25,000+ items per store without infinite loop risks

    while (page <= MAX_SAFETY_PAGES) {
      try {
        const pageUrl = `${baseUrl}?page=${page}`;
        const res = await getFetch()(pageUrl, { headers: BROWSER_HEADERS });
        if (!res.ok) break;
        const xml = await res.text();
        const items = parseGoogleFeed(xml);
        if (items.length === 0) break;

        let newCount = 0;
        for (const item of items) {
          if (!seenLinks.has(item.link)) {
            seenLinks.add(item.link);
            allItems.push(item);
            newCount++;
          }
        }

        if (newCount === 0) {
          // No new items discovered on this page; store has finished its paginated catalog
          break;
        }

        page++;
        const delayMs = (process.env.NODE_ENV === 'test' || process.env.FAST_SEED === 'true') ? 0 : 500;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } catch (err) {
        console.warn(`[Feed Fetcher] Page ${page} failed for ${baseUrl}:`, err);
        break;
      }
    }
    return allItems;
  }

  const res = await getFetch()(feedUrl, { headers: BROWSER_HEADERS });
  if (res.ok) {
    const xml = await res.text();
    return parseGoogleFeed(xml);
  }
  return [];
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
  const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
  const supabase = createClient(supabaseUrl, adminKey);
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

    // 3. Auto-create game page entry in bgg_games_cache for unique unmatched XML feed items AND enqueue for BGG metadata enrichment
    let isAutoCreated = false;
    if (!matchedGame && item.title) {
      const cleanTitle = item.title.replace(/\s*\([^)]*\)/g, '').split(' - ')[0].trim();
      if (cleanTitle.length >= 2) {
        const normalizedForHash = cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
        let hash = 0;
        for (let i = 0; i < normalizedForHash.length; i++) {
          hash = (hash << 5) - hash + normalizedForHash.charCodeAt(i);
          hash |= 0;
        }
        const generatedId = 8000000 + Math.abs(hash) % 1999999;

        const newGameRow = {
          bgg_id: generatedId,
          name: cleanTitle,
          thumbnail: '',
          last_updated_at: new Date().toISOString(),
        };

        await supabase.from('bgg_games_cache').upsert(newGameRow, { onConflict: 'bgg_id' });
        matchedGame = newGameRow;
        isAutoCreated = true;
      }
    }

    if (matchedGame) {
      if (!isAutoCreated) {
        stats.matched++;
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

      buffer.push({
        store_id: storeId,
        bgg_id: matchedGame.bgg_id,
        store_product_url: item.link,
        price: item.price,
        stock: item.stock,
        edition_language: item.language || detectLanguage(item.title),
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
      const dedupedBuffer = Array.from(new Map(buffer.map((item) => [`${item.store_id}_${item.bgg_id}`, item])).values());
      const { error } = await supabase
        .from('store_games')
        .upsert(dedupedBuffer, { onConflict: 'store_id,bgg_id' });
      
      if (error) {
        console.error('[syncStoreCatalog] Batch upsert failed:', error.message);
      }
      buffer.length = 0; // Clear buffer
    }

    // Upsert unmapped queue batch if threshold reached
    if (queueBuffer.length >= BATCH_LIMIT) {
      const dedupedQueue = Array.from(new Map(queueBuffer.map((item) => [`${item.store_id}_${item.store_product_url}`, item])).values());
      const { error } = await supabase
        .from('bgg_metadata_queue')
        .upsert(dedupedQueue, { onConflict: 'store_id,store_product_url' });
      
      if (error) {
        console.error('[syncStoreCatalog] Queue batch upsert failed:', error.message);
      }
      queueBuffer.length = 0;
    }
  }

  // Upsert remaining matched buffer items
  if (buffer.length > 0) {
    const dedupedBuffer = Array.from(new Map(buffer.map((item) => [`${item.store_id}_${item.bgg_id}`, item])).values());
    const { error } = await supabase
      .from('store_games')
      .upsert(dedupedBuffer, { onConflict: 'store_id,bgg_id' });
    
    if (error) {
      console.error('[syncStoreCatalog] Final buffer upsert failed:', error.message);
    }
  }

  // Upsert remaining unmapped queue buffer items
  if (queueBuffer.length > 0) {
    const dedupedQueue = Array.from(new Map(queueBuffer.map((item) => [`${item.store_id}_${item.store_product_url}`, item])).values());
    const { error } = await supabase
      .from('bgg_metadata_queue')
      .upsert(dedupedQueue, { onConflict: 'store_id,store_product_url' });
    
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
