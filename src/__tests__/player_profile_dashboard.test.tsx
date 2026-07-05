import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlayerDashboardPage from '@/app/player/dashboard/page';

// Mock useRouter and usePathname for Toolbar
jest.mock('next/navigation', () => ({
  useRouter() {
    return { push: jest.fn(), refresh: jest.fn() };
  },
  usePathname() {
    return '/player/dashboard';
  },
}));

describe('US-47: Player Profile & Search Preference Management Portal', () => {
  it('renders active mock player identity card with name, email, and location in Mexico', () => {
    render(<PlayerDashboardPage />);

    expect(screen.getByText(/Sofía M\./i)).toBeInTheDocument();
    expect(screen.getAllByText(/sofia@meeple\.mx/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/CDMX, México/i)).toBeInTheDocument();
  });

  it('renders sentence-case headings and accessible tactile switch controls for preferences', () => {
    render(<PlayerDashboardPage />);

    // Check sentence case headings
    expect(screen.getByRole('heading', { name: /perfil de comprador y preferencias/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /preferencias de búsqueda en catálogo/i })).toBeInTheDocument();

    // Check tactile switch controls exist
    const switches = screen.getAllByRole('switch');
    expect(switches.length).toBeGreaterThanOrEqual(2);
  });

  it('saves preferences and displays confirmation feedback when Guardar preferencias is clicked', () => {
    render(<PlayerDashboardPage />);

    const saveBtn = screen.getByRole('button', { name: /guardar preferencias/i });
    expect(saveBtn).toBeInTheDocument();

    fireEvent.click(saveBtn);
    expect(screen.getByText(/preferencias guardadas/i)).toBeInTheDocument();
  });
});
