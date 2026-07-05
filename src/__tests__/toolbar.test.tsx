import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Toolbar } from '@/components/Toolbar';

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

describe('US-44 & US-47: Simplified Toolbar & Role Navigation', () => {
  beforeEach(() => {
    document.cookie.split(';').forEach((c) => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });
    mockRefresh.mockClear();
  });

  it('sets default country/currency cookies and renders clean role switcher without non-functional selectors', () => {
    render(<Toolbar />);

    // Verifies language and country selectors are removed per user simplification request
    expect(screen.queryByLabelText(/shipping country|país de envío/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/idioma/i)).not.toBeInTheDocument();

    // Verifies cookies are automatically locked to MX and MXN
    expect(document.cookie).toContain('meeple_country=MX');
    expect(document.cookie).toContain('meeple_currency=MXN');
  });

  it('renders Mi perfil and Catálogo completo links when role is player (US-47)', () => {
    document.cookie = 'meeple_role=player; path=/';
    render(<Toolbar />);

    expect(screen.getByRole('link', { name: /catálogo completo/i })).toHaveAttribute('href', '/catalog');
    expect(screen.getByRole('link', { name: /mi perfil/i })).toHaveAttribute('href', '/player/dashboard');
  });

  it('US-39 & US-48: renders direct link to Admin Panel in sentence case when role is admin, without dead FX link', () => {
    document.cookie = 'meeple_role=admin; path=/';
    render(<Toolbar />);

    const adminPanelLink = screen.getByRole('link', { name: /panel de admin/i });
    expect(adminPanelLink).toBeInTheDocument();
    expect(adminPanelLink).toHaveAttribute('href', '/admin/dashboard');

    const queueLink = screen.getByRole('link', { name: /cola metadatos bgg/i });
    expect(queueLink).toBeInTheDocument();
    expect(queueLink).toHaveAttribute('href', '/admin/queue');

    // Ensure dead FX link is removed per US-48
    expect(screen.queryByRole('link', { name: /tipos de cambio fx/i })).not.toBeInTheDocument();

    // Ensure partner links are not present
    expect(screen.queryByRole('link', { name: /panel tienda/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /dar de alta tienda/i })).not.toBeInTheDocument();
  });
});
