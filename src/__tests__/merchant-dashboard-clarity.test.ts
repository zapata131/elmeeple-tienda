import { describe, it, expect } from 'vitest';
import { db } from '@/lib/db/db';

describe('US-09 & US-08: Merchant Portal UI Clarity & Mapping Metadata', () => {
  it('should resolve calculated offers for a store with game title and non-editable store product URL', () => {
    const stores = db.getStores();
    expect(stores.length).toBeGreaterThan(0);

    const store = stores[0];
    const offers = db.getOffers().filter(o => o.store_id === store.id);

    if (offers.length > 0) {
      const offer = offers[0];
      const game = db.getBggGameById(offer.bgg_id);

      expect(offer.store_product_url).toBeDefined();
      expect(offer.store_product_url).toContain('http');
      expect(game?.name).toBeDefined();
    }
  });

  it('should map merchant internal SKU to official BoardGameGeek BGG ID', () => {
    const store = db.getStores()[0];
    const game = db.getBggGames()[0];

    const mapping = db.upsertMapping(
      store.id,
      'SKU-TEST-1234',
      game.bgg_id
    );

    expect(mapping.merchant_sku).toBe('SKU-TEST-1234');
    expect(mapping.bgg_id).toBe(game.bgg_id);

    const found = db.findMapping(store.id, 'SKU-TEST-1234');
    expect(found?.bgg_id).toBe(game.bgg_id);
  });
});
