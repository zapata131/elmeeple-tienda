import { db } from '@/lib/db/db';
import { parseShopifyJsonFeed, parseGoogleXmlFeed, FeedProduct } from './feed-parser';
import { matchProductToCatalog, classifyFeedItemType, cleanBoardGameTitle } from './matching-engine';
import { StoreGameOffer } from '@/types';

export interface IngestionOptions {
  maxStores?: number;
  storeId?: string;
}

export interface IngestionResult {
  processedStores: number;
  totalItemsParsed: number;
  totalOffersIngested: number;
  errors: Array<{ storeId: string; storeName: string; error: string }>;
}

export async function runFullFeedIngestion(options: IngestionOptions = {}): Promise<IngestionResult> {
  let stores = db.getStores();

  if (options.storeId) {
    stores = stores.filter(s => s.id === options.storeId);
  } else if (options.maxStores) {
    stores = stores.slice(0, options.maxStores);
  }

  let processedStores = 0;
  let totalItemsParsed = 0;
  let totalOffersIngested = 0;
  const errors: Array<{ storeId: string; storeName: string; error: string }> = [];

  for (const store of stores) {
    if (!store.feed_url) continue;

    try {
      const baseUrl = store.feed_url.replace(/\/collections\/.*$/, '');
      let feedItems: FeedProduct[] = [];

      // Route 1: Multi-Page Shopify /products.json pagination
      try {
        for (let page = 1; page <= 10; page++) {
          const jsonRes = await fetch(`${baseUrl}/products.json?limit=250&page=${page}`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              'Accept': 'application/json, text/plain, */*'
            }
          });

          if (jsonRes.ok) {
            const jsonData = await jsonRes.json();
            const pageItems = parseShopifyJsonFeed(jsonData, baseUrl);
            if (pageItems.length === 0) break;

            if (page > 1 && feedItems.length > 0 && pageItems[0].productUrl === feedItems[0].productUrl) {
              break;
            }
            feedItems.push(...pageItems);
          } else {
            break;
          }
        }
      } catch (e) {}

      // Route 2: Multi-Page Google Atom XML feed pagination (/collections/all.atom?page=N)
      if (feedItems.length === 0) {
        try {
          for (let page = 1; page <= 10; page++) {
            const xmlUrl = page === 1 ? store.feed_url : (store.feed_url.includes('?') ? `${store.feed_url}&page=${page}` : `${store.feed_url}?page=${page}`);
            const xmlRes = await fetch(xmlUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'application/atom+xml, application/xml, text/xml, */*'
              }
            });

            if (xmlRes.ok) {
              const xmlText = await xmlRes.text();
              const pageItems = parseGoogleXmlFeed(xmlText);
              if (pageItems.length === 0) break;

              if (page > 1 && feedItems.length > 0 && pageItems[0].productUrl === feedItems[0].productUrl) {
                break;
              }
              feedItems.push(...pageItems);
            } else {
              break;
            }
          }
        } catch (e) {}
      }

      totalItemsParsed += feedItems.length;
      let matchedCount = 0;

      for (const item of feedItems) {
        if (!item.title || !item.price || item.price <= 0) continue;
        const itemType = classifyFeedItemType(item.title);
        if (itemType === 'accessory') continue; // Skip non-game merchandise

        const match = await matchProductToCatalog({
          storeId: store.id,
          title: item.title,
          sku: item.sku,
          barcode: item.barcode,
        });

        let targetBggId: number | null = match.matchedBggId;

        // Auto-create catalog game if no BGG game match exists yet
        if (!targetBggId || match.confidence < 0.90) {
          const cleanName = cleanBoardGameTitle(item.title) || item.title;
          const existing = db.searchBggGames(cleanName);

          if (existing.length > 0) {
            targetBggId = existing[0].bgg_id;
          } else {
            const pseudoBggId = 900000 + db.getBggGames().length + 1;
            const newGame = db.upsertBggGame({
              bgg_id: pseudoBggId,
              name: item.title,
              thumbnail: item.image || 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=300&h=300&fit=crop',
              image: item.image || 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&h=600&fit=crop',
              description: `Juego de mesa ${item.title} disponible en tiendas mexicanas.`,
              min_players: 2,
              max_players: 4,
              playing_time: 45,
              base_price_eur: Math.round(item.price / 20),
              item_type: itemType,
              search_count: 150,
            });
            targetBggId = newGame.bgg_id;
          }
        }

        if (targetBggId) {
          const offer: StoreGameOffer = {
            id: `offer-live-${store.id}-${targetBggId}`,
            store_id: store.id,
            bgg_id: targetBggId,
            store_product_url: item.productUrl,
            price: item.price,
            stock: item.stock > 0 ? item.stock : 10,
            edition_language: 'es',
            is_featured: false,
            match_confidence: match.confidence || 1.00,
            match_tier: match.matchTier || 1,
            last_updated_at: new Date().toISOString(),
          };

          db.upsertOffer(offer);
          matchedCount++;
          totalOffersIngested++;
        }
      }

      db.updateStoreSettings(store.id, {
        feed_status: 'success',
        feed_last_processed_count: feedItems.length,
        feed_last_matched_count: matchedCount,
        feed_last_synced_at: new Date().toISOString(),
      } as any);

      processedStores++;
    } catch (e: any) {
      errors.push({
        storeId: store.id,
        storeName: store.name,
        error: e.message || 'Error parsing store feed',
      });

      db.updateStoreSettings(store.id, {
        feed_status: 'error',
      } as any);
    }
  }

  return {
    processedStores,
    totalItemsParsed,
    totalOffersIngested,
    errors,
  };
}
