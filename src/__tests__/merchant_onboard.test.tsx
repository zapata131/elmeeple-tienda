import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { useSession } from 'next-auth/react';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

describe('US-07: Sequential Store Onboarding Funnel', () => {
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

    render(<OnboardingWizard />);

    expect(screen.getByText(/Please sign in to onboard/i)).toBeInTheDocument();
  });

  it('completes onboarding step-by-step with validations and calls POST API', async () => {
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

    render(<OnboardingWizard />);

    // --- STEP 1: Store Info ---
    expect(screen.getByText(/Paso 1: Información de la Tienda/i)).toBeInTheDocument();
    const nextBtn1 = screen.getByRole('button', { name: /siguiente/i });
    
    // Clicking next with empty fields fails validation
    fireEvent.click(nextBtn1);
    expect(screen.getByText(/Paso 1: Información de la Tienda/i)).toBeInTheDocument(); // Stays on Step 1

    // Fill fields
    fireEvent.change(screen.getByLabelText(/nombre de la tienda/i), { target: { value: 'Meeple Oasis' } });
    fireEvent.change(screen.getByLabelText(/url base de la tienda/i), { target: { value: 'https://meeple-oasis.com' } });
    fireEvent.change(screen.getByLabelText(/identificador url/i), { target: { value: 'meeple-oasis' } });
    
    fireEvent.click(nextBtn1);

    // --- STEP 2: Branding ---
    await waitFor(() => {
      expect(screen.getByText(/Paso 2: Imagen y Logotipo/i)).toBeInTheDocument();
    });
    const nextBtn2 = screen.getByRole('button', { name: /siguiente/i });
    
    // Fill logo URL
    fireEvent.change(screen.getByLabelText(/url del logotipo/i), { target: { value: 'https://meeple-oasis.com/logo.png' } });
    fireEvent.click(nextBtn2);

    // --- STEP 3: Shipping Config ---
    await waitFor(() => {
      expect(screen.getByText(/Paso 3: Gastos de Envío/i)).toBeInTheDocument();
    });
    const nextBtn3 = screen.getByRole('button', { name: /siguiente/i });
    
    // Fill shipping details
    fireEvent.change(screen.getByLabelText(/tarifa plana/i), { target: { value: '4.95' } });
    fireEvent.change(screen.getByLabelText(/umbral de envío gratis/i), { target: { value: '60' } });
    fireEvent.click(nextBtn3);

    // --- STEP 4: Google Feed XML ---
    await waitFor(() => {
      expect(screen.getByText(/Paso 4: Feed de Google Shopping/i)).toBeInTheDocument();
    });
    const submitBtn = screen.getByRole('button', { name: /completar registro/i });
    
    // Fill Google Shopping feed
    fireEvent.change(screen.getByLabelText(/url del feed/i), { target: { value: 'https://meeple-oasis.com/google-shopping.xml' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Onboarding completado con éxito/i)).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/merchant/onboard',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          name: 'Meeple Oasis',
          base_url: 'https://meeple-oasis.com',
          slug: 'meeple-oasis',
          logo_url: 'https://meeple-oasis.com/logo.png',
          shipping_flat: 4.95,
          shipping_free_threshold: 60,
          feed_url: 'https://meeple-oasis.com/google-shopping.xml',
        }),
      })
    );
  });
});
