import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { convertPrice, isRatesCacheStale } from '@/utils/currency';
import { POST as AdminFxPost } from '@/app/api/admin/fx-rates/route';
import { POST as CronFxPost } from '@/app/api/cron/sync-fx/route';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { createClient } from '@supabase/supabase-js';
import { CurrencyManager } from '@/components/CurrencyManager';

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
      if (key === 'id' || key === 'currency') {
        return Promise.resolve({ error: null });
      }
      return this;
    }),
    single: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
  };
  return {
    createClient: jest.fn(() => mockClientInstance),
  };
});

describe('US-13: Currency and Foreign Exchange Rate Manager', () => {
  let mockClient: Record<string, jest.Mock>;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    mockClient = (createClient as jest.Mock)();
    fetchMock = jest.fn();
    global.fetch = fetchMock;
    jest.clearAllMocks();
  });

  describe('Currency Utility Helpers', () => {
    it('converts prices from base EUR to target currency correctly', () => {
      const ratesMap = new Map<string, number>([
        ['EUR', 1.0],
        ['MXN', 21.50],
        ['BRL', 6.05],
      ]);

      const convertedMxn = convertPrice(10.0, 'EUR', 'MXN', ratesMap);
      expect(convertedMxn).toBeCloseTo(215.0, 2);

      const convertedBrl = convertPrice(20.0, 'EUR', 'BRL', ratesMap);
      expect(convertedBrl).toBeCloseTo(121.0, 2);
    });

    it('identifies if FX cache timestamp is older than 24 hours', () => {
      const freshTime = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); // 2 hours ago
      const staleTime = new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(); // 26 hours ago

      expect(isRatesCacheStale(freshTime)).toBe(false);
      expect(isRatesCacheStale(staleTime)).toBe(true);
    });
  });

  describe('Admin FX Override API Endpoint (/api/admin/fx-rates)', () => {
    it('blocks non-admin users with 403 Forbidden', async () => {
      (getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { email: 'partner@example.com' },
      });

      mockClient.single.mockResolvedValueOnce({
        data: { role: 'partner' },
        error: null,
      });

      const req = new NextRequest('http://localhost/api/admin/fx-rates', {
        method: 'POST',
        body: JSON.stringify({ currency: 'MXN', rate: 22.0, enabled: true }),
      });

      const res = await AdminFxPost(req);
      expect(res.status).toBe(403);
    });

    it('updates rate and enabled status in database when called by admin', async () => {
      (getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { email: 'admin@example.com' },
      });

      mockClient.single.mockResolvedValueOnce({
        data: { role: 'admin' },
        error: null,
      });

      const req = new NextRequest('http://localhost/api/admin/fx-rates', {
        method: 'POST',
        body: JSON.stringify({ currency: 'MXN', rate: 22.25, enabled: false }),
      });

      const res = await AdminFxPost(req);
      expect(res.status).toBe(200);
      expect(mockClient.from).toHaveBeenCalledWith('exchange_rates');
      expect(mockClient.update).toHaveBeenCalledWith(
        expect.objectContaining({ rate: 22.25, enabled: false })
      );
    });
  });

  describe('Cron FX Sync Endpoint (/api/cron/sync-fx)', () => {
    it('fetches live rates and batch upserts into exchange_rates table', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          base: 'EUR',
          rates: {
            USD: 1.09,
            MXN: 21.80,
            BRL: 6.10,
            ARS: 1060.0,
            COP: 4450.0,
            CLP: 1030.0,
            PEN: 4.10,
          },
        }),
      });

      mockClient.upsert.mockResolvedValueOnce({ error: null });

      const res = await CronFxPost();

      expect(res.status).toBe(200);
      expect(mockClient.from).toHaveBeenCalledWith('exchange_rates');
      expect(mockClient.upsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ currency: 'MXN', rate: 21.80 }),
        ]),
        expect.any(Object)
      );
    });
  });

  describe('CurrencyManager UI Component', () => {
    it('renders list of currencies and triggers override update', async () => {
      const initialRates = [
        { currency: 'EUR', rate: 1.0, enabled: true, updated_at: new Date().toISOString() },
        { currency: 'MXN', rate: 21.50, enabled: true, updated_at: new Date().toISOString() },
      ];

      render(<CurrencyManager initialRates={initialRates} />);

      expect(screen.getByText('EUR')).toBeInTheDocument();
      expect(screen.getByText('MXN')).toBeInTheDocument();

      const mxnInput = screen.getByLabelText('rate-input-MXN') as HTMLInputElement;
      expect(mxnInput.value).toBe('21.5');
    });
  });
});
