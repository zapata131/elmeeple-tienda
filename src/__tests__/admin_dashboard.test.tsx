import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminDashboardPage from '@/app/admin/dashboard/page';
import { getServerSession } from 'next-auth';
import { createClient } from '@supabase/supabase-js';

// Mock next-auth
jest.mock('next-auth', () => {
  const mockNextAuth = jest.fn(() => () => {});
  return {
    __esModule: true,
    default: mockNextAuth,
    getServerSession: jest.fn(),
  };
});

// Mock Supabase
jest.mock('@supabase/supabase-js', () => {
  const mockClientInstance = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
  };
  return {
    createClient: jest.fn(() => mockClientInstance),
  };
});

describe('US-11: Admin Auditing Dashboard', () => {
  let mockClient: Record<string, jest.Mock>;

  beforeEach(() => {
    mockClient = (createClient as jest.Mock)();
    jest.clearAllMocks();
  });

  it('renders restricted access if role is not admin', async () => {
    (getServerSession as jest.Mock).mockResolvedValueOnce({
      user: { email: 'partner@example.com' },
    });

    mockClient.single.mockResolvedValueOnce({
      data: { role: 'partner' },
      error: null,
    });

    const page = await AdminDashboardPage();
    render(page);

    expect(screen.getByText(/Acceso Restringido/i)).toBeInTheDocument();
  });

  it('lists merchant stores and toggles status indicators', async () => {
    (getServerSession as jest.Mock).mockResolvedValueOnce({
      user: { email: 'admin@example.com' },
    });

    mockClient.single.mockResolvedValueOnce({
      data: { role: 'admin' },
      error: null,
    });

    // Mock stores lookup (order resolves array)
    mockClient.order.mockResolvedValueOnce({
      data: [
        { id: 'store-1', name: 'Zacatrus', verified: true, owner_email: 'zac@store.com' },
        { id: 'store-2', name: 'MeepleShop', verified: false, owner_email: 'meeple@store.com' },
      ],
      error: null,
    });

    const page = await AdminDashboardPage();
    render(page);

    expect(screen.getByText('Zacatrus')).toBeInTheDocument();
    expect(screen.getByText('MeepleShop')).toBeInTheDocument();

    // Verifies status badges
    expect(screen.getByText('Verificada')).toBeInTheDocument();
    expect(screen.getByText('Suspendida')).toBeInTheDocument();
  });
});
