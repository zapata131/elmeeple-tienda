import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MerchantClickAnalytics, ClickRecord } from '@/components/MerchantClickAnalytics';

describe('US-100: Merchant Outbound Click Analytics & CPC Monthly Billing Generator', () => {
  const mockClicks: ClickRecord[] = [
    {
      id: 'click-1',
      created_at: new Date('2026-07-05T10:00:00Z').toISOString(),
      bgg_id: 13,
      bgg_games_cache: { name: 'Catan' },
      store_id: 'store-1',
    },
    {
      id: 'click-2',
      created_at: new Date('2026-07-06T14:30:00Z').toISOString(),
      bgg_id: 13,
      bgg_games_cache: { name: 'Catan' },
      store_id: 'store-1',
    },
    {
      id: 'click-3',
      created_at: new Date('2026-07-07T09:15:00Z').toISOString(),
      bgg_id: 266192,
      bgg_games_cache: { name: 'Wingspan' },
      store_id: 'store-1',
    },
    {
      id: 'click-4',
      created_at: new Date('2026-06-15T11:00:00Z').toISOString(),
      bgg_id: 167791,
      bgg_games_cache: { name: 'Terraforming Mars' },
      store_id: 'store-1',
    },
  ];

  it('renders click-through analytics summary cards and top games ranking in sentence case', () => {
    render(<MerchantClickAnalytics clicks={mockClicks} storeName="Dungeon Shop CDMX" />);

    expect(screen.getByText('Analítica de clics salientes y facturación cpc')).toBeInTheDocument();
    expect(screen.getByText('Rendimiento por juego')).toBeInTheDocument();
    expect(screen.getAllByText(/catan/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/2 clics|2/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/wingspan/i).length).toBeGreaterThan(0);
  });

  it('calculates automated monthly CPC invoice summary based on selected month and rate', () => {
    render(<MerchantClickAnalytics clicks={mockClicks} storeName="Dungeon Shop CDMX" defaultCpcRate={3.00} />);

    // Click on invoice tab or view invoice section
    const invoiceTab = screen.getByRole('button', { name: /facturación y resumen cpc/i });
    fireEvent.click(invoiceTab);

    expect(screen.getByText('Resumen de facturación mensual (cpc)')).toBeInTheDocument();

    // Check month selector & CPC rate input
    const monthSelect = screen.getByLabelText(/período de facturación/i);
    expect(monthSelect).toBeInTheDocument();

    // In July 2026, there are 3 clicks. 3 * $3.00 = $9.00
    expect(screen.getAllByText((content, element) => element?.textContent === '$9.00 MXN').length).toBeGreaterThan(0);
  });

  it('updates total invoice amount when CPC rate input is changed', () => {
    render(<MerchantClickAnalytics clicks={mockClicks} storeName="Dungeon Shop CDMX" defaultCpcRate={3.00} />);

    const invoiceTab = screen.getByRole('button', { name: /facturación y resumen cpc/i });
    fireEvent.click(invoiceTab);

    const rateInput = screen.getByLabelText(/tarifa por clic \(cpc\)/i);
    fireEvent.change(rateInput, { target: { value: '5.00' } });

    // 3 clicks * $5.00 = $15.00 MXN
    expect(screen.getAllByText(/15.00/i).length).toBeGreaterThan(0);
  });

  it('filters invoice breakdown when changing billing month', () => {
    render(<MerchantClickAnalytics clicks={mockClicks} storeName="Dungeon Shop CDMX" defaultCpcRate={3.00} />);

    const invoiceTab = screen.getByRole('button', { name: /facturación y resumen cpc/i });
    fireEvent.click(invoiceTab);

    const monthSelect = screen.getByLabelText(/período de facturación/i);
    // Switch to June 2026 (2026-06)
    fireEvent.change(monthSelect, { target: { value: '2026-06' } });

    // In June 2026, there is 1 click. 1 * $3.00 = $3.00
    expect(screen.getAllByText('$3.00 MXN').length).toBeGreaterThan(0);
    expect(screen.getByText('Terraforming Mars')).toBeInTheDocument();
  });

  it('provides a button to download or print invoice summary', () => {
    render(<MerchantClickAnalytics clicks={mockClicks} storeName="Dungeon Shop CDMX" />);

    const invoiceTab = screen.getByRole('button', { name: /facturación y resumen cpc/i });
    fireEvent.click(invoiceTab);

    expect(screen.getByRole('button', { name: /descargar desglose csv/i })).toBeInTheDocument();
  });

  it('contains zero raw unicode emojis', () => {
    const { container } = render(<MerchantClickAnalytics clicks={mockClicks} storeName="Dungeon Shop CDMX" />);

    const textContent = container.textContent || '';
    const bannedEmojis = ['🎲', '🔥', '🌍', '💸', '📦', '🏪', '✨', '⚠️', '📈', '📊', '⚡', '❌', '✅', '💰'];
    bannedEmojis.forEach((emoji) => {
      expect(textContent).not.toContain(emoji);
    });
  });
});
