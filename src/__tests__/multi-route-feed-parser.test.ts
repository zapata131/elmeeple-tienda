import { describe, it, expect, vi } from 'vitest';
import { parseGoogleXmlFeed, parseShopifyJsonFeed, fetchWithMultiRouteFallback } from '@/lib/engine/feed-parser';

describe('US-24 Multi-Route Shopify Feed Fallback Engine', () => {
  it('should parse Shopify products.json payload correctly', () => {
    const jsonPayload = {
      products: [
        {
          id: 101,
          title: 'Catan Base Game',
          handle: 'catan-base-game',
          vendor: 'Devir',
          images: [{ src: 'https://cdn.shopify.com/catan.jpg' }],
          variants: [
            {
              id: 201,
              title: 'Default Title',
              price: '950.00',
              sku: 'DEV-CAT-01',
              barcode: '8435407624108',
              available: true,
              inventory_quantity: 5,
            },
          ],
        },
      ],
    };

    const parsed = parseShopifyJsonFeed(jsonPayload, 'https://geekystuff.com.mx');
    expect(parsed.length).toBe(1);
    expect(parsed[0].title).toBe('Catan Base Game');
    expect(parsed[0].price).toBe(950.00);
    expect(parsed[0].barcode).toBe('8435407624108');
    expect(parsed[0].productUrl).toBe('https://geekystuff.com.mx/products/catan-base-game');
  });

  it('should attempt secondary routes if primary atom feed fails', async () => {
    const mockFetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/collections/all.atom')) {
        return { ok: false, status: 404, statusText: 'Not Found' };
      }
      if (url.includes('/products.json')) {
        return {
          ok: true,
          status: 200,
          text: async () => JSON.stringify({
            products: [
              {
                title: 'Carcassonne',
                handle: 'carcassonne',
                variants: [{ price: '799.00', available: true, inventory_quantity: 10 }],
              },
            ],
          }),
        };
      }
      return { ok: false, status: 404 };
    });

    const result = await fetchWithMultiRouteFallback('https://hobbitongames.com/collections/all.atom', mockFetch as any);
    expect(result.ok).toBe(true);
    expect(result.items.length).toBe(1);
    expect(result.items[0].title).toBe('Carcassonne');
    expect(result.usedRoute).toBe('https://hobbitongames.com/products.json?limit=250');
  });
});
