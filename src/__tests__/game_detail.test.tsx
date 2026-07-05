import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameDetailPage from '@/app/game/[id]/page';

// Mock Supabase & queries
jest.mock('@/lib/queries', () => ({
  fetchGameDetails: jest.fn().mockResolvedValue({
    bgg_id: 23,
    name: 'Catan Español',
    thumbnail: 'http://img/catan_thumb.jpg',
    image: 'http://img/catan_original.jpg',
    description: 'En Catan colonizas una isla construyendo poblados y rutas comerciales.',
    weight: 2.3,
    min_players: 3,
    max_players: 4,
    playing_time: 120,
  }),
  fetchGameOffers: jest.fn().mockResolvedValue([
    {
      id: 'off-1',
      store_id: 'store-mx-01',
      store_name: 'El Duende Juegos CDMX',
      store_logo: null,
      store_country: 'MX',
      price: 749.00,
      stock: 5,
      edition_language: 'es',
      shipping_flat: 99.00,
      shipping_free_threshold: 1200.00,
      is_featured: true,
    },
  ]),
  fetchGameEditions: jest.fn().mockResolvedValue([]),
  fetchPriceHistory: jest.fn().mockResolvedValue([]),
}));

// Mock navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/game/23',
}));

describe('Redesigned Full-Width GameDetailPage', () => {
  it('renders Hero Cover Box Art header and stats strip in $ MXN', async () => {
    const jsx = await GameDetailPage({ params: Promise.resolve({ id: '23' }) });
    render(jsx);

    expect(screen.getByText('Catan Español')).toBeInTheDocument();
    expect(screen.getByText('El Duende Juegos CDMX')).toBeInTheDocument();
    expect(screen.getByText(/749\.00/)).toBeInTheDocument();
  });
});
