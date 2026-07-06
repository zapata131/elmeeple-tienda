/* eslint-disable @typescript-eslint/no-explicit-any */
import { parseGoogleFeed, syncStoreCatalog, fetchFullStoreFeed } from '@/utils/feed_parser';
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
    // Mock EAN match lookup (single resolves)
    supabaseMock.single.mockResolvedValueOnce({
      data: { bgg_id: 100, name: 'Catan' },
      error: null,
    });

    // No redundant overrides needed here

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
    expect(supabaseMock.eq).toHaveBeenCalledWith('ean', '8435407624108');
    expect(stats.processed).toBe(1);
    expect(stats.matched).toBe(1);
    expect(stats.unmatched).toBe(0);
  });

  it('falls back to name matching when EAN lookup returns no match', async () => {
    // Mock EAN lookup: returns null (no EAN match found)
    supabaseMock.single.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    // Mock name match lookup (limit resolves)
    supabaseMock.limit.mockResolvedValueOnce({
      data: [{ bgg_id: 200, name: 'Carcassonne' }],
      error: null,
    });

    // No redundant overrides needed here

    const parsedItems = [
      {
        title: 'Carcassonne (Edición 2026)',
        link: 'https://mockstore.com/carcassonne',
        price: 24.95,
        stock: 2,
        ean: '8435407623101', // EAN lookup returns nothing
      },
    ];

    const stats = await syncStoreCatalog('store-123', parsedItems);

    expect(supabaseMock.eq).toHaveBeenCalledWith('ean', '8435407623101');
    expect(supabaseMock.ilike).toHaveBeenCalledWith('name', '%carcassonne%'); // Cleaned title
    expect(stats.matched).toBe(1);
  });

  it('batches catalog upsert rows in segments of 500 items maximum', async () => {
    // Generate 600 identical matched items
    const parsedItems = Array.from({ length: 600 }).map((_, i) => ({
      title: `Game ${i}`,
      link: `https://mockstore.com/game-${i}`,
      price: 19.99,
      stock: 1,
      ean: `ean-${i}`,
    }));

    // Mock BGG EAN lookup: always matches a BGG game
    supabaseMock.single.mockResolvedValue({
      data: { bgg_id: 500, name: 'Mock Game' },
      error: null,
    });

    // No redundant overrides needed here

    await syncStoreCatalog('store-123', parsedItems);

    // Assert upsert is called exactly twice (500 items + 100 items)
    expect(supabaseMock.upsert).toHaveBeenCalledTimes(2);
  });

  it('auto-creates bgg_games_cache entries for new XML items and groups duplicates under the same generated ID', async () => {
    supabaseMock.single.mockResolvedValue({ data: null, error: null });
    supabaseMock.limit.mockResolvedValue({ data: [], error: null });

    const newItems = [
      { title: 'Brand New Space Opera (2026)', link: 'https://store1.mx/space', price: 1200, stock: 5, ean: null },
      { title: 'Brand New Space Opera - Edición en Español', link: 'https://store2.mx/space', price: 1250, stock: 3, ean: null },
    ];

    const stats = await syncStoreCatalog('store-abc', newItems);
    expect(stats.unmatched).toBe(2);
    expect(stats.queued).toBe(2);
    expect(supabaseMock.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Brand New Space Opera' }),
      expect.anything()
    );
  });

  it('crawls and parses Wix store-products-sitemap.xml and HTML product pages in fetchFullStoreFeed', async () => {

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
          <loc>https://www.geekystuff.mx/product-page/arcs</loc>
        </url>
      </urlset>`;

    const productHtml = `
      <html>
        <head>
          <meta property="og:title" content="Arcs | Geeky Stuff"/>
          <meta property="product:price:amount" content="1350"/>
          <meta property="og:availability" content="instock"/>
          <script type="application/ld+json">{"gtin":"4571394093412"}</script>
        </head>
      </html>`;

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(sitemapXml),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(productHtml),
      });

    const items = await fetchFullStoreFeed('https://www.geekystuff.mx/store-products-sitemap.xml');
    expect(items).toHaveLength(1);
    expect(items[0]).toEqual({
      title: 'Arcs',
      link: 'https://www.geekystuff.mx/product-page/arcs',
      price: 1350,
      stock: 1,
      ean: '4571394093412',
      language: 'es',
    });
  });
});
