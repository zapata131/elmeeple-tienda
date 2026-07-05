import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StoreOffersComparisonTable, { ComparisonOffer } from '@/components/StoreOffersComparisonTable';

const MOCK_OFFERS: ComparisonOffer[] = [
  {
    id: 'off-1',
    store_id: 'store-es-1',
    store_name: 'Ludotek Madrid',
    store_logo: null,
    store_country: 'ES',
    rating: 4.9,
    review_count: 150,
    price: 40.00,
    stock: 12,
    edition_language: 'es',
    shippingCost: 3.50,
    totalCost: 43.50,
  },
  {
    id: 'off-2',
    store_id: 'store-de-1',
    store_name: 'Spiele Berlin',
    store_logo: null,
    store_country: 'DE',
    rating: 4.7,
    review_count: 80,
    price: 38.00,
    stock: 5,
    edition_language: 'de',
    shippingCost: 9.00,
    totalCost: 47.00,
  },
  {
    id: 'off-3',
    store_id: 'store-pt-1',
    store_name: 'Lisboa Boardgames',
    store_logo: null,
    store_country: 'PT',
    rating: 4.8,
    review_count: 60,
    price: 39.00,
    stock: 8,
    edition_language: 'pt',
    shippingCost: 6.00,
    totalCost: 45.00,
  },
];

describe('US-32 (Issue #35): Tactile Regional Domestic Filtering Toggle', () => {
  it('renders store offers table correctly', () => {
    render(
      <StoreOffersComparisonTable
        offers={MOCK_OFFERS}
        bggId={101}
        gameName="Wingspan"
        selectedCountry="ES"
      />
    );
    expect(screen.getByText('Ludotek Madrid')).toBeInTheDocument();
  });

  it('sorts out-of-stock offers to the bottom below all in-stock offers', () => {
    const mixedOffers: ComparisonOffer[] = [
      {
        id: 'off-cheap-oos',
        store_id: 'store-mx-1',
        store_name: 'Tienda Agotada Barata',
        store_logo: null,
        price: 100,
        stock: 0,
        edition_language: 'es',
        shippingCost: 0,
        totalCost: 100,
      },
      {
        id: 'off-pricier-in-stock',
        store_id: 'store-mx-2',
        store_name: 'Tienda En Stock',
        store_logo: null,
        price: 200,
        stock: 5,
        edition_language: 'es',
        shippingCost: 0,
        totalCost: 200,
      },
    ];

    render(
      <StoreOffersComparisonTable
        offers={mixedOffers}
        bggId={101}
        gameName="Wingspan"
        selectedCountry="MX"
      />
    );

    const rows = screen.getAllByTestId(/^store-offer-row-/);
    expect(rows).toHaveLength(2);
    // First row should be Tienda En Stock despite being $200 vs $100
    expect(rows[0]).toHaveTextContent('Tienda En Stock');
    expect(rows[1]).toHaveTextContent('Tienda Agotada Barata');
  });
});
