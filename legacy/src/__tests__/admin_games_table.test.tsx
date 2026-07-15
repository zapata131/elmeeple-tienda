import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AdminGamesCatalogTable } from '@/components/AdminGamesCatalogTable';

describe('US-81: Admin Dashboard Catalog Overview Table & Excalibur Indexing', () => {
  const sampleGames = [
    { bgg_id: 421285, name: 'Excalibur', thumbnail: 'https://mock.jpg', last_updated_at: '2026-07-05T12:00:00Z' },
    { bgg_id: 13, name: 'Catan', thumbnail: 'https://mock.jpg', last_updated_at: '2026-07-05T12:00:00Z' },
  ];

  it('displays total count and lists all available games with comparison links', () => {
    render(<AdminGamesCatalogTable games={sampleGames} />);
    expect(screen.getByText(/Total registrados: 2 juego\(s\)/i)).toBeInTheDocument();
    expect(screen.getByText('Excalibur')).toBeInTheDocument();
    expect(screen.getByText('Catan')).toBeInTheDocument();

    const links = screen.getAllByText(/Ver comparativa/i);
    expect(links).toHaveLength(2);
    expect(links[0].closest('a')).toHaveAttribute('href', '/game/421285');
  });

  it('filters the catalog table by game title or ID', () => {
    render(<AdminGamesCatalogTable games={sampleGames} />);
    const input = screen.getByPlaceholderText(/Buscar por título o BGG ID/i);
    fireEvent.change(input, { target: { value: 'excalibur' } });

    expect(screen.getByText('Excalibur')).toBeInTheDocument();
    expect(screen.queryByText('Catan')).not.toBeInTheDocument();
  });
});
