import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Toolbar } from '@/components/Toolbar';

// Mock next/navigation
const mockRefresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      refresh: mockRefresh,
    };
  },
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

describe('US-03: Global Shipping and Currency Settings (Toolbar)', () => {
  beforeEach(() => {
    // Clear cookies before each test
    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });
    mockRefresh.mockClear();
  });

  it('renders default country and currency if no cookies are set', () => {
    render(<Toolbar />);
    
    // Default country: Spain (ES)
    const countrySelect = screen.getByLabelText(/shipping country|país de envío/i) as HTMLSelectElement;
    expect(countrySelect.value).toBe('ES');

    // Default currency: EUR
    const currencySelect = screen.getByLabelText(/currency|moneda/i) as HTMLSelectElement;
    expect(currencySelect.value).toBe('EUR');
  });

  it('stores selected country in cookies and refreshes the page on change', () => {
    render(<Toolbar />);
    const countrySelect = screen.getByLabelText(/shipping country|país de envío/i) as HTMLSelectElement;

    fireEvent.change(countrySelect, { target: { value: 'MX' } });

    expect(document.cookie).toContain('meeple_country=MX');
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('stores selected currency in cookies and refreshes the page on change', () => {
    render(<Toolbar />);
    const currencySelect = screen.getByLabelText(/currency|moneda/i) as HTMLSelectElement;

    fireEvent.change(currencySelect, { target: { value: 'BRL' } });

    expect(document.cookie).toContain('meeple_currency=BRL');
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('stores selected language in cookies and refreshes the page on change', () => {
    render(<Toolbar />);
    const languageSelect = screen.getByLabelText(/idioma/i) as HTMLSelectElement;

    fireEvent.change(languageSelect, { target: { value: 'pt' } });

    expect(document.cookie).toContain('meeple_language=pt');
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('initializes country, currency, and language selectors from persisted cookies', () => {
    document.cookie = 'meeple_country=AR; path=/';
    document.cookie = 'meeple_currency=ARS; path=/';
    document.cookie = 'meeple_language=en; path=/';

    render(<Toolbar />);

    const countrySelect = screen.getByLabelText(/shipping country|país de envío/i) as HTMLSelectElement;
    const currencySelect = screen.getByLabelText(/currency|moneda/i) as HTMLSelectElement;
    const languageSelect = screen.getByLabelText(/idioma/i) as HTMLSelectElement;

    expect(countrySelect.value).toBe('AR');
    expect(currencySelect.value).toBe('ARS');
    expect(languageSelect.value).toBe('en');
  });

  it('renders tactile domestic switch with role="switch" and updates cookie on change without propagating click', () => {
    const parentClick = jest.fn();
    render(
      <div onClick={parentClick}>
        <Toolbar />
      </div>
    );

    const domesticSwitch = screen.getByRole('switch', { name: /Solo Tiendas Nacionales/i });
    expect(domesticSwitch).toBeInTheDocument();
    expect(domesticSwitch).not.toBeChecked();

    fireEvent.click(domesticSwitch);
    expect(parentClick).not.toHaveBeenCalled();
    expect(document.cookie).toContain('meeple_domestic_only=true');
    expect(mockRefresh).toHaveBeenCalled();
  });
});

