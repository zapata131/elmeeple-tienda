import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '@/app/page';
import { CatalogView } from '@/components/CatalogView';

// Mock Supabase for Home
jest.mock('@supabase/supabase-js', () => {
  const mockClientInstance = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    limit: jest.fn().mockImplementation(() => Promise.resolve({
      data: [
        { bgg_id: 23, name: 'Catan', thumbnail: 'http://img/catan.jpg', weight: 2.3 },
      ],
      error: null,
    })),
  };
  return {
    createClient: jest.fn(() => mockClientInstance),
  };
});

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
}));

describe('Clean Home and Catalog Navigation', () => {
  it('renders Home search header and hot games grid', async () => {
    const jsx = await Home();
    render(jsx);

    expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument();
    expect(screen.getByText(/Juegos del Momento/i)).toBeInTheDocument();
  });

  it('renders accessible tactile switch (role="switch") for In Stock filter in CatalogView', () => {
    const mockGames = [
      {
        bgg_id: 1,
        name: 'Catan',
        thumbnail: 'http://img/catan.jpg',
        categories: ['Strategy'],
        min_price: 35,
        in_stock: true,
      },
    ];

    render(<CatalogView initialGames={mockGames} />);

    const stockToggle = screen.getByRole('switch', { name: /mostrar solo en stock/i });
    expect(stockToggle).toBeInTheDocument();
  });
});
