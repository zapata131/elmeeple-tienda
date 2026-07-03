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
    upsert: jest.fn().mockReturnThis(),
  };
  return {
    createClient: jest.fn(() => mockClientInstance),
  };
});

describe('US-21: Player BGG Wishlist Sync', () => {
  let mockClient: Record<string, jest.Mock>;

  beforeEach(() => {
    mockClient = (createClient as jest.Mock)();
    jest.clearAllMocks();
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

    it('parses BGG XML and creates price alerts at 15% discount', async () => {
      const mockXml = `<?xml version="1.0" encoding="utf-8"?>
        <items totalitems="2">
          <item objecttype="thing" objectid="13" subtype="boardgame">
            <name sortindex="1">Catan</name>
            <status own="0" prevowned="0" fortrade="0" want="0" wanttoplay="0" wanttobuy="1" wishlist="1" />
          </item>
          <item objecttype="thing" objectid="30549" subtype="boardgame">
            <name sortindex="1">Pandemic</name>
            <status own="0" prevowned="0" fortrade="0" want="0" wanttoplay="0" wanttobuy="1" wishlist="1" />
          </item>
        </items>`;

      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve(mockXml),
        })
      );

      mockClient.in.mockImplementationOnce(() => ({
        data: [
          { bgg_id: 13, price: 40.0 },
          { bgg_id: 30549, price: 30.0 },
        ],
        error: null,
      }));

      mockClient.upsert.mockImplementationOnce(() => ({
        error: null,
      }));

      const req = new NextRequest('http://localhost:3001/api/user/sync-bgg', {
        method: 'POST',
        body: JSON.stringify({ username: 'testgeek', email: 'player@meeple.com' }),
      });
      const res = await SyncBggPost(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.importedCount).toBe(2);
      expect(mockClient.upsert).toHaveBeenCalled();
    });
  });

  describe('UI Integration in UserAlertsDashboard', () => {
    it('allows entering BGG username and triggers sync', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, importedCount: 2 }),
        })
      );

      render(<UserAlertsDashboard initialAlerts={[]} userEmail="player@meeple.com" />);

      const bggInput = screen.getByPlaceholderText(/tu usuario de bgg/i);
      fireEvent.change(bggInput, { target: { value: 'meeplefan' } });

      const syncBtn = screen.getByText(/Importar Wishlist BGG/i);
      fireEvent.click(syncBtn);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/user/sync-bgg', expect.objectContaining({
          method: 'POST',
        }));
      });
    });
  });
});
