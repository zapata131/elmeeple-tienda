import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from '@/app/login/page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/login',
}));

jest.mock('next-auth/react', () => ({
  signIn: jest.fn().mockResolvedValue({ ok: true, error: null }),
}));

describe('US-80: Dedicated Login Page and Global Toolbar Account Access', () => {
  it('renders login credentials form and demo account notice', () => {
    render(<LoginPage />);
    expect(screen.getByText(/Iniciar sesión en MeeplePrecios/i)).toBeInTheDocument();
    expect(screen.getByText(/💡 Cuentas demo para pruebas rápidas/i)).toBeInTheDocument();
  });

  it('populates email when admin demo button is clicked', () => {
    render(<LoginPage />);
    const adminBtn = screen.getByText(/🛡️ Admin Demo/i);
    fireEvent.click(adminBtn);

    const emailInput = screen.getByPlaceholderText('admin@meepleprecios.com') as HTMLInputElement;
    expect(emailInput.value).toBe('admin@meepleprecios.com');
  });
});
