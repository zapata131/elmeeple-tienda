import { matchFeedItemWaterfall, calculateSimilarityScore } from '@/utils/waterfall_matching_engine';

describe('US-105: 4-Tier Waterfall Feed Matching Engine', () => {
  const mockGamesList = [
    { bgg_id: 13, name: 'Catan', ean: '8436017220101', alternate_names: ['Los Colonos de Catan'] },
    { bgg_id: 822, name: 'Carcassonne', ean: '8436017220156' },
    { bgg_id: 266192, name: 'Wingspan', ean: '0850004948037' },
    { bgg_id: 316554, name: 'Dune: Imperium', ean: null },
  ];

  const mockGameBarcodes = [
    { barcode: '7501234567890', bgg_id: 13, edition_language: 'es' },
    { barcode: '0850004948037', bgg_id: 266192, edition_language: 'en' },
  ];

  const mockMerchantMappings = [
    { store_id: 'store-1', merchant_sku: 'SKU-CATAN-SPECIAL', bgg_id: 13, is_verified: true },
  ];

  describe('Confidence Scoring & Similarity Function', () => {
    it('returns 1.0 for exact string matches', () => {
      expect(calculateSimilarityScore('Catan', 'Catan')).toBeCloseTo(1.0, 2);
    });

    it('returns high score (>0.80) for minor spelling/case variations', () => {
      const score = calculateSimilarityScore('Catan Juego de Mesa', 'Catan');
      expect(score).toBeGreaterThanOrEqual(0.80);
    });
  });

  describe('Tier 1: EAN/GTIN Multi-Barcode Registry Matcher', () => {
    it('matches deterministically via game_barcodes registry (Tier 1, Confidence 1.00)', async () => {
      const result = await matchFeedItemWaterfall({
        storeId: 'store-1',
        title: 'Catan Edición Especial',
        ean: '7501234567890',
        link: 'https://store.com/catan-sp',
      }, mockGamesList, mockGameBarcodes, mockMerchantMappings);

      expect(result.match_tier).toBe(1);
      expect(result.bgg_id).toBe(13);
      expect(result.confidence).toBe(1.00);
      expect(result.edition_language).toBe('es');
    });
  });

  describe('Tier 2: Merchant SKU & Mapping Memory Matcher', () => {
    it('matches via historical SKU memory table when EAN is missing/unmatched (Tier 2, Confidence 1.00)', async () => {
      const result = await matchFeedItemWaterfall({
        storeId: 'store-1',
        title: 'Random Store Title For Catan',
        ean: 'SKU-CATAN-SPECIAL',
        link: 'https://store.com/custom-catan',
      }, mockGamesList, [], mockMerchantMappings);

      expect(result.match_tier).toBe(2);
      expect(result.bgg_id).toBe(13);
      expect(result.confidence).toBe(1.00);
    });
  });

  describe('Tier 3: Tokenized Fuzzy Matcher & Subtitle Isolator', () => {
    it('auto-publishes high-confidence matches (Confidence >= 0.92)', async () => {
      const result = await matchFeedItemWaterfall({
        storeId: 'store-1',
        title: 'Catan',
        ean: null,
        link: 'https://store.com/catan',
      }, mockGamesList, [], []);

      expect(result.match_tier).toBe(3);
      expect(result.bgg_id).toBe(13);
      expect(result.confidence).toBeGreaterThanOrEqual(0.92);
    });

    it('routes medium-confidence matches (0.70 <= score < 0.92) to Admin Staging Queue with suggested BGG ID', async () => {
      const result = await matchFeedItemWaterfall({
        storeId: 'store-1',
        title: 'Dune Imperium Uprising Standalone Edition',
        ean: null,
        link: 'https://store.com/dune-uprising',
      }, mockGamesList, [], []);

      expect(result.confidence).toBeGreaterThanOrEqual(0.70);
      expect(result.confidence).toBeLessThan(0.92);
      expect(result.suggested_bgg_id).toBe(316554);
    });
  });

  describe('Tier 4: Manual Queue & Low Confidence Items', () => {
    it('flags low-confidence items (< 0.70) for unmatched processing', async () => {
      const result = await matchFeedItemWaterfall({
        storeId: 'store-1',
        title: 'Completely Unrelated Board Game 2026',
        ean: null,
        link: 'https://store.com/unrelated',
      }, mockGamesList, [], []);

      expect(result.confidence).toBeLessThan(0.70);
      expect(result.bgg_id).toBeNull();
    });
  });
});
