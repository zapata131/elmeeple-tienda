import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CatalogView } from '@/components/CatalogView';
import StoreOffersComparisonTable, { ComparisonOffer } from '@/components/StoreOffersComparisonTable';
import { StoreReviewPanel } from '@/components/StoreReviewPanel';
import { CartOptimizerPanel } from '@/components/CartOptimizerPanel';
import { MOCK_GAMES } from '@/utils/mockData';

const mockCatalogGames = [
  {
    bgg_id: 1,
    name: 'Catan',
    thumbnail: null,
    categories: ['Estrategia', 'Familiar'],
    min_price: 35.0,
    in_stock: true,
    historical_min_price: 30.0,
  },
  {
    bgg_id: 2,
    name: 'Carcassonne',
    thumbnail: null,
    categories: ['Colocación de losetas'],
    min_price: 25.0,
    in_stock: true,
    historical_min_price: 22.0,
  },
];

const mockComparisonOffers: ComparisonOffer[] = [
  {
    id: 'off-1',
    store_id: 'store-1',
    store_name: 'Tienda Madrid',
    store_logo: null,
    store_country: 'ES',
    rating: 4.8,
    review_count: 50,
    price: 35.0,
    stock: 5,
    edition_language: 'es',
    shippingCost: 3.5,
    totalCost: 38.5,
  },
];

// Helper to detect Title Case violations in multi-word strings (words capitalized that are not proper nouns/acronyms)
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
  it('ensures CatalogView headings, filter labels, and buttons strictly follow sentence case without Title Case violations', () => {
    const { container } = render(<CatalogView initialGames={mockCatalogGames} />);
    const textContent = container.textContent || '';

    BANNED_TITLE_CASE_STRINGS.forEach((banned) => {
      expect(textContent).not.toContain(banned);
    });

    // Check specific headings in CatalogView
    const h1s = container.querySelectorAll('h1, h2, h3, h4');
    h1s.forEach((h) => {
      const text = h.textContent?.trim() || '';
      if (text && text.length > 3) {
        // First letter should be capitalized, but not 3 words in a row starting with capital unless acronym/proper noun
        expect(text).not.toMatch(/^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+ [A-ZÁÉÍÓÚÑ][a-záéíóúñ]+ [A-ZÁÉÍÓÚÑ][a-záéíóúñ]+$/);
      }
    });
  });

  it('ensures StoreOffersComparisonTable headings and badges follow sentence case', () => {
    const { container } = render(
      <StoreOffersComparisonTable
        offers={mockComparisonOffers}
        bggId={1}
        gameName="Catan"
        selectedCountry="ES"
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

  it('ensures StoreReviewPanel headings and buttons follow sentence case', () => {
    const { container } = render(
      <StoreReviewPanel
        storeId="store-1"
        storeName="Cuarto de Juegos"
        initialReviews={[]}
        initialAvgRating={5}
        initialTagCounts={{ 'Esquinas Protegidas': 1 }}
      />
    );
    const textContent = container.textContent || '';

    BANNED_TITLE_CASE_STRINGS.forEach((banned) => {
      expect(textContent).not.toContain(banned);
    });

    expect(textContent).not.toContain('Dejar Reseña');
    expect(textContent).not.toContain('Etiquetas De Experiencia');
    expect(textContent).not.toContain('Puntuación Media');
  });

  it('ensures CartOptimizerPanel headings and actions follow sentence case', () => {
    const { container } = render(
      <CartOptimizerPanel
        initialGames={MOCK_GAMES.slice(0, 3)}
      />
    );
    const textContent = container.textContent || '';

    BANNED_TITLE_CASE_STRINGS.forEach((banned) => {
      expect(textContent).not.toContain(banned);
    });

    expect(textContent).not.toContain('Comparador De Pedidos');
    expect(textContent).not.toContain('Calcular Mejor Opción');
    expect(textContent).not.toContain('Resumen De Selección');
    expect(textContent).not.toContain('Resultados De Optimización');
  });
});


