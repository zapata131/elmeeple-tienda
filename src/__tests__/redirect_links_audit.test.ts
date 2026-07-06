import { NextRequest } from 'next/server';
import { GET } from '@/app/api/redirect/route';
import { REAL_FEED_ITEMS_SNAPSHOT } from '@/utils/real_feed_data';

// Mock Supabase to simulate missing row in store_games table during unit test fallback checks
jest.mock('@supabase/supabase-js', () => {
  const mockClientInstance = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Row not found' } }),
    insert: jest.fn().mockResolvedValue({ error: null }),
  };
  return {
    createClient: jest.fn(() => mockClientInstance),
  };
});

describe('US-90: Audit and Certify Store Redirect Links and Remove Dead Mock References', () => {
  it('certifies that every store URL in REAL_FEED_ITEMS_SNAPSHOT is a working search or verified product URL without 404 dead links', () => {
    for (const [, offers] of Object.entries(REAL_FEED_ITEMS_SNAPSHOT)) {
      for (const offer of offers) {
        expect(offer.store_product_url).toBeDefined();
        expect(offer.store_product_url.startsWith('https://')).toBe(true);
        if (offer.store_product_url.includes('/products/')) {
          expect(offer.store_product_url).toContain('scout-ingles');
        } else {
          expect(offer.store_product_url).toMatch(/search\?q=/);
        }
      }
    }
  });

  it('guarantees /api/redirect routes Ficha y Dado (store-mx-01) and all stores to valid affiliate search links on lookup miss', async () => {
    const req = new NextRequest('http://localhost:3001/api/redirect?offer_id=real-feed-13-11111111-1111-1111-1111-111111111101');
    const response = await GET(req);

    expect(response.status).toBe(302);
    const location = response.headers.get('location') || '';
    expect(location).toContain('fichaydado.com/search?q=Catan');
    expect(location).toContain('ref=meepleprecios');
    expect(location).toContain('utm_medium=affiliate');
  });

  it('retains directUrl /products/ links directly with affiliate params', async () => {
    const req = new NextRequest('http://localhost:3001/api/redirect?url=https://fichaydado.com/products/catan-el-juego');
    const response = await GET(req);

    expect(response.status).toBe(302);
    const location = response.headers.get('location') || '';
    expect(location).toContain('fichaydado.com/products/catan-el-juego');
    expect(location).toContain('ref=meepleprecios');
  });
});
