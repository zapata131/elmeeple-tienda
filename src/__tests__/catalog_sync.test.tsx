/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseGoogleFeed, syncStoreCatalog } from '@/utils/feed_parser';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

const mockFeedXml = `<?xml version="1.0"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Mock Store</title>
    <item>
      <title>Catan (Spanish edition)</title>
      <link>https://mockstore.com/catan</link>
      <g:price>39.95 EUR</g:price>
      <g:availability>in stock</g:availability>
      <g:gtin>8435407624108</g:gtin>
    </item>
    <item>
      <title>Carcassonne</title>
      <link>https://mockstore.com/carcassonne</link>
      <g:price>24.95 EUR</g:price>
      <g:availability>out of stock</g:availability>
      <g:gtin>8435407623101</g:gtin>
    </item>
  </channel>
</rss>`;

describe('US-09: Automated Catalog Sync via XML/CSV Feeds', () => {
  let fetchMock: jest.Mock;
  let supabaseMock: any;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock;

    // Build mock chain for supabase
    supabaseMock = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      lt: jest.fn().mockImplementation(function (this: any, key: string, value: any) {
        if (key === 'bgg_id' && value === 8000000) {
          return Promise.resolve({
            data: [
              { bgg_id: 100, name: 'Catan', ean: '8435407624108' },
              { bgg_id: 200, name: 'Carcassonne', ean: null },
            ],
            error: null,
          });
        }
        return this;
      }),
      eq: jest.fn().mockImplementation(function (this: any, key: string) {
        if (key === 'id') {
          return Promise.resolve({ error: null });
        }
        return this;
      }),
      ilike: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockImplementation(() => Promise.resolve({ error: null })),
      update: jest.fn().mockReturnThis(),
    };
    (createClient as jest.Mock).mockReturnValue(supabaseMock);
    jest.clearAllMocks();
  });

  it('parses Google Shopping RSS XML items correctly', () => {
    const items = parseGoogleFeed(mockFeedXml);
    expect(items).toHaveLength(2);

    expect(items[0]).toEqual({
      title: 'Catan (Spanish edition)',
      link: 'https://mockstore.com/catan',
      price: 39.95,
      stock: 1, // 'in stock' maps to 1 or default inventory > 0
      ean: '8435407624108',
      language: 'es',
    });

    expect(items[1]).toEqual({
      title: 'Carcassonne',
      link: 'https://mockstore.com/carcassonne',
      price: 24.95,
      stock: 0, // 'out of stock' maps to 0
      ean: '8435407623101',
      language: 'es',
    });
  });

  it('matches catalog games by EAN barcode first', async () => {
    const parsedItems = [
      {
        title: 'Catan',
        link: 'https://mockstore.com/catan',
        price: 39.95,
        stock: 5,
        ean: '8435407624108',
      },
    ];

    const stats = await syncStoreCatalog('store-123', parsedItems);

    expect(supabaseMock.from).toHaveBeenCalledWith('bgg_games_cache');
    expect(stats.processed).toBe(1);
    expect(stats.matched).toBe(1);
    expect(stats.unmatched).toBe(0);
  });

  it('falls back to name matching when EAN lookup returns no match', async () => {
    const parsedItems = [
      {
        title: 'Carcassonne (Edición 2026)',
        link: 'https://mockstore.com/carcassonne',
        price: 24.95,
        stock: 2,
        ean: '8435407623101', // EAN lookup returns nothing (Carcassonne mock has ean: null)
      },
    ];

    const stats = await syncStoreCatalog('store-123', parsedItems);

    expect(stats.processed).toBe(1);
    expect(stats.matched).toBe(1);
    expect(stats.unmatched).toBe(0);
  });

  it('batches catalog upsert rows in segments of 500 items maximum', async () => {
    const parsedItems = Array.from({ length: 600 }).map((_, i) => ({
      title: 'Catan',
      link: `https://mockstore.com/game-${i}`,
      price: 19.99,
      stock: 1,
      ean: '8435407624108',
    }));

    await syncStoreCatalog('store-123', parsedItems);

    // Assert upsert is called exactly twice for store_games (500 items + 100 items)
    expect(supabaseMock.upsert).toHaveBeenCalledTimes(2);
  });

  it('auto-creates bgg_games_cache entries for new XML items and groups duplicates under the same generated ID', async () => {
    const newItems = [
      { title: 'Brand New Space Opera (2026)', link: 'https://store1.mx/space', price: 1200, stock: 5, ean: null },
      { title: 'Brand New Space Opera - Edición en Español', link: 'https://store2.mx/space', price: 1250, stock: 3, ean: null },
    ];

    const stats = await syncStoreCatalog('store-abc', newItems);
    expect(stats.unmatched).toBe(1);
    expect(stats.queued).toBe(1);
    expect(stats.matched).toBe(1);
    expect(supabaseMock.upsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Brand New Space Opera' })
      ]),
      expect.anything()
    );
  });

  it('prevents matching different editions or scenarios containing exclusion words to the base game', async () => {
    const newItems = [
      { title: 'Catan: El Duelo (Doble)', link: 'https://store1.mx/duelo', price: 599, stock: 5, ean: null },
      { title: 'Catan: Viaje Edición', link: 'https://store2.mx/viaje', price: 950, stock: 2, ean: null },
    ];

    const stats = await syncStoreCatalog('store-123', newItems);
    expect(stats.matched).toBe(0);
    expect(stats.unmatched).toBe(2);
  });
});

