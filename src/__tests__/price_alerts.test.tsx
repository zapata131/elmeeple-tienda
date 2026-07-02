import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PriceAlertForm } from '@/components/PriceAlertForm';
import { useSession } from 'next-auth/react';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

describe('US-06: Wishlist and Price Drop Alerts', () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock;
    jest.clearAllMocks();
  });

  it('renders sign-in prompt if user is unauthenticated', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<PriceAlertForm bggId={23} />);

    expect(screen.getByText(/Sign in to set price alerts/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/target price/i)).not.toBeInTheDocument();
  });

  it('renders form inputs if user is authenticated', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { email: 'player@example.com' } },
      status: 'authenticated',
    });

    render(<PriceAlertForm bggId={23} />);

    expect(screen.getByLabelText(/target price/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear alerta/i })).toBeInTheDocument();
  });

  it('prevents submission and displays warning if price is not positive', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { email: 'player@example.com' } },
      status: 'authenticated',
    });

    render(<PriceAlertForm bggId={23} />);

    const input = screen.getByLabelText(/target price/i) as HTMLInputElement;
    const btn = screen.getByRole('button', { name: /crear alerta/i });

    // Try submitting -5
    fireEvent.change(input, { target: { value: '-5' } });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByText(/Target price must be a positive number/i)).toBeInTheDocument();
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends POST request and displays success feedback on valid alert values', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { email: 'player@example.com' } },
      status: 'authenticated',
    });

    fetchMock.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );

    render(<PriceAlertForm bggId={23} />);

    const input = screen.getByLabelText(/target price/i) as HTMLInputElement;
    const btn = screen.getByRole('button', { name: /crear alerta/i });

    // Submit positive value
    fireEvent.change(input, { target: { value: '35' } });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByText(/Alert successfully created/i)).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/price-alerts',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ bgg_id: 23, target_price: 35, currency: 'EUR' }),
      })
    );
  });
});
