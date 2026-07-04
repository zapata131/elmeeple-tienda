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

describe('US-35: BGG Wishlist Dashboard & Discount Alerts Removal', () => {
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

    it('returns wishlist items without discount target prices on GET', async () => {
      mockClient.eq.mockImplementationOnce(() => ({
        data: [
          { id: 'alert-1', bgg_id: 13, user_email: 'player@meeple.com', target_price: null, created_at: '2026-07-01' },
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
      expect(body.alerts[0].targetPrice).toBeNull();
      expect(body.alerts[0].isTriggered).toBe(false);
    });

    it('deletes item record on DELETE', async () => {
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
    it('renders wishlist items list without discount comparison grid or target price editing, shows best price/offers link, and allows deletion', async () => {
      const initialAlerts = [
        {
          id: 'alert-1',
          bggId: 13,
          gameName: 'Catan',
          thumbnail: 'http://img/catan.jpg',
          currentLowestPrice: 34.5,
          createdAt: '2026-07-01',
        },
        {
          id: 'alert-2',
          bggId: 30549,
          gameName: 'Pandemic',
          thumbnail: '',
          currentLowestPrice: 0,
          createdAt: '2026-07-01',
        }
      ];

      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        })
      );

      const { container } = render(<UserAlertsDashboard initialAlerts={initialAlerts} userEmail="player@meeple.com" />);

      expect(screen.getByText('Catan')).toBeInTheDocument();
      expect(screen.getByText('Pandemic')).toBeInTheDocument();
      expect(screen.getAllByText(/Eliminar/i)).toHaveLength(2);

      // Assert removal of discount comparison grid and editing buttons
      expect(screen.queryByText(/Tu Objetivo/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/¡Precio Alcanzado!/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Editar Objetivo/i)).not.toBeInTheDocument();

      // Assert best price or store offers link/CTA displayed
      expect(screen.getByText(/€34\.50/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Ver Ofertas/i)).toHaveLength(2);
      expect(screen.getByText(/Consultando ofertas en tiendas/i)).toBeInTheDocument();

      // Assert zero raw emojis in UI
      const BANNED_EMOJIS = ['🎲', '⚡', '🎉', '🔥', '✨', '✔', '❌', '⚠️', '⭐'];
      BANNED_EMOJIS.forEach((emoji) => {
        expect(container.textContent).not.toContain(emoji);
      });

      const deleteBtns = screen.getAllByText(/Eliminar/i);
      fireEvent.click(deleteBtns[0]);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/user/alerts', expect.objectContaining({ method: 'DELETE' }));
      });
    });
  });
});
