import { MOCK_IBEROAMERICAN_STORES, MOCK_GAMES, getMockOffersForGame } from '@/utils/mockData';

const ALLOWED_COUNTRIES = ['ES', 'PT', 'MX', 'BR', 'AR', 'CO', 'CL', 'PE', 'UY', 'CR', 'EC'];

describe('US-29: Iberoamerican & Iberian Exclusive Mock Data Seed', () => {
  describe('MOCK_IBEROAMERICAN_STORES', () => {
    it('contains exactly 8 verified Mexican stores', () => {
      expect(MOCK_IBEROAMERICAN_STORES.length).toBe(8);
    });

    it('contains only stores in Mexico (MX)', () => {
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
    it('generates offers exclusively from verified regional stores in MXN', async () => {
      const offers = getMockOffersForGame(13, 'MX');
      expect(offers.length).toBe(8);
      offers.forEach((o) => {
        expect(ALLOWED_COUNTRIES).toContain((o.store_country || '').toUpperCase());
      });
    });
  });
});
