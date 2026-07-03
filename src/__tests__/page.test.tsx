import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '@/app/page';
import { RegionalStoreToggle } from '@/components/RegionalStoreToggle';
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
const mockRefresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: mockRefresh,
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

describe('US-36: Consolidated Regional Domestic Store Toggles in Catalog and Search UI', () => {
  beforeEach(() => {
    mockRefresh.mockClear();
    document.cookie = 'meeple_country=ES; path=/';
    document.cookie = 'meeple_domestic_only=true; path=/';
  });

  it('renders accessible tactile switch (role="switch") directly in Home search page UI', async () => {
    const jsx = await Home();
    render(jsx);

    const toggleSwitch = screen.getByRole('switch', { name: /Solo tiendas en mi país/i });
    expect(toggleSwitch).toBeInTheDocument();
    expect(toggleSwitch).toBeChecked();
    expect(toggleSwitch).toHaveAttribute('aria-checked', 'true');
  });

  it('RegionalStoreToggle stops click propagation and updates cookie on change', () => {
    const parentClick = jest.fn();
    render(
      <div onClick={parentClick}>
        <RegionalStoreToggle />
      </div>
    );

    const toggleSwitch = screen.getByRole('switch', { name: /Solo tiendas en mi país/i });
    fireEvent.click(toggleSwitch);

    expect(parentClick).not.toHaveBeenCalled();
    expect(document.cookie).toContain('meeple_domestic_only=false');
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('renders accessible tactile switch in CatalogView filters UI', () => {
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

    const domesticToggle = screen.getByRole('switch', { name: /Solo tiendas en mi país/i });
    expect(domesticToggle).toBeInTheDocument();
  });
});
