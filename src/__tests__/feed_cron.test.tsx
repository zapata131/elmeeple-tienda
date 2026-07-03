/* eslint-disable @typescript-eslint/no-explicit-any */
import { syncStoreCatalog } from '@/utils/feed_parser';
import { GET as AdminQueueGet, DELETE as AdminQueueDelete } from '@/app/api/admin/feed-queue/route';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { createClient } from '@supabase/supabase-js';

// Mock next-auth
jest.mock('next-auth', () => {
  const mockNextAuth = jest.fn(() => () => {});
  return {
    __esModule: true,
    default: mockNextAuth,
    getServerSession: jest.fn(),
  };
});

// Mock Supabase
jest.mock('@supabase/supabase-js', () => {
  const mockClientInstance = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockImplementation(function (this: unknown, key: string) {
      if (key === 'id' || key === 'status') {
        return Promise.resolve({ error: null });
      }
      return this;
    }),
    ilike: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockImplementation(() => Promise.resolve({ error: null })),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  };
  return {
    createClient: jest.fn(() => mockClientInstance),
  };
});

describe('US-14: Scheduled Store Feed Parser & Metadata Queueing', () => {
  let mockClient: Record<string, jest.Mock>;

  beforeEach(() => {
    mockClient = (createClient as jest.Mock)();
    jest.clearAllMocks();
  });

  describe('Unmapped Game Enqueueing in syncStoreCatalog', () => {
    it('enqueues unmapped feed items into bgg_metadata_queue', async () => {
      // Mock EAN and title lookup returning null / empty array (unmapped item)
      mockClient.single.mockResolvedValueOnce({ data: null, error: null });
      mockClient.limit.mockResolvedValueOnce({ data: [], error: null });

      const parsedItems = [
        {
          title: 'Mystery Board Game Deluxe 2026',
          link: 'https://store.com/mystery-game',
          price: 59.95,
          stock: 1,
          ean: '8435407699999',
        },
      ];

      const stats = await syncStoreCatalog('store-123', parsedItems);

      expect(stats.unmatched).toBe(1);
      expect(stats.queued).toBe(1);

      expect(mockClient.from).toHaveBeenCalledWith('bgg_metadata_queue');
      expect(mockClient.upsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            store_id: 'store-123',
            ean: '8435407699999',
            title: 'Mystery Board Game Deluxe 2026',
            store_product_url: 'https://store.com/mystery-game',
            status: 'pending',
          }),
        ]),
        expect.objectContaining({ onConflict: 'store_id,store_product_url' })
      );
    });

    it('batches bgg_metadata_queue upserts in segments of 500 items maximum', async () => {
      const parsedItems = Array.from({ length: 600 }).map((_, i) => ({
        title: `Unmapped Game ${i}`,
        link: `https://store.com/unmapped-${i}`,
        price: 29.99,
        stock: 1,
        ean: `ean-unmapped-${i}`,
      }));

      // Always unmapped
      mockClient.single.mockResolvedValue({ data: null, error: null });
      mockClient.limit.mockResolvedValue({ data: [], error: null });

      const stats = await syncStoreCatalog('store-123', parsedItems);

      expect(stats.unmatched).toBe(600);
      expect(stats.queued).toBe(600);

      // Verify two batch calls to upsert (500 + 100)
      const queueUpsertCalls = mockClient.upsert.mock.calls.filter(
        (call: any[]) => Array.isArray(call[0]) && call[0][0]?.title?.startsWith('Unmapped Game')
      );
      expect(queueUpsertCalls).toHaveLength(2);
      expect(queueUpsertCalls[0][0]).toHaveLength(500);
      expect(queueUpsertCalls[1][0]).toHaveLength(100);
    });
  });

  describe('Admin Queue Management Endpoint (/api/admin/feed-queue)', () => {
    it('returns 403 Forbidden to non-admin users', async () => {
      (getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { email: 'partner@example.com' },
      });

      mockClient.single.mockResolvedValueOnce({
        data: { role: 'partner' },
        error: null,
      });

      const res = await AdminQueueGet();
      expect(res.status).toBe(403);
    });

    it('lists pending queue items for administrators', async () => {
      (getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { email: 'admin@example.com' },
      });

      mockClient.single.mockResolvedValueOnce({
        data: { role: 'admin' },
        error: null,
      });

      mockClient.limit.mockResolvedValueOnce({
        data: [
          { id: 'q-1', title: 'Unlisted Game A', status: 'pending', created_at: new Date().toISOString() },
        ],
        error: null,
      });

      const res = await AdminQueueGet();
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.items).toHaveLength(1);
      expect(body.items[0].title).toBe('Unlisted Game A');
    });

    it('deletes specific queue items when requested by admin', async () => {
      (getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { email: 'admin@example.com' },
      });

      mockClient.single.mockResolvedValueOnce({
        data: { role: 'admin' },
        error: null,
      });

      const req = new NextRequest('http://localhost/api/admin/feed-queue', {
        method: 'DELETE',
        body: JSON.stringify({ id: 'q-1' }),
      });
      const res = await AdminQueueDelete(req);
      expect(res.status).toBe(200);
      expect(mockClient.delete).toHaveBeenCalled();
    });
  });
});
