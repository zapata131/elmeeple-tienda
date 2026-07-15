import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminQueueMonitor, QueueItem } from '@/components/AdminQueueMonitor';

describe('US-106: Admin Queue Interactive Suggestions & Auto-complete Search', () => {
  const mockStagedItems: QueueItem[] = [
    {
      id: 'queue-staged-1',
      store_id: 'store-1',
      ean: '7501234567890',
      title: 'Catan Edición Especial 2026',
      store_product_url: 'https://tienda.mx/catan-2026',
      status: 'staged',
      match_confidence: 0.88,
      suggested_bgg_id: 13,
      suggested_game_name: 'Catan: El Juego',
      suggested_game_thumbnail: 'https://cf.geekdo-images.com/catan.jpg',
      created_at: '2026-07-15T08:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders suggested game name, thumbnail, and confidence badge for staged items', () => {
    render(<AdminQueueMonitor initialItems={mockStagedItems} />);

    expect(screen.getByText('Catan Edición Especial 2026')).toBeInTheDocument();
    expect(screen.getByText('Catan: El Juego')).toBeInTheDocument();
    expect(screen.getByText(/88% coincidencia/i)).toBeInTheDocument();
    expect(screen.getByText('Aprobar coincidencia')).toBeInTheDocument();
  });

  it('provides live interactive BGG search suggestions when re-mapping catalog', async () => {
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/api/search')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            games: [
              { bgg_id: 316554, name: 'Dune: Imperium – Uprising', thumbnail: 'https://cf.geekdo-images.com/dune.jpg' },
            ],
          }),
        });
      }
      return Promise.resolve({ ok: false });
    });

    render(<AdminQueueMonitor initialItems={mockStagedItems} />);

    const remapBtn = screen.getByText('Reasignar catálogo');
    fireEvent.click(remapBtn);

    const searchInput = screen.getByPlaceholderText(/Buscar juego en BGG/i);
    fireEvent.change(searchInput, { target: { value: 'Dune' } });

    await waitFor(() => {
      expect(screen.getByText('Dune: Imperium – Uprising')).toBeInTheDocument();
    });
  });
});
