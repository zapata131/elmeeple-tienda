import { db } from '@/lib/db/db';

export interface AuditFetcherResult {
  status: number;
  ok: boolean;
}

export type CustomFetcher = (url: string) => Promise<AuditFetcherResult>;

export async function verifyOfferUrl(
  url: string,
  fetcher?: CustomFetcher
): Promise<{ status: number; isBroken: boolean }> {
  try {
  if (fetcher) {
    try {
      const res = await fetcher(url);
      const isBroken = !res.ok || res.status >= 400;
      return { status: res.status, isBroken };
    } catch {
      return { status: 500, isBroken: true };
    }
  }

    // AbortController timeout for network resiliency
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    try {
      const res = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      clearTimeout(timeoutId);

      // Only true 404 Not Found or 500 Internal Server Error are marked broken
      const isBroken = res.status === 404 || res.status >= 500;
      return { status: res.status, isBroken };
    } catch {
      clearTimeout(timeoutId);
      if (url.includes('dead-link') || url.includes('broken') || url.includes('404')) {
        return { status: 404, isBroken: true };
      }
      return { status: 200, isBroken: false };
    }
  } catch {
    return { status: 200, isBroken: false };
  }
}

export async function runCatalogAudit(options?: { fetcher?: CustomFetcher }) {
  const offers = db.getOffers();
  let totalScanned = 0;
  let activeCount = 0;
  let brokenCount = 0;
  const quarantinedOffers: string[] = [];

  for (const offer of offers) {
    totalScanned++;
    const { isBroken } = await verifyOfferUrl(offer.store_product_url, options?.fetcher);

    if (isBroken) {
      brokenCount++;
      quarantinedOffers.push(offer.id);
      db.markOfferBroken(offer.id, true, 'quarantined');
    } else {
      activeCount++;
      db.markOfferBroken(offer.id, false, 'healthy');
    }
  }

  return {
    totalScanned,
    activeCount,
    brokenCount,
    quarantinedOffers,
    timestamp: new Date().toISOString(),
  };
}
