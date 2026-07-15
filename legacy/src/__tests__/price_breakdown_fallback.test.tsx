import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { fetchGameOffers } from '@/lib/queries';
import GameDetailPage from '@/app/game/[id]/page';

jest.mock('@/utils/local_file_cache', () => ({
  loadLocalCatalogCache: jest.fn(() => null),
  saveLocalCatalogCache: jest.fn(),
}));

jest.mock('@supabase/supabase-js', () => {
  const mockClientInstance = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockImplementation(() => ({
      data: {
        bgg_id: 13,
        name: 'Catan',
        thumbnail: 'https://cf.geekdo-images.com/W3Bsga_uLP9kO91gZ7H8yw__thumb/img/8a9HeqFydO7Uun_le9bXWPnidcA=/fit-in/200x150/filters:strip_icc()/pic2419375.jpg',
        weight: 2.3,
        min_players: 3,
        max_players: 4,
        playing_time: 75,
      },
      error: null,
    })),
    // When fetchGameOffers awaits without .single(), thenable resolution:
    then: jest.fn((resolve) =>
      resolve({
        data: [
          {
            id: 'offer-1',
            store_id: '11111111-1111-1111-1111-111111111101',
            price: 680,
            stock: 5,
            edition_language: 'es',
            store_product_url: 'https://fichaydado.com/products/catan',
            stores: { id: '11111111-1111-1111-1111-111111111101', name: 'Ficha y Dado', logo_url: null, shipping_rates: [{ flat_rate: 99, free_shipping_threshold: 1200, destination_country: 'MX' }] },
          },
          {
            id: 'offer-2',
            store_id: '11111111-1111-1111-1111-111111111102',
            price: 720,
            stock: 3,
            edition_language: 'es',
            store_product_url: 'https://mundomeeplestore.com/products/catan',
            stores: { id: '11111111-1111-1111-1111-111111111102', name: 'Mundo Meeple Store', logo_url: null, shipping_rates: [{ flat_rate: 110, free_shipping_threshold: 1499, destination_country: 'MX' }] },
          },
          {
            id: 'offer-3',
            store_id: '11111111-1111-1111-1111-111111111104',
            price: 695,
            stock: 4,
            edition_language: 'es',
            store_product_url: 'https://tdetlacuache.com/products/catan',
            stores: { id: '11111111-1111-1111-1111-111111111104', name: 'Con T de Tlacuache', logo_url: null, shipping_rates: [{ flat_rate: 105, free_shipping_threshold: 1199, destination_country: 'MX' }] },
          },
          {
            id: 'offer-4',
            store_id: '11111111-1111-1111-1111-111111111103',
            price: 710,
            stock: 2,
            edition_language: 'es',
            store_product_url: 'https://rollgames.mx/products/catan',
            stores: { id: '11111111-1111-1111-1111-111111111103', name: 'Roll Games', logo_url: null, shipping_rates: [{ flat_rate: 120, free_shipping_threshold: 1500, destination_country: 'MX' }] },
          },
        ],
        error: null,
      })
    ),
  };
  return {
    createClient: jest.fn(() => mockClientInstance),
  };
});

describe('US-28: Brettspielpreise-Style 3-Part Price Breakdown & Offline Fallbacks', () => {
  describe('queries.ts fetchGameOffers Fallback', () => {
    it('returns rich fallback store offers when Supabase returns empty data', async () => {
      const offers = await fetchGameOffers(13, 'MX');
      expect(Array.isArray(offers)).toBe(true);
      expect(offers.length).toBeGreaterThanOrEqual(4);
      expect(offers[0]).toHaveProperty('price');
      expect(offers[0]).toHaveProperty('shipping_flat');
      expect(offers[0]).toHaveProperty('store_country');
    });
  });

  describe('GameDetailPage UI 3-Part Cost Table', () => {
    it('renders explicit Base Price, Shipping Fee, and Total Cost columns for competing stores', async () => {
      const paramsPromise = Promise.resolve({ id: '13' });
      const jsx = await GameDetailPage({ params: paramsPromise });
      render(jsx);

      expect(screen.getByText(/Comparativa de ofertas/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Precio artículo/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Envío/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Coste total/i).length).toBeGreaterThanOrEqual(1);

      // Check fallback stores appear
      expect(screen.getByText(/Ficha y Dado/i)).toBeInTheDocument();
      expect(screen.getByText(/Mundo Meeple Store/i)).toBeInTheDocument();
    });
  });
});
