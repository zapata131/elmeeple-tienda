import { filterDomesticOffers, seedMockData } from '@/utils/seed_mock_data';
import { POST as SeedPost } from '@/app/api/admin/seed-data/route';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => {
  const mockClientInstance = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockImplementation(() => Promise.resolve({ data: { role: 'admin' }, error: null })),
    upsert: jest.fn().mockImplementation(() => Promise.resolve({ error: null })),
  };
  return {
    createClient: jest.fn(() => mockClientInstance),
  };
});

describe('US-18 Domestic Toggle, US-25 Language & Role Switcher, US-26 Rich Mock Seed Engine', () => {
  let mockClient: Record<string, jest.Mock>;

  beforeEach(() => {
    mockClient = (createClient as jest.Mock)();
    jest.clearAllMocks();
  });

  describe('filterDomesticOffers Utility', () => {
    const storesMap = {
      'store-es-1': { id: 'store-es-1', name: 'Zygomatic España', country: 'ES' },
      'store-mx-1': { id: 'store-mx-1', name: 'Jugamos México', country: 'MX' },
      'store-pt-1': { id: 'store-pt-1', name: 'Meeple Lisboa', country: 'PT' },
    };

    const offers = [
      { store_id: 'store-es-1', price: 45.0, bgg_id: 1 },
      { store_id: 'store-mx-1', price: 950.0, bgg_id: 1 },
      { store_id: 'store-pt-1', price: 43.0, bgg_id: 1 },
    ];

    it('returns all offers when domesticOnly toggle is false', () => {
      const filtered = filterDomesticOffers(offers, storesMap, 'ES', false);
      expect(filtered).toHaveLength(3);
    });

    it('restricts offers strictly to matching domestic stores when domesticOnly is true', () => {
      const filteredEs = filterDomesticOffers(offers, storesMap, 'ES', true);
      expect(filteredEs).toHaveLength(1);
      expect(filteredEs[0].store_id).toBe('store-es-1');

      const filteredMx = filterDomesticOffers(offers, storesMap, 'MX', true);
      expect(filteredMx).toHaveLength(1);
      expect(filteredMx[0].store_id).toBe('store-mx-1');
    });
  });

  describe('seedMockData Utility', () => {
    it('seeds 7 verified Mexican stores and 20+ board games with authentic BGG cover images', async () => {
      const stats = await seedMockData();
      expect(stats.storesCount).toBe(7);
      expect(stats.gamesCount).toBeGreaterThanOrEqual(20);
      expect(stats.offersCount).toBeGreaterThanOrEqual(20);

      expect(mockClient.from).toHaveBeenCalledWith('stores');
      expect(mockClient.from).toHaveBeenCalledWith('bgg_games_cache');
      expect(mockClient.from).toHaveBeenCalledWith('store_games');
      expect(mockClient.from).toHaveBeenCalledWith('shipping_rates');
    });
  });

  describe('Admin Seed Endpoint (/api/admin/seed-data)', () => {
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

    it('returns success and seed counts', async () => {
      const res = await SeedPost();
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.stats.gamesCount).toBeGreaterThanOrEqual(20);
    });
  });
});
