import { describe, it, expect, beforeEach } from 'vitest';
import { verifyOfferUrl, runCatalogAudit } from '@/lib/engine/audit-worker';
import { GET as auditCronHandler, POST as auditCronPostHandler } from '@/app/api/cron/audit-urls/route';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db/db';

describe('US-20: Automated Catalog Broken Link & Redirect Audit Worker', () => {
  beforeEach(() => {
    // Reset test offer state
    const offers = db.getOffers();
    if (offers.length > 0) {
      offers[0].stock = 5;
      (offers[0] as any).is_broken = false;
    }
  });

  it('verifyOfferUrl should identify healthy URLs (200 OK)', async () => {
    const mockFetcher = async () => ({ status: 200, ok: true });
    const result = await verifyOfferUrl('https://fichaydado.com/products/catan', mockFetcher);
    expect(result.isBroken).toBe(false);
    expect(result.status).toBe(200);
  });

  it('verifyOfferUrl should identify broken URLs (404 Not Found)', async () => {
    const mockFetcher = async () => ({ status: 404, ok: false });
    const result = await verifyOfferUrl('https://fichaydado.com/products/dead-link', mockFetcher);
    expect(result.isBroken).toBe(true);
    expect(result.status).toBe(404);
  });

  it('verifyOfferUrl should handle network errors gracefully', async () => {
    const mockFetcher = async () => {
      throw new Error('Network timeout');
    };
    const result = await verifyOfferUrl('https://invalid-store-domain-xyz.com', mockFetcher);
    expect(result.isBroken).toBe(true);
    expect(result.status).toBe(500);
  });

  it('runCatalogAudit should scan offers and quarantine broken links', async () => {
    const mockFetcher = async (url: string) => {
      if (url.includes('catan')) {
        return { status: 200, ok: true };
      }
      return { status: 404, ok: false };
    };

    const auditResult = await runCatalogAudit({ fetcher: mockFetcher });
    expect(auditResult.totalScanned).toBeGreaterThan(0);
    expect(auditResult).toHaveProperty('brokenCount');
    expect(auditResult).toHaveProperty('quarantinedOffers');
  });

  it('/api/cron/audit-urls should reject requests without valid Bearer CRON_SECRET header', async () => {
    const req = new NextRequest('http://localhost:3001/api/cron/audit-urls', {
      headers: { authorization: 'Bearer invalid-secret-token' },
    });
    const res = await auditCronHandler(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('/api/cron/audit-urls should accept valid Bearer CRON_SECRET and execute audit', async () => {
    const secret = process.env.CRON_SECRET || 'your-secure-cron-secret-token';
    const req = new NextRequest('http://localhost:3001/api/cron/audit-urls', {
      method: 'POST',
      headers: { authorization: `Bearer ${secret}` },
    });
    const res = await auditCronPostHandler(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.audited_at).toBeDefined();
    expect(data.total_audited).toBeGreaterThanOrEqual(0);
  });
});
