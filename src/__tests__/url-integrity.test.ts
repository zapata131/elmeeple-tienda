import { describe, it, expect } from 'vitest';
import { db } from '../lib/db/db';
import { INITIAL_OFFERS, INITIAL_GAMES } from '../lib/db/seed-data';

describe('Sprint 4: URL Integrity & 3-Part Delivered Cost Math Gate', () => {
  it('should have valid, well-formed HTTPS URLs for all store offers', () => {
    for (const offer of INITIAL_OFFERS) {
      expect(offer.store_product_url).toMatch(/^https:\/\/[a-zA-Z0-9.-]+\/products\/[a-zA-Z0-9_-]+/);
    }
  });

  it('should verify that all store offer URLs respond with HTTP 200 and match product title', async () => {
    for (const offer of INITIAL_OFFERS) {
      const game = INITIAL_GAMES.find(g => g.id === offer.game_id);
      expect(game).toBeDefined();

      const res = await fetch(offer.store_product_url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        },
      });

      expect(res.status, `Failed URL: ${offer.store_product_url}`).toBe(200);

      const html = await res.text();
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const pageTitle = (titleMatch ? titleMatch[1] : '').toLowerCase();

      expect(pageTitle).not.toContain('404');
      expect(pageTitle).not.toContain('not found');

      // Verify the product page title contains key terms of the game
      const mainKeyword = game!.title.split(':')[0].split(' ')[0].toLowerCase();
      expect(pageTitle).toContain(mainKeyword);
    }
  }, 40000); // Allow sufficient network timeout for live checks

  it('should calculate 3-part delivered cost strictly according to the law', async () => {
    // Flamecraft has multiple offers with different shipping rules
    const flamecraft = INITIAL_GAMES.find(g => g.slug === 'flamecraft');
    expect(flamecraft).toBeDefined();

    const offers = await db.getOffersForGame(flamecraft!.id);
    expect(offers.length).toBeGreaterThan(0);

    for (const o of offers) {
      const expectedShipping =
        o.shipping.free_shipping_threshold !== null && o.price >= o.shipping.free_shipping_threshold
          ? 0
          : o.shipping.flat_rate;

      expect(o.shipping.shipping_cost).toBe(expectedShipping);
      expect(o.total_delivered_cost).toBe(o.price + expectedShipping);
    }
  });
});
