import { parseBggThingXml, processMetadataQueueBatch } from '@/utils/bgg_worker';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase
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
    ilike: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockImplementation(() => Promise.resolve({ data: null, error: null })),
    upsert: jest.fn().mockImplementation(() => Promise.resolve({ error: null })),
    update: jest.fn().mockReturnThis(),
  };
  return {
    createClient: jest.fn(() => mockClientInstance),
  };
});

const mockBggXml = `<?xml version="1.0" encoding="utf-8"?>
<items termsofuse="https://boardgamegeek.com/xmlapi/termsofuse">
  <item type="boardgame" id="13">
    <thumbnail>https://cf.geekdo-images.com/catan.jpg</thumbnail>
    <name type="primary" sortindex="1" value="Catan"/>
    <name type="alternate" sortindex="1" value="The Settlers of Catan"/>
    <name type="alternate" sortindex="1" value="Los Colonos de Catán"/>
    <minplayers value="3"/>
    <maxplayers value="4"/>
    <playingtime value="120"/>
    <statistics page="1">
      <ratings>
        <averageweight value="2.30"/>
      </ratings>
    </statistics>
  </item>
</items>`;

describe('US-15: BGG API Metadata Queue and Cache Manager', () => {
  let mockClient: Record<string, jest.Mock>;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    mockClient = (createClient as jest.Mock)();
    fetchMock = jest.fn();
    global.fetch = fetchMock;
    jest.clearAllMocks();
  });

  describe('parseBggThingXml', () => {
    it('extracts primary name, alternate names, complexity weight, players, and playing time from BGG XML', () => {
      const parsed = parseBggThingXml(mockBggXml);

      expect(parsed).toEqual({
        bgg_id: 13,
        name: 'Catan',
        alternate_names: ['The Settlers of Catan', 'Los Colonos de Catán'],
        thumbnail: 'https://cf.geekdo-images.com/catan.jpg',
        min_players: 3,
        max_players: 4,
        playing_time: 120,
        weight: 2.30,
      });
    });
  });

  describe('processMetadataQueueBatch', () => {
    it('handles BGG HTTP 202 Accepted and HTTP 429 Rate Limit statuses by marking item as retry', async () => {
      // Mock queue select returning 2 pending items
      mockClient.limit.mockResolvedValueOnce({
        data: [
          { id: 'q-202', store_id: 'store-1', ean: null, title: 'Queue Game 202', store_product_url: 'http://s.com/202', status: 'pending' },
          { id: 'q-429', store_id: 'store-1', ean: null, title: 'Queue Game 429', store_product_url: 'http://s.com/429', status: 'pending' },
        ],
        error: null,
      });

      // Mock BGG Search / Thing requests returning 202 then 429
      fetchMock
        .mockResolvedValueOnce({ status: 202, ok: false }) // first item Search/Thing returns 202
        .mockResolvedValueOnce({ status: 429, ok: false }); // second item Search/Thing returns 429

      const result = await processMetadataQueueBatch(2);

      expect(result.processed).toBe(2);
      expect(result.retried).toBe(2);
      expect(result.resolved).toBe(0);

      expect(mockClient.from).toHaveBeenCalledWith('bgg_metadata_queue');
      expect(mockClient.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'retry' })
      );
    });

    it('resolves metadata successfully, upserts into bgg_games_cache and store_games, and marks queue completed', async () => {
      mockClient.limit.mockResolvedValueOnce({
        data: [
          { id: 'q-success', store_id: 'store-xyz', ean: '8435407600001', title: 'Catan Spanish', store_product_url: 'http://store.com/catan', status: 'pending' },
        ],
        error: null,
      });

      // Mock BGG Search finding ID 13, then BGG Thing returning XML
      fetchMock
        .mockResolvedValueOnce({
          status: 200,
          ok: true,
          text: async () => `<items><item id="13"><name type="primary" value="Catan"/></item></items>`,
        }) // Search return
        .mockResolvedValueOnce({
          status: 200,
          ok: true,
          text: async () => mockBggXml,
        }); // Thing return

      const result = await processMetadataQueueBatch(1);

      expect(result.processed).toBe(1);
      expect(result.resolved).toBe(1);

      expect(mockClient.from).toHaveBeenCalledWith('bgg_games_cache');
      expect(mockClient.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          bgg_id: 13,
          name: 'Catan',
          ean: '8435407600001',
          weight: 2.30,
        }),
        expect.any(Object)
      );

      expect(mockClient.from).toHaveBeenCalledWith('store_games');
      expect(mockClient.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          store_id: 'store-xyz',
          bgg_id: 13,
          store_product_url: 'http://store.com/catan',
        }),
        expect.any(Object)
      );

      expect(mockClient.from).toHaveBeenCalledWith('bgg_metadata_queue');
      expect(mockClient.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'completed' })
      );
    });
  });
});
