import { describe, it, expect } from 'vitest';
import { matchProductToCatalog, calculateSimilarityScore } from '@/lib/engine/matching-engine';

describe('Variant & Subtitle Strict Matching Precision', () => {
  it('should not match Catan Energias to base Catan (BGG 13) with high confidence', async () => {
    const result = await matchProductToCatalog({
      storeId: 'store-test',
      title: 'Catan Energías en Español - Juego de Mesa',
    });

    // Catan Energias is a standalone variant, should NOT match base Catan (BGG 13) without high confidence
    if (result.matchedBggId === 13) {
      expect(result.confidence).toBeLessThan(0.85);
      expect(result.shouldQueue).toBe(true);
    }
  });

  it('should not match Catan Edición de Viaje to base Catan (BGG 13) with high confidence', async () => {
    const result = await matchProductToCatalog({
      storeId: 'store-test',
      title: 'Catan Edición de Viaje',
    });

    if (result.matchedBggId === 13) {
      expect(result.confidence).toBeLessThan(0.85);
      expect(result.shouldQueue).toBe(true);
    }
  });

  it('should penalize extra variant keywords when catalog title is plain base game', () => {
    const scoreBase = calculateSimilarityScore('Catan', 'Catan');
    const scoreVariant = calculateSimilarityScore('Catan Energías', 'Catan');

    expect(scoreBase).toBe(1.0);
    expect(scoreVariant).toBeLessThan(0.80);
  });
});
