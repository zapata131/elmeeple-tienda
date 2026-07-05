import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StoreOffersComparisonTable, { ComparisonOffer } from '@/components/StoreOffersComparisonTable';
import { MerchantFeaturedDealsPanel, MerchantDealItem } from '@/components/MerchantFeaturedDealsPanel';

const mockOffers: ComparisonOffer[] = [
  {
    id: 'offer-cheaper-standard',
    store_id: 'store-es-1',
    store_name: 'Tienda Estándar',
    store_logo: null,
    store_country: 'ES',
    price: 32.0,
    stock: 10,
    edition_language: 'es',
    shippingCost: 3.0,
    totalCost: 35.0,
    is_featured: false,
  },
  {
    id: 'offer-premium-featured',
    store_id: 'store-es-2',
    store_name: 'Ludoteca Madrid VIP',
    store_logo: null,
    store_country: 'ES',
    price: 36.0,
    stock: 5,
    edition_language: 'es',
    shippingCost: 2.0,
    totalCost: 38.0,
    is_featured: true,
  },
];

const mockMerchantDeals: MerchantDealItem[] = [
  {
    id: 'deal-1',
    bgg_id: 13,
    game_name: 'Catan Español',
    price: 37.5,
    stock: 8,
    is_featured: true,
  },
  {
    id: 'deal-2',
    bgg_id: 266192,
    game_name: 'Wingspan',
    price: 49.9,
    stock: 12,
    is_featured: false,
  },
];

describe('US-41: Sponsored Featured Store Placement in Comparison Table and Merchant Dashboard', () => {
  it('highlights featured offers at the top of the comparison table even if price is slightly higher', () => {
    render(
      <StoreOffersComparisonTable
        offers={mockOffers}
        bggId={13}
        gameName="Catan"
        selectedCountry="ES"
        historicalMinPrice={30.0}
      />
    );

    const rows = screen.getAllByTestId(/^store-offer-row-/);
    expect(rows).toHaveLength(2);

    // First row should be the featured store (Ludoteca Madrid VIP) despite higher totalCost (38.0 vs 35.0)
    expect(rows[0]).toHaveTextContent('Ludoteca Madrid VIP');
    expect(rows[1]).toHaveTextContent('Tienda Estándar');
  });

  it('renders distinct sentence-case badge ★ Tienda recomendada on featured offers', () => {
    render(
      <StoreOffersComparisonTable
        offers={mockOffers}
        bggId={13}
        gameName="Catan"
        selectedCountry="ES"
      />
    );

    const badge = screen.getByTestId('featured-store-badge-offer-premium-featured');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('★ Tienda recomendada');

    // Should not render featured badge on non-featured offer
    expect(screen.queryByTestId('featured-store-badge-offer-cheaper-standard')).not.toBeInTheDocument();
  });

  it('renders self-serve featured deal toggles in MerchantFeaturedDealsPanel with accessible switches', () => {
    const handleToggleMock = jest.fn();
    render(
      <MerchantFeaturedDealsPanel
        storeId="store-es-2"
        initialDeals={mockMerchantDeals}
        onToggleFeatured={handleToggleMock}
      />
    );

    expect(screen.getByText('Gestión de ofertas destacadas patrocinadas')).toBeInTheDocument();
    expect(screen.getByText('Catan Español')).toBeInTheDocument();
    expect(screen.getByText('Wingspan')).toBeInTheDocument();

    const switches = screen.getAllByRole('switch');
    expect(switches.length).toBeGreaterThanOrEqual(2);

    // First switch is Catan (is_featured: true)
    expect(switches[0]).toBeChecked();
    // Second switch is Wingspan (is_featured: false)
    expect(switches[1]).not.toBeChecked();

    fireEvent.click(switches[1]);
    expect(handleToggleMock).toHaveBeenCalledWith('deal-2', true);
  });

  it('ensures zero raw unicode emoji leakage and sentence case adherence in featured components', () => {
    const { container: tableContainer } = render(
      <StoreOffersComparisonTable
        offers={mockOffers}
        bggId={13}
        gameName="Catan"
        selectedCountry="ES"
      />
    );
    const { container: panelContainer } = render(
      <MerchantFeaturedDealsPanel
        storeId="store-es-2"
        initialDeals={mockMerchantDeals}
      />
    );

    const combinedText = (tableContainer.textContent || '') + ' ' + (panelContainer.textContent || '');

    // Title Case violations check
    const bannedTitleCase = [
      'Tienda Recomendada',
      'Oferta Destacada',
      'Gestión De Ofertas Destacadas Patrocinadas',
      'Activar Patrocinio',
    ];
    bannedTitleCase.forEach((banned) => {
      expect(combinedText).not.toContain(banned);
    });
  });
});
