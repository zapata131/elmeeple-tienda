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

export function cleanBoardGameTitle(title: string): string {
  let clean = title;
  
  // Remove brackets content
  clean = clean.replace(/\s*\([^)]*\)/g, '');
  
  // Remove common store/retailer suffixes and publisher labels
  const SUFFIXES_TO_REMOVE = [
    'en español', 'en espanol', 'español', 'espanol',
    'en inglés', 'en ingles', 'inglés', 'ingles', 'english edition',
    'juego de mesa', 'juego de cartas', 'juego',
    'devir', 'asmodee', 'maldito games', 'ravensburger', 'hasbro'
  ];
  
  for (const suffix of SUFFIXES_TO_REMOVE) {
    const regex = new RegExp(`\\b${suffix}\\b`, 'gi');
    clean = clean.replace(regex, '').trim();
  }
  
  // Clean up extra spaces, hyphens, and commas at ends
  clean = clean.replace(/^[,\s-]+|[,\s-]+$/g, '');
  return clean.replace(/\s+/g, ' ').trim();
}

export function isLikelyBoardGame(title: string, contentBlock: string = '', productType: string = ''): boolean {
  const combinedType = `${productType} ${contentBlock}`.toLowerCase();
  
  // Exclude non-boardgame categories in Atom/XML feeds unless explicitly marked as a board game
  const excludedTypes = ['figura', 'figuras', 'maqueta', 'ropa', 'merchandising', 'peluche', 'funko'];
  for (const type of excludedTypes) {
    if (combinedType.includes(type) && !combinedType.includes('juego de mesa') && !combinedType.includes('board game')) {
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
    const productType = getTagValue('s:type') || getTagValue('g:product_type') || getTagValue('category') || '';

    if (title && price > 0 && isLikelyBoardGame(title, block, productType)) {
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

  if (feedUrl.includes('products.json')) {
    const baseUrl = feedUrl.split('?')[0];
    let page = 1;
    const seenLinks = new Set<string>();
    const MAX_SAFETY_PAGES = 60; // Up to 15,000 products per store

    while (page <= MAX_SAFETY_PAGES) {
      try {
        const paginatedUrl = `${baseUrl}?limit=250&page=${page}`;
        const res = await getFetch()(paginatedUrl, { headers: BROWSER_HEADERS });
        if (!res.ok) break;
        
        interface ShopifyProductsResponse {
          products: Array<{
            id: number;
            title: string;
            handle: string;
            body_html?: string;
            variants?: Array<{
              id: number;
              title: string;
              price: string;
              available: boolean;
              sku?: string | null;
            }>;
          }>;
        }

        const data = await res.json() as ShopifyProductsResponse;
        const products = data.products || [];
        if (products.length === 0) break;

        let newCount = 0;
        for (const prod of products) {
          const cleanBase = baseUrl.replace('/products.json', '');
          const link = `${cleanBase}/products/${prod.handle}`;
          
          if (!seenLinks.has(link)) {
            seenLinks.add(link);
            
            for (const variant of prod.variants || []) {
              const price = parseFloat(variant.price) || 0;
              const stock = variant.available ? 1 : 0;
              const ean = variant.sku || null;
              const title = variant.title && variant.title !== 'Default Title' 
                ? `${prod.title} (${variant.title})` 
                : prod.title;
              const description = prod.body_html || '';

              if (title && price > 0 && isLikelyBoardGame(title, description)) {
                allItems.push({
                  title,
                  link,
                  price,
                  stock,
                  ean,
                  language: detectLanguage(title, description),
                });
                newCount++;
              }
            }
          }
        }

        page++;
        
        const delayMs = (process.env.NODE_ENV === 'test' || process.env.FAST_SEED === 'true') ? 0 : 200;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } catch (err) {
        console.warn(`[Products JSON Fetcher] Page ${page} failed for ${baseUrl}:`, err);
        break;
      }
    }
    return allItems;
  }

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
  const newGamesToUpsert: Array<{ bgg_id: number; name: string; thumbnail: string; last_updated_at: string }> = [];
  const BATCH_LIMIT = 500;

  // Pre-load all cached games in memory for speedy matching without making thousands of remote queries
  // Limit to verified catalog games (bgg_id < 8,000,000) to avoid Supabase 1000 rows pagination limits
  const { data: cachedGames, error: cacheErr } = await supabase
    .from('bgg_games_cache')
    .select('bgg_id, name, ean')
    .lt('bgg_id', 8000000);
  
  if (cacheErr) {
    console.error('[syncStoreCatalog] Failed to pre-load games cache:', cacheErr.message);
  }
  const gamesList: Array<{ bgg_id: number; name: string; ean: string | null }> = cachedGames || [];
  const { data: baseStores } = await supabase.from('stores').select('*').eq('id', storeId);
  const baseStore = baseStores?.[0] || null;
  const { data: baseRates } = await supabase.from('shipping_rates').select('*').eq('store_id', storeId);
  const knownEditionStores = new Set<string>([storeId]);

  const EXCLUSION_EDITION_WORDS = [
    'expansion', 'expansión', 'exp', 'expa', 'ampliacion', 'ampliación', 'escenario', 'viaje', 'travel',
    'junior', 'duelo', 'duel', 'extension', 'extensión', 'pack', 'set', 'scenario',
    'plus', '3d', 'aniversario', 'anniversary', 'big box', 'bigbox', 'deluxe', 'especial', 'special',
    'cazadores', 'recolectores', 'constructores', 'catedrales', 'posadas', 'dragones', 'hadas', 'torre', 'abadía', 'abadias', 'niebla', 'barcos',
    'puzzle', 'rompecabezas',
    'nesting', 'nesting box', 'caja nido', 'organizer', 'organizador', 'inserto', 'insert', 'folded space',
    'box', 'caja', 'storage', 'caja organizadora', 'almacenamiento',
    'sleeves', 'micas', 'funda', 'fundas', 'playmat', 'play-mat', 'play mat', 'tapete',
    'monedas', 'coins', 'metal coins', 'tokens', 'fichas', 'dice', 'dados', 'torre de dados', 'dice tower',
    'eggs', 'huevos', 'stone', 'meeple', 'meeples', 'miniatures', 'miniaturas',
    'promo', 'promos', 'addon', 'add-on', 'upgrade', 'upgrade pack', 'artbook', 'art book', 'soundtrack', 'playera', 't-shirt', 'poster',
    'beetle', 'model', 'kit', 'figura', 'figure', 'toy', 'juguete', 'hot wheels', 'funko', 'gundam', 'gunpla', 'plamo', 'replica', 'réplica', 'statue', 'estatua', 'plush', 'peluche'
  ];

  for (const item of items) {
    stats.processed++;
    let matchedGame = null;

    // 1. Match by EAN barcode first
    if (item.ean) {
      matchedGame = gamesList.find((g) => g.ean === item.ean) || null;
    }

    // 2. Fallback to case-insensitive name match
    if (!matchedGame && item.title) {
      // Clean title from common suffixes or editions details
      const cleanTitle = cleanBoardGameTitle(item.title);
      matchedGame = gamesList.find((g) => g.name.toLowerCase() === cleanTitle.toLowerCase()) || null;
      if (!matchedGame) {
        const escapeReg = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        matchedGame = gamesList.find((g) => {
          const cacheName = g.name.toLowerCase();
          const cleanLower = cleanTitle.toLowerCase();
          
          let hasInclusion = false;
          try {
            const cacheReg = new RegExp(`\\b${escapeReg(cacheName)}\\b`, 'i');
            const cleanReg = new RegExp(`\\b${escapeReg(cleanLower)}\\b`, 'i');
            hasInclusion = cacheReg.test(cleanLower) || cleanReg.test(cacheName);
          } catch {
            hasInclusion = cacheName.includes(cleanLower) || cleanLower.includes(cacheName);
          }
          
          if (!hasInclusion) return false;

          for (const word of EXCLUSION_EDITION_WORDS) {
            const cleanHasWord = cleanLower.includes(word);
            const cacheHasWord = cacheName.includes(word);
            if (cleanHasWord && !cacheHasWord) {
              return false;
            }
          }
          return true;
        }) || null;
      }
    }

    // 3. Auto-create game page entry in bgg_games_cache for unique unmatched XML feed items AND enqueue for BGG metadata enrichment
    let isAutoCreated = false;
    const isExcludedFromAutoCreation = EXCLUSION_EDITION_WORDS.some((word) => 
      item.title.toLowerCase().includes(word)
    );

    if (!matchedGame && item.title && !isExcludedFromAutoCreation) {
      const cleanTitle = cleanBoardGameTitle(item.title);
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

        newGamesToUpsert.push(newGameRow);
        matchedGame = newGameRow;
        gamesList.push({ bgg_id: generatedId, name: cleanTitle, ean: null });
        isAutoCreated = true;

        if (newGamesToUpsert.length >= BATCH_LIMIT) {
          const dedupedNewGames = Array.from(new Map(newGamesToUpsert.map((g) => [g.bgg_id, g])).values());
          const { error: newGamesErr } = await supabase
            .from('bgg_games_cache')
            .upsert(dedupedNewGames, { onConflict: 'bgg_id' });
          if (newGamesErr) {
            console.error('[syncStoreCatalog] Batch upsert of new games failed:', newGamesErr.message);
          }
          newGamesToUpsert.length = 0;
        }
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

      const itemLang = ['es', 'pt', 'en'].includes(item.language || '')
        ? (item.language as string)
        : ['es', 'pt', 'en'].includes(detectLanguage(item.title))
          ? detectLanguage(item.title)
          : 'es';

      let effectiveStoreId = storeId;
      if (itemLang !== 'es') {
        const editionStoreId = getEditionStoreId(storeId, itemLang);
        if (!knownEditionStores.has(editionStoreId)) {
          if (baseStore) {
            await supabase.from('stores').upsert({
              id: editionStoreId,
              name: baseStore.name,
              slug: `${baseStore.slug}-${itemLang}`,
              base_url: baseStore.base_url,
              logo_url: baseStore.logo_url,
              google_shopping_feed_url: baseStore.google_shopping_feed_url,
              owner_email: baseStore.owner_email,
              verified: true,
              feed_status: 'success'
            }, { onConflict: 'id' });

            if (baseRates && baseRates.length > 0) {
              const editionRates = baseRates.map(r => ({
                store_id: editionStoreId,
                destination_country: r.destination_country,
                flat_rate: r.flat_rate,
                free_shipping_threshold: r.free_shipping_threshold
              }));
              await supabase.from('shipping_rates').upsert(editionRates, { onConflict: 'store_id,destination_country' });
            }
          }
          knownEditionStores.add(editionStoreId);
        }
        effectiveStoreId = editionStoreId;
      }

      buffer.push({
        store_id: effectiveStoreId,
        bgg_id: matchedGame.bgg_id,
        store_product_url: item.link,
        price: item.price,
        stock: item.stock,
        edition_language: itemLang,
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
      if (newGamesToUpsert.length > 0) {
        const dedupedNewGames = Array.from(new Map(newGamesToUpsert.map((g) => [g.bgg_id, g])).values());
        const { error: newGamesErr } = await supabase
          .from('bgg_games_cache')
          .upsert(dedupedNewGames, { onConflict: 'bgg_id' });
        if (newGamesErr) {
          console.error('[syncStoreCatalog] Batch upsert of new games failed:', newGamesErr.message);
        }
        newGamesToUpsert.length = 0;
      }

      const dedupedBuffer = dedupeStoreOffers(buffer);
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
  if (newGamesToUpsert.length > 0) {
    const dedupedNewGames = Array.from(new Map(newGamesToUpsert.map((g) => [g.bgg_id, g])).values());
    const { error: newGamesErr } = await supabase
      .from('bgg_games_cache')
      .upsert(dedupedNewGames, { onConflict: 'bgg_id' });
    if (newGamesErr) {
      console.error('[syncStoreCatalog] Final batch upsert of new games failed:', newGamesErr.message);
    }
    newGamesToUpsert.length = 0;
  }

  if (buffer.length > 0) {
    const dedupedBuffer = dedupeStoreOffers(buffer);
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

  // Upsert remaining auto-created games
  if (newGamesToUpsert.length > 0) {
    const dedupedNewGames = Array.from(new Map(newGamesToUpsert.map((g) => [g.bgg_id, g])).values());
    const { error: newGamesErr } = await supabase
      .from('bgg_games_cache')
      .upsert(dedupedNewGames, { onConflict: 'bgg_id' });
    if (newGamesErr) {
      console.error('[syncStoreCatalog] Final batch upsert of new games failed:', newGamesErr.message);
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

export function getEditionStoreId(baseStoreId: string, lang: string): string {
  if (lang === 'es' || !lang) return baseStoreId;
  const suffix = lang === 'en' ? '1' : '2';
  return baseStoreId.slice(0, -1) + suffix;
}

export function dedupeStoreOffers<T extends { store_id: string; bgg_id: number; stock: number; edition_language?: string; price: number }>(offers: T[]): T[] {
  const map = new Map<string, T>();

  for (const offer of offers) {
    const key = `${offer.store_id}_${offer.bgg_id}`;
    const existing = map.get(key);

    if (!existing) {
      map.set(key, offer);
      continue;
    }

    // 1. In-stock priority: if new offer is in-stock and existing is out-of-stock, replace!
    if (offer.stock > 0 && existing.stock === 0) {
      map.set(key, offer);
      continue;
    }
    if (existing.stock > 0 && offer.stock === 0) {
      continue;
    }

    // 2. Language priority: if both have same stock status, prefer Spanish ('es') over non-Spanish
    if (offer.edition_language === 'es' && existing.edition_language !== 'es') {
      map.set(key, offer);
      continue;
    }
    if (existing.edition_language === 'es' && offer.edition_language !== 'es') {
      continue;
    }

    // 3. If stock & language priority are equal, keep lower price (if > 0)
    if (offer.price > 0 && offer.price < existing.price) {
      map.set(key, offer);
    }
  }

  return Array.from(map.values());
}
