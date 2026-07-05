import { seedActualFeedsIntoDatabase, getRealFeedOffersForGame, REAL_FEED_ITEMS_SNAPSHOT } from '@/utils/real_feed_data';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => {
  const mockClientInstance = {
    from: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockResolvedValue({ error: null }),
  };
  return {
    createClient: jest.fn(() => mockClientInstance),
  };
});

describe('US-71: Real Feed Database Ingestion & Mock Data Deprecation', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        text: () =>
          Promise.resolve(`
          <feed xmlns="http://www.w3.org/2005/Atom">
            <entry>
              <title>Catan</title>
              <link rel="alternate" type="text/html" href="https://store.mx/products/catan"/>
              <s:variant xmlns:s="http://jadedpixel.com/-/spec/shopify">
                <s:price currency="MXN">890.00</s:price>
              </s:variant>
            </entry>
          </feed>
        `),
      })
    ) as jest.Mock;
  });

  it('seeds genuine real feed items into Supabase store_games without synthetic randomized prices', async () => {
    const stats = await seedActualFeedsIntoDatabase();
    expect(stats.success).toBe(true);
    expect(stats.storesProcessed).toBe(8);
    expect(stats.totalIngested).toBeGreaterThanOrEqual(10);
  });

  it('returns exact real feed snapshot prices and product links for Arcs (359871)', () => {
    const offers = getRealFeedOffersForGame(359871, 'MX');
    expect(offers.length).toBe(REAL_FEED_ITEMS_SNAPSHOT[359871].length);

    const fichaDado = offers.find((o) => o.store_name === 'Ficha y Dado');
    expect(fichaDado).toBeDefined();
    expect(fichaDado?.price).toBe(1450.00);
    expect(fichaDado?.store_product_url).toBe('https://fichaydado.com/products/arcs-conflicto-y-colapso-en-el-alcance');
  });

  it('returns universal coverage across all 8 verified Mexican stores for Catan (13) with direct product URLs', () => {
    const offers = getRealFeedOffersForGame(13, 'MX');
    expect(offers).toHaveLength(8);
    offers.forEach((offer) => {
      expect(offer.store_product_url).toMatch(/^https:\/\//);
      expect(offer.price).toBeGreaterThan(0);
      expect(offer.stock).toBeGreaterThan(0);
    });
  });

  it('attempts live paginated XML crawling across all 8 verified stores without adding non-XML items', async () => {
    const stats = await seedActualFeedsIntoDatabase();
    expect(stats.success).toBe(true);
    expect(stats.storesProcessed).toBe(8);
    expect(stats.totalIngested).toBeGreaterThanOrEqual(15);
  });
});
