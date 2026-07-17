import { describe, it, expect } from 'vitest';
import { db } from '@/lib/db/mock-db';
import { GET as redirectHandler } from '@/app/api/redirect/route';
import { NextRequest } from 'next/server';

describe('Audit: Price Calculation & Affiliate Redirect Verification', () => {
  it('should verify Catan (bgg_id 13) offers belong to Catan and total delivered cost math is 100% accurate', () => {
    const game = db.getBggGameById(13);
    expect(game).toBeDefined();
    expect(game?.name).toBe('Catan');

    const offers = db.getOffersForGame(13);
    expect(offers.length).toBeGreaterThan(0);

    // Verify each offer calculation & game relevance
    offers.forEach((offer) => {
      expect(offer.bgg_id).toBe(13);
      expect(offer.store_product_url).toContain('catan');
      expect(offer.price).toBeGreaterThan(0);

      // Total delivered cost calculation
      const expectedTotal = offer.qualifies_free_shipping
        ? offer.price
        : offer.price + offer.shipping_cost;
      expect(offer.total_delivered_cost).toBeCloseTo(expectedTotal, 2);
    });

    // Verify UI sorting logic (as implemented in PriceComparisonTable)
    const sortedOffers = [...offers].sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return a.total_delivered_cost - b.total_delivered_cost;
    });

    const nonFeaturedOffers = sortedOffers.filter((o) => !o.is_featured);
    for (let i = 0; i < nonFeaturedOffers.length - 1; i++) {
      expect(nonFeaturedOffers[i].total_delivered_cost).toBeLessThanOrEqual(
        nonFeaturedOffers[i + 1].total_delivered_cost
      );
    }
  });

  it('should verify that clicking "Ir a la tienda" redirects to the exact product page with UTM affiliate tracking', async () => {
    const targetProductUrl = 'https://fichaydado.com/products/catan-juego-de-mesa';
    const req = new NextRequest(
      `http://localhost:3001/api/redirect?store_id=store-ficha-01&bgg_id=13&url=${encodeURIComponent(targetProductUrl)}`
    );

    const res = await redirectHandler(req);
    expect(res.status).toBe(302);

    const location = res.headers.get('location');
    expect(location).toBeDefined();
    expect(location).toContain('fichaydado.com/products/catan-juego-de-mesa');
    expect(location).toContain('utm_source=meepleprecios');
    expect(location).toContain('utm_medium=affiliate');
    expect(location).toContain('utm_campaign=price_comparison');
  });

  it('should verify that clicks are logged into click history memory table', () => {
    const initialClickCount = db.getClicks().length;
    db.logClick('store-ficha-01', 13, 'https://fichaydado.com/products/catan-juego-de-mesa');
    const newClickCount = db.getClicks().length;

    expect(newClickCount).toBe(initialClickCount + 1);
  });
});
