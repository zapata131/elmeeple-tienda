import { syncStoreCatalog } from '@/utils/feed_parser';

describe('US-95: Strict Sub-Title & Colon-Delimited Expansion Isolation Engine', () => {
  const mockGamesCatalog = [
    { bgg_id: 13, name: 'Catan', alternate_names: ['The Settlers of Catan', 'Catan: El Juego'], ean: null },
    { bgg_id: 822, name: 'Carcassonne', alternate_names: [], ean: null },
    { bgg_id: 266192, name: 'Wingspan', alternate_names: [], ean: null },
    { bgg_id: 316554, name: 'Dune: Imperium', alternate_names: [], ean: null },
    { bgg_id: 15366, name: 'Catan: Exploradores y Piratas', alternate_names: [], ean: null },
  ];

  let mockSupabase: unknown;

  beforeEach(() => {
    const makeQuery = (data: unknown) => {
      const promise = Promise.resolve({ data, error: null }) as unknown as Record<string, unknown>;
      promise.eq = jest.fn().mockImplementation(() => makeQuery(data));
      promise.lt = jest.fn().mockImplementation(() => makeQuery(data));
      promise.in = jest.fn().mockImplementation(() => makeQuery(data));
      promise.gte = jest.fn().mockImplementation(() => makeQuery(data));
      return promise;
    };

    mockSupabase = {
      from: jest.fn().mockImplementation((table: string) => {
        const data = table === 'bgg_games_cache' ? mockGamesCatalog : table === 'stores' ? [{ id: 'store-1', name: 'Test Store' }] : [];
        return {
          select: jest.fn().mockImplementation(() => makeQuery(data)),
          upsert: jest.fn().mockResolvedValue({ data: [], error: null }),
          delete: jest.fn().mockResolvedValue({ data: [], error: null }),
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        };
      }),
    };
  });

  it('rejects colon/hyphen delimited un-indexed expansion titles from matching base game pages', async () => {
    const feedItems = [
      { title: 'Catan: Exploradores y Piratas', link: 'https://store.com/catan-exp-1', price: 850, stock: 1, ean: null, language: 'es' },
      { title: 'Catan - Navegantes', link: 'https://store.com/catan-exp-2', price: 790, stock: 1, ean: null, language: 'es' },
      { title: 'Carcassonne: El Destino', link: 'https://store.com/carcassonne-destino', price: 550, stock: 1, ean: null, language: 'es' },
      { title: 'Wingspan - Oceanía', link: 'https://store.com/wingspan-oceania', price: 620, stock: 1, ean: null, language: 'es' },
    ];

    const res = await syncStoreCatalog('store-1', feedItems, mockSupabase);

    // "Catan: Exploradores y Piratas" exact matches bgg_id: 15366 in catalog!
    // The other 3 ("Catan - Navegantes", "Carcassonne: El Destino", "Wingspan - Oceanía") must NOT match base games!
    expect(res.processed).toBe(4);
    // Only "Catan: Exploradores y Piratas" (which has exact BGG entry 15366) should match
    expect(res.matched).toBe(1);
    expect(res.unmatched).toBe(3);
  });

  it('allows exact canonical or pre-indexed alternate_names matches with colons or hyphens', async () => {
    const feedItems = [
      { title: 'Dune: Imperium', link: 'https://store.com/dune-imperium', price: 1200, stock: 1, ean: null, language: 'es' },
      { title: 'Catan: El Juego', link: 'https://store.com/catan-juego', price: 850, stock: 1, ean: null, language: 'es' },
      { title: 'Catan (Edición 2021)', link: 'https://store.com/catan-2021', price: 850, stock: 1, ean: null, language: 'es' },
    ];

    const res = await syncStoreCatalog('store-1', feedItems, mockSupabase);

    expect(res.processed).toBe(3);
    expect(res.matched).toBe(3);
  });

  it('isolates multi-level delimited expansion titles like Dune: Imperium - Rise of Ix from Dune: Imperium', async () => {
    const feedItems = [
      { title: 'Dune: Imperium - Rise of Ix', link: 'https://store.com/dune-exp', price: 990, stock: 1, ean: null, language: 'es' },
    ];

    const res = await syncStoreCatalog('store-1', feedItems, mockSupabase);

    expect(res.processed).toBe(1);
    // Should NOT match Dune: Imperium (bgg_id: 316554)
    expect(res.matched).toBe(0);
    expect(res.unmatched).toBe(1);
  });
});
