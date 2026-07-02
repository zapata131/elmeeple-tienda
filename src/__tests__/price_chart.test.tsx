import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PriceChart } from '@/components/PriceChart';

describe('US-05: Historical Price Evolution Graph', () => {
  const mockHistory30 = [
    { min_price: 35.0, recorded_at: '2026-06-15' },
    { min_price: 30.0, recorded_at: '2026-06-25' },
    { min_price: 32.0, recorded_at: '2026-07-02' },
  ];

  const mockHistory90 = [
    { min_price: 40.0, recorded_at: '2026-04-15' },
    ...mockHistory30,
  ];

  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock;
    jest.clearAllMocks();
  });

  it('renders loading states and fallback messages if no history is found', async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    render(<PriceChart bggId={23} />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/No price history available/i)).toBeInTheDocument();
    });
  });

  it('calculates SVG path coordinates and renders line chart correctly', async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockHistory30),
      })
    );

    render(<PriceChart bggId={23} />);

    await waitFor(() => {
      // SVG chart renders
      expect(screen.getByTestId('price-chart-svg')).toBeInTheDocument();
      // Price points render
      expect(screen.getByText('€35.00')).toBeInTheDocument();
      expect(screen.getByText('€30.00')).toBeInTheDocument();
      expect(screen.getByText('€32.00')).toBeInTheDocument();
    });

    // Check SVG line path contains coordinate computations
    const linePath = screen.getByTestId('price-chart-path');
    expect(linePath).toHaveAttribute('d');
  });

  it('queries API for different time ranges when range buttons are clicked', async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockHistory30),
      })
    );

    render(<PriceChart bggId={23} />);

    // Wait for the buttons to render (initial load completes)
    const btn90 = await screen.findByRole('button', { name: /90 días/i });

    expect(fetchMock).toHaveBeenCalledWith('/api/price-history?bgg_id=23&days=30'); // Defaults to 30 days

    // Mock response for 90 days query
    fetchMock.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockHistory90),
      })
    );
    fireEvent.click(btn90);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/price-history?bgg_id=23&days=90');
    });
  });
});
