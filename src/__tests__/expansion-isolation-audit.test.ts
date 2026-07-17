import { describe, it, expect } from 'vitest';
import { db } from '@/lib/db/db';
import { classifyFeedItemType, matchProductToCatalog } from '@/lib/engine/matching-engine';

describe('US-17 & US-05: Systemic Base Game vs Expansion Isolation & Catalog Integrity', () => {
  it('should correctly classify title types as base game or expansion', () => {
    expect(classifyFeedItemType('Carcassonne Base - ESPAÑOL')).toBe('boardgame');
    expect(classifyFeedItemType('Carcassonne Expansión 10: Circos y Artistas')).toBe('expansion');
    expect(classifyFeedItemType('Devir Catan: Navegantes Ampliación')).toBe('expansion');
    expect(classifyFeedItemType('Wingspan (Español)')).toBe('boardgame');
    expect(classifyFeedItemType('Wingspan: Asia (Expansión)')).toBe('expansion');
  });

  it('should prevent expansion feed items from auto-matching base game entities', async () => {
    const matchResult = await matchProductToCatalog({
      storeId: 'store-tlacuache-04',
      title: 'Carcassonne Expansión 10: Circos y Artistas | Devir',
    });

    // If suggested bggId is base game (822), should flag as expansion or require queue review
    if (matchResult.matchedBggId === 822) {
      expect(matchResult.shouldQueue).toBe(true);
    }
  });

  it('should strictly return base game offers for base game bgg_id in getOffersForGame()', () => {
    const carcassonneOffers = db.getOffersForGame(822); // Carcassonne Base Game
    expect(carcassonneOffers.length).toBeGreaterThan(0);

    for (const offer of carcassonneOffers) {
      const urlLower = offer.store_product_url.toLowerCase();
      // Ensure no offer URL contains expansion keywords
      expect(urlLower).not.toContain('expansion');
      expect(urlLower).not.toContain('ampliacion');
      expect(urlLower).not.toContain('posadas');
      expect(urlLower).not.toContain('circos');
    }
  });

  it('should strictly return base game offers for Catan (13)', () => {
    const catanOffers = db.getOffersForGame(13); // Catan Base Game
    expect(catanOffers.length).toBeGreaterThan(0);

    for (const offer of catanOffers) {
      const urlLower = offer.store_product_url.toLowerCase();
      expect(urlLower).not.toContain('navegantes');
      expect(urlLower).not.toContain('ciudades-y-caballeros');
    }
  });
});
