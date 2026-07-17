import { describe, it, expect } from 'vitest';
import { db } from '@/lib/db/db';
import { runFullFeedIngestion } from '@/lib/engine/feed-ingestion-worker';

describe('US-26: Store Logo Management & Automated Live Ingestion', () => {
  it('should ensure all 51 stores have valid logo_url defined', () => {
    const stores = db.getStores();
    expect(stores.length).toBeGreaterThanOrEqual(50);

    for (const store of stores) {
      expect(store.logo_url).toBeDefined();
      expect(store.logo_url.length).toBeGreaterThan(0);
    }
  });

  it('should allow updating store logo_url and shipping settings in db', () => {
    const store = db.getStores()[0];
    const newLogo = 'https://custom-logo.example.com/logo.png';
    
    db.updateStoreSettings(store.id, {
      logo_url: newLogo,
      flat_rate_shipping: 95,
      free_shipping_threshold: 1200,
    });

    const updatedStore = db.getStoreById(store.id);
    const updatedShipping = db.getShippingRateForStore(store.id);
    expect(updatedStore?.logo_url).toBe(newLogo);
    expect(updatedShipping.flat_rate).toBe(95);
    expect(updatedShipping.free_shipping_threshold).toBe(1200);
  });

  it('should execute live multi-route feed ingestion worker without errors', async () => {
    const results = await runFullFeedIngestion({ maxStores: 3 });
    expect(results).toBeDefined();
    expect(results.processedStores).toBeGreaterThan(0);
    expect(results.totalOffersIngested).toBeGreaterThanOrEqual(0);
  }, 15000);
});
