import { CatalogGame, GameBarcode, MerchantProductMapping, FeedItem, MatchResult } from '../../types';
import { classifyFeedItemType } from './feed-parser';

export function cleanBoardGameTitle(rawTitle: string): string {
  if (!rawTitle) return '';
  let title = rawTitle.toLowerCase();

  // Longest / most specific phrases first to prevent partial residual tokens
  const noisePatterns = [
    /\bedición en español\b/gi,
    /\bedicion en espanol\b/gi,
    /\bedición especial\b/gi,
    /\bedicion especial\b/gi,
    /\bel juego de mesa\b/gi,
    /\bjuego de mesa\b/gi,
    /\bel juego base\b/gi,
    /\bjuego base\b/gi,
    /\bel juego\b/gi,
    /\ben español\b/gi,
    /\ben espanol\b/gi,
    /\bedición\b/gi,
    /\bedicion\b/gi,
    /\bingles\b/gi,
    /\binglés\b/gi,
    /\bpreventa\b/gi,
    /\bnuevo\b/gi,
    /\boriginal\b/gi,
    /\bdevir\b/gi,
    /\basmodee\b/gi,
    /\bboard game\b/gi,
  ];

  for (const pattern of noisePatterns) {
    title = title.replace(pattern, ' ');
  }

  // Preserve alphanumeric + Spanish/European characters (\u00C0-\u024F)
  title = title.replace(/[^\w\s\u00C0-\u024F]/gi, ' ');
  return title.replace(/\s+/g, ' ').trim();
}

export function levenshteinDistance(a: string, b: string): number {
  const an = a.length;
  const bn = b.length;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix = Array.from({ length: bn + 1 }, (_, i) => [i]);
  for (let j = 0; j <= an; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= bn; i++) {
    for (let j = 1; j <= an; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[bn][an];
}

export function jaroWinklerSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  const len1 = s1.length;
  const len2 = s2.length;
  if (len1 === 0 || len2 === 0) return 0.0;

  const matchDistance = Math.floor(Math.max(len1, len2) / 2) - 1;
  const s1Matches = new Array(len1).fill(false);
  const s2Matches = new Array(len2).fill(false);

  let matches = 0;
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, len2);
    for (let j = start; j < end; j++) {
      if (!s2Matches[j] && s1[i] === s2[j]) {
        s1Matches[i] = true;
        s2Matches[j] = true;
        matches++;
        break;
      }
    }
  }

  if (matches === 0) return 0.0;

  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (s1Matches[i]) {
      while (!s2Matches[k]) k++;
      if (s1[i] !== s2[k]) transpositions++;
      k++;
    }
  }

  const jaro =
    (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3;

  // Winkler standard prefix bonus
  let prefix = 0;
  for (let i = 0; i < Math.min(4, Math.min(len1, len2)); i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }

  return jaro + prefix * 0.1 * (1 - jaro);
}

export function tokenOverlapRatio(s1: string, s2: string): number {
  const tokens1 = new Set(s1.split(' ').filter(t => t.length > 0));
  const tokens2 = new Set(s2.split(' ').filter(t => t.length > 0));

  if (tokens1.size === 0 || tokens2.size === 0) return 0.0;

  let common = 0;
  for (const t of tokens1) {
    if (tokens2.has(t)) common++;
  }

  return (2 * common) / (tokens1.size + tokens2.size);
}

export function calculateSimilarityScore(feedTitle: string, catalogTitle: string): number {
  const cleanFeed = cleanBoardGameTitle(feedTitle);
  const cleanCat = cleanBoardGameTitle(catalogTitle);

  if (cleanFeed === cleanCat) return 1.0;
  if (!cleanFeed || !cleanCat) return 0.0;

  const jw = jaroWinklerSimilarity(cleanFeed, cleanCat);
  const to = tokenOverlapRatio(cleanFeed, cleanCat);
  const maxLen = Math.max(cleanFeed.length, cleanCat.length);
  const lev = maxLen > 0 ? 1 - levenshteinDistance(cleanFeed, cleanCat) / maxLen : 1;

  let score = 0.5 * jw + 0.3 * to + 0.2 * lev;

  // Standalone Subtitle / Spin-off Penalty
  const penaltyRegex = /\b(duelo|viaje|rivales|junior|plus|legacy|big box|cartas|3d|aniversario)\b/i;
  if (penaltyRegex.test(feedTitle) && !penaltyRegex.test(catalogTitle)) {
    score -= 0.4;
  }

  // Token Imbalance Penalty
  const feedTokens = cleanFeed.split(' ').filter(t => t.length > 2);
  const catTokens = cleanCat.split(' ').filter(t => t.length > 2);
  const unmapped = feedTokens.filter(t => !catTokens.includes(t));
  if (unmapped.length >= 1 && catTokens.length <= 2) {
    score -= 0.25;
  }

  return Math.max(0, Math.min(1.0, Number(score.toFixed(3))));
}

export interface MatchContext {
  catalog: CatalogGame[];
  barcodes: GameBarcode[];
  skuMappings: MerchantProductMapping[];
  storeId?: string;
}

export function matchFeedItem(feedItem: FeedItem, context: MatchContext): MatchResult {
  const { catalog, barcodes, skuMappings, storeId } = context;

  // Tier 1: Barcode matching
  if (feedItem.barcode) {
    const cleanBarcode = feedItem.barcode.trim();
    const foundBarcode = barcodes.find(b => b.barcode.trim() === cleanBarcode);
    if (foundBarcode) {
      return {
        game_id: foundBarcode.game_id,
        confidence: 1.0,
        tier: 1,
        match_method: 'barcode',
      };
    }
  }

  // Tier 2: SKU Memory lookup
  if (feedItem.sku && storeId) {
    const cleanSku = feedItem.sku.trim();
    const foundMapping = skuMappings.find(
      m => m.store_id === storeId && m.merchant_sku.trim() === cleanSku
    );
    if (foundMapping) {
      return {
        game_id: foundMapping.game_id,
        confidence: 1.0,
        tier: 2,
        match_method: 'sku_memory',
      };
    }
  }

  // Tier 3: Fuzzy composite matching
  const feedType = feedItem.item_type || classifyFeedItemType(feedItem.raw_title);
  const scoredCandidates: Array<{ game: CatalogGame; score: number }> = [];

  for (const game of catalog) {
    // Check main title
    let maxScore = calculateSimilarityScore(feedItem.raw_title, game.title);

    // Check alternate titles (e.g. Aventureros al Tren vs Ticket to Ride)
    if (game.alternate_titles && game.alternate_titles.length > 0) {
      for (const alt of game.alternate_titles) {
        const altScore = calculateSimilarityScore(feedItem.raw_title, alt);
        if (altScore > maxScore) maxScore = altScore;
      }
    }

    // Type compatibility penalty
    if (feedType !== game.item_type) {
      maxScore -= 0.35;
    }

    maxScore = Math.max(0, Math.min(1.0, Number(maxScore.toFixed(3))));
    if (maxScore > 0.3) {
      scoredCandidates.push({ game, score: maxScore });
    }
  }

  scoredCandidates.sort((a, b) => b.score - a.score);

  const best = scoredCandidates[0];
  if (best && best.score >= 0.92) {
    return {
      game_id: best.game.id,
      confidence: best.score,
      tier: 3,
      match_method: 'fuzzy_composite',
    };
  }

  // Tier 4: Ambiguous items or low confidence -> Staging Queue
  return {
    game_id: null,
    confidence: best ? best.score : 0,
    tier: 4,
    match_method: 'manual_queue',
    candidate_games: scoredCandidates.slice(0, 5),
  };
}
