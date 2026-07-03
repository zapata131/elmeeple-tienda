import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CatalogPage from '@/app/catalog/page';
import * as queries from '@/lib/queries';

// Mock queries module
jest.mock('@/lib/queries', () => ({
  fetchCatalogGames: jest.fn(),
}));

// Mock search params and router
jest.mock('next/navigation', () => ({
  useSearchParams() {
    return new URLSearchParams({ q: 'catan' });
  },
  useRouter() {
    return {
      refresh: jest.fn(),
    };
  },
  usePathname: () => '/catalog',
}));

describe('US-04: Catalog Search Filters and Navigation', () => {
  const mockGames = [
    {
      bgg_id: 1,
      name: 'Catan (Spanish)',
      thumbnail: 'https://example.com/catan.png',
      categories: ['Strategy', 'Negotiation'],
      min_price: 35.0,
      in_stock: true,
    },
    {
      bgg_id: 2,
      name: 'Catan Expansion',
      thumbnail: 'https://example.com/catan_exp.png',
      categories: ['Expansion', 'Strategy'],
      min_price: 25.0,
      in_stock: false, // Out of stock
    },
    {
      bgg_id: 3,
      name: 'Catan Card Game',
      thumbnail: 'https://example.com/catan_card.png',
      categories: ['Card Game'],
      min_price: 15.0,
      in_stock: true,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all games matching the search query by default', async () => {
    (queries.fetchCatalogGames as jest.Mock).mockResolvedValue(mockGames);

    const PageResolved = await CatalogPage({ searchParams: Promise.resolve({ q: 'catan' }) });
    render(PageResolved);

    expect(screen.getByText('Catan (Spanish)')).toBeInTheDocument();
    expect(screen.getByText('Catan Expansion')).toBeInTheDocument();
    expect(screen.getByText('Catan Card Game')).toBeInTheDocument();
  });

  it('filters out out-of-stock games when "In Stock Only" is checked', async () => {
    (queries.fetchCatalogGames as jest.Mock).mockResolvedValue(mockGames);

    const PageResolved = await CatalogPage({ searchParams: Promise.resolve({ q: 'catan' }) });
    render(PageResolved);

    const checkbox = screen.getByLabelText(/only show in stock/i);
    expect(screen.getByText('Catan Expansion')).toBeInTheDocument();

    // Check "Only Show In Stock"
    fireEvent.click(checkbox);

    expect(screen.getByText('Catan (Spanish)')).toBeInTheDocument();
    expect(screen.getByText('Catan Card Game')).toBeInTheDocument();
    expect(screen.queryByText('Catan Expansion')).not.toBeInTheDocument();
  });

  it('filters games by category chip clicks', async () => {
    (queries.fetchCatalogGames as jest.Mock).mockResolvedValue(mockGames);

    const PageResolved = await CatalogPage({ searchParams: Promise.resolve({ q: 'catan' }) });
    render(PageResolved);

    const categoryChip = screen.getByRole('button', { name: 'Card Game' });
    expect(screen.getByText('Catan (Spanish)')).toBeInTheDocument();

    // Click "Card Game" chip
    fireEvent.click(categoryChip);

    expect(screen.getByText('Catan Card Game')).toBeInTheDocument();
    expect(screen.queryByText('Catan (Spanish)')).not.toBeInTheDocument();
    expect(screen.queryByText('Catan Expansion')).not.toBeInTheDocument();
  });

  it('filters games based on price slider settings', async () => {
    (queries.fetchCatalogGames as jest.Mock).mockResolvedValue(mockGames);

    const PageResolved = await CatalogPage({ searchParams: Promise.resolve({ q: 'catan' }) });
    render(PageResolved);

    const priceSlider = screen.getByLabelText(/max price/i) as HTMLInputElement;
    expect(screen.getByText('Catan (Spanish)')).toBeInTheDocument(); // Price is 35.0

    // Adjust max price to 30.0
    fireEvent.change(priceSlider, { target: { value: '30' } });

    expect(screen.getByText('Catan Expansion')).toBeInTheDocument(); // Price is 25.0
    expect(screen.getByText('Catan Card Game')).toBeInTheDocument(); // Price is 15.0
    expect(screen.queryByText('Catan (Spanish)')).not.toBeInTheDocument();
  });
});
