import { describe, it, expect } from 'vitest';
import {
  cleanBoardGameTitle,
  detectLanguage,
  calculateSimilarityScore,
  matchProductToCatalog,
} from '@/lib/engine/matching-engine';
import { db } from '@/lib/db/mock-db';

describe('Matching Engine Algorithms (US-10, US-11, US-12, US-13)', () => {
  describe('cleanBoardGameTitle (Section 7.1)', () => {
    it('should strip common store noise words and normalize spaces', () => {
      const rawTitle = 'Juego de Mesa Catan Edición Especial Devir En Español Preventa';
      const cleaned = cleanBoardGameTitle(rawTitle);
      expect(cleaned).toBe('catan');
    });

    it('should handle special accents and punctuation correctly', () => {
      const rawTitle = 'Ticket to Ride: Europa (Inglés) - Nuevo Original!';
      const cleaned = cleanBoardGameTitle(rawTitle);
      expect(cleaned).toBe('ticket to ride europa');
    });

    it('should return empty string for empty input', () => {
      expect(cleanBoardGameTitle('')).toBe('');
    });
  });

  describe('detectLanguage (Section 7.2)', () => {
    it('should detect Spanish as default', () => {
      expect(detectLanguage('Catan El Juego', 'Juego de mesa clásico en español')).toBe('es');
    });

    it('should detect English when explicitly specified without Spanish', () => {
      expect(detectLanguage('Gloomhaven English Edition', 'Original English board game')).toBe('en');
    });

    it('should detect Multilingual when multi keywords are present', () => {
      expect(detectLanguage('Azul Multilingüe', 'Multi-language edition')).toBe('multi');
    });
  });

  describe('calculateSimilarityScore (Section 7.3)', () => {
    it('should calculate high score for exact or near-identical titles', () => {
      const score = calculateSimilarityScore('Catan', 'Catan');
      expect(score).toBeGreaterThanOrEqual(0.95);
    });

    it('should penalize titles with accessory/expansion keywords not present in catalog title', () => {
      const scoreBase = calculateSimilarityScore('Catan', 'Catan');
      const scoreWithSleeves = calculateSimilarityScore('Catan Fundas Protectoras Sleeves', 'Catan');
      expect(scoreWithSleeves).toBeLessThan(scoreBase - 0.20);
    });
  });

  describe('4-Tier Waterfall Matcher (Section 7.4)', () => {
    it('Tier 1: Should match deterministically by GTIN/EAN barcode', async () => {
      const result = await matchProductToCatalog({
        storeId: 'store-duende-01',
        title: 'Catan Edición Desconocida',
        barcode: '8435407624108', // EAN for Catan
        sku: 'UNKNOWN-SKU',
      });

      expect(result.matchedBggId).toBe(13);
      expect(result.matchTier).toBe(1);
      expect(result.confidence).toBe(1.00);
    });

    it('Tier 2: Should match by Historical Merchant SKU Memory', async () => {
      const result = await matchProductToCatalog({
        storeId: 'store-duende-01',
        title: 'Título no coincidente',
        sku: 'DEV-CATAN-ES', // Mapped to 13 in seed data
      });

      expect(result.matchedBggId).toBe(13);
      expect(result.matchTier).toBe(2);
      expect(result.confidence).toBe(1.00);
    });

    it('Tier 3: Should auto-publish high confidence tokenized fuzzy matches (score >= 0.92)', async () => {
      const result = await matchProductToCatalog({
        storeId: 'store-quantum-04',
        title: 'Carcassonne Juego Base',
        sku: 'CARC-NEW',
      });

      expect(result.matchedBggId).toBe(822);
      expect(result.matchTier).toBe(3);
      expect(result.confidence).toBeGreaterThanOrEqual(0.92);
      expect(result.shouldQueue).toBe(false);
    });

    it('Tier 3/4: Should route medium or low confidence items to bgg_metadata_queue', async () => {
      const result = await matchProductToCatalog({
        storeId: 'store-caravana-02',
        title: 'Super Extraño Juego De Mesa No Catalogado 2026',
        sku: 'UNKNOWN-999',
      });

      expect(result.shouldQueue).toBe(true);
      expect(result.confidence).toBeLessThan(0.70);
    });
  });
});
