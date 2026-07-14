import { auditDatabaseCatalogIntegrity, EXPANSION_AND_ACCESSORY_WORDS } from '@/utils/catalog_audit_worker';

describe('Catalog Audit Worker - Spin-Off & Mismatch Purge', () => {
  it('includes spot it, spot-it, and dobble in exclusion audit list', () => {
    expect(EXPANSION_AND_ACCESSORY_WORDS).toContain('spot it');
    expect(EXPANSION_AND_ACCESSORY_WORDS).toContain('spot-it');
    expect(EXPANSION_AND_ACCESSORY_WORDS).toContain('dobble');
  });

  it('correctly identifies mismatched offer URLs with spot-it on base games', async () => {
    const mockClient = {
      from: jest.fn().mockImplementation((table: string) => {
        const makeQuery = (data: unknown) => {
          const promise = Promise.resolve({ data, count: 1, error: null }) as unknown as Record<string, unknown>;
          promise.select = jest.fn().mockImplementation(() => makeQuery(data));
          promise.lt = jest.fn().mockImplementation(() => makeQuery(data));
          promise.gte = jest.fn().mockImplementation(() => makeQuery(data));
          promise.in = jest.fn().mockImplementation(() => makeQuery(data));
          promise.delete = jest.fn().mockImplementation(() => makeQuery(data));
          return promise;
        };

        if (table === 'bgg_games_cache') {
          return makeQuery([{ bgg_id: 13, name: 'Catan' }]);
        }
        if (table === 'store_games') {
          return makeQuery([
            { id: 'offer-spot-it', bgg_id: 13, store_product_url: 'https://quantumboardgames.com/products/spot-it-catan-ingles' },
            { id: 'offer-catan-valid', bgg_id: 13, store_product_url: 'https://bundaba.com.mx/products/catan' }
          ]);
        }
        return makeQuery([]);
      }),
    };

    const report = await auditDatabaseCatalogIntegrity(mockClient);
    expect(report.success).toBe(true);
    expect(report.mismatchedOffersDeleted).toBe(1);
  });
});
