import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StoreOffersComparisonTable, { ComparisonOffer } from '@/components/StoreOffersComparisonTable';

const mockOffers: ComparisonOffer[] = [
  {
    id: 'off-1',
    store_id: 'store-1',
    store_name: 'El Duende CDMX',
    store_logo: null,
    store_country: 'MX',
    price: 800.0,
    stock: 5,
    edition_language: 'es',
    shippingCost: 99.0,
    totalCost: 899.0,
    store_product_url: 'https://elduende.com.mx/catan',
  },
];

describe('US-91: Regional State & Dynamic Shipping Fee Recalculator', () => {
  it('renders destination state selector and recalculates regional shipping fee on selection', () => {
    render(
      <StoreOffersComparisonTable
        offers={mockOffers}
        bggId={13}
        gameName="Catan"
        selectedCountry="MX"
      />
    );

    const stateSelect = screen.getByTestId('destination-state-select');
    expect(stateSelect).toBeInTheDocument();

    // Default CDMX shipping cost is $99.00 -> Total $899.00
    expect(screen.getByText('$899.00')).toBeInTheDocument();

    // Change state to Baja California (which applies +$45 regional surcharge)
    fireEvent.change(stateSelect, { target: { value: 'BC' } });

    // Recalculated shipping cost: $99 + $45 = $144.00 -> Total $944.00
    expect(screen.getByText('$944.00')).toBeInTheDocument();
  });
});
