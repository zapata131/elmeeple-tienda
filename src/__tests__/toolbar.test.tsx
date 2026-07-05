import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Toolbar } from '@/components/Toolbar';

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Clean Functional Toolbar', () => {
  it('renders brand name cleanly without distracting merchant header links', () => {
    render(<Toolbar />);

    expect(screen.getByText(/MeeplePrecios/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /dar de alta tienda/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /acceso socios/i })).not.toBeInTheDocument();
  });

  it('does NOT render non-functional mock profile pills or redundant catalog link', () => {
    render(<Toolbar />);

    expect(screen.queryByText(/perfil mock:/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /catálogo completo/i })).not.toBeInTheDocument();
  });
});
