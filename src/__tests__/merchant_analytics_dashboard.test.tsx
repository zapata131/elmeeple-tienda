import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MerchantAnalyticsCharts, ClickLogItem } from '@/components/MerchantAnalyticsCharts';

describe('US-10: Merchant Analytics Dashboard Charts & UTM Guide', () => {
  const mockClicks: ClickLogItem[] = [
    {
      created_at: new Date().toISOString(),
      bgg_id: 13,
      bgg_games_cache: { name: 'Catan: El Juego' },
    },
    {
      created_at: new Date().toISOString(),
      bgg_id: 13,
      bgg_games_cache: { name: 'Catan: El Juego' },
    },
    {
      created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      bgg_id: 30549,
      bgg_games_cache: { name: 'Pandemic' },
    },
  ];

  it('renders daily click evolution header and timeframe buttons', () => {
    render(<MerchantAnalyticsCharts clicks={mockClicks} storeUrl="https://tiendajuegos.es" />);

    expect(screen.getByText('Evolución Diaria de Clics Salientes')).toBeInTheDocument();
    expect(screen.getByText('Últimos 7 días')).toBeInTheDocument();
    expect(screen.getByText('Últimos 30 días')).toBeInTheDocument();
    expect(screen.getByText('Histórico Total')).toBeInTheDocument();
  });

  it('renders top referred board games ranking accurately', () => {
    render(<MerchantAnalyticsCharts clicks={mockClicks} storeUrl="https://tiendajuegos.es" />);

    expect(screen.getByText('Top Juegos Generando Tráficos de Referencia')).toBeInTheDocument();
    expect(screen.getByText('Catan: El Juego')).toBeInTheDocument();
    expect(screen.getByText('2 clics')).toBeInTheDocument();
    expect(screen.getByText('Pandemic')).toBeInTheDocument();
    expect(screen.getByText('1 clics')).toBeInTheDocument();
  });

  it('displays comprehensive UTM tracking guide and parameters without raw emojis', () => {
    const { container } = render(<MerchantAnalyticsCharts clicks={mockClicks} storeUrl="https://tiendajuegos.es" />);

    expect(screen.getByText('Guía de Conciliación y Seguimiento UTM')).toBeInTheDocument();
    expect(screen.getAllByText(/utm_source/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/utm_medium/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/affiliate/).length).toBeGreaterThan(0);

    // Verify zero raw unicode emojis
    const textContent = container.textContent || '';
    const bannedEmojis = ['🎲', '🔥', '🌍', '💸', '📦', '🏪', '✨', '⚠️', '📈', '📊'];
    bannedEmojis.forEach((emoji) => {
      expect(textContent).not.toContain(emoji);
    });
  });

  it('switches timeframe filter on click', () => {
    render(<MerchantAnalyticsCharts clicks={mockClicks} storeUrl="https://tiendajuegos.es" />);

    const btn30d = screen.getByText('Últimos 30 días');
    fireEvent.click(btn30d);
    expect(btn30d).toHaveClass('text-indigo-700');
  });
});
