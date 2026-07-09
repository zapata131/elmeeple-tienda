import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StoreOffersComparisonTable, { ComparisonOffer } from '@/components/StoreOffersComparisonTable';

const mockOffers: ComparisonOffer[] = [
  {
    id: 'off-1',
    store_id: 'store-1',
    store_name: 'El Duende CDMX',
    store_logo: null,
    store_country: 'MX',
    price: 850.0,
    stock: 3,
    edition_language: 'es',
    shippingCost: 99.0,
    totalCost: 949.0,
    store_product_url: 'https://elduende.com.mx/catan',
  },
  {
    id: 'off-2',
    store_id: 'store-2',
    store_name: 'La Caravana Gamelab',
    store_logo: null,
    store_country: 'MX',
    price: 920.0,
    stock: 5,
    edition_language: 'es',
    shippingCost: 0,
    totalCost: 920.0,
    store_product_url: 'https://lacaravana.mx/catan',
  },
];

describe('US-75: All-Time Lowest Price Badge & Historical Summary Suite', () => {
  it('renders historical price summary banner and active all-time low indicator when historicalMinPrice is set', () => {
    render(
      <StoreOffersComparisonTable
        offers={mockOffers}
        bggId={13}
        gameName="Catan"
        selectedCountry="MX"
        historicalMinPrice={920.0}
      />
    );

    // Header summary banner
    const summaryBanner = screen.getByTestId('historical-price-summary-banner');
    expect(summaryBanner).toBeInTheDocument();
    expect(summaryBanner).toHaveTextContent('$920.00');
    expect(summaryBanner).toHaveTextContent('¡Récord mínimo histórico activo!');

    // Individual row historical record badge
    const historicalBadge = screen.getByTestId('best-price-badge-historical');
    expect(historicalBadge).toBeInTheDocument();
    expect(historicalBadge).toHaveTextContent('★ Récord mínimo histórico');
  });

  it('omits historical price summary banner when historicalMinPrice is null', () => {
    render(
      <StoreOffersComparisonTable
        offers={mockOffers}
        bggId={13}
        gameName="Catan"
        selectedCountry="MX"
        historicalMinPrice={null}
      />
    );

    expect(screen.queryByTestId('historical-price-summary-banner')).not.toBeInTheDocument();
    expect(screen.queryByTestId('best-price-badge-historical')).not.toBeInTheDocument();
  });
});
