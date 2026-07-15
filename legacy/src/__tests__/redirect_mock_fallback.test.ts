import { NextRequest } from 'next/server';
import { GET } from '@/app/api/redirect/route';

// Mock Supabase to simulate missing row in store_games table
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

describe('US-68: Redirect API Mock Offer Resolution Fallback', () => {
  it('redirects directly to target store game search url with affiliate params when offerId follows mock format', async () => {
    const req = new NextRequest('http://localhost:3001/api/redirect?offer_id=offer-13-store-mx-01');
    const response = await GET(req);

    expect(response.status).toBe(302);
    const location = response.headers.get('location') || '';
    expect(location).toContain('fichaydado.com/search?q=Catan');
    expect(location).toContain('ref=meepleprecios');
    expect(location).toContain('utm_medium=affiliate');
  });

  it('redirects directly to target store game search url when offerId follows real-feed- format', async () => {
    const req = new NextRequest('http://localhost:3001/api/redirect?offer_id=real-feed-359871-11111111-1111-1111-1111-111111111103');
    const response = await GET(req);

    expect(response.status).toBe(302);
    const location = response.headers.get('location') || '';
    expect(location).toContain('rollgames.mx/search?q=Arcs');
    expect(location).toContain('ref=meepleprecios');
  });

  it('prioritizes url query parameter when Supabase lookup misses', async () => {
    const req = new NextRequest('http://localhost:3001/api/redirect?offer_id=unknown-id&url=https://fichaydado.com/products/arcs');
    const response = await GET(req);

    expect(response.status).toBe(302);
    const location = response.headers.get('location') || '';
    expect(location).toContain('fichaydado.com/products/arcs');
    expect(location).toContain('ref=meepleprecios');
  });
});
