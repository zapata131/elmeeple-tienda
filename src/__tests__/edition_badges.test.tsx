import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StoreOffersComparisonTable, { ComparisonOffer } from '@/components/StoreOffersComparisonTable';

const MOCK_EDITION_OFFERS: ComparisonOffer[] = [
  {
    id: 'lang-es',
    store_id: 'store-1',
    store_name: 'Store ES',
    store_logo: null,
    store_country: 'ES',
    price: 40.0,
    stock: 5,
    edition_language: 'es',
    shippingCost: 3.0,
    totalCost: 43.0,
  },
  {
    id: 'lang-pt',
    store_id: 'store-2',
    store_name: 'Store PT',
    store_logo: null,
    store_country: 'PT',
    price: 39.0,
    stock: 5,
    edition_language: 'pt',
    shippingCost: 4.0,
    totalCost: 43.0,
  },
  {
    id: 'lang-en',
    store_id: 'store-3',
    store_name: 'Store EN',
    store_logo: null,
    store_country: 'ES',
    price: 38.0,
    stock: 5,
    edition_language: 'en',
    shippingCost: 3.0,
    totalCost: 41.0,
  },
  {
    id: 'lang-de',
    store_id: 'store-4',
    store_name: 'Store DE',
    store_logo: null,
    store_country: 'ES',
    price: 37.0,
    stock: 5,
    edition_language: 'de',
    shippingCost: 3.0,
    totalCost: 40.0,
  },
  {
    id: 'lang-multi',
    store_id: 'store-5',
    store_name: 'Store MULTI',
    store_logo: null,
    store_country: 'ES',
    price: 42.0,
    stock: 5,
    edition_language: 'multi',
    shippingCost: 3.0,
    totalCost: 45.0,
  },
];

describe('US-30 (Issue #33): Multi-Language Box Edition Badges', () => {
  it('renders styled badges/pills for ES, PT, EN, DE, and MULTI editions without raw unicode emojis', () => {
    const { container } = render(
      <StoreOffersComparisonTable
        offers={MOCK_EDITION_OFFERS}
        bggId={1001}
        gameName="Terraforming Mars"
        selectedCountry="ES"
      />
    );

    // Verify edition badges are rendered using clean typographic pills or vector elements
    expect(screen.getByTestId('edition-badge-es')).toBeInTheDocument();
    expect(screen.getByTestId('edition-badge-pt')).toBeInTheDocument();
    expect(screen.getByTestId('edition-badge-en')).toBeInTheDocument();
    expect(screen.getByTestId('edition-badge-de')).toBeInTheDocument();
    expect(screen.getByTestId('edition-badge-multi')).toBeInTheDocument();

    // Verify that NO raw unicode flag emojis exist anywhere in container text
    const textContent = container.textContent || '';
    const bannedFlagEmojis = ['🇪🇸', '🇵🇹', '🇧🇷', '🇬🇧', '🇩🇪', '🌐'];
    bannedFlagEmojis.forEach((emoji) => {
      expect(textContent).not.toContain(emoji);
    });
  });
});
