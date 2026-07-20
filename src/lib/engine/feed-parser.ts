import { XMLParser } from 'fast-xml-parser';
import { db } from '@/lib/db/db';
import { matchProductToCatalog, detectLanguage } from './matching-engine';

export interface FeedProduct {
  title: string;
  productUrl: string;
  price: number;
  stock: number;
  sku?: string;
  barcode?: string;
  vendor?: string;
  image?: string;
}

export function parseShopifyJsonFeed(data: any, storeDomain: string): FeedProduct[] {
  if (!data || !Array.isArray(data.products)) return [];
  const products: FeedProduct[] = [];

  const cleanDomain = storeDomain.endsWith('/') ? storeDomain.slice(0, -1) : storeDomain;

  for (const item of data.products) {
    const title = item.title || '';
    const handle = item.handle || '';
    const vendor = item.vendor || '';
    const image = item.images && item.images.length > 0 ? item.images[0].src : undefined;
    const productUrl = `${cleanDomain}/products/${handle}`;

    if (Array.isArray(item.variants)) {
      for (const variant of item.variants) {
        const price = parseFloat(variant.price) || 0;
        const available = variant.available !== false;
        const stock = available ? (typeof variant.inventory_quantity === 'number' ? variant.inventory_quantity : 1) : 0;
        const sku = variant.sku || undefined;
        const barcode = variant.barcode || undefined;

        products.push({
          title,
          productUrl,
          price,
          stock,
          sku,
          barcode,
          vendor,
          image,
        });
      }
    }
  }

  return products;
}

export function parseGoogleXmlFeed(xmlString: string): FeedProduct[] {
  if (!xmlString) return [];

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });

  const jsonObj = parser.parse(xmlString);
  const products: FeedProduct[] = [];

  // Support RSS channel item or Atom entry formats
  let items: any[] = [];
  if (jsonObj?.rss?.channel?.item) {
    items = Array.isArray(jsonObj.rss.channel.item)
      ? jsonObj.rss.channel.item
      : [jsonObj.rss.channel.item];
  } else if (jsonObj?.feed?.entry) {
    items = Array.isArray(jsonObj.feed.entry)
      ? jsonObj.feed.entry
      : [jsonObj.feed.entry];
  }

  for (const item of items) {
    const title = item.title || item['g:title'] || '';
    const link = typeof item.link === 'string' ? item.link : item.link?.['@_href'] || '';
    const priceRaw = item['g:price'] || item.price || '0';
    const priceNum = parseFloat(priceRaw.toString().replace(/[^\d.]/g, '')) || 0;

    const barcode = item['g:gtin'] || item.gtin || item['g:identifier_exists'] || undefined;
    const sku = item['g:id'] || item.id || undefined;
    const availability = (item['g:availability'] || item.availability || 'in stock').toString().toLowerCase();
    const stock = availability.includes('in stock') || availability.includes('in_stock') ? 1 : 0;
    const image = item['g:image_link'] || item.image_link || undefined;

    if (title && link) {
      products.push({
        title: title.toString(),
        productUrl: link.toString(),
        price: priceNum,
        stock,
        sku: sku ? sku.toString() : undefined,
        barcode: barcode ? barcode.toString() : undefined,
        image: image ? image.toString() : undefined,
      });
    }
  }

  return products;
}

export async function fetchWithMultiRouteFallback(
  primaryFeedUrl: string,
  customFetch: typeof fetch = fetch
): Promise<{ ok: boolean; usedRoute: string; items: FeedProduct[]; error?: string }> {
  const urlObj = new URL(primaryFeedUrl);
  const baseUrl = `${urlObj.protocol}//${urlObj.host}`;

  // Multi-route fallback chain:
  // 1. Primary Atom XML (/collections/all.atom)
  // 2. Public Shopify JSON API (/products.json?limit=250)
  // 3. Category Atom XML (/collections/juegos-de-mesa/all.atom)
  const candidateRoutes = [
    primaryFeedUrl,
    `${baseUrl}/products.json?limit=250`,
    `${baseUrl}/collections/juegos-de-mesa/all.atom`,
  ];

  for (const route of candidateRoutes) {
    try {
      const allPaginatedItems: FeedProduct[] = [];

      for (let page = 1; page <= 50; page++) {
        const paginatedRoute = page === 1 ? route : (route.includes('?') ? `${route}&page=${page}` : `${route}?page=${page}`);
        const res = await customFetch(paginatedRoute, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'application/atom+xml, application/xml, text/xml, application/json, */*',
          },
        });

        if (!res.ok) break;

        const bodyText = await res.text();
        let pageItems: FeedProduct[] = [];

        // Check if XML feed
        if (bodyText.includes('<feed') || bodyText.includes('<entry') || bodyText.includes('<rss')) {
          pageItems = parseGoogleXmlFeed(bodyText);
        } else {
          // Check if JSON feed
          try {
            const jsonData = JSON.parse(bodyText);
            if (Array.isArray(jsonData.products)) {
              pageItems = parseShopifyJsonFeed(jsonData, baseUrl);
            }
          } catch {}
        }

        if (pageItems.length === 0) break;

        // Stop pagination if server returns duplicate first product (indicating non-paginated endpoint)
        if (page > 1 && allPaginatedItems.length > 0 && pageItems[0].productUrl === allPaginatedItems[0].productUrl) {
          break;
        }

        allPaginatedItems.push(...pageItems);
      }

      if (allPaginatedItems.length > 0) {
        return { ok: true, usedRoute: route, items: allPaginatedItems };
      }
    } catch {
      // Ignore and try next candidate route in fallback chain
    }
  }

  return { ok: false, usedRoute: primaryFeedUrl, items: [], error: 'All candidate routes failed or blocked' };
}

export async function processStoreFeedBatch(storeId: string, products: FeedProduct[]): Promise<{
  processedCount: number;
  matchedCount: number;
  queuedCount: number;
}> {
  let matchedCount = 0;
  let queuedCount = 0;

  // Buffer discovered records in memory (up to 500 records per batch)
  const BATCH_SIZE = 500;
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);

    for (const prod of batch) {
      const match = await matchProductToCatalog({
        storeId,
        title: prod.title,
        sku: prod.sku,
        barcode: prod.barcode,
      });

      const language = detectLanguage(prod.title);

      if (match.matchedBggId && !match.shouldQueue) {
        db.upsertOffer({
          store_id: storeId,
          bgg_id: match.matchedBggId,
          store_product_url: prod.productUrl,
          price: prod.price,
          stock: prod.stock,
          edition_language: language,
          is_featured: false,
          match_confidence: match.confidence,
          match_tier: match.matchTier,
        });
        matchedCount++;
      } else {
        db.addQueueItem({
          store_id: storeId,
          ean: prod.barcode,
          title: prod.title,
          store_product_url: prod.productUrl,
          status: 'pending',
          match_confidence: match.confidence,
          suggested_bgg_id: match.matchedBggId,
        });
        queuedCount++;
      }
    }
  }

  // Update store status
  db.updateStore(storeId, {
    feed_status: 'success',
    feed_last_processed_count: products.length,
    feed_last_matched_count: matchedCount,
  });

  return {
    processedCount: products.length,
    matchedCount,
    queuedCount,
  };
}
