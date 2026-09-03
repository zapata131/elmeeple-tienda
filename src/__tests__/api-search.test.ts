import { describe, it, expect } from 'vitest';
import { db } from '../lib/db/db';

describe('Sprint 5: Discovery & Predictive Search (US-01, US-25)', () => {
  it('should return catalog games for empty query (homepage feed)', async () => {
    const results = await db.searchGames('');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(g => g.slug === 'catan')).toBe(true);
    expect(results.some(g => g.slug === 'wingspan')).toBe(true);
  });

  it('should find games by partial or exact query', async () => {
    const results = await db.searchGames('flame');
    expect(results.length).toBeGreaterThanOrEqual(2); // Flamecraft & Flamecraft Duals
    expect(results.some(g => g.slug === 'flamecraft')).toBe(true);
    expect(results.some(g => g.slug === 'flamecraft-duals')).toBe(true);
  });

  it('should match alternate Spanish titles correctly', async () => {
    const results = await db.searchGames('Colonos de Catan');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].slug).toBe('catan');
  });

  it('should filter by language edition (es / en)', async () => {
    const esGames = await db.searchGames('', 'es');
    expect(esGames.length).toBeGreaterThan(0);

    const enGames = await db.searchGames('', 'en');
    expect(enGames.length).toBeGreaterThan(0);
  });
});
