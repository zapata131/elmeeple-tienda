import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchResultsPage from '@/app/search/page';
import { SearchBar } from '@/components/SearchBar';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams('q=espacio'),
  usePathname: () => '/search',
}));

// Mock fetch for /api/search
global.fetch = jest.fn().mockImplementation((url) => {
  if (typeof url === 'string' && url.includes('/api/search')) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          games: [{ bgg_id: 359871, name: 'Arcs', thumbnail: 'https://mock.jpg' }],
          stores: [{ id: 'store-mx-01', name: 'Ficha y Dado', base_url: 'https://fichaydado.com' }],
          categories: [{ tag: 'Ciencia Ficción' }],
        }),
    });
  }
  return Promise.reject(new Error('Unknown url'));
});

describe('US-74: Dedicated Search Results Page for Non-Exact Queries', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders viable games, stores, and categories when visiting /search?q=espacio', async () => {
    render(<SearchResultsPage />);

    expect(screen.getByText(/Opciones viables para "espacio"/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Arcs')).toBeInTheDocument();
      expect(screen.getByText('Ficha y Dado')).toBeInTheDocument();
      expect(screen.getByText('🏷️ Ciencia Ficción')).toBeInTheDocument();
    });
  });

  it('routes non-exact query submission in SearchBar directly to /search?q=...', () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/Buscar juegos de mesa/i);
    fireEvent.change(input, { target: { value: 'estrategia galáctica' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockPush).toHaveBeenCalledWith('/search?q=estrategia%20gal%C3%A1ctica');
  });

  it('routes unselected autocomplete query submission directly to /search?q=... instead of jumping to first game', async () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/Buscar juegos de mesa/i);
    fireEvent.change(input, { target: { value: 'Arcs' } });
    
    await waitFor(() => {
      expect(screen.getByText('Arcs')).toBeInTheDocument();
    });

    // Submitting form without pressing arrow down or clicking activeIndex
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(mockPush).toHaveBeenCalledWith('/search?q=Arcs');
  });
});
