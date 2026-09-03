import { XMLParser } from 'fast-xml-parser';
import { FeedItem, CatalogItemType } from '../../types';

export function isBoardGameFeedItem(title: string): boolean {
  if (!title) return false;
  const t = title.toLowerCase();

  // Guard: preserve legitimate games that happen to contain 'dice', 'cartas', or 'roll' in their titles
  if (/\b(dice throne|roll for the galaxy|juego de cartas|cartas contra la humanidad)\b/i.test(t)) {
    return true;
  }

  const accessoryRegex = /\b(fundas?|sleeves?|inserto|dice|dados|monedas|playmats?|tapete|deck box|caja protectora|tokens?|sobres?|booster pack|cargador|álbum|album|binder)\b/i;
  return !accessoryRegex.test(t);
}

export function classifyFeedItemType(title: string): CatalogItemType {
  if (!isBoardGameFeedItem(title)) {
    return 'accessory';
  }
  const t = title.toLowerCase();
  if (/(?:\bspot\s+it!?|\bdobble\b|\bjunior\b)/i.test(t)) {
    return 'spinoff';
  }
  if (/\b(expansión|expansion|ampliación|ampliacion|extension|extensión|pack de escenario)\b/i.test(t)) {
    return 'expansion';
  }
  return 'boardgame';
}

interface ShopifyVariant {
  id: number | string;
  price: string | number;
  sku?: string;
  barcode?: string;
}

interface ShopifyProduct {
  id: number | string;
  title: string;
  handle: string;
  images?: Array<{ src: string }>;
  variants?: ShopifyVariant[];
}

export function parseShopifyJsonFeed(json: { products?: ShopifyProduct[] }, storeDomain: string): FeedItem[] {
  if (!json || !Array.isArray(json.products)) return [];

  const cleanDomain = storeDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const items: FeedItem[] = [];

  for (const product of json.products) {
    const rawTitle = product.title || '';
    const handle = product.handle || '';
    const productUrl = `https://${cleanDomain}/products/${handle}`;
    const imageUrl = product.images && product.images.length > 0 ? product.images[0].src : undefined;
    const itemType = classifyFeedItemType(rawTitle);

    const firstVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
    const price = firstVariant ? parseFloat(String(firstVariant.price)) : 0;
    const sku = firstVariant?.sku || undefined;
    const barcode = firstVariant?.barcode || undefined;

    items.push({
      raw_title: rawTitle,
      product_url: productUrl,
      price: isNaN(price) ? 0 : price,
      sku,
      barcode,
      image_url: imageUrl,
      item_type: itemType,
    });
  }

  return items;
}

function extractNodeValue(node: unknown): string {
  if (node === null || node === undefined) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (typeof node === 'object' && node !== null) {
    const obj = node as Record<string, unknown>;
    if (obj['#text'] !== undefined) return String(obj['#text']);
  }
  return '';
}

export function parseGoogleXmlFeed(xmlText: string): FeedItem[] {
  if (!xmlText) return [];

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });

  const parsed = parser.parse(xmlText);
  const items: FeedItem[] = [];

  // Handle Atom feed format (<feed><entry>...</entry></feed>)
  if (parsed.feed && parsed.feed.entry) {
    const entries = Array.isArray(parsed.feed.entry) ? parsed.feed.entry : [parsed.feed.entry];
    for (const entry of entries) {
      const rawTitle = extractNodeValue(entry.title);
      let productUrl = '';
      if (typeof entry.link === 'string') {
        productUrl = entry.link;
      } else if (entry.link && entry.link['@_href']) {
        productUrl = entry.link['@_href'];
      }

      let rawPrice = '';
      if (entry['s:price'] !== undefined) {
        rawPrice = extractNodeValue(entry['s:price']);
      } else if (entry['g:price'] !== undefined) {
        rawPrice = extractNodeValue(entry['g:price']);
      }

      const price = parseFloat(rawPrice.replace(/[^0-9.]/g, ''));
      const itemType = classifyFeedItemType(rawTitle);

      items.push({
        raw_title: rawTitle,
        product_url: productUrl,
        price: isNaN(price) ? 0 : price,
        sku: extractNodeValue(entry['g:id']) || undefined,
        barcode: extractNodeValue(entry['g:gtin']) || undefined,
        image_url: extractNodeValue(entry['g:image_link']) || undefined,
        item_type: itemType,
      });
    }
  }

  // Handle RSS / Google Merchant feed format (<rss><channel><item>...</item></channel></rss>)
  if (parsed.rss && parsed.rss.channel && parsed.rss.channel.item) {
    const rawItems = Array.isArray(parsed.rss.channel.item)
      ? parsed.rss.channel.item
      : [parsed.rss.channel.item];

    for (const item of rawItems) {
      const rawTitle = extractNodeValue(item.title);
      const productUrl = extractNodeValue(item.link);
      const rawPrice = extractNodeValue(item['g:price']);
      const price = parseFloat(rawPrice.replace(/[^0-9.]/g, ''));
      const itemType = classifyFeedItemType(rawTitle);

      items.push({
        raw_title: rawTitle,
        product_url: productUrl,
        price: isNaN(price) ? 0 : price,
        sku: extractNodeValue(item['g:id']) || undefined,
        barcode: extractNodeValue(item['g:gtin']) || undefined,
        image_url: extractNodeValue(item['g:image_link']) || undefined,
        item_type: itemType,
      });
    }
  }

  return items;
}

export async function fetchWithMultiRouteFallback(storeDomain: string, primaryFeedUrl: string) {
  const cleanDomain = storeDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const candidateRoutes = [
    `https://${cleanDomain}/products.json?limit=250`,
    `https://${cleanDomain}/collections/juegos-de-mesa/all.atom`,
    primaryFeedUrl,
  ];

  for (const route of candidateRoutes) {
    try {
      const res = await fetch(route, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'application/json, application/atom+xml, text/xml, */*',
        },
      });

      if (!res.ok) continue;
      const text = await res.text();
      const items = text.trim().startsWith('{')
        ? parseShopifyJsonFeed(JSON.parse(text), cleanDomain)
        : parseGoogleXmlFeed(text);

      if (items.length > 0) {
        return { ok: true, usedRoute: route, items };
      }
    } catch {}
  }

  return { ok: false, usedRoute: primaryFeedUrl, items: [] };
}
