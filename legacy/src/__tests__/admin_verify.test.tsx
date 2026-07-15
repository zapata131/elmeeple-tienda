import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { createClient } from '@supabase/supabase-js';

// Mock next-auth before importing routing handlers
jest.mock('next-auth', () => {
  const mockNextAuth = jest.fn(() => () => {});
  return {
    __esModule: true,
    default: mockNextAuth,
    getServerSession: jest.fn(),
  };
});

// Mock Supabase before importing routing handlers
jest.mock('@supabase/supabase-js', () => {
  const mockClientInstance = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockImplementation(function (this: unknown, key: string) {
      if (key === 'id') {
        return Promise.resolve({ error: null });
      }
      return this;
    }),
    single: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
  };
  return {
    createClient: jest.fn(() => mockClientInstance),
  };
});

// Import GET after mock declarations
import { POST } from '@/app/api/admin/verify-store/route';

describe('US-11: Admin Verification API Endpoint', () => {
  let mockClient: Record<string, jest.Mock>;

  beforeEach(() => {
    mockClient = (createClient as jest.Mock)();
    jest.clearAllMocks();
  });

  it('returns 403 if session user is not an admin', async () => {
    (getServerSession as jest.Mock).mockResolvedValueOnce({
      user: { email: 'partner@example.com' },
    });

    // Mock role lookup in database: returns 'partner'
    mockClient.single.mockResolvedValueOnce({
      data: { role: 'partner' },
      error: null,
    });

    const req = new NextRequest('http://localhost/api/admin/verify-store', {
      method: 'POST',
      body: JSON.stringify({ store_id: 'store-123', verified: true }),
    });

    const res = await POST(req);

    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain('Forbidden. Administrator access required.');
  });

  it('updates store verified status in database if session user is admin', async () => {
    (getServerSession as jest.Mock).mockResolvedValueOnce({
      user: { email: 'admin@example.com' },
    });

    // Mock role lookup: returns 'admin'
    mockClient.single.mockResolvedValueOnce({
      data: { role: 'admin' },
      error: null,
    });

    const req = new NextRequest('http://localhost/api/admin/verify-store', {
      method: 'POST',
      body: JSON.stringify({ store_id: 'store-123', verified: true }),
    });

    const res = await POST(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);

    // Verify updates query target
    expect(mockClient.from).toHaveBeenCalledWith('stores');
    expect(mockClient.update).toHaveBeenCalledWith(
      expect.objectContaining({ verified: true })
    );
  });
});
