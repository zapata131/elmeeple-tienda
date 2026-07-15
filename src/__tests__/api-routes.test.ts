import { describe, it, expect } from 'vitest';
import { GET as searchHandler } from '@/app/api/search/route';
import { GET as redirectHandler } from '@/app/api/redirect/route';
import { GET as queueGetHandler, POST as queuePostHandler } from '@/app/api/admin/feed-queue/route';
import { POST as shippingPostHandler } from '@/app/api/merchant/shipping/route';
import { NextRequest } from 'next/server';

describe('REST API Contracts (Section 6)', () => {
  it('/api/search should return matching games and active stores', async () => {
    const req = new NextRequest('http://localhost:3001/api/search?q=catan');
    const res = await searchHandler(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.games).toBeDefined();
    expect(data.games.length).toBeGreaterThan(0);
    expect(data.games[0].name).toContain('Catan');
  });

  it('/api/redirect should record click and return 302 redirect with UTM parameters', async () => {
    const req = new NextRequest('http://localhost:3001/api/redirect?store_id=store-duende-01&bgg_id=13&url=https://elduendecdmx.com/products/catan');
    const res = await redirectHandler(req);
    expect(res.status).toBe(302);
    const location = res.headers.get('location');
    expect(location).toContain('utm_source=meepleprecios');
    expect(location).toContain('utm_medium=affiliate');
    expect(location).toContain('utm_campaign=price_comparison');
  });

  it('/api/merchant/shipping should update shipping rates', async () => {
    const req = new NextRequest('http://localhost:3001/api/merchant/shipping', {
      method: 'POST',
      body: JSON.stringify({
        store_id: 'store-duende-01',
        flat_rate: 110.00,
        free_shipping_threshold: 1300.00,
      }),
    });
    const res = await shippingPostHandler(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it('/api/admin/feed-queue should return queue items and support resolution', async () => {
    const getReq = new NextRequest('http://localhost:3001/api/admin/feed-queue');
    const getRes = await queueGetHandler(getReq);
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.items).toBeDefined();

    if (getData.items.length > 0) {
      const targetId = getData.items[0].id;
      const postReq = new NextRequest('http://localhost:3001/api/admin/feed-queue', {
        method: 'POST',
        body: JSON.stringify({
          id: targetId,
          action: 'approve',
          bgg_id: 13,
        }),
      });
      const postRes = await queuePostHandler(postReq);
      expect(postRes.status).toBe(200);
      const postData = await postRes.json();
      expect(postData.success).toBe(true);
    }
  });
});
