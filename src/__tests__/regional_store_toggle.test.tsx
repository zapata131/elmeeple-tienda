import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StoreOffersComparisonTable from '@/components/StoreOffersComparisonTable';

const MOCK_OFFERS = [
  {
    id: 'off-1',
    store_id: 'store-es-1',
    store_name: 'Zygomatic España',
    store_logo: null,
    store_country: 'ES',
    rating: 4.9,
    review_count: 100,
    price: 35.00,
    stock: 10,
    edition_language: 'es',
    shippingCost: 3.99,
    totalCost: 38.99,
  },
  {
    id: 'off-2',
    store_id: 'store-de-1',
    store_name: 'Brettspiel DE',
    store_logo: null,
    store_country: 'DE',
    rating: 4.8,
    review_count: 200,
    price: 30.00,
    stock: 5,
    edition_language: 'de',
    shippingCost: 8.50,
    totalCost: 38.50,
  },
  {
    id: 'off-3',
    store_id: 'store-us-1',
    store_name: 'Meepleland USA',
    store_logo: null,
    store_country: 'US',
    rating: 4.6,
    review_count: 50,
    price: 32.00,
    stock: 3,
    edition_language: 'en',
    shippingCost: 14.00,
    totalCost: 46.00,
  },
];

describe('US-27: Regional Store Filter Toggle (Default Activated)', () => {
  it('renders toggle activated by default and displays only domestic stores matching selected country', () => {
    render(
      <StoreOffersComparisonTable
        offers={MOCK_OFFERS}
        bggId={13}
        gameName="Catan"
        selectedCountry="ES"
      />
    );

    // Toggle should be checked/active by default
    const checkbox = screen.getByRole('switch', { name: /Solo tiendas de mi país/i });
    expect(checkbox).toBeChecked();

    // Only ES store should be displayed
    expect(screen.getByText('Zygomatic España')).toBeInTheDocument();
    expect(screen.queryByText('Brettspiel DE')).not.toBeInTheDocument();
    expect(screen.queryByText('Meepleland USA')).not.toBeInTheDocument();
  });

  it('reveals international shops and shows customs/tax notice when user deactivates the toggle', () => {
    render(
      <StoreOffersComparisonTable
        offers={MOCK_OFFERS}
        bggId={13}
        gameName="Catan"
        selectedCountry="ES"
      />
    );

    const checkbox = screen.getByRole('switch', { name: /Solo tiendas de mi país/i });
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();

    // Now international stores appear
    expect(screen.getByText('Zygomatic España')).toBeInTheDocument();
    expect(screen.getByText('Brettspiel DE')).toBeInTheDocument();
    expect(screen.getByText('Meepleland USA')).toBeInTheDocument();

    // And international tax notice is visible
    expect(screen.getAllByText(/Envío internacional \+ posibles aranceles/i).length).toBeGreaterThanOrEqual(1);
  });
});
