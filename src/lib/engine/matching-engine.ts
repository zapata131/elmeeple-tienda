import { db } from '@/lib/db/mock-db';

export function cleanBoardGameTitle(rawTitle: string): string {
  if (!rawTitle) return '';
  let title = rawTitle.toLowerCase();

  const noisePatterns = [
    /juego de mesa/gi,
    /juego base/gi,
    /edición especial/gi,
    /edición en español/gi,
    /edicion espanol/gi,
    /en español/gi,
    /ingles/gi,
    /inglés/gi,
    /preventa/gi,
    /nuevo/gi,
    /original/gi,
    /devir/gi,
    /asmodee/gi,
  ];

  for (const pattern of noisePatterns) {
    title = title.replace(pattern, '');
  }

  // Preserve alphanumeric + Spanish letters (\u00C0-\u024F)
  title = title.replace(/[^\w\s\u00C0-\u024F]/gi, ' ');
  return title.replace(/\s+/g, ' ').trim();
}

export function detectLanguage(title: string, description: string = ''): 'es' | 'en' | 'multi' {
  const text = `${title} ${description}`.toLowerCase();

  if (/\b(multilingüe|multilenguaje|multi-language)\b/i.test(text)) return 'multi';
  if (/\b(inglés|ingles|english|en)\b/i.test(text) && !/\b(español|espanol)\b/i.test(text)) return 'en';
  return 'es'; // Default to Spanish for Mexican store feeds
}

export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  const lenA = a.length;
  const lenB = b.length;

  if (lenA === 0) return lenB;
  if (lenB === 0) return lenA;

  for (let i = 0; i <= lenB; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= lenA; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= lenB; i++) {
    for (let j = 1; j <= lenA; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[lenB][lenA];
}

export function jaroWinklerSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  let m = 0;
  const len1 = s1.length;
  const len2 = s2.length;
  const matchDistance = Math.floor(Math.max(len1, len2) / 2) - 1;

  const s1Matches = new Array(len1).fill(false);
  const s2Matches = new Array(len2).fill(false);

  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, len2);

    for (let j = start; j < end; j++) {
      if (s2Matches[j]) continue;
      if (s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      m++;
      break;
    }
  }

  if (m === 0) return 0.0;

  let k = 0;
  let numTranspositions = 0;
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) numTranspositions++;
    k++;
  }

  const t = numTranspositions / 2;
  const jaro = (m / len1 + m / len2 + (m - t) / m) / 3;

  // Winkler prefix scale adjustment
  let prefix = 0;
  for (let i = 0; i < Math.min(4, Math.min(len1, len2)); i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }

  return jaro + prefix * 0.1 * (1 - jaro);
}

export function tokenOverlapRatio(s1: string, s2: string): number {
  const tokens1 = new Set(s1.toLowerCase().split(/\s+/).filter(Boolean));
  const tokens2 = new Set(s2.toLowerCase().split(/\s+/).filter(Boolean));

  if (tokens1.size === 0 || tokens2.size === 0) return 0;

  let intersection = 0;
  tokens1.forEach(t => {
    if (tokens2.has(t)) intersection++;
  });

  const union = new Set([...tokens1, ...tokens2]).size;
  return union === 0 ? 0 : intersection / union;
}

export function calculateSimilarityScore(feedTitle: string, catalogTitle: string): number {
  const cleanFeed = cleanBoardGameTitle(feedTitle);
  const cleanCat = cleanBoardGameTitle(catalogTitle);

  if (cleanFeed === cleanCat) return 1.0;
  if (!cleanFeed || !cleanCat) return 0.0;

  const jaroWinkler = jaroWinklerSimilarity(cleanFeed, cleanCat);
  const tokenOverlap = tokenOverlapRatio(cleanFeed, cleanCat);
  const maxLen = Math.max(cleanFeed.length, cleanCat.length);
  const levDist = levenshteinDistance(cleanFeed, cleanCat);
  const levSimilarity = maxLen === 0 ? 1.0 : 1 - levDist / maxLen;

  let score = 0.5 * jaroWinkler + 0.3 * tokenOverlap + 0.2 * levSimilarity;

  // Exclusion Keyword Penalty
  const penaltyRegex = /\b(fundas?|primer|puzzles?|sleeves?|expansion)\b/i;
  const feedHasPenaltyKeyword = penaltyRegex.test(feedTitle);
  const catalogHasPenaltyKeyword = penaltyRegex.test(catalogTitle);

  if (feedHasPenaltyKeyword && !catalogHasPenaltyKeyword) {
    score -= 0.35;
  }

  return Math.max(0, Math.min(1.0, Number(score.toFixed(3))));
}

export interface ProductInput {
  storeId: string;
  title: string;
  sku?: string;
  barcode?: string;
  description?: string;
}

export interface MatchResult {
  matchedBggId: number | null;
  matchTier: number;
  confidence: number;
  shouldQueue: boolean;
}

export async function matchProductToCatalog(product: ProductInput): Promise<MatchResult> {
  const { storeId, title, sku, barcode } = product;

  // Tier 1: GTIN/EAN Barcode Matcher
  if (barcode && barcode.trim()) {
    const barcodeMatch = db.findBarcode(barcode.trim());
    if (barcodeMatch) {
      return {
        matchedBggId: barcodeMatch.bgg_id,
        matchTier: 1,
        confidence: 1.00,
        shouldQueue: false,
      };
    }
  }

  // Tier 2: Historical Merchant SKU Memory Lookup
  if (sku && sku.trim()) {
    const skuMatch = db.findMapping(storeId, sku.trim());
    if (skuMatch) {
      return {
        matchedBggId: skuMatch.bgg_id,
        matchTier: 2,
        confidence: 1.00,
        shouldQueue: false,
      };
    }
  }

  // Tier 3: Tokenized Fuzzy Matcher across BGG Games Cache
  const games = db.getBggGames();
  let highestScore = 0;
  let bestGameId: number | null = null;

  for (const game of games) {
    // Check primary title score
    const primaryScore = calculateSimilarityScore(title, game.name);
    if (primaryScore > highestScore) {
      highestScore = primaryScore;
      bestGameId = game.bgg_id;
    }

    // Check alternate names
    if (game.alternate_names) {
      for (const altName of game.alternate_names) {
        const altScore = calculateSimilarityScore(title, altName);
        if (altScore > highestScore) {
          highestScore = altScore;
          bestGameId = game.bgg_id;
        }
      }
    }
  }

  // Threshold decision tree
  if (highestScore >= 0.92 && bestGameId !== null) {
    return {
      matchedBggId: bestGameId,
      matchTier: 3,
      confidence: highestScore,
      shouldQueue: false,
    };
  } else if (highestScore >= 0.70 && bestGameId !== null) {
    return {
      matchedBggId: bestGameId,
      matchTier: 3,
      confidence: highestScore,
      shouldQueue: true,
    };
  }

  // Tier 4: Manual Queue Fallback
  return {
    matchedBggId: bestGameId,
    matchTier: 4,
    confidence: highestScore,
    shouldQueue: true,
  };
}
