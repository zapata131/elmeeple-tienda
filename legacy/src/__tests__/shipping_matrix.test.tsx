import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ShippingMatrix } from '@/components/ShippingMatrix';
import { useSession } from 'next-auth/react';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

describe('US-08: Shipping Cost Matrix Configuration', () => {
  let fetchMock: jest.Mock;

  const mockRates = [
    { destination_country: 'ES', flat_rate: 4.95, free_shipping_threshold: 60.0 },
    { destination_country: 'PT', flat_rate: 5.95, free_shipping_threshold: 80.0 },
  ];

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

    render(<ShippingMatrix storeId="store-abc" initialRates={mockRates} />);

    expect(screen.getByText(/Acceso Restringido/i)).toBeInTheDocument();
  });

  it('renders grid with country inputs prefilled', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { email: 'partner@example.com' } },
      status: 'authenticated',
    });

    render(<ShippingMatrix storeId="store-abc" initialRates={mockRates} />);

    const esFlatInput = screen.getByLabelText('flat-rate-ES') as HTMLInputElement;
    const esFreeInput = screen.getByLabelText('free-threshold-ES') as HTMLInputElement;
    const ptFlatInput = screen.getByLabelText('flat-rate-PT') as HTMLInputElement;

    expect(Number(esFlatInput.value)).toBe(4.95);
    expect(Number(esFreeInput.value)).toBe(60);
    expect(Number(ptFlatInput.value)).toBe(5.95);

    // Other supported countries like Mexico are prefilled with 0/defaults if missing
    const mxFlatInput = screen.getByLabelText('flat-rate-MX') as HTMLInputElement;
    expect(Number(mxFlatInput.value)).toBe(0);
  });

  it('prevents submission if shipping rates are negative', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { email: 'partner@example.com' } },
      status: 'authenticated',
    });

    render(<ShippingMatrix storeId="store-abc" initialRates={mockRates} />);

    const esFlatInput = screen.getByLabelText('flat-rate-ES') as HTMLInputElement;
    const saveBtn = screen.getByRole('button', { name: /guardar cambios/i });

    // Input negative value
    fireEvent.change(esFlatInput, { target: { value: '-2.50' } });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/Las tarifas de envío no pueden ser negativas/i)).toBeInTheDocument();
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('submits updated matrix payload to API on Save', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { email: 'partner@example.com' } },
      status: 'authenticated',
    });

    fetchMock.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );

    render(<ShippingMatrix storeId="store-abc" initialRates={mockRates} />);

    const esFlatInput = screen.getByLabelText('flat-rate-ES') as HTMLInputElement;
    const saveBtn = screen.getByRole('button', { name: /guardar cambios/i });

    // Change ES rate to 3.95
    fireEvent.change(esFlatInput, { target: { value: '3.95' } });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/Gastos de envío actualizados con éxito/i)).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/merchant/shipping',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"destination_country":"ES","flat_rate":3.95'),
      })
    );
  });
});
