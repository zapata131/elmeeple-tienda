import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '@/app/page';

// Mock queries for Home
jest.mock('@/lib/queries', () => ({
  fetchBggHotness: jest.fn().mockResolvedValue([
    { bgg_id: 13, name: 'Catan', thumbnail: 'http://img/catan.jpg', weight: 2.3 },
    { bgg_id: 266192, name: 'Wingspan', thumbnail: 'http://img/wingspan.jpg', weight: 2.46 },
  ]),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
}));

describe('Clean Homepage and BGG Hotness Grid', () => {
  it('renders Home search bar and BGG Hotness grid in Mexico ($ MXN)', async () => {
    const jsx = await Home();
    render(jsx);

    expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument();
    expect(screen.getByText(/Tendencias BGG/i)).toBeInTheDocument();
    expect(screen.getByText('Catan')).toBeInTheDocument();
    expect(screen.getByText('Wingspan')).toBeInTheDocument();
  });

  it('does NOT render removed promotional feature explanation cards or catalog switches', async () => {
    const jsx = await Home();
    render(jsx);

    expect(screen.queryByText(/Envíos Localizados/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Tu Moneda Local/i)).not.toBeInTheDocument();
  });
});
