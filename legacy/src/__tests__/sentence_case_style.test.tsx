import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import StoreOffersComparisonTable, { ComparisonOffer } from '@/components/StoreOffersComparisonTable';

const mockComparisonOffers: ComparisonOffer[] = [
  {
    id: 'off-1',
    store_id: 'store-1',
    store_name: 'Tienda Madrid',
    store_logo: null,
    store_country: 'MX',
    price: 35.0,
    stock: 5,
    edition_language: 'es',
    shippingCost: 3.5,
    totalCost: 38.5,
  },
];

const BANNED_TITLE_CASE_STRINGS = [
  'Mejor Oferta',
  'Lista De Deseos',
  'Comparar Ofertas De Tiendas',
  'Ver Todas Las Tiendas',
  'Añadir Al Carrito',
  'Filtrar Por Categoría',
  'Ordenar Por Precio',
  'Ofertas Disponibles Para',
  'Escribe Una Reseña',
  'Calificar Tienda',
  'Optimizar Carrito De Compra',
  'Configuración De Envío',
  'Puntuación Media',
  'Resumen De Selección',
  'Resultados De Optimización',
];

describe('US-40: Automated Sentence Case Verification Suite & UI Harmonization', () => {
  it('ensures StoreOffersComparisonTable headings and badges follow sentence case', () => {
    const { container } = render(
      <StoreOffersComparisonTable
        offers={mockComparisonOffers}
        bggId={1}
        gameName="Catan"
        selectedCountry="MX"
        historicalMinPrice={30.0}
      />
    );
    const textContent = container.textContent || '';

    BANNED_TITLE_CASE_STRINGS.forEach((banned) => {
      expect(textContent).not.toContain(banned);
    });

    // Verify badges and column headers are in sentence case
    expect(textContent).not.toContain('Mejor Precio Actual');
    expect(textContent).not.toContain('Récord Mínimo Histórico');
    expect(textContent).not.toContain('Ir A Tienda');
  });
});
