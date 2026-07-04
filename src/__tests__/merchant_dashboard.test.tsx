import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MerchantDashboardPage from '@/app/merchant/dashboard/page';
import { useSession } from 'next-auth/react';
import { createClient } from '@supabase/supabase-js';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock Supabase before importing redirect route
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

describe('US-10: Merchant Analytics Dashboard', () => {
  let mockClient: Record<string, jest.Mock>;

  beforeEach(() => {
    mockClient = (createClient as jest.Mock)();
    jest.clearAllMocks();
  });

  it('renders stats and logs clicks data correctly', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { email: 'partner@example.com' } },
      status: 'authenticated',
    });

    // Mock store query
    mockClient.single.mockResolvedValueOnce({
      data: { id: 'store-123', name: 'Zacatrus Iberian' },
      error: null,
    });

    // Mock clicks logs queries
    mockClient.order.mockResolvedValueOnce({
      data: [
        {
          created_at: '2026-07-02T12:00:00Z',
          bgg_games_cache: { name: 'Catan' },
        },
        {
          created_at: '2026-07-02T13:00:00Z',
          bgg_games_cache: { name: 'Carcassonne' },
        },
      ],
      error: null,
    });

    // Renders Server Component by awaiting the component call
    const page = await MerchantDashboardPage();
    render(page);

    expect(screen.getByText('Zacatrus Iberian')).toBeInTheDocument();
    
    // Clicks count card
    expect(screen.getAllByText('2').length).toBeGreaterThan(0); // total clicks count
    expect(screen.getAllByText('Catan').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Carcassonne').length).toBeGreaterThan(0);
  });
});
