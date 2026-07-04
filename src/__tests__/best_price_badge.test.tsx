import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StoreOffersComparisonTable, { ComparisonOffer } from '../components/StoreOffersComparisonTable';
import { CatalogView } from '../components/CatalogView';

const mockOffers: ComparisonOffer[] = [
  {
    id: 'offer-1',
    store_id: 'store-es-1',
    store_name: 'Dungeon Marvels',
    store_logo: null,
    store_country: 'ES',
    price: 38.5,
    stock: 5,
    edition_language: 'es',
    shippingCost: 3.99,
    totalCost: 42.49,
  },
  {
    id: 'offer-2',
    store_id: 'store-es-2',
    store_name: 'Zacatrus',
    store_logo: null,
    store_country: 'ES',
    price: 45.0,
    stock: 2,
    edition_language: 'es',
    shippingCost: 0.0,
    totalCost: 45.0,
  },
];

describe('Best Price Deal Badges and Market Bargain Indicator (US-38)', () => {
  test('renders current best price badge on the lowest total cost offer in StoreOffersComparisonTable', () => {
    render(
      <StoreOffersComparisonTable
        offers={mockOffers}
        bggId={13}
        gameName="Catan"
        selectedCountry="ES"
      />
    );

    const currentBestBadge = screen.getByTestId('best-price-badge-current');
    expect(currentBestBadge).toBeInTheDocument();
    expect(currentBestBadge).toHaveTextContent('★ Mejor Precio Actual');
  });

  test('renders historical record badge when offer totalCost matches historicalMinPrice within threshold', () => {
    render(
      <StoreOffersComparisonTable
        offers={mockOffers}
        bggId={13}
        gameName="Catan"
        selectedCountry="ES"
        historicalMinPrice={43.0}
      />
    );

    const historicalBadge = screen.getByTestId('best-price-badge-historical');
    expect(historicalBadge).toBeInTheDocument();
    expect(historicalBadge).toHaveTextContent('★ Récord Mínimo Histórico');
  });

  test('renders catalog best price badge when min_price meets historical_min_price in CatalogView', () => {
    const catalogGames = [
      {
        bgg_id: 13,
        name: 'Catan Español',
        thumbnail: null,
        categories: ['Strategy'],
        min_price: 38.5,
        in_stock: true,
        historical_min_price: 39.0,
      },
      {
        bgg_id: 14,
        name: 'Carcassonne',
        thumbnail: null,
        categories: ['Family'],
        min_price: 25.0,
        in_stock: true,
        historical_min_price: 22.0,
      },
    ];

    render(<CatalogView initialGames={catalogGames} />);

    const badges = screen.getAllByTestId('catalog-best-price-badge');
    expect(badges).toHaveLength(1);
    expect(badges[0]).toHaveTextContent('★ Mínimo Histórico');
  });

  test('ensures zero unicode emoji leakage in badge components', () => {
    const { container } = render(
      <StoreOffersComparisonTable
        offers={mockOffers}
        bggId={13}
        gameName="Catan"
        selectedCountry="ES"
        historicalMinPrice={43.0}
      />
    );

    const textContent = container.textContent || '';
    const bannedEmojis = ['🎲', '🔥', '🌍', '💸', '📦', '⭐', '✨', '⚠️', '🔔', '🏷️', '🏆', '🎉'];
    for (const emoji of bannedEmojis) {
      expect(textContent).not.toContain(emoji);
    }
  });
});
