import { syncStoreCatalog } from '@/utils/feed_parser';
import { EXPANSION_AND_ACCESSORY_WORDS } from '@/utils/catalog_audit_worker';

describe('US-70: Automated Catalog Matching & Expansion Integrity Safeguards', () => {
  const mockGamesList = [
    { bgg_id: 13, name: 'Catan', ean: null },
    { bgg_id: 822, name: 'Carcassonne', ean: null },
    { bgg_id: 266192, name: 'Wingspan', ean: null },
    { bgg_id: 291453, name: 'Scout', ean: null },
    { bgg_id: 124742, name: 'Concordia', ean: null },
    { bgg_id: 204583, name: 'Kingdomino', ean: null },
    { bgg_id: 316554, name: 'Dune: Imperium', ean: null },
  ];

  describe('Expansion and Accessory Word Exclusion Audit', () => {
    it('contains essential expansion and non-boardgame exclusion keywords', () => {
      expect(EXPANSION_AND_ACCESSORY_WORDS).toContain('exp');
      expect(EXPANSION_AND_ACCESSORY_WORDS).toContain('expansion');
      expect(EXPANSION_AND_ACCESSORY_WORDS).toContain('expansión');
      expect(EXPANSION_AND_ACCESSORY_WORDS).toContain('dragones');
      expect(EXPANSION_AND_ACCESSORY_WORDS).toContain('cazadores');
      expect(EXPANSION_AND_ACCESSORY_WORDS).toContain('niebla');
      expect(EXPANSION_AND_ACCESSORY_WORDS).toContain('salsa');
      expect(EXPANSION_AND_ACCESSORY_WORDS).toContain('beetle');
      expect(EXPANSION_AND_ACCESSORY_WORDS).toContain('nesting');
      expect(EXPANSION_AND_ACCESSORY_WORDS).toContain('sleeves');
      expect(EXPANSION_AND_ACCESSORY_WORDS).toContain('fundas');
      expect(EXPANSION_AND_ACCESSORY_WORDS).toContain('rompecabezas');
      expect(EXPANSION_AND_ACCESSORY_WORDS).toContain('pegamento');
    });
  });

  describe('syncStoreCatalog Expansion & Base Game Matching Safeguards', () => {
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
          const data = table === 'bgg_games_cache' ? mockGamesList : table === 'stores' ? [{ id: 'store-1', name: 'Test Store' }] : [];
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

    it('matches base game titles correctly to verified BGG IDs', async () => {
      const feedItems = [
        { title: 'Catan', link: 'https://store.com/catan', price: 850, stock: 1, ean: null, language: 'es' },
        { title: 'Carcassonne', link: 'https://store.com/carcassonne', price: 600, stock: 1, ean: null, language: 'es' },
        { title: 'Concordia - séptima edición', link: 'https://store.com/concordia-7', price: 1650, stock: 1, ean: null, language: 'es' },
      ];

      const res = await syncStoreCatalog('store-1', feedItems, mockSupabase);
      expect(res.processed).toBe(3);
      expect(res.matched).toBe(3);
    }, 15000);

    it('prevents matching expansions to base games and blocks non-boardgame auto-creation', async () => {
      const feedItems = [
        { title: 'Carcassonne Exp. 3 Dragones y Hadas', link: 'https://store.com/carcassonne-exp-3', price: 440, stock: 1, ean: null, language: 'es' },
        { title: 'Carcassonne Cazadores y Recolectores', link: 'https://store.com/carcassonne-cazadores', price: 595, stock: 1, ean: null, language: 'es' },
        { title: 'Scout Beetle Model Kit', link: 'https://store.com/scout-beetle', price: 1399, stock: 1, ean: null, language: 'es' },
        { title: 'Wingspan Nesting Box', link: 'https://store.com/wingspan-nesting', price: 1800, stock: 1, ean: null, language: 'es' },
        { title: 'Pegamento Puzzle Conserver', link: 'https://store.com/pegamento', price: 120, stock: 1, ean: null, language: 'es' },
      ];

      const res = await syncStoreCatalog('store-1', feedItems, mockSupabase);
      expect(res.processed).toBe(5);
      // None of these expansions/accessories should match base games!
      expect(res.matched).toBe(0);
    }, 15000);

    it('isolates spin-off game variants (Spot It! Catan) from base game Catan and auto-creates distinct game entry', async () => {
      const feedItems = [
        { title: 'Spot It! Catan', link: 'https://store.com/spot-it-catan', price: 350, stock: 5, ean: null, language: 'es' },
      ];

      const res = await syncStoreCatalog('store-1', feedItems, mockSupabase);
      expect(res.processed).toBe(1);
      // Should NOT match base game Catan (bgg_id: 13) directly!
      expect(res.matched).toBe(0);
      // Should be queued and auto-created as a distinct game entry!
      expect(res.unmatched).toBe(1);
      expect(res.queued).toBe(1);
    }, 15000);
  });
});

