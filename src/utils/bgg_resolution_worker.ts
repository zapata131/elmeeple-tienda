import { createClient } from '@supabase/supabase-js';
import { parseBggThingXml } from './bgg_worker';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';

export interface BggResolutionResult {
  processed: number;
  resolved: number;
  retried: number;
  failed: number;
}

export async function processBggResolutionBatch(
  limit = 10,
  customSupabase?: unknown
): Promise<BggResolutionResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase: any = customSupabase || createClient(supabaseUrl, supabaseAnonKey);
  const stats: BggResolutionResult = { processed: 0, resolved: 0, retried: 0, failed: 0 };

  // Fetch pseudo-games (bgg_id >= 8,000,000) from bgg_games_cache
  const { data: pseudoGames, error: fetchErr } = await supabase
    .from('bgg_games_cache')
    .select('bgg_id, name, ean, thumbnail, last_updated_at')
    .gte('bgg_id', 8000000)
    .order('bgg_id')
    .limit(limit);

  if (fetchErr || !pseudoGames || pseudoGames.length === 0) {
    return stats;
  }

  for (const game of pseudoGames) {
    stats.processed++;
    try {
      let targetBggId: number | null = null;

      // 1. Check if another canonical game in cache already matches by EAN or exact name
      if (game.ean) {
        const { data: cachedByEan } = await supabase
          .from('bgg_games_cache')
          .select('bgg_id')
          .eq('ean', game.ean)
          .lt('bgg_id', 8000000)
          .single();
        if (cachedByEan && cachedByEan.bgg_id) {
          targetBggId = cachedByEan.bgg_id;
        }
      }

      if (!targetBggId && game.name) {
        const { data: cachedByName } = await supabase
          .from('bgg_games_cache')
          .select('bgg_id')
          .eq('name', game.name)
          .lt('bgg_id', 8000000)
          .single();
        if (cachedByName && cachedByName.bgg_id) {
          targetBggId = cachedByName.bgg_id;
        }
      }

      const bggHeaders: HeadersInit = {};
      const apiKey = process.env.BGG_API_KEY;
      if (apiKey) {
        bggHeaders['Authorization'] = `Bearer ${apiKey}`;
      }

      // 2. If not in cache, search BGG API
      if (!targetBggId) {
        const searchUrl = `https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(game.name)}&type=boardgame`;
        const searchRes = await fetch(searchUrl, { headers: bggHeaders });

        if (searchRes.status === 202 || searchRes.status === 429) {
          stats.retried++;
          continue;
        }

        if (searchRes.ok) {
          const searchXml = await searchRes.text();
          const idMatch = /<item[^>]*?id=["'](\d+)["']/i.exec(searchXml);
          if (idMatch) {
            targetBggId = parseInt(idMatch[1], 10);
          }
        }
      }

      // 3. Fallback search with cleaned query if no match found
      if (!targetBggId) {
        const cleanQuery = game.name.split('(')[0].split(' - ')[0].split(':')[0].trim();
        if (cleanQuery && cleanQuery !== game.name) {
          const fallbackRes = await fetch(
            `https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(cleanQuery)}&type=boardgame`,
            { headers: bggHeaders }
          );

          if (fallbackRes && (fallbackRes.status === 202 || fallbackRes.status === 429)) {
            stats.retried++;
            continue;
          }

          if (fallbackRes && fallbackRes.ok) {
            const fallbackXml = await fallbackRes.text();
            const idMatch = /<item[^>]*?id=["'](\d+)["']/i.exec(fallbackXml);
            if (idMatch) {
              targetBggId = parseInt(idMatch[1], 10);
            }
          }
        }
      }

      if (!targetBggId) {
        stats.failed++;
        continue;
      }

      // 4. Fetch canonical game details from BGG /thing API
      const thingRes = await fetch(
        `https://boardgamegeek.com/xmlapi2/thing?id=${targetBggId}&stats=1`,
        { headers: bggHeaders }
      );

      if (thingRes.status === 202 || thingRes.status === 429) {
        stats.retried++;
        continue;
      }

      if (!thingRes.ok) {
        stats.failed++;
        continue;
      }

      const thingXml = await thingRes.text();
      const details = parseBggThingXml(thingXml);

      if (!details) {
        stats.failed++;
        continue;
      }

      // 5. Upsert canonical game into bgg_games_cache
      await supabase.from('bgg_games_cache').upsert(
        {
          bgg_id: details.bgg_id,
          name: details.name,
          alternate_names: details.alternate_names,
          thumbnail: details.thumbnail,
          min_players: details.min_players,
          max_players: details.max_players,
          playing_time: details.playing_time,
          weight: details.weight,
          ean: game.ean || null,
          last_updated_at: new Date().toISOString(),
        },
        { onConflict: 'bgg_id' }
      );

      // 6. Re-link store_games rows from pseudo bgg_id to canonical bgg_id
      const { data: storeOffers } = await supabase
        .from('store_games')
        .select('*')
        .eq('bgg_id', game.bgg_id);

      if (storeOffers && storeOffers.length > 0) {
        const reLinkedOffers = storeOffers.map((offer: Record<string, unknown>) => ({
          store_id: offer.store_id,
          bgg_id: details.bgg_id,
          store_product_url: offer.store_product_url,
          price: offer.price,
          stock: offer.stock,
          edition_language: offer.edition_language || 'es',
          last_updated_at: new Date().toISOString(),
        }));

        await supabase
          .from('store_games')
          .upsert(reLinkedOffers, { onConflict: 'store_id,bgg_id' });

        await supabase.from('store_games').delete().eq('bgg_id', game.bgg_id);
      }

      // 7. Mark matching bgg_metadata_queue items as completed
      await supabase
        .from('bgg_metadata_queue')
        .update({ status: 'completed' })
        .ilike('title', `%${game.name}%`);

      // 8. Delete old pseudo-game row from bgg_games_cache
      await supabase.from('bgg_games_cache').delete().eq('bgg_id', game.bgg_id);

      stats.resolved++;
    } catch (err) {
      console.error(`[processBggResolutionBatch] Error resolving game ${game.bgg_id}:`, err);
      stats.failed++;
    }
  }

  return stats;
}
