import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
  it('renders tactile UI toggle switch with role="switch" and aria-checked="true" by default', () => {
    render(
      <StoreOffersComparisonTable
        offers={MOCK_OFFERS}
        bggId={101}
        gameName="Wingspan"
        selectedCountry="ES"
      />
    );

    const toggleSwitch = screen.getByRole('switch', { name: /Solo tiendas de mi país/i });
    expect(toggleSwitch).toBeInTheDocument();
    expect(toggleSwitch).toBeChecked();
    expect(toggleSwitch).toHaveAttribute('aria-checked', 'true');
  });

  it('dynamically filters stores matching active destination country without page reloads when toggled', () => {
    render(
      <StoreOffersComparisonTable
        offers={MOCK_OFFERS}
        bggId={101}
        gameName="Wingspan"
        selectedCountry="ES"
      />
    );

    // Initially domestic (ES) only
    expect(screen.getByText('Ludotek Madrid')).toBeInTheDocument();
    expect(screen.queryByText('Spiele Berlin')).not.toBeInTheDocument();
    expect(screen.queryByText('Lisboa Boardgames')).not.toBeInTheDocument();

    const toggleSwitch = screen.getByRole('switch', { name: /Solo tiendas de mi país/i });

    // Toggle OFF -> instantly shows international stores without reload
    fireEvent.click(toggleSwitch);
    expect(toggleSwitch).not.toBeChecked();
    expect(toggleSwitch).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByText('Ludotek Madrid')).toBeInTheDocument();
    expect(screen.getByText('Spiele Berlin')).toBeInTheDocument();
    expect(screen.getByText('Lisboa Boardgames')).toBeInTheDocument();

    // Toggle back ON -> instantly filters back to domestic only
    fireEvent.click(toggleSwitch);
    expect(toggleSwitch).toBeChecked();
    expect(screen.getByText('Ludotek Madrid')).toBeInTheDocument();
    expect(screen.queryByText('Spiele Berlin')).not.toBeInTheDocument();
    expect(screen.queryByText('Lisboa Boardgames')).not.toBeInTheDocument();
  });

  it('dynamically filters for a different selectedCountry (e.g. DE) when prop changes or is provided', () => {
    render(
      <StoreOffersComparisonTable
        offers={MOCK_OFFERS}
        bggId={101}
        gameName="Wingspan"
        selectedCountry="DE"
      />
    );

    // Domestic for DE should only show Spiele Berlin
    expect(screen.getByText('Spiele Berlin')).toBeInTheDocument();
    expect(screen.queryByText('Ludotek Madrid')).not.toBeInTheDocument();
    expect(screen.queryByText('Lisboa Boardgames')).not.toBeInTheDocument();
  });

  it('stops click propagation on the switch input element per AGENTS.md Rule 5.5', () => {
    const parentClickHandler = jest.fn();
    render(
      <div onClick={parentClickHandler}>
        <StoreOffersComparisonTable
          offers={MOCK_OFFERS}
          bggId={101}
          gameName="Wingspan"
          selectedCountry="ES"
        />
      </div>
    );

    const toggleSwitch = screen.getByRole('switch', { name: /Solo tiendas de mi país/i });
    fireEvent.click(toggleSwitch);

    expect(parentClickHandler).not.toHaveBeenCalled();
  });
});
