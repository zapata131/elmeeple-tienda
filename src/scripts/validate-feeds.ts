import { INITIAL_STORES } from '../lib/db/seed-data';
import { fetchWithMultiRouteFallback } from '../lib/engine/feed-parser';

export interface FeedValidationResult {
  storeId: string;
  storeName: string;
  primaryFeedUrl: string;
  workingRoute?: string;
  isValid: boolean;
  itemCount: number;
  error?: string;
}

async function main() {
  console.log(`===================================================`);
  console.log(`US-24 Multi-Route Feed Scan across all ${INITIAL_STORES.length} Stores`);
  console.log(`===================================================\n`);

  const results: FeedValidationResult[] = [];

  for (const store of INITIAL_STORES) {
    if (!store.feed_url) continue;

    const res = await fetchWithMultiRouteFallback(store.feed_url);

    results.push({
      storeId: store.id,
      storeName: store.name,
      primaryFeedUrl: store.feed_url,
      workingRoute: res.ok ? res.usedRoute : undefined,
      isValid: res.ok,
      itemCount: res.items.length,
      error: res.error,
    });
  }

  const validStores = results.filter((r) => r.isValid);
  console.log(`\n===================================================`);
  console.log(`MULTI-ROUTE VERIFICATION SUMMARY: ${validStores.length}/${INITIAL_STORES.length} Stores Responding Live`);
  console.log(`===================================================\n`);

  results.forEach((r) => {
    const icon = r.isValid ? '🟢' : '🟡';
    console.log(`${icon} [${r.storeName}] -> ${r.isValid ? `LIVE ROUTE: ${r.workingRoute} (${r.itemCount} items)` : `OFFLINE / CLOUDFLARE CACHED (${r.error})`}`);
  });
}

main();
