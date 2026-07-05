import { fetchGameDetails, fetchGameEditions } from '@/lib/queries';

const mockSingle = jest.fn();
const mockThen = jest.fn();

jest.mock('@supabase/supabase-js', () => {
  const queryBuilder: Record<string, unknown> = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    single: (...args: unknown[]) => mockSingle(...args),
    then: (resolve: (val: unknown) => void, reject?: (reason: unknown) => void) => mockThen(resolve, reject),
  };
  return {
    createClient: jest.fn(() => ({
      from: jest.fn(() => queryBuilder),
    })),
  };
});

describe('Issue #38: Offline Fallback Detection in queries.ts', () => {
  beforeEach(() => {
    mockSingle.mockReset();
    mockThen.mockReset();
    mockThen.mockImplementation((resolve: (val: unknown) => void) => resolve({ data: [], error: null }));
  });

  describe('fetchGameDetails', () => {
    it('returns Catan specs from MOCK_GAMES when Supabase returns { data: [], error: null }', async () => {
      mockSingle.mockResolvedValueOnce({ data: [], error: null });

      const details = await fetchGameDetails(23);

      expect(details).toEqual({
        bgg_id: 13,
        name: 'Catan',
        thumbnail: expect.any(String),
        image: expect.any(String),
        description: expect.any(String),
        weight: 2.3,
        min_players: 3,
        max_players: 4,
        playing_time: 120,
      });
    });
  });

  describe('fetchGameEditions', () => {
    it('returns empty array when currentGame from Supabase returns { data: [], error: null }', async () => {
      mockSingle.mockResolvedValueOnce({ data: [], error: null });
      // If the code erroneously proceeds to query editions, mockThen would resolve with some items:
      mockThen.mockImplementationOnce((resolve: (val: unknown) => void) =>
        resolve({ data: [{ bgg_id: 999, name: 'Unrelated Game', parent_bgg_id: null }], error: null })
      );

      const editions = await fetchGameEditions(23);

      expect(editions).toEqual([]);
    });

    it('returns empty array when query returns { data: [], error: null }', async () => {
      mockSingle.mockResolvedValueOnce({ data: { parent_bgg_id: null }, error: null });
      mockThen.mockImplementationOnce((resolve: (val: unknown) => void) => resolve({ data: [], error: null }));

      const editions = await fetchGameEditions(23);

      expect(editions).toEqual([]);
    });

    it('filters out unlinked/unrelated games when querying editions for a child game (parent_bgg_id is null)', async () => {
      mockSingle.mockResolvedValueOnce({ data: { parent_bgg_id: null }, error: null });
      mockThen.mockImplementationOnce((resolve: (val: unknown) => void) =>
        resolve({
          data: [
            { bgg_id: 50, name: 'Child Edition 1', parent_bgg_id: 23 },
            { bgg_id: 23, name: 'Self', parent_bgg_id: null },
            { bgg_id: 999, name: 'Unrelated Game', parent_bgg_id: 777 },
          ],
          error: null,
        })
      );

      const editions = await fetchGameEditions(23);

      expect(editions).toEqual([
        { bgg_id: 50, name: 'Child Edition 1', parent_bgg_id: 23 },
      ]);
    });

    it('filters out unlinked/unrelated games when querying editions for a sibling game (parent_bgg_id exists)', async () => {
      mockSingle.mockResolvedValueOnce({ data: { parent_bgg_id: 100 }, error: null });
      mockThen.mockImplementationOnce((resolve: (val: unknown) => void) =>
        resolve({
          data: [
            { bgg_id: 100, name: 'Parent Game', parent_bgg_id: null },
            { bgg_id: 101, name: 'Sibling Edition', parent_bgg_id: 100 },
            { bgg_id: 23, name: 'Self', parent_bgg_id: 100 },
            { bgg_id: 888, name: 'Unrelated Game', parent_bgg_id: 444 },
          ],
          error: null,
        })
      );

      const editions = await fetchGameEditions(23);

      expect(editions).toEqual([
        { bgg_id: 100, name: 'Parent Game', parent_bgg_id: null },
        { bgg_id: 101, name: 'Sibling Edition', parent_bgg_id: 100 },
      ]);
    });
  });
});
