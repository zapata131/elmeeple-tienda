import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SearchBar } from '@/components/SearchBar';
import { GET as SearchGet } from '@/app/api/search/route';
import { NextRequest } from 'next/server';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

describe('US-19: Unified Smart Autocomplete Dropdown', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  describe('API Endpoint (/api/search)', () => {
    it('returns categorized object containing games, stores, and categories', async () => {
      const req = new NextRequest('http://localhost:3001/api/search?q=cat');
      const res = await SearchGet(req);
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data).toHaveProperty('games');
      expect(data).toHaveProperty('stores');
      expect(data).toHaveProperty('categories');
      expect(Array.isArray(data.games)).toBe(true);
      expect(Array.isArray(data.stores)).toBe(true);
      expect(Array.isArray(data.categories)).toBe(true);
    });
  });

  describe('SearchBar Component Categorized UI', () => {
    it('renders categorized sections and responds to keyboard navigation', async () => {
      const mockResponse = {
        games: [{ bgg_id: 13, name: 'Catan', thumbnail: 'http://img/catan.jpg' }],
        stores: [{ id: 's1', name: 'Zygomatic España', base_url: 'http://zygomatic.es' }],
        categories: [{ tag: 'Negociación' }],
      };

      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        })
      );

      render(<SearchBar />);
      const input = screen.getByPlaceholderText(/buscar juegos de mesa|search board games/i);

      await act(async () => {
        fireEvent.change(input, { target: { value: 'cat' } });
      });

      await waitFor(() => {
        expect(screen.getByText('Juegos de Mesa')).toBeInTheDocument();
        expect(screen.getByText('Tiendas Asociadas')).toBeInTheDocument();
        expect(screen.getByText('Categorías y Temáticas')).toBeInTheDocument();
      });

      // Test keyboard navigation Down arrow
      await act(async () => {
        fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });
      });

      // First item (Catan) should be highlighted
      const catanItem = screen.getByText('Catan');
      expect(catanItem).toBeInTheDocument();

      // Press enter on highlighted item
      await act(async () => {
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
      });

      expect(mockPush).toHaveBeenCalledWith('/game/13');
    });
  });
});
