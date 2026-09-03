import { describe, it, expect } from 'vitest';
import { db } from '../lib/db/db';

describe('Sprint 6: Game Detail View & 3-Part Delivered Cost Law (US-02, US-03, US-04)', () => {
  it('should fetch game details by slug', async () => {
    const game = await db.getGameBySlug('catan');
    expect(game).not.toBeNull();
    expect(game?.title).toBe('Catan');
    expect(game?.slug).toBe('catan');
    expect(game?.bgg_rank).toBe(450);
  });

  it('should return calculated offers with store and shipping details', async () => {
    const game = await db.getGameBySlug('flamecraft');
    expect(game).not.toBeNull();

    const offers = await db.getOffersForGame(game!.id);
    expect(offers.length).toBeGreaterThanOrEqual(2);

    for (const offer of offers) {
      expect(offer.store).toBeDefined();
      expect(offer.store.name).toBeTruthy();
      expect(offer.shipping).toBeDefined();
      expect(offer.total_delivered_cost).toBe(offer.price + offer.shipping.shipping_cost);
    }
  });

  it('should sort offers strictly by delivered cost (Base + Shipping)', async () => {
    const game = await db.getGameBySlug('flamecraft-duals');
    expect(game).not.toBeNull();

    const offers = await db.getOffersForGame(game!.id);
    expect(offers.length).toBeGreaterThan(0);

    // Filter out non-featured to test pure cost sorting
    const unfeatured = offers.filter(o => !o.is_featured);
    for (let i = 0; i < unfeatured.length - 1; i++) {
      expect(unfeatured[i].total_delivered_cost).toBeLessThanOrEqual(
        unfeatured[i + 1].total_delivered_cost
      );
    }
  });

  it('should highlight exactly one best price offer', async () => {
    const game = await db.getGameBySlug('flamecraft');
    const offers = await db.getOffersForGame(game!.id);
    const bestPrices = offers.filter(o => o.is_best_price);
    expect(bestPrices.length).toBe(1);
  });
});
