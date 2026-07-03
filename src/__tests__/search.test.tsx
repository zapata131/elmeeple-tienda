import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SearchBar } from '@/components/SearchBar';
import { useRouter } from 'next/navigation';

// Mock next/navigation useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('US-01: Predictive Smart Search Bar', () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    jest.clearAllMocks();
  });

  it('renders the search input field', () => {
    render(<SearchBar />);
    expect(screen.getByPlaceholderText(/search board games/i)).toBeInTheDocument();
  });

  it('does not trigger search or show suggestions if query is empty', async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock;

    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/search board games/i);

    fireEvent.change(input, { target: { value: ' ' } });

    await new Promise((resolve) => setTimeout(resolve, 500)); // wait debounce

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('triggers search API and displays suggestions when 1 or more characters are typed', async () => {
    const mockSuggestions = [
      { bgg_id: 23, name: 'Catan', thumbnail: 'https://example.com/catan.png' },
      { bgg_id: 46, name: 'Carcassonne', thumbnail: 'https://example.com/carc.png' },
    ];

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSuggestions),
      })
    );

    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/search board games/i);

    fireEvent.change(input, { target: { value: 'Cat' } });

    // Wait for the debounce and elements to render
    await waitFor(() => {
      expect(screen.getByText('Catan')).toBeInTheDocument();
      expect(screen.getByText('Carcassonne')).toBeInTheDocument();
    });

    expect(screen.getByAltText('Catan')).toHaveAttribute('src', 'https://example.com/catan.png');
  });

  it('redirects to the game details page when a suggestion is clicked', async () => {
    const mockSuggestions = [
      { bgg_id: 23, name: 'Catan', thumbnail: 'https://example.com/catan.png' },
    ];

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockSuggestions),
      })
    );

    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/search board games/i);

    fireEvent.change(input, { target: { value: 'Catan' } });

    // Wait for dropdown item to render
    await waitFor(() => {
      expect(screen.getByText('Catan')).toBeInTheDocument();
    });

    const item = screen.getByText('Catan');
    fireEvent.click(item);

    expect(mockPush).toHaveBeenCalledWith('/game/23');
  });
});
