import { MOCK_IBEROAMERICAN_STORES, MOCK_GAMES, getMockOffersForGame } from '@/utils/mockData';

const ALLOWED_COUNTRIES = ['ES', 'PT', 'MX', 'BR', 'AR', 'CO', 'CL', 'PE', 'UY', 'CR', 'EC'];

describe('US-29: Iberoamerican & Iberian Exclusive Mock Data Seed', () => {
  describe('MOCK_IBEROAMERICAN_STORES', () => {
    it('contains at least 20 distinct stores', () => {
      expect(MOCK_IBEROAMERICAN_STORES.length).toBeGreaterThanOrEqual(20);
    });

    it('contains only stores in Iberoamerican countries or the Iberian Peninsula', () => {
      MOCK_IBEROAMERICAN_STORES.forEach((store) => {
        expect(ALLOWED_COUNTRIES).toContain(store.country.toUpperCase());
      });
    });
  });

  describe('MOCK_GAMES', () => {
    it('contains at least 10 distinct board games', () => {
      expect(MOCK_GAMES.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('getMockOffersForGame & queries fallback', () => {
    it('generates offers exclusively from regional stores without foreign shops like DE or US', async () => {
      const offers = getMockOffersForGame(13, 'ES');
      expect(offers.length).toBe(4);
      offers.forEach((o) => {
        expect(ALLOWED_COUNTRIES).toContain((o.store_country || '').toUpperCase());
      });
    });
  });
});
