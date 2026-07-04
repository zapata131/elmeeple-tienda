import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase before importing redirect route
jest.mock('@supabase/supabase-js', () => {
  const mockClientInstance = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    insert: jest.fn().mockImplementation(() => Promise.resolve({ error: null })),
  };
  return {
    createClient: jest.fn(() => mockClientInstance),
  };
});

// Import GET routing handler AFTER mock declarations to capture overrides
import { GET } from '@/app/api/redirect/route';

describe('US-10: Redirect API Clicks Logging', () => {
  let mockClient: Record<string, jest.Mock>;

  beforeEach(() => {
    mockClient = (createClient as jest.Mock)();
    jest.clearAllMocks();
  });

  it('returns 400 if both offer_id and url parameters are missing', async () => {
    const req = new NextRequest('http://localhost/api/redirect');
    const res = await GET(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Missing offer_id or url');
  });

  it('redirects user to target store product URL injecting UTM tracking parameters and logs click details', async () => {
    // Mock store game listing details resolver
    mockClient.single.mockResolvedValueOnce({
      data: {
        store_id: 'store-xyz',
        bgg_id: 23,
        store_product_url: 'https://store.com/catan?ref=old',
      },
      error: null,
    });

    const req = new NextRequest('http://localhost/api/redirect?offer_id=offer-123');
    const res = await GET(req);

    // Redirect assertions with injected UTM parameters
    expect(res.status).toBe(302);
    const location = res.headers.get('location');
    expect(location).toContain('ref=meepleprecios');
    expect(location).toContain('utm_source=meepleprecios');
    expect(location).toContain('utm_medium=affiliate');

    // Clicks logging assertions
    expect(mockClient.from).toHaveBeenCalledWith('clicks');
    expect(mockClient.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        store_id: 'store-xyz',
        bgg_id: 23,
      })
    );
  });

  it('redirects directly via url parameter appending UTM parameters and logs click when store_id is provided', async () => {
    const req = new NextRequest('http://localhost/api/redirect?url=https%3A%2F%2Ftienda.es%2Fitem&store_id=store-abc&bgg_id=13');
    const res = await GET(req);

    expect(res.status).toBe(302);
    const location = res.headers.get('location');
    expect(location).toBe('https://tienda.es/item?ref=meepleprecios&utm_source=meepleprecios&utm_medium=affiliate');

    expect(mockClient.from).toHaveBeenCalledWith('clicks');
    expect(mockClient.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        store_id: 'store-abc',
        bgg_id: 13,
      })
    );
  });
});
