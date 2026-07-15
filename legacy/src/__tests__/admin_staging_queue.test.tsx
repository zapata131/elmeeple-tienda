import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminQueueMonitor } from '@/components/AdminQueueMonitor';

describe('US-106: Admin Staging & Moderation Queue UI for Medium-Confidence Matches', () => {
  const mockInitialItems = [
    {
      id: 'queue-1',
      store_id: 'store-1',
      ean: '7501234567890',
      title: 'Catan Edición 2026',
      store_product_url: 'https://store.com/catan-2026',
      status: 'staged',
      match_confidence: 0.85,
      suggested_bgg_id: 13,
      created_at: '2026-07-14T10:00:00Z',
    },
    {
      id: 'queue-2',
      store_id: 'store-1',
      ean: null,
      title: 'Wingspan Asia Expansion Promo',
      store_product_url: 'https://store.com/wingspan-asia',
      status: 'pending',
      match_confidence: 0.50,
      suggested_bgg_id: null,
      created_at: '2026-07-14T11:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders medium-confidence staged items with confidence score badge and action buttons', () => {
    render(<AdminQueueMonitor initialItems={mockInitialItems} />);

    expect(screen.getByText('Catan Edición 2026')).toBeInTheDocument();
    expect(screen.getByText(/85% coincidencia/i)).toBeInTheDocument();
    expect(screen.getByText('Aprobar coincidencia')).toBeInTheDocument();
    expect(screen.getAllByText('Reasignar catálogo')[0]).toBeInTheDocument();
  });

  it('approves a medium-confidence match and updates list upon clicking Aprobar coincidencia', async () => {
    global.fetch = jest.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url === '/api/admin/feed-queue' && init?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, message: 'Coincidencia aprobada correctamente.' }),
        });
      }
      return Promise.resolve({ ok: false });
    });

    render(<AdminQueueMonitor initialItems={mockInitialItems} />);

    const approveBtn = screen.getByText('Aprobar coincidencia');
    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/feed-queue', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ id: 'queue-1', action: 'approve', bgg_id: 13 }),
      }));
    });
  });

  it('triggers manual re-mapping modal/flow upon clicking Reasignar catálogo', async () => {
    render(<AdminQueueMonitor initialItems={mockInitialItems} />);

    const remapBtn = screen.getAllByText('Reasignar catálogo')[0];
    fireEvent.click(remapBtn);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Buscar juego en BGG/i)).toBeInTheDocument();
    });
  });
});
