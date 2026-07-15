import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';

export interface BggGameDetails {
  bgg_id: number;
  name: string;
  alternate_names: string[];
  thumbnail: string | null;
  min_players: number | null;
  max_players: number | null;
  playing_time: number | null;
  weight: number | null;
}

export function parseBggThingXml(xml: string): BggGameDetails | null {
  const getAttr = (block: string, tag: string, attr: string): string | null => {
    const regex = new RegExp(`<${tag}[^>]*?${attr}=["']([^"']+)["'][^>]*?>`, 'i');
    const m = regex.exec(block);
    return m ? m[1].trim() : null;
  };

  const getTagContent = (block: string, tag: string): string | null => {
    const regex = new RegExp(`<${tag}[^>]*?>([\\s\\S]*?)<\\/${tag}>`, 'i');
    const m = regex.exec(block);
    return m ? m[1].trim() : null;
  };

  const itemMatch = /<item[^>]*?id=["'](\d+)["'][^>]*?>([\s\S]*?)<\/item>/i.exec(xml);
  if (!itemMatch) {
    return null;
  }

  const bgg_id = parseInt(itemMatch[1], 10);
  const itemBlock = itemMatch[2];

  let primaryName = 'Unknown Game';
  const alternate_names: string[] = [];

  const nameRegex = /<name[^>]*?>/gi;
  let nameMatch;
  while ((nameMatch = nameRegex.exec(itemBlock)) !== null) {
    const tagStr = nameMatch[0];
    const typeAttr = /type=["']([^"']+)["']/i.exec(tagStr)?.[1];
    const valAttr = /value=["']([^"']+)["']/i.exec(tagStr)?.[1];
    if (valAttr) {
      if (typeAttr === 'primary') {
        primaryName = valAttr;
      } else if (typeAttr === 'alternate') {
        alternate_names.push(valAttr);
      }
    }
  }

  const thumbnail = getTagContent(itemBlock, 'thumbnail') || null;
  const minPlayersStr = getAttr(itemBlock, 'minplayers', 'value');
  const maxPlayersStr = getAttr(itemBlock, 'maxplayers', 'value');
  const playingTimeStr = getAttr(itemBlock, 'playingtime', 'value');
  const weightStr = getAttr(itemBlock, 'averageweight', 'value');

  return {
    bgg_id,
    name: primaryName,
    alternate_names,
    thumbnail,
    min_players: minPlayersStr ? parseInt(minPlayersStr, 10) : null,
    max_players: maxPlayersStr ? parseInt(maxPlayersStr, 10) : null,
    playing_time: playingTimeStr ? parseInt(playingTimeStr, 10) : null,
    weight: weightStr ? parseFloat(weightStr) : null,
  };
}

export async function processMetadataQueueBatch(limit = 20) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const stats = { processed: 0, resolved: 0, retried: 0, failed: 0 };

  // Fetch pending queue items
  const { data: items, error: fetchErr } = await supabase
    .from('bgg_metadata_queue')
    .select('id, store_id, ean, title, store_product_url, status')
    .eq('status', 'pending')
    .order('created_at')
    .limit(limit);

  if (fetchErr || !items || items.length === 0) {
    return stats;
  }

  for (const item of items) {
    stats.processed++;
    try {
      let targetBggId: number | null = null;

      // 1. Check if another item in cache already matches by EAN or exact title
      if (item.ean) {
        const { data: cachedByEan } = await supabase
          .from('bgg_games_cache')
          .select('bgg_id')
          .eq('ean', item.ean)
          .single();
        if (cachedByEan) {
          targetBggId = cachedByEan.bgg_id;
        }
      }

      const bggHeaders: HeadersInit = {};
      const apiKey = process.env.BGG_API_KEY;
      if (apiKey) {
        bggHeaders['Authorization'] = `Bearer ${apiKey}`;
      }

      // 2. If not found in cache, search BGG API
      if (!targetBggId) {
        const cleanQuery = item.title.split('(')[0].split(' - ')[0].trim();
        const searchRes = await fetch(`https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(cleanQuery)}&type=boardgame`, {
          headers: bggHeaders,
        });
        
        if (searchRes.status === 202 || searchRes.status === 429) {
          stats.retried++;
          await supabase.from('bgg_metadata_queue').update({ status: 'retry' }).eq('id', item.id);
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

      if (!targetBggId) {
        stats.failed++;
        await supabase.from('bgg_metadata_queue').update({ status: 'failed' }).eq('id', item.id);
        continue;
      }

      // 3. Fetch BGG Game Details from /thing API
      const thingRes = await fetch(`https://boardgamegeek.com/xmlapi2/thing?id=${targetBggId}&stats=1`, {
        headers: bggHeaders,
      });
      
      if (thingRes.status === 202 || thingRes.status === 429) {
        stats.retried++;
        await supabase.from('bgg_metadata_queue').update({ status: 'retry' }).eq('id', item.id);
        continue;
      }

      if (!thingRes.ok) {
        stats.failed++;
        await supabase.from('bgg_metadata_queue').update({ status: 'failed' }).eq('id', item.id);
        continue;
      }

      const thingXml = await thingRes.text();
      const details = parseBggThingXml(thingXml);

      if (!details) {
        stats.failed++;
        await supabase.from('bgg_metadata_queue').update({ status: 'failed' }).eq('id', item.id);
        continue;
      }

      // 4. Upsert into bgg_games_cache
      await supabase.from('bgg_games_cache').upsert({
        bgg_id: details.bgg_id,
        name: details.name,
        alternate_names: details.alternate_names,
        thumbnail: details.thumbnail,
        min_players: details.min_players,
        max_players: details.max_players,
        playing_time: details.playing_time,
        weight: details.weight,
        ean: item.ean || null,
        last_updated_at: new Date().toISOString(),
      }, { onConflict: 'bgg_id' });

      // 5. Link store_games offering
      await supabase.from('store_games').upsert({
        store_id: item.store_id,
        bgg_id: details.bgg_id,
        store_product_url: item.store_product_url,
        price: 0, // default if price not stored on queue item
        stock: 1,
        edition_language: 'es',
        last_updated_at: new Date().toISOString(),
      }, { onConflict: 'store_id,bgg_id' });

      // 6. Mark queue item completed
      await supabase.from('bgg_metadata_queue').update({ status: 'completed' }).eq('id', item.id);
      stats.resolved++;
    } catch (err) {
      console.error(`[processMetadataQueueBatch] Error resolving item ${item.id}:`, err);
      stats.failed++;
      await supabase.from('bgg_metadata_queue').update({ status: 'failed' }).eq('id', item.id);
    }
  }

  return stats;
}
