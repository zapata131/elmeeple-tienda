import { processBggResolutionBatch } from '@/utils/bgg_resolution_worker';

describe('US-96: Automated Background BGG Resolution and Image Hydration Worker', () => {
  let mockSupabase: unknown;
  let fetchMock: jest.Mock;

  const mockBggThingXml = `<?xml version="1.0" encoding="utf-8"?>
<items>
  <item type="boardgame" id="15366">
    <thumbnail>https://cf.geekdo-images.com/catan_exp.jpg</thumbnail>
    <name type="primary" value="Catan: Exploradores y Piratas"/>
    <minplayers value="2"/>
    <maxplayers value="4"/>
    <playingtime value="90"/>
    <statistics page="1">
      <ratings>
        <averageweight value="2.75"/>
      </ratings>
    </statistics>
  </item>
</items>`;

  const mockBggSearchXml = `<?xml version="1.0" encoding="utf-8"?>
<items total="1">
  <item type="boardgame" id="15366">
    <name type="primary" value="Catan: Exploradores y Piratas"/>
  </item>
</items>`;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock;

    const pseudoGame = {
      bgg_id: 8123456,
      name: 'Catan: Exploradores y Piratas',
      ean: null,
      thumbnail: '',
      last_updated_at: new Date().toISOString(),
    };

    const storeGameRow = {
      store_id: 'store-1',
      bgg_id: 8123456,
      store_product_url: 'https://store.com/catan-exp',
      price: 850,
      stock: 1,
      edition_language: 'es',
    };

    const makeQuery = (data: unknown) => {
      const promise = Promise.resolve({ data, error: null }) as unknown as Record<string, unknown>;
      promise.eq = jest.fn().mockImplementation(() => makeQuery(data));
      promise.gte = jest.fn().mockImplementation(() => makeQuery(data));
      promise.lt = jest.fn().mockImplementation(() => makeQuery(data));
      promise.order = jest.fn().mockImplementation(() => makeQuery(data));
      promise.limit = jest.fn().mockImplementation(() => makeQuery(data));
      promise.single = jest.fn().mockImplementation(() => Promise.resolve({ data: null, error: null }));
      promise.ilike = jest.fn().mockImplementation(() => makeQuery(data));
      return promise;
    };

    const tableMocks: Record<string, Record<string, jest.Mock>> = {
      bgg_games_cache: {
        select: jest.fn().mockImplementation(() => makeQuery([pseudoGame])),
        upsert: jest.fn().mockResolvedValue({ data: [], error: null }),
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      },
      store_games: {
        select: jest.fn().mockImplementation(() => makeQuery([storeGameRow])),
        upsert: jest.fn().mockResolvedValue({ data: [], error: null }),
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      },
      bgg_metadata_queue: {
        select: jest.fn().mockImplementation(() => makeQuery([])),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
          ilike: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      },
    };

    mockSupabase = {
      from: jest.fn().mockImplementation((table: string) => {
        if (!tableMocks[table]) {
          tableMocks[table] = {
            select: jest.fn().mockImplementation(() => makeQuery([])),
            upsert: jest.fn().mockResolvedValue({ data: [], error: null }),
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: [], error: null }),
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ data: [], error: null }),
              ilike: jest.fn().mockResolvedValue({ data: [], error: null }),
            }),
          };
        }
        return tableMocks[table];
      }),
    };
  });

  it('resolves pseudo-game (bgg_id >= 8,000,000), hydrates cover art, re-links store_games, and deletes pseudo-game', async () => {
    // Mock BGG search and thing responses
    fetchMock
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        text: async () => mockBggSearchXml,
      })
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        text: async () => mockBggThingXml,
      });

    const result = await processBggResolutionBatch(5, mockSupabase);

    expect(result.processed).toBe(1);
    expect(result.resolved).toBe(1);

    // 1. Should upsert canonical game (bgg_id 15366) into bgg_games_cache with thumbnail
    expect(mockSupabase.from).toHaveBeenCalledWith('bgg_games_cache');
    expect(mockSupabase.from('bgg_games_cache').upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        bgg_id: 15366,
        name: 'Catan: Exploradores y Piratas',
        thumbnail: 'https://cf.geekdo-images.com/catan_exp.jpg',
      }),
      expect.any(Object)
    );

    // 2. Should re-link store_games to bgg_id 15366
    expect(mockSupabase.from).toHaveBeenCalledWith('store_games');
    expect(mockSupabase.from('store_games').upsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          store_id: 'store-1',
          bgg_id: 15366,
        }),
      ]),
      expect.any(Object)
    );

    // 3. Should delete old pseudo-game store_games and bgg_games_cache rows
    expect(mockSupabase.from('store_games').delete).toHaveBeenCalled();
    expect(mockSupabase.from('bgg_games_cache').delete).toHaveBeenCalled();
  });

  it('handles BGG HTTP 202/429 rate limiting gracefully by marking for retry', async () => {
    fetchMock.mockResolvedValueOnce({ status: 429, ok: false });

    const result = await processBggResolutionBatch(5, mockSupabase);

    expect(result.processed).toBe(1);
    expect(result.retried).toBe(1);
    expect(result.resolved).toBe(0);
  });

  it('handles failed BGG search without throwing an error', async () => {
    fetchMock.mockResolvedValueOnce({
      status: 200,
      ok: true,
      text: async () => `<items total="0"></items>`,
    });

    const result = await processBggResolutionBatch(5, mockSupabase);

    expect(result.processed).toBe(1);
    expect(result.failed).toBe(1);
    expect(result.resolved).toBe(0);
  });
});
