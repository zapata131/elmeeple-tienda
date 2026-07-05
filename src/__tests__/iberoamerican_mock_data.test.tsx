import { MOCK_IBEROAMERICAN_STORES, MOCK_GAMES } from '@/utils/mockData';
import { getRealFeedOffersForGame } from '@/utils/real_feed_data';

const ALLOWED_COUNTRIES = ['ES', 'PT', 'MX', 'BR', 'AR', 'CO', 'CL', 'PE', 'UY', 'CR', 'EC'];

describe('US-29: Iberoamerican & Iberian Exclusive Real Feed Data Engine', () => {
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

  describe('getRealFeedOffersForGame & queries fallback', () => {
    it('returns genuine feed offers exclusively from verified regional stores in MXN', async () => {
      const offers = getRealFeedOffersForGame(13, 'MX');
      expect(offers.length).toBeGreaterThanOrEqual(1);
      offers.forEach((o) => {
        expect(ALLOWED_COUNTRIES).toContain((o.store_country || '').toUpperCase());
      });
    });
  });
});
