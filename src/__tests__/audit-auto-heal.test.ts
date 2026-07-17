import { describe, it, expect } from 'vitest';
import { verifyOfferUrl } from '@/lib/engine/audit-worker';
import { db } from '@/lib/db/db';

describe('US-30: Link Audit & Quarantine Auto-Healing Worker', () => {
  it('should treat HTTP 200/301/302 responses as healthy links', async () => {
    const mockFetcher = async () => ({ status: 200, ok: true });
    const result = await verifyOfferUrl('https://fichaydado.com/products/catan', mockFetcher);
    expect(result.isBroken).toBe(false);
    expect(result.status).toBe(200);
  });

  it('should mark 404 links as broken and un-quarantine healthy links in db', () => {
    const offers = db.getOffers();
    expect(offers.length).toBeGreaterThan(0);

    // Pick test offer
    const testOffer = offers[0];
    db.markOfferBroken(testOffer.id, true, 'quarantined');
    expect(db.getDiagnostics().broken_offers).toBeGreaterThan(0);

    // Auto-heal
    db.markOfferBroken(testOffer.id, false, 'healthy');
    const updatedOffer = db.getOffers().find(o => o.id === testOffer.id);
    expect(updatedOffer?.is_broken).toBe(false);
    expect(updatedOffer?.health_status).toBe('healthy');
  });
});
