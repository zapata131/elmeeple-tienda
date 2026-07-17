import { describe, it, expect } from 'vitest';
import { INITIAL_STORES, INITIAL_SHIPPING_RATES } from '@/lib/db/seed-data';
import { db } from '@/lib/db/db';

describe('US-23 Extended Mexican Tabletop Store Directory Registry', () => {
  it('should register 51 total Mexican board game stores', () => {
    expect(INITIAL_STORES.length).toBe(51);
  });

  it('should ensure all stores have unique IDs and valid Atom XML or JSON feed URLs', () => {
    const storeIds = new Set<string>();
    INITIAL_STORES.forEach((store) => {
      expect(storeIds.has(store.id)).toBe(false);
      storeIds.add(store.id);

      expect(store.country).toBe('MX');
      expect(store.is_domestic).toBe(true);
      expect(store.feed_url).toMatch(/^https:\/\/[a-z0-9.-]+\/collections\/all\.atom$/);
      expect(store.feed_type).toBe('google_xml');
    });
  });

  it('should have a corresponding flat shipping rate configured for every registered store', () => {
    expect(INITIAL_SHIPPING_RATES.length).toBe(51);

    INITIAL_STORES.forEach((store) => {
      const shipping = INITIAL_SHIPPING_RATES.find((s) => s.store_id === store.id);
      expect(shipping).toBeDefined();
      expect(shipping?.flat_rate).toBeGreaterThan(0);
      expect(shipping?.free_shipping_threshold).toBeGreaterThan(0);
    });
  });

  it('should return all 51 stores through the mock DB service', () => {
    const stores = db.getStores();
    expect(stores.length).toBe(51);
  });
});
