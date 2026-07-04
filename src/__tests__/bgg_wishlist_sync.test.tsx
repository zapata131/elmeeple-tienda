import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UserAlertsDashboard } from '@/components/UserAlertsDashboard';
import { POST as SyncBggPost } from '@/app/api/user/sync-bgg/route';
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js', () => {
  const mockClientInstance = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
  };
  return {
    createClient: jest.fn(() => mockClientInstance),
  };
});

describe('Milestone 2: BGG Wishlist Sync & Matching TDD', () => {
  let mockClient: Record<string, jest.Mock>;

  beforeEach(() => {
    mockClient = (createClient as jest.Mock)();
    jest.clearAllMocks();
    mockClient.from.mockReturnThis();
    mockClient.select.mockReturnThis();
    mockClient.in.mockReturnThis();
    mockClient.eq.mockReturnThis();
    mockClient.or.mockReturnThis();
    mockClient.ilike.mockReturnThis();
    mockClient.limit.mockImplementation(() => Promise.resolve({ data: [], error: null }));
    mockClient.single.mockImplementation(() => Promise.resolve({ data: null, error: null }));
    mockClient.upsert.mockImplementation(() => ({
      select: jest.fn().mockImplementation(() => Promise.resolve({ data: [], error: null }))
    }));
  });

  describe('API Endpoint (/api/user/sync-bgg)', () => {
    it('returns 400 if username or email is missing', async () => {
      const req = new NextRequest('http://localhost:3001/api/user/sync-bgg', {
        method: 'POST',
        body: JSON.stringify({ username: '' }),
      });
      const res = await SyncBggPost(req);
      expect(res.status).toBe(400);
    });

    it('parses wishlist=1 and wanttobuy=1 BGG XML items, matches against bgg_games_cache/games per Sec 5.1, guards Sec 5.4, and saves without discount alerts (target_price: null)', async () => {
      const mockWishlistXml = `<?xml version="1.0" encoding="utf-8"?>
        <items totalitems="1">
          <item objecttype="thing" objectid="13" subtype="boardgame">
            <name sortindex="1">Catan</name>
            <status own="0" prevowned="0" fortrade="0" want="0" wanttoplay="0" wanttobuy="0" wishlist="1" />
          </item>
        </items>`;

      const mockWantToBuyXml = `<?xml version="1.0" encoding="utf-8"?>
        <items totalitems="1">
          <item objecttype="thing" objectid="30549" subtype="boardgame">
            <name sortindex="1">Pandemic: El Juego</name>
            <status own="0" prevowned="0" fortrade="0" want="0" wanttoplay="0" wanttobuy="1" wishlist="0" />
          </item>
        </items>`;

      global.fetch = jest.fn().mockImplementation((url: string) => {
        if (url.includes('wishlist=1')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            text: () => Promise.resolve(mockWishlistXml),
          });
        }
        if (url.includes('wanttobuy=1')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            text: () => Promise.resolve(mockWantToBuyXml),
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      // Mock matching queries for Catan (id 13) and Pandemic (id 30549)
      // For id 13 direct match in bgg_games_cache:
      mockClient.limit.mockImplementation(() => {
        return Promise.resolve({ data: [], error: null });
      });

      mockClient.in.mockImplementation((col: string, vals: unknown[]) => {
        if (col === 'bgg_id' && vals.includes(13)) {
          return Promise.resolve({
            data: [
              { bgg_id: 13, price: 40.0 },
              { bgg_id: 30549, price: 30.0 },
            ],
            error: null,
          });
        }
        return Promise.resolve({ data: [], error: null });
      });

      let upsertPayload: Record<string, unknown>[] | null = null;
      mockClient.upsert.mockImplementation((data: Record<string, unknown>[]) => {
        upsertPayload = data;
        return {
          select: jest.fn().mockImplementation(() => Promise.resolve({ data, error: null }))
        };
      });

      const req = new NextRequest('http://localhost:3001/api/user/sync-bgg', {
        method: 'POST',
        body: JSON.stringify({ username: 'testgeek', email: 'player@meeple.com' }),
      });
      const res = await SyncBggPost(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.importedCount).toBe(2);

      expect(mockClient.upsert).toHaveBeenCalled();
      expect(Array.isArray(upsertPayload)).toBe(true);
      // Ensure target_price is null for all items (no discount alert created)
      upsertPayload?.forEach((item: Record<string, unknown>) => {
        expect(item.target_price).toBeNull();
        expect(item.user_email).toBe('player@meeple.com');
      });
    });

    it('returns clean error state when BGG returns an invalid username error XML', async () => {
      const mockErrorXml = `<?xml version="1.0" encoding="utf-8"?>
        <errors>
          <error><message>Invalid username specified</message></error>
        </errors>`;

      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve(mockErrorXml),
        })
      );

      const req = new NextRequest('http://localhost:3001/api/user/sync-bgg', {
        method: 'POST',
        body: JSON.stringify({ username: 'invalid_user_xyz', email: 'player@meeple.com' }),
      });
      const res = await SyncBggPost(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toMatch(/usuario.*no válido|no encontrado|invalid/i);
    });

    it('returns 200 with importedCount 0 when BGG wishlist is empty (totalitems="0")', async () => {
      const mockEmptyXml = `<?xml version="1.0" encoding="utf-8"?>
        <items totalitems="0" termsofuse="https://boardgamegeek.com/xmlapi/termsofuse">
        </items>`;

      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve(mockEmptyXml),
        })
      );

      const req = new NextRequest('http://localhost:3001/api/user/sync-bgg', {
        method: 'POST',
        body: JSON.stringify({ username: 'empty_geek', email: 'player@meeple.com' }),
      });
      const res = await SyncBggPost(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.importedCount).toBe(0);
      expect(data.message).toMatch(/vacía|no se encontraron/i);
    });
  });

  describe('UI Integration & Zero Raw Emojis in UserAlertsDashboard', () => {
    it('allows entering BGG username, triggers sync, and displays zero raw emojis in feedback', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, importedCount: 2, message: '¡Se han importado 2 juegos de tu wishlist desde BGG!' }),
        })
      );

      const { container } = render(<UserAlertsDashboard initialAlerts={[]} userEmail="player@meeple.com" />);

      const bggInput = screen.getByPlaceholderText(/tu usuario de bgg/i);
      fireEvent.change(bggInput, { target: { value: 'meeplefan' } });

      const syncBtn = screen.getByText(/Importar Wishlist BGG/i);
      fireEvent.click(syncBtn);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/user/sync-bgg', expect.objectContaining({
          method: 'POST',
        }));
      });

      // Assert zero raw emojis in container
      const BANNED_EMOJIS = ['🎲', '⚡', '🎉', '🔥', '✨', '✔', '❌', '⚠️', '⭐'];
      BANNED_EMOJIS.forEach((emoji) => {
        expect(container.textContent).not.toContain(emoji);
      });
    });
  });
});
