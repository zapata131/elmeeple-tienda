import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';

const supabase = createSupabaseClient(supabaseUrl, supabaseRoleKey);

export const EXPANSION_AND_ACCESSORY_WORDS = [
  'expansion', 'expansión', 'exp', 'expa', 'ampliacion', 'ampliación', 'escenario', 'viaje', 'travel',
  'junior', 'duelo', 'duel', 'extension', 'extensión', 'pack', 'set', 'scenario',
  'spot it', 'spot-it', 'dobble',
  'cazadores', 'recolectores', 'constructores', 'catedrales', 'posadas', 'dragones', 'hadas', 'torre', 'abadía', 'abadias', 'niebla', 'salsa', 'barcos',
  'puzzle', 'rompecabezas', 'pegamento',
  'nesting', 'nesting box', 'caja nido', 'organizer', 'organizador', 'inserto', 'insert', 'folded space',
  'box', 'caja', 'storage', 'caja organizadora', 'almacenamiento',
  'sleeves', 'micas', 'funda', 'fundas', 'playmat', 'play-mat', 'play mat', 'tapete',
  'monedas', 'coins', 'metal coins', 'tokens', 'fichas', 'dice', 'dados', 'torre de dados', 'dice tower',
  'eggs', 'huevos', 'stone', 'meeple', 'meeples', 'miniatures', 'miniaturas',
  'promo', 'promos', 'addon', 'add-on', 'upgrade', 'upgrade pack', 'artbook', 'art book', 'soundtrack', 'playera', 't-shirt', 'poster',
  'beetle', 'model', 'kit', 'figura', 'figure', 'toy', 'juguete', 'hot wheels', 'funko', 'gundam', 'gunpla', 'plamo', 'replica', 'réplica', 'statue', 'estatua', 'plush', 'peluche'
];

export interface AuditReport {
  mismatchedOffersDeleted: number;
  autoCreatedExclusionsPurged: number;
  storesAudited: number;
  success: boolean;
}

/**
 * Automated Catalog Audit Worker
 * Scans store_games and bgg_games_cache in Supabase:
 * 1. Purges mismatched store offers on base games that contain expansion/accessory keywords in their URL or title.
 * 2. Purges unverified auto-created entries (bgg_id >= 8,000,000) containing exclusion keywords.
 */
export async function auditDatabaseCatalogIntegrity(customClient?: unknown): Promise<AuditReport> {
  const client = (customClient || supabase) as typeof supabase;
  const report: AuditReport = {
    mismatchedOffersDeleted: 0,
    autoCreatedExclusionsPurged: 0,
    storesAudited: 0,
    success: true,
  };

  try {
    // 1. Audit store_games linked to verified base games (bgg_id < 8,000,000)
    const { data: verifiedGames } = await client
      .from('bgg_games_cache')
      .select('bgg_id, name')
      .lt('bgg_id', 8000000);

    const verifiedMap = new Map<number, string>();
    for (const g of (verifiedGames || [])) {
      verifiedMap.set(g.bgg_id, g.name.toLowerCase());
    }

    const { data: allOffers } = await client
      .from('store_games')
      .select('id, bgg_id, store_product_url')
      .lt('bgg_id', 8000000);

    const mismatchedIds: string[] = [];

    for (const offer of (allOffers || [])) {
      const baseName = verifiedMap.get(offer.bgg_id) || '';
      const urlLower = offer.store_product_url.toLowerCase();

      for (const word of EXPANSION_AND_ACCESSORY_WORDS) {
        if (urlLower.includes(word) && !baseName.includes(word)) {
          mismatchedIds.push(offer.id);
          break;
        }
      }
    }

    if (mismatchedIds.length > 0) {
      for (let i = 0; i < mismatchedIds.length; i += 200) {
        const batch = mismatchedIds.slice(i, i + 200);
        await client.from('store_games').delete().in('id', batch);
      }
      report.mismatchedOffersDeleted = mismatchedIds.length;
    }

    // 2. Audit auto-created bgg_games_cache entries (bgg_id >= 8,000,000)
    const { data: autoGames } = await client
      .from('bgg_games_cache')
      .select('bgg_id, name')
      .gte('bgg_id', 8000000);

    const autoPurgeIds: number[] = [];

    for (const game of (autoGames || [])) {
      const nameLower = game.name.toLowerCase();
      for (const word of EXPANSION_AND_ACCESSORY_WORDS) {
        if (nameLower.includes(word)) {
          autoPurgeIds.push(game.bgg_id);
          break;
        }
      }
    }

    if (autoPurgeIds.length > 0) {
      for (let i = 0; i < autoPurgeIds.length; i += 200) {
        const batch = autoPurgeIds.slice(i, i + 200);
        await client.from('store_games').delete().in('bgg_id', batch);
        await client.from('bgg_games_cache').delete().in('bgg_id', batch);
      }
      report.autoCreatedExclusionsPurged = autoPurgeIds.length;
    }

    const { count } = await client.from('stores').select('*', { count: 'exact', head: true });
    report.storesAudited = count || 0;
  } catch (err) {
    console.error('[Catalog Audit Worker] Error during catalog audit:', err);
    report.success = false;
  }

  return report;
}
