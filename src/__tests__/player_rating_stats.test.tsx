import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameDetailPage from '@/app/game/[id]/page';

// Mock queries
jest.mock('@/lib/queries', () => ({
  fetchGameDetails: jest.fn().mockResolvedValue({
    bgg_id: 13,
    name: 'Catan',
    thumbnail: 'https://example.com/catan.jpg',
    image: 'https://example.com/catan.jpg',
    description: 'Juego de mesa clásico de negociación y estrategia.',
    weight: 2.3,
    min_players: 3,
    max_players: 4,
    playing_time: 75,
    bgg_rating: 8.2,
    best_players: 3,
    rulebook_url: 'https://example.com/catan-reglamento-es.pdf',
  }),
  fetchGameOffers: jest.fn().mockResolvedValue([]),
  fetchGameEditions: jest.fn().mockResolvedValue([]),
  fetchPriceHistory: jest.fn().mockResolvedValue([]),
}));

describe('US-92: Player Rating Aggregation & Recommended Player Count Stats', () => {
  it('renders BGG rating, best player count badge, and Spanish rulebook PDF link', async () => {
    const pageComponent = await GameDetailPage({ params: Promise.resolve({ id: '13' }) });
    render(pageComponent);

    // BGG Rating Pill
    expect(screen.getByTestId('bgg-rating-stat')).toHaveTextContent('★ 8.2 / 10');

    // Recommended Best Player Count
    expect(screen.getByTestId('best-players-stat')).toHaveTextContent('Ideal a 3 jug.');

    // Spanish Rulebook Button
    const rulebookBtn = screen.getByTestId('spanish-rulebook-btn');
    expect(rulebookBtn).toBeInTheDocument();
    expect(rulebookBtn).toHaveAttribute('href', 'https://example.com/catan-reglamento-es.pdf');
    expect(rulebookBtn).toHaveTextContent('Descargar reglamento en español (PDF)');
  });
});
