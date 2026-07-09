import { createClient } from '@supabase/supabase-js';
import { cleanBoardGameTitle, isLikelyBoardGame } from './feed_parser';
import { EXPANSION_AND_ACCESSORY_WORDS } from './catalog_audit_worker';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';

export interface UrlAuditResult {
  offerId: string;
  storeName: string;
  targetGameName: string;
  bggId: number;
  url: string;
  httpStatus: number | null;
  isValidLink: boolean;
  productTitleFound: string | null;
  isCorrectProductMatch: boolean;
  failureReason?: string;
}

export interface DatabaseUrlAuditReport {
  totalOffersTested: number;
  validLinksCount: number;
  brokenLinksCount: number;
  titleMismatchesCount: number;
  healedOffersCount: number;
  results: UrlAuditResult[];
  success: boolean;
}

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Accept': 'application/json,text/html;q=0.9,*/*;q=0.8',
};

export async function verifyStoreOfferUrl(
  url: string,
  targetGameName: string
): Promise<{
  httpStatus: number | null;
  isValidLink: boolean;
  productTitleFound: string | null;
  isCorrectProductMatch: boolean;
  failureReason?: string;
}> {
  if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    return {
      httpStatus: null,
      isValidLink: false,
      productTitleFound: null,
      isCorrectProductMatch: false,
      failureReason: 'Invalid URL format',
    };
  }

  try {
    // 1. HTTP Link Health Check
    const cleanUrl = url.split('?')[0];
    const jsonUrl = cleanUrl.endsWith('.json') ? cleanUrl : `${cleanUrl}.json`;

    let res: Response;
    try {
      res = await fetch(jsonUrl, { headers: BROWSER_HEADERS, method: 'GET', signal: AbortSignal.timeout(3000) });
    } catch {
      res = await fetch(url, { headers: BROWSER_HEADERS, method: 'GET', signal: AbortSignal.timeout(3000) });
    }

    let productTitle: string | null = null;

    if (res.ok) {
      try {
        const data = await res.json();
        if (data?.product?.title) {
          productTitle = data.product.title;
        }
      } catch {
        // Not a Shopify JSON endpoint, fallback to standard HTML fetch
      }
    }

    if (!res.ok && res.status !== 301 && res.status !== 302 && res.status !== 308) {
      return {
        httpStatus: res.status,
        isValidLink: false,
        productTitleFound: productTitle,
        isCorrectProductMatch: false,
        failureReason: `HTTP ${res.status} returned by store`,
      };
    }

    // 2. Product Title Match & Expansion Integrity Check
    if (productTitle) {
      const cleanTarget = cleanBoardGameTitle(targetGameName).toLowerCase();
      const cleanFound = cleanBoardGameTitle(productTitle).toLowerCase();
      const lowerFound = productTitle.toLowerCase();

      // Check if product title contains an excluded expansion/accessory word when target is a base game
      for (const word of EXPANSION_AND_ACCESSORY_WORDS) {
        if (
          lowerFound.includes(word) &&
          !targetGameName.toLowerCase().includes(word)
        ) {
          return {
            httpStatus: res.status,
            isValidLink: true,
            productTitleFound: productTitle,
            isCorrectProductMatch: false,
            failureReason: `Product is an expansion/accessory (${word}) but linked to base game ${targetGameName}`,
          };
        }
      }

      // Check for board game likelihood
      if (!isLikelyBoardGame(productTitle)) {
        return {
          httpStatus: res.status,
          isValidLink: true,
          productTitleFound: productTitle,
          isCorrectProductMatch: false,
          failureReason: `Product appears to be a non-boardgame (apparel/model kit/accessory)`,
        };
      }

      // Verify title similarity / containment
      if (
        !cleanFound.includes(cleanTarget) &&
        !cleanTarget.includes(cleanFound)
      ) {
        return {
          httpStatus: res.status,
          isValidLink: true,
          productTitleFound: productTitle,
          isCorrectProductMatch: false,
          failureReason: `Title mismatch: found "${productTitle}" for game "${targetGameName}"`,
        };
      }
    }

    return {
      httpStatus: res.status,
      isValidLink: true,
      productTitleFound: productTitle,
      isCorrectProductMatch: true,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network fetch error';
    return {
      httpStatus: null,
      isValidLink: false,
      productTitleFound: null,
      isCorrectProductMatch: false,
      failureReason: message,
    };
  }
}

export async function auditAllDatabaseStoreOfferUrls(limit: number = 50): Promise<DatabaseUrlAuditReport> {
  const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
  const supabase = createClient(supabaseUrl, adminKey);

  const { data: storeGames, error } = await supabase
    .from('store_games')
    .select('id, bgg_id, store_product_url, stores(name), bgg_games_cache(name)')
    .limit(limit);

  if (error || !storeGames) {
    return {
      totalOffersTested: 0,
      validLinksCount: 0,
      brokenLinksCount: 0,
      titleMismatchesCount: 0,
      healedOffersCount: 0,
      results: [],
      success: false,
    };
  }

  const results: UrlAuditResult[] = [];
  let validLinksCount = 0;
  let brokenLinksCount = 0;
  let titleMismatchesCount = 0;
  let healedOffersCount = 0;

  const BATCH_SIZE = 10;
  for (let i = 0; i < storeGames.length; i += BATCH_SIZE) {
    const chunk = storeGames.slice(i, i + BATCH_SIZE);
    const chunkResults = await Promise.all(
      chunk.map(async (offer: Record<string, unknown>) => {
        const storeName = (offer.stores as { name?: string } | null)?.name || 'Desconocida';
        const targetGameName = (offer.bgg_games_cache as { name?: string } | null)?.name || `BGG ${offer.bgg_id}`;

        const audit = await verifyStoreOfferUrl((offer.store_product_url as string) || '', targetGameName);

        if (!audit.isValidLink || (audit.failureReason && audit.failureReason.includes('expansion/accessory'))) {
          await supabase.from('store_games').delete().eq('id', offer.id as string);
        }

        return {
          offerId: String(offer.id || ''),
          storeName,
          targetGameName,
          bggId: Number(offer.bgg_id || 0),
          url: String(offer.store_product_url || ''),
          httpStatus: audit.httpStatus,
          isValidLink: audit.isValidLink,
          productTitleFound: audit.productTitleFound,
          isCorrectProductMatch: audit.isCorrectProductMatch,
          failureReason: audit.failureReason,
        };
      })
    );

    for (const res of chunkResults) {
      if (res.isValidLink && res.isCorrectProductMatch) {
        validLinksCount++;
      } else {
        if (!res.isValidLink) brokenLinksCount++;
        if (res.isValidLink && !res.isCorrectProductMatch) titleMismatchesCount++;
        if (!res.isValidLink || (res.failureReason && res.failureReason.includes('expansion/accessory'))) {
          healedOffersCount++;
        }
      }
      results.push(res);
    }
  }

  return {
    totalOffersTested: storeGames.length,
    validLinksCount,
    brokenLinksCount,
    titleMismatchesCount,
    healedOffersCount,
    results,
    success: true,
  };
}
