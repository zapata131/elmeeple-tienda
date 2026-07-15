import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MerchantDiagnosticsPage from '@/app/merchant/diagnostics/page';
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
  };
  return {
    createClient: jest.fn(() => mockClientInstance),
  };
});

describe('US-12: Feed Diagnostics and Monitoring Hub', () => {
  let mockClient: Record<string, jest.Mock>;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    mockClient = (createClient as jest.Mock)();
    fetchMock = jest.fn();
    global.fetch = fetchMock;
    jest.clearAllMocks();
  });

  it('renders sign-in prompt if session is unauthorized', async () => {
    (getServerSession as jest.Mock).mockResolvedValueOnce(null);

    const page = await MerchantDiagnosticsPage();
    render(page);

    expect(screen.getByText(/Acceso Restringido/i)).toBeInTheDocument();
  });

  it('renders feed diagnostics statistics dashboard grid', async () => {
    (getServerSession as jest.Mock).mockResolvedValueOnce({
      user: { email: 'partner@example.com' },
    });

    mockClient.single.mockResolvedValueOnce({
      data: {
        id: 'store-123',
        name: 'Dungeon Shop',
        feed_status: 'success',
        feed_last_processed_count: 320,
        feed_last_matched_count: 280,
        feed_last_unmatched_count: 40,
        google_shopping_feed_url: 'https://dungeon.com/feed.xml',
      },
      error: null,
    });

    const page = await MerchantDiagnosticsPage();
    render(page);

    expect(screen.getByText('Dungeon Shop')).toBeInTheDocument();
    
    // Check parsed metrics
    expect(screen.getByText('320')).toBeInTheDocument();
    expect(screen.getByText('280')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
    expect(screen.getByText('Sincronizar Feed Ahora')).toBeInTheDocument();
  });
});
