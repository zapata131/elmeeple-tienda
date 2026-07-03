import { optimizeCart, StoreGameOffer, ShippingRateInfo, StoreInfo } from '@/utils/cart_optimizer';
import { POST as OptimizePost } from '@/app/api/cart/optimize/route';
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => {
  const mockClientInstance = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
  };
  return {
    createClient: jest.fn(() => mockClientInstance),
  };
});

describe('US-17: Consolidated Multi-Game Cart Optimizer', () => {
  let mockClient: Record<string, jest.Mock>;

  beforeEach(() => {
    mockClient = (createClient as jest.Mock)();
    jest.clearAllMocks();
  });

  describe('optimizeCart Algorithm Engine', () => {
    const storesMap: Record<string, StoreInfo> = {
      'store-a': { id: 'store-a', name: 'Dungeon Shop ES', base_url: 'http://dungeon.es' },
      'store-b': { id: 'store-b', name: 'Meeple Outlet PT', base_url: 'http://meeple.pt' },
    };

    const shippingRates: ShippingRateInfo[] = [
      { store_id: 'store-a', destination_country: 'ES', flat_rate: 10.0, free_shipping_threshold: 50.0 },
      { store_id: 'store-b', destination_country: 'ES', flat_rate: 5.0, free_shipping_threshold: 30.0 },
    ];

    it('applies free shipping threshold when store subtotal equals or exceeds limit', () => {
      const offers: StoreGameOffer[] = [
        { store_id: 'store-a', bgg_id: 1, price: 55.0, stock: 5, store_product_url: 'http://dungeon.es/1', game_name: 'Catan' },
      ];

      const results = optimizeCart([1], 'ES', offers, shippingRates, storesMap);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].totalCost).toBe(55.0); // 55 + 0 shipping
      expect(results[0].storeBreakdowns[0].shippingFee).toBe(0);
    });

    it('identifies cheaper multi-store split vs single-store purchase', () => {
      const offers: StoreGameOffer[] = [
        // Store A has both games but expensive subtotal without threshold
        { store_id: 'store-a', bgg_id: 1, price: 20.0, stock: 5, store_product_url: 'http://dungeon.es/1', game_name: 'Game 1' },
        { store_id: 'store-a', bgg_id: 2, price: 25.0, stock: 5, store_product_url: 'http://dungeon.es/2', game_name: 'Game 2' },
        // Store B has Game 1 very cheap + qualifies for free shipping with Game 2
        { store_id: 'store-b', bgg_id: 1, price: 12.0, stock: 5, store_product_url: 'http://meeple.pt/1', game_name: 'Game 1' },
        { store_id: 'store-b', bgg_id: 2, price: 19.0, stock: 5, store_product_url: 'http://meeple.pt/2', game_name: 'Game 2' },
      ];

      const results = optimizeCart([1, 2], 'ES', offers, shippingRates, storesMap);

      expect(results.length).toBeGreaterThan(0);
      // Store B subtotal: 12 + 19 = 31 >= 30 free threshold -> Total 31.0
      // Store A subtotal: 20 + 25 = 45 < 50 threshold -> Total 45 + 10 = 55.0
      expect(results[0].totalCost).toBe(31.0);
      expect(results[0].storeBreakdowns[0].storeName).toBe('Meeple Outlet PT');
    });
  });

  describe('API Endpoint (/api/cart/optimize)', () => {
    it('returns 400 Bad Request if gameIds list is empty or invalid', async () => {
      const req = new NextRequest('http://localhost/api/cart/optimize', {
        method: 'POST',
        body: JSON.stringify({ gameIds: [], destinationCountry: 'ES' }),
      });

      const res = await OptimizePost(req);
      expect(res.status).toBe(400);
    });

    it('returns top 3 combinations sorted by total cost', async () => {
      // Mock store_games
      mockClient.in.mockImplementationOnce(() => ({
        data: [
          { store_id: 's1', bgg_id: 10, price: 40.0, stock: 2, store_product_url: 'http://s1.com/10', bgg_games_cache: { name: 'Gloomhaven' } },
        ],
        error: null,
      }));

      // Mock shipping_rates
      mockClient.eq.mockImplementationOnce(() => ({
        data: [
          { store_id: 's1', destination_country: 'ES', flat_rate: 6.0, free_shipping_threshold: 100.0 },
        ],
        error: null,
      }));

      // Mock stores
      mockClient.in.mockImplementationOnce(() => ({
        data: [
          { id: 's1', name: 'Store One ES', base_url: 'http://s1.com' },
        ],
        error: null,
      }));

      const req = new NextRequest('http://localhost/api/cart/optimize', {
        method: 'POST',
        body: JSON.stringify({ gameIds: [10], destinationCountry: 'ES' }),
      });

      const res = await OptimizePost(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body.combinations)).toBe(true);
      expect(body.combinations[0].totalCost).toBe(46.0); // 40 + 6
    });
  });
});
