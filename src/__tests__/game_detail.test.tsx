import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameDetailPage from '@/app/game/[id]/page';
import * as queries from '@/lib/queries';

// Mock queries module
jest.mock('@/lib/queries', () => ({
  fetchGameDetails: jest.fn(),
  fetchGameOffers: jest.fn(),
  fetchGameEditions: jest.fn(),
}));

// Mock PriceChart subcomponent
jest.mock('@/components/PriceChart', () => ({
  PriceChart: () => <div data-testid="mock-price-chart" />,
}));

// Mock next/navigation params and headers
jest.mock('next/navigation', () => ({
  useRouter() {
    return { push: jest.fn() };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

describe('US-02 & US-16: Game Detail Page & Comparison Table', () => {
  const mockGame = {
    bgg_id: 23,
    name: 'Catan',
    thumbnail: 'https://example.com/catan.png',
    weight: 2.3,
    min_players: 3,
    max_players: 4,
    playing_time: 60,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders game meta specifications correctly', async () => {
    (queries.fetchGameDetails as jest.Mock).mockResolvedValue(mockGame);
    (queries.fetchGameOffers as jest.Mock).mockResolvedValue([]);
    (queries.fetchGameEditions as jest.Mock).mockResolvedValue([]);

    const PageResolved = await GameDetailPage({ params: Promise.resolve({ id: '23' }) });
    render(PageResolved);

    expect(screen.getByText('Catan')).toBeInTheDocument();
    expect(screen.getByText('3-4 players')).toBeInTheDocument();
    expect(screen.getByText('Complexity: 2.3 / 5')).toBeInTheDocument();
  });

  it('renders alternative language editions list (US-16)', async () => {
    const mockEditions = [
      { bgg_id: 46146, name: 'Sang Rancune', thumbnail: 'https://example.com/sang.png', parent_bgg_id: 23 },
    ];
    (queries.fetchGameDetails as jest.Mock).mockResolvedValue(mockGame);
    (queries.fetchGameOffers as jest.Mock).mockResolvedValue([]);
    (queries.fetchGameEditions as jest.Mock).mockResolvedValue(mockEditions);

    const PageResolved = await GameDetailPage({ params: Promise.resolve({ id: '23' }) });
    render(PageResolved);

    expect(screen.getByText('Other Versions')).toBeInTheDocument();
    expect(screen.getByText('Sang Rancune')).toBeInTheDocument();
  });

  it('sorts store offers by total cost and calculates free shipping thresholds correctly (US-02)', async () => {
    const mockOffers = [
      {
        id: '1',
        store_name: 'Store A',
        store_logo: 'https://example.com/logoA.png',
        store_product_url: 'https://storea.com/catan',
        price: 30.0,
        stock: 5,
        edition_language: 'es',
        shipping_flat: 5.0,
        shipping_free_threshold: null,
      },
      {
        id: '2',
        store_name: 'Store B',
        store_logo: 'https://example.com/logoB.png',
        store_product_url: 'https://storeb.com/catan',
        price: 28.0,
        stock: 2,
        edition_language: 'pt',
        shipping_flat: 9.0,
        shipping_free_threshold: 40.0,
      },
      {
        id: '3',
        store_name: 'Store C',
        store_logo: 'https://example.com/logoC.png',
        store_product_url: 'https://storec.com/catan',
        price: 55.0,
        stock: 10,
        edition_language: 'en',
        shipping_flat: 6.0,
        shipping_free_threshold: 50.0, // Should trigger Free Shipping
      },
    ];

    (queries.fetchGameDetails as jest.Mock).mockResolvedValue(mockGame);
    (queries.fetchGameOffers as jest.Mock).mockResolvedValue(mockOffers);
    (queries.fetchGameEditions as jest.Mock).mockResolvedValue([]);

    const PageResolved = await GameDetailPage({ params: Promise.resolve({ id: '23' }) });
    render(PageResolved);

    // Verify headers
    expect(screen.getByText('Store A')).toBeInTheDocument();
    expect(screen.getByText('Store B')).toBeInTheDocument();
    expect(screen.getByText('Store C')).toBeInTheDocument();

    // Verify Store C shipping calculated as Free (55.00 >= 50.00 threshold)
    const storeCContainer = screen.getByText('Store C').closest('tr');
    expect(storeCContainer).toHaveTextContent('Free');
    expect(storeCContainer).toHaveTextContent('€55.00'); // total cost is 55 + 0

    // Verify Store A total is 35 (30 + 5)
    const storeAContainer = screen.getByText('Store A').closest('tr');
    expect(storeAContainer).toHaveTextContent('€35.00');

    // Verify Store B total is 37 (28 + 9 since 28 < 40 threshold)
    const storeBContainer = screen.getByText('Store B').closest('tr');
    expect(storeBContainer).toHaveTextContent('€37.00');

    // Assert rows are sorted correctly by total cost: Store A (35.00), Store B (37.00), Store C (55.00)
    const rows = screen.getAllByRole('row');
    // Row 0 is the table header
    expect(rows[1]).toHaveTextContent('Store A');
    expect(rows[2]).toHaveTextContent('Store B');
    expect(rows[3]).toHaveTextContent('Store C');
  });
});
