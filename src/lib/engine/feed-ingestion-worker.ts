import { db } from '@/lib/db/db';
import { parseShopifyJsonFeed, parseGoogleXmlFeed, FeedProduct } from './feed-parser';
import { matchProductToCatalog } from './matching-engine';
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

      // Route 1: Try Shopify /products.json
      try {
        const jsonRes = await fetch(`${baseUrl}/products.json?limit=250`);
        if (jsonRes.ok) {
          const jsonData = await jsonRes.json();
          feedItems = parseShopifyJsonFeed(jsonData, baseUrl);
        }
      } catch (e) {}

      // Route 2: Fallback to Google XML feed if JSON returned no items
      if (feedItems.length === 0) {
        try {
          const xmlRes = await fetch(store.feed_url);
          if (xmlRes.ok) {
            const xmlText = await xmlRes.text();
            feedItems = parseGoogleXmlFeed(xmlText);
          }
        } catch (e) {}
      }

      totalItemsParsed += feedItems.length;
      let matchedCount = 0;

      for (const item of feedItems) {
        if (!item.title || !item.price || item.price <= 0) continue;

        const match = await matchProductToCatalog({
          storeId: store.id,
          title: item.title,
          sku: item.sku,
          barcode: item.barcode,
        });

        if (match.matchedBggId && match.confidence >= 0.90 && !match.shouldQueue) {
          const offer: StoreGameOffer = {
            id: `offer-live-${store.id}-${match.matchedBggId}`,
            store_id: store.id,
            bgg_id: match.matchedBggId,
            store_product_url: item.productUrl,
            price: item.price,
            stock: item.stock > 0 ? item.stock : 10,
            edition_language: 'es',
            is_featured: false,
            match_confidence: match.confidence,
            match_tier: match.matchTier,
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
