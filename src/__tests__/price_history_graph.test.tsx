import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PriceHistoryChart, { PriceHistoryPoint } from '@/components/PriceHistoryChart';

const mockPricePoints: PriceHistoryPoint[] = [
  { recorded_at: '2026-04-01', min_price: 950.0 },
  { recorded_at: '2026-05-01', min_price: 920.0 },
  { recorded_at: '2026-06-01', min_price: 850.0 },
  { recorded_at: '2026-07-01', min_price: 890.0 },
];

describe('US-98: Historical Price Time-Series Logger & Interactive Price Drop Graphs', () => {
  it('renders interactive SVG price history chart with 90-day lowest price and discount metrics', () => {
    render(
      <PriceHistoryChart
        bggId={13}
        gameName="Catan"
        history={mockPricePoints}
        currentMinPrice={850.0}
      />
    );

    // Chart header & badge
    expect(screen.getByTestId('price-history-chart')).toBeInTheDocument();
    expect(screen.getByText('Historial de precios (Últimos 90 días)')).toBeInTheDocument();
    expect(screen.getByTestId('lowest-price-recorded')).toHaveTextContent('$850.00 MXN');

    // Time-range filter buttons (30 días, 90 días, 1 año)
    expect(screen.getByRole('button', { name: '30 días' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '90 días' })).toBeInTheDocument();

    // SVG elements
    const svgChart = screen.getByTestId('price-history-svg');
    expect(svgChart).toBeInTheDocument();
  });

  it('renders empty state message when no historical price points exist', () => {
    render(
      <PriceHistoryChart
        bggId={13}
        gameName="Catan"
        history={[]}
        currentMinPrice={850.0}
      />
    );

    expect(screen.getByTestId('price-history-empty')).toHaveTextContent('Sin suficiente historial de precios registrado aún.');
  });
});
