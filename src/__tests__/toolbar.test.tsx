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
});
