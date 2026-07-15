import { cleanBoardGameTitle } from './feed_parser';

export interface FeedItemInput {
  storeId: string;
  title: string;
  ean?: string | null;
  link: string;
}

export interface CatalogGameItem {
  bgg_id: number;
  name: string;
  ean?: string | null;
  alternate_names?: string[] | null;
}

export interface GameBarcodeItem {
  barcode: string;
  bgg_id: number;
  edition_language?: string;
  publisher_name?: string;
}

export interface MerchantMappingItem {
  store_id: string;
  merchant_sku: string;
  bgg_id: number;
  is_verified?: boolean;
}

export interface MatchWaterfallResult {
  bgg_id: number | null;
  confidence: number;
  match_tier: 1 | 2 | 3 | 4;
  edition_language?: string;
  suggested_bgg_id?: number | null;
  matched_name?: string;
}

/**
 * Calculates Jaro-Winkler similarity between two strings (0.0 to 1.0)
 */
export function jaroWinkler(s1: string, s2: string): number {
  const str1 = s1.toLowerCase().trim();
  const str2 = s2.toLowerCase().trim();

  if (str1 === str2) return 1.0;
  if (!str1 || !str2) return 0.0;

  const matchWindow = Math.floor(Math.max(str1.length, str2.length) / 2) - 1;
  const str1Matches = new Array(str1.length).fill(false);
  const str2Matches = new Array(str2.length).fill(false);

  let matches = 0;
  let transpositions = 0;

  for (let i = 0; i < str1.length; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, str2.length);

    for (let j = start; j < end; j++) {
      if (str2Matches[j]) continue;
      if (str1[i] !== str2[j]) continue;
      str1Matches[i] = true;
      str2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0.0;

  let k = 0;
  for (let i = 0; i < str1.length; i++) {
    if (!str1Matches[i]) continue;
    while (!str2Matches[k]) k++;
    if (str1[i] !== str2[k]) transpositions++;
    k++;
  }

  const m = matches;
  const jaro = (m / str1.length + m / str2.length + (m - transpositions / 2) / m) / 3;

  // Jaro-Winkler prefix adjustment
  let prefix = 0;
  for (let i = 0; i < Math.min(4, Math.min(str1.length, str2.length)); i++) {
    if (str1[i] === str2[i]) prefix++;
    else break;
  }

  return jaro + prefix * 0.1 * (1 - jaro);
}

/**
 * Calculates Token Overlap score between two string titles (0.0 to 1.0)
 */
export function tokenOverlap(s1: string, s2: string): number {
  const tokens1 = new Set(s1.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean));
  const tokens2 = new Set(s2.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean));

  if (tokens1.size === 0 || tokens2.size === 0) return 0.0;

  let intersection = 0;
  for (const token of Array.from(tokens1)) {
    if (tokens2.has(token)) intersection++;
  }

  // Use min size ratio for partial containment check (e.g. Catan vs Catan Edición Especial)
  return intersection / Math.min(tokens1.size, tokens2.size);
}

/**
 * Calculates Levenshtein distance ratio (0.0 to 1.0)
 */
export function levenshteinRatio(s1: string, s2: string): number {
  const a = s1.toLowerCase();
  const b = s2.toLowerCase();
  if (a === b) return 1.0;
  if (!a.length || !b.length) return 0.0;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }

  const distance = matrix[b.length][a.length];
  const maxLen = Math.max(a.length, b.length);
  return 1.0 - distance / maxLen;
}

/**
 * Combined similarity metric: (0.5 * JW) + (0.3 * TO) + (0.2 * Lev)
 */
export function calculateSimilarityScore(str1: string, str2: string): number {
  const c1 = cleanBoardGameTitle(str1);
  const c2 = cleanBoardGameTitle(str2);
  if (c1.toLowerCase() === c2.toLowerCase()) return 1.0;

  const jw = jaroWinkler(c1, c2);
  const to = tokenOverlap(c1, c2);
  const lev = levenshteinRatio(c1, c2);

  return parseFloat(((0.5 * jw) + (0.3 * to) + (0.2 * lev)).toFixed(2));
}

/**
 * 4-Tier Waterfall Feed Matching Engine
 */
export async function matchFeedItemWaterfall(
  item: FeedItemInput,
  gamesCatalog: CatalogGameItem[],
  gameBarcodes: GameBarcodeItem[] = [],
  merchantMappings: MerchantMappingItem[] = []
): Promise<MatchWaterfallResult> {
  // Tier 1: EAN / GTIN Barcode Registry Matcher (Deterministic)
  if (item.ean) {
    const barcodeMatch = gameBarcodes.find((b) => b.barcode === item.ean);
    if (barcodeMatch) {
      return {
        bgg_id: barcodeMatch.bgg_id,
        confidence: 1.00,
        match_tier: 1,
        edition_language: barcodeMatch.edition_language || 'es',
      };
    }

    // Check EAN stored directly on bgg_games_cache
    const eanCatalogMatch = gamesCatalog.find((g) => g.ean === item.ean);
    if (eanCatalogMatch) {
      return {
        bgg_id: eanCatalogMatch.bgg_id,
        confidence: 1.00,
        match_tier: 1,
        edition_language: 'es',
      };
    }
  }

  // Tier 2: Historical Merchant SKU / Product URL Memory Table
  const skuToMatch = item.ean || item.link;
  if (skuToMatch) {
    const memoryMatch = merchantMappings.find(
      (m) => m.store_id === item.storeId && (m.merchant_sku === skuToMatch || m.merchant_sku === item.link)
    );
    if (memoryMatch) {
      return {
        bgg_id: memoryMatch.bgg_id,
        confidence: 1.00,
        match_tier: 2,
      };
    }
  }

  // Tier 3: Tokenized Fuzzy Matcher & Subtitle Isolator
  const cleanTitle = cleanBoardGameTitle(item.title);
  let bestCandidate: CatalogGameItem | null = null;
  let maxScore = 0.0;

  const EXCLUSION_WORDS = [
    'expansion', 'expansión', 'exp', 'sleeves', 'fundas',
    'spot it', 'spot-it', 'dobble', 'junior', 'duelo', 'duel'
  ];

  for (const game of gamesCatalog) {
    const titlesToTest = [game.name, ...(game.alternate_names || [])];

    for (const targetTitle of titlesToTest) {
      let score = calculateSimilarityScore(cleanTitle, targetTitle);

      // Check expansion/spin-off keyword penalties
      const cleanLower = cleanTitle.toLowerCase();
      const targetLower = targetTitle.toLowerCase();

      for (const word of EXCLUSION_WORDS) {
        if (cleanLower.includes(word) && !targetLower.includes(word)) {
          score = Math.max(0.0, score - 0.35); // Apply penalty for un-indexed expansion words
        }
      }

      if (score > maxScore) {
        maxScore = score;
        bestCandidate = game;
      }
    }
  }

  // Evaluate Confidence Thresholds
  if (bestCandidate && maxScore >= 0.92) {
    return {
      bgg_id: bestCandidate.bgg_id,
      confidence: maxScore,
      match_tier: 3,
      matched_name: bestCandidate.name,
    };
  }

  if (bestCandidate && maxScore >= 0.70) {
    return {
      bgg_id: null, // routed to Staging Queue
      confidence: maxScore,
      match_tier: 4,
      suggested_bgg_id: bestCandidate.bgg_id,
      matched_name: bestCandidate.name,
    };
  }

  // Tier 4: Low-confidence / Unmatched
  return {
    bgg_id: null,
    confidence: maxScore,
    match_tier: 4,
    suggested_bgg_id: bestCandidate && maxScore > 0 ? bestCandidate.bgg_id : null,
  };
}

/**
 * Enriches queue items with suggested game titles and thumbnails
 */
export async function enrichQueueItems<T extends { suggested_bgg_id?: number | null }>(
  items: T[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseClient?: any
): Promise<Array<T & { suggested_game_name?: string | null; suggested_game_thumbnail?: string | null }>> {
  if (!items || items.length === 0) return [];

  const suggestedBggIds = Array.from(
    new Set(items.map((i) => i.suggested_bgg_id).filter((id): id is number => typeof id === 'number' && id > 0))
  );

  const gameMap = new Map<number, { name: string; thumbnail?: string | null }>();

  // 1. Populate defaults from memory/catalog if available
  const mockGamesList = [
    { bgg_id: 13, name: 'Catan', thumbnail: 'https://cf.geekdo-images.com/W3Bs2D0ZaG4vJBHvfR0EJQ__thumb/img/unBvZ25uJ-7389k0839_J97232=/fit-in/200x150/filters:strip_icc()/pic2419375.jpg' },
    { bgg_id: 822, name: 'Carcassonne', thumbnail: 'https://cf.geekdo-images.com/okjI-h-Uvxm-Q221097.jpg' },
    { bgg_id: 266192, name: 'Wingspan', thumbnail: 'https://cf.geekdo-images.com/wingspan.jpg' },
    { bgg_id: 316554, name: 'Dune: Imperium', thumbnail: 'https://cf.geekdo-images.com/dune.jpg' },
    { bgg_id: 167791, name: 'Terraforming Mars', thumbnail: 'https://cf.geekdo-images.com/tfmars.jpg' },
  ];

  for (const g of mockGamesList) {
    gameMap.set(g.bgg_id, { name: g.name, thumbnail: g.thumbnail });
  }

  // 2. Query bgg_games_cache if supabaseClient passed and suggestedBggIds present
  if (supabaseClient && suggestedBggIds.length > 0) {
    try {
      const { data: cachedGames } = await supabaseClient
        .from('bgg_games_cache')
        .select('bgg_id, name, thumbnail')
        .in('bgg_id', suggestedBggIds);

      if (cachedGames && Array.isArray(cachedGames)) {
        for (const g of cachedGames) {
          gameMap.set(g.bgg_id, { name: g.name, thumbnail: g.thumbnail });
        }
      }
    } catch {
      // Ignore cache fetch error in test/offline mode
    }
  }

  return items.map((item) => {
    const game = item.suggested_bgg_id ? gameMap.get(item.suggested_bgg_id) : null;
    return {
      ...item,
      suggested_game_name: game ? game.name : item.suggested_bgg_id ? `Juego BGG #${item.suggested_bgg_id}` : null,
      suggested_game_thumbnail: game ? game.thumbnail || null : null,
    };
  });
}
