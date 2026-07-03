import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RestockAlertButton } from '@/components/RestockAlertButton';
import { POST as RestockPost, GET as RestockGet } from '@/app/api/user/restock-alert/route';
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

jest.mock('@supabase/supabase-js', () => {
  const mockClientInstance = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
  };
  return {
    createClient: jest.fn(() => mockClientInstance),
  };
});

describe('US-24: Restock Alert Notification', () => {
  let mockClient: Record<string, jest.Mock>;

  beforeEach(() => {
    mockClient = (createClient as jest.Mock)();
    jest.clearAllMocks();
  });

  describe('API Endpoints (/api/user/restock-alert)', () => {
    it('returns 400 if bggId or email is missing on POST', async () => {
      const req = new NextRequest('http://localhost:3001/api/user/restock-alert', {
        method: 'POST',
        body: JSON.stringify({ email: '' }),
      });
      const res = await RestockPost(req);
      expect(res.status).toBe(400);
    });

    it('creates a restock subscription on POST', async () => {
      mockClient.upsert.mockImplementationOnce(() => ({
        error: null,
      }));

      const req = new NextRequest('http://localhost:3001/api/user/restock-alert', {
        method: 'POST',
        body: JSON.stringify({ bggId: 13, gameName: 'Catan', email: 'player@meeple.com' }),
      });
      const res = await RestockPost(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it('returns restock subscriptions on GET', async () => {
      mockClient.eq.mockImplementationOnce(() => ({
        data: [
          { id: 'restock-1', bgg_id: 13, game_name: 'Catan', user_email: 'player@meeple.com', is_restocked: false, created_at: '2026-07-03' },
        ],
        error: null,
      }));

      const req = new NextRequest('http://localhost:3001/api/user/restock-alert?email=player@meeple.com');
      const res = await RestockGet(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.subscriptions[0].gameName).toBe('Catan');
    });
  });

  describe('RestockAlertButton Component UI', () => {
    it('renders restock trigger button and submits request upon click', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        })
      );

      render(
        <RestockAlertButton
          bggId={13}
          gameName="Catan"
          userEmail="player@meeple.com"
        />
      );

      const btn = screen.getByText(/Avísame cuando haya stock/i);
      expect(btn).toBeInTheDocument();

      fireEvent.click(btn);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/user/restock-alert', expect.objectContaining({ method: 'POST' }));
        expect(screen.getByText(/¡Alerta de Stock Activada!/i)).toBeInTheDocument();
      });
    });
  });
});
