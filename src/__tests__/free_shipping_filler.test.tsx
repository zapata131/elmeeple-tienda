import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FreeShippingFillerWidget } from '@/components/FreeShippingFillerWidget';
import { GET as FillersGet } from '@/app/api/cart/fillers/route';
import { NextRequest } from 'next/server';

jest.mock('@supabase/supabase-js', () => {
  const mockClientInstance = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
  };
  return {
    createClient: jest.fn(() => mockClientInstance),
  };
});

describe('US-23: Free Shipping Filler Helper', () => {
  describe('API Endpoint (/api/cart/fillers)', () => {
    it('returns 400 if storeId or gap is invalid', async () => {
      const req = new NextRequest('http://localhost:3001/api/cart/fillers?storeId=s1&gap=-5');
      const res = await FillersGet(req);
      expect(res.status).toBe(400);
    });

    it('returns up to 3 sorted low-cost accessories to bridge free shipping threshold gap', async () => {
      const req = new NextRequest('http://localhost:3001/api/cart/fillers?storeId=11111111-1111-1111-1111-111111111101&gap=12.5');
      const res = await FillersGet(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.fillers)).toBe(true);
      expect(data.fillers.length).toBeLessThanOrEqual(3);
      expect(data.fillers[0].price).toBeLessThanOrEqual(data.fillers[1]?.price || 999);
    });
  });

  describe('FreeShippingFillerWidget Component UI', () => {
    it('renders threshold helper when gap is between 0.01 and 15 EUR', async () => {
      const mockFillers = [
        { id: 'f1', name: 'Fundas Premium Euro (100 u)', price: 3.5, category: 'Accesorios' },
        { id: 'f2', name: 'Set Dados D6 Multicolor', price: 4.9, category: 'Dados' },
        { id: 'f3', name: 'Love Letter (Edición Bolsillo)', price: 11.9, category: 'Juego de Cartas' },
      ];

      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ fillers: mockFillers }),
        })
      );

      const onAddFiller = jest.fn();

      render(
        <FreeShippingFillerWidget
          storeId="11111111-1111-1111-1111-111111111101"
          storeName="Zygomatic España"
          currentSubtotal={48.0}
          freeShippingThreshold={60.0}
          onAddFiller={onAddFiller}
        />
      );

      expect(screen.getByText(/¡Estás a solo/i)).toBeInTheDocument();
      expect(screen.getByText(/€12.00/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('Fundas Premium Euro (100 u)')).toBeInTheDocument();
        expect(screen.getByText('Love Letter (Edición Bolsillo)')).toBeInTheDocument();
      });

      const addBtns = screen.getAllByText(/Añadir \+/i);
      fireEvent.click(addBtns[0]);
      expect(onAddFiller).toHaveBeenCalledWith(mockFillers[0]);
    });
  });
});
