import { describe, it, expect } from 'vitest';
import { parseShopifyJsonFeed, parseGoogleXmlFeed } from '@/lib/engine/feed-parser';

describe('Multi-Format Feed Ingestion Engine (US-10, US-13)', () => {
  it('should parse Shopify JSON products feed and return structured feed products', () => {
    const mockShopifyData = {
      products: [
        {
          id: 101,
          title: 'Catan Juego de Mesa (Español)',
          handle: 'catan-juego-de-mesa',
          vendor: 'Devir',
          variants: [
            {
              id: 501,
              title: 'Default Title',
              sku: 'DEV-CATAN-ES',
              barcode: '8435407624108',
              price: '949.00',
              available: true,
            },
          ],
          images: [{ src: 'https://cdn.shopify.com/catan.jpg' }],
        },
      ],
    };

    const products = parseShopifyJsonFeed(mockShopifyData, 'https://elduendecdmx.com');
    expect(products.length).toBe(1);
    expect(products[0].title).toBe('Catan Juego de Mesa (Español)');
    expect(products[0].barcode).toBe('8435407624108');
    expect(products[0].price).toBe(949.00);
    expect(products[0].productUrl).toBe('https://elduendecdmx.com/products/catan-juego-de-mesa');
  });

  it('should parse Google Shopping XML feed and return structured feed products', () => {
    const mockXmlString = `<?xml version="1.0"?>
      <rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
        <channel>
          <title>La Caravana Store Feed</title>
          <item>
            <title>Carcassonne Juego Base</title>
            <link>https://lacaravanamx.com/products/carcassonne</link>
            <g:gtin>8435407621107</g:gtin>
            <g:price>799.00 MXN</g:price>
            <g:availability>in stock</g:availability>
          </item>
        </channel>
      </rss>`;

    const products = parseGoogleXmlFeed(mockXmlString);
    expect(products.length).toBe(1);
    expect(products[0].title).toBe('Carcassonne Juego Base');
    expect(products[0].barcode).toBe('8435407621107');
    expect(products[0].price).toBe(799.00);
    expect(products[0].productUrl).toBe('https://lacaravanamx.com/products/carcassonne');
  });
});
