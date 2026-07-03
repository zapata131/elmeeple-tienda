import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UserAlertsDashboard } from '@/components/UserAlertsDashboard';
import { GET as AlertsGet, DELETE as AlertsDelete } from '@/app/api/user/alerts/route';
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => {
  const mockClientInstance = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
  };
  return {
    createClient: jest.fn(() => mockClientInstance),
  };
});

describe('US-20: Price Alerts In-App Dashboard & Header Notification', () => {
  let mockClient: Record<string, jest.Mock>;

  beforeEach(() => {
    mockClient = (createClient as jest.Mock)();
    jest.clearAllMocks();
  });

  describe('API Endpoints (/api/user/alerts)', () => {
    it('returns 400 if email is missing on GET', async () => {
      const req = new NextRequest('http://localhost:3001/api/user/alerts');
      const res = await AlertsGet(req);
      expect(res.status).toBe(400);
    });

    it('returns active alerts with game details on GET', async () => {
      mockClient.eq.mockImplementationOnce(() => ({
        data: [
          { id: 'alert-1', bgg_id: 13, user_email: 'player@meeple.com', target_price: 35.0, created_at: '2026-07-01' },
        ],
        error: null,
      }));

      mockClient.in.mockImplementationOnce(() => ({
        data: [
          { bgg_id: 13, name: 'Catan', thumbnail: 'http://img/catan.jpg' },
        ],
        error: null,
      }));

      mockClient.in.mockImplementationOnce(() => ({
        data: [
          { bgg_id: 13, price: 34.50 },
        ],
        error: null,
      }));

      const req = new NextRequest('http://localhost:3001/api/user/alerts?email=player@meeple.com');
      const res = await AlertsGet(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body.alerts)).toBe(true);
      expect(body.alerts[0].gameName).toBe('Catan');
      expect(body.alerts[0].currentLowestPrice).toBe(34.50);
    });

    it('deletes alert record on DELETE', async () => {
      mockClient.eq.mockImplementationOnce(() => ({
        error: null,
      }));

      const req = new NextRequest('http://localhost:3001/api/user/alerts', {
        method: 'DELETE',
        body: JSON.stringify({ alertId: 'alert-1' }),
      });
      const res = await AlertsDelete(req);
      expect(res.status).toBe(200);
    });
  });

  describe('UserAlertsDashboard Component UI', () => {
    it('renders active alerts list and triggers deletion', async () => {
      const initialAlerts = [
        {
          id: 'alert-1',
          bggId: 13,
          gameName: 'Catan',
          thumbnail: 'http://img/catan.jpg',
          targetPrice: 35.0,
          currentLowestPrice: 34.5,
          isTriggered: true,
          createdAt: '2026-07-01',
        },
      ];

      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        })
      );

      render(<UserAlertsDashboard initialAlerts={initialAlerts} userEmail="player@meeple.com" />);

      expect(screen.getByText('Catan')).toBeInTheDocument();
      expect(screen.getByText('€35.00')).toBeInTheDocument();
      expect(screen.getByText(/¡Precio Alcanzado!/i)).toBeInTheDocument();

      const deleteBtn = screen.getByText(/Eliminar/i);
      fireEvent.click(deleteBtn);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/user/alerts', expect.objectContaining({ method: 'DELETE' }));
      });
    });
  });
});
