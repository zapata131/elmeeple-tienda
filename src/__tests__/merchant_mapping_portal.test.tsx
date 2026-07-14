import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MerchantMappingPortal } from '@/components/MerchantMappingPortal';

describe('US-107: Merchant Self-Service Feed Mapping Portal', () => {
  const mockStoreId = 'store-1';
  const mockUnmatchedItems = [
    {
      id: 'queue-101',
      store_id: 'store-1',
      ean: '7509876543210',
      title: 'Dune Imperium Uprising Edición MX',
      store_product_url: 'https://tienda.mx/dune-uprising',
      status: 'pending',
      created_at: '2026-07-14T11:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders unmatched feed items and expands BGG binding search controls on click', async () => {
    render(<MerchantMappingPortal storeId={mockStoreId} initialItems={mockUnmatchedItems} />);

    expect(screen.getByText('Dune Imperium Uprising Edición MX')).toBeInTheDocument();
    
    // Click 'Mapear producto' button to expand mapping controls
    const mapBtn = screen.getByText('Mapear producto');
    fireEvent.click(mapBtn);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Buscar juego en el catálogo BGG/i)).toBeInTheDocument();
      expect(screen.getByText('Vincular juego')).toBeInTheDocument();
    });
  });

  it('binds an unmatched item to a selected BGG ID and updates mapping memory', async () => {
    global.fetch = jest.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url === '/api/merchant/mapping' && init?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, message: 'Producto vinculado y guardado en memoria permanente.' }),
        });
      }
      if (url.includes('/api/search')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ games: [{ bgg_id: 316554, name: 'Dune: Imperium' }] }),
        });
      }
      return Promise.resolve({ ok: false });
    });

    render(<MerchantMappingPortal storeId={mockStoreId} initialItems={mockUnmatchedItems} />);

    // Click 'Mapear producto' button to expand controls
    const mapBtn = screen.getByText('Mapear producto');
    fireEvent.click(mapBtn);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Buscar juego en el catálogo BGG/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Buscar juego en el catálogo BGG/i);
    fireEvent.change(searchInput, { target: { value: '316554' } });

    const bindBtn = screen.getByText('Vincular juego');
    fireEvent.click(bindBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/merchant/mapping', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          storeId: 'store-1',
          queueId: 'queue-101',
          merchantSku: '7509876543210',
          bggId: 316554,
          storeProductUrl: 'https://tienda.mx/dune-uprising',
        }),
      }));
    });
  });
});
