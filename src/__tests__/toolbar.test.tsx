import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Toolbar } from '@/components/Toolbar';

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Clean Functional Toolbar', () => {
  it('renders brand name and core functional navigation links (Catálogo, Alta de tienda, Acceso socios)', () => {
    render(<Toolbar />);

    expect(screen.getByText(/MeeplePrecios/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /catálogo completo/i })).toHaveAttribute('href', '/catalog');
    expect(screen.getByRole('link', { name: /dar de alta tienda/i })).toHaveAttribute('href', '/merchant/onboard');
    expect(screen.getByRole('link', { name: /acceso socios/i })).toHaveAttribute('href', '/merchant/dashboard');
  });

  it('does NOT render non-functional mock profile pills or dropdown selectors', () => {
    render(<Toolbar />);

    expect(screen.queryByText(/perfil mock:/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/idioma/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/moneda/i)).not.toBeInTheDocument();
  });
});
