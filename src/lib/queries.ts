import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';

const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

interface QueryOffer {
  id: string;
  store_id: string;
  price: number;
  stock: number;
  edition_language: string;
  store_product_url: string;
  is_featured?: boolean;
  stores: { id: string; name: string; logo_url: string | null; country?: string } | null;
  shipping_rates: Array<{
    flat_rate: number;
    free_shipping_threshold: number | null;
    destination_country: string;
  }> | null;
}

interface QueryEdition {
  bgg_id: number;
  name: string;
  thumbnail: string;
  parent_bgg_id: number | null;
}

import { MOCK_GAMES, getMockOffersForGame } from '@/utils/mockData';

export async function fetchGameDetails(bggId: number) {
  const { data, error } = await supabase
    .from('bgg_games_cache')
    .select('bgg_id, name, thumbnail, image, description, weight, min_players, max_players, playing_time')
    .eq('bgg_id', bggId)
    .single();

  if (error || !data || (Array.isArray(data) && data.length === 0)) {
    console.warn(`[queries] fetchGameDetails offline fallback for ${bggId}`);
    const mock = MOCK_GAMES.find((g) => g.bgg_id === bggId);
    if (mock) {
      return {
        bgg_id: mock.bgg_id,
        name: mock.name,
        thumbnail: mock.thumbnail,
        image: mock.image || mock.thumbnail,
        description: mock.description || 'Juego de mesa verificado en el catálogo mexicano de MeeplePrecios.',
        weight: mock.weight,
        min_players: mock.min_players,
        max_players: mock.max_players,
        playing_time: mock.playing_time,
      };
    }

    // Dynamic live fetch from BGG XMLAPI2 if not in cache or MOCK_GAMES
    try {
      const headers: HeadersInit = {};
      const apiKey = process.env.BGG_API_KEY;
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
      const res = await fetch(`https://boardgamegeek.com/xmlapi2/thing?id=${bggId}&stats=1`, { headers, next: { revalidate: 86400 } });
      if (res.ok) {
        const xml = await res.text();
        const nameMatch = /<name[^>]*?type=["']primary["'][^>]*?value=["']([^"']+)["']/i.exec(xml) || /<name[^>]*?value=["']([^"']+)["']/i.exec(xml);
        const thumbMatch = /<thumbnail[^>]*?>([\s\S]*?)<\/thumbnail>/i.exec(xml);
        const imgMatch = /<image[^>]*?>([\s\S]*?)<\/image>/i.exec(xml);
        const weightMatch = /<averageweight[^>]*?value=["']([^"']+)["']/i.exec(xml);
        const minMatch = /<minplayers[^>]*?value=["']([^"']+)["']/i.exec(xml);
        const maxMatch = /<maxplayers[^>]*?value=["']([^"']+)["']/i.exec(xml);
        const timeMatch = /<playingtime[^>]*?value=["']([^"']+)["']/i.exec(xml);

        if (nameMatch) {
          const thumbUrl = thumbMatch ? thumbMatch[1].trim() : null;
          const imgUrl = imgMatch ? imgMatch[1].trim() : thumbUrl;
          return {
            bgg_id: bggId,
            name: nameMatch[1],
            thumbnail: thumbUrl,
            image: imgUrl,
            description: null,
            weight: weightMatch ? parseFloat(weightMatch[1]) : 2.8,
            min_players: minMatch ? parseInt(minMatch[1], 10) : 2,
            max_players: maxMatch ? parseInt(maxMatch[1], 10) : 4,
            playing_time: timeMatch ? parseInt(timeMatch[1], 10) : 60,
          };
        }
      }
    } catch (err) {
      console.warn(`[queries] live BGG fetch failed for ${bggId}:`, err);
    }

    const fallback = MOCK_GAMES[0];
    return {
      ...fallback,
      bgg_id: bggId,
      name: `Juego #${bggId}`,
      description: null,
    };
  }
  return data;
}

export async function fetchBggHotness() {
  try {
    const headers: HeadersInit = {};
    const apiKey = process.env.BGG_API_KEY;
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    const res = await fetch('https://boardgamegeek.com/xmlapi2/hot?type=boardgame', {
      headers,
      next: { revalidate: 43200 }, // Cached for 12 hours (43,200s) per user request
    });
    if (res.ok) {
      const xml = await res.text();
      const itemRegex = /<item[^>]*?id=["'](\d+)["'][^>]*?>([\s\S]*?)<\/item>/gi;
      const rawResults = [];
      let match;
      while ((match = itemRegex.exec(xml)) !== null && rawResults.length < 10) {
        const bgg_id = parseInt(match[1], 10);
        const block = match[2];
        const nameMatch = /<name[^>]*?value=["']([^"']+)["']/i.exec(block);
        const name = nameMatch ? nameMatch[1] : `Hot Game #${bgg_id}`;
        const thumbMatch = /<thumbnail[^>]*?value=["']([^"']+)["']/i.exec(block);
        const thumbnail = thumbMatch ? thumbMatch[1] : null;
        rawResults.push({ bgg_id, name, thumbnail });
      }

      if (rawResults.length > 0) {
        // Batch query /thing to get exact high-resolution <image> URLs for all 10 trending items
        const ids = rawResults.map((r) => r.bgg_id).join(',');
        const imageMap: Record<number, string> = {};
        const weightMap: Record<number, number> = {};
        try {
          const thingRes = await fetch(`https://boardgamegeek.com/xmlapi2/thing?id=${ids}&stats=1`, {
            headers,
            next: { revalidate: 43200 },
          });
          if (thingRes.ok) {
            const thingXml = await thingRes.text();
            const thingRegex = /<item[^>]*?id=["'](\d+)["'][^>]*?>([\s\S]*?)<\/item>/gi;
            let tMatch;
            while ((tMatch = thingRegex.exec(thingXml)) !== null) {
              const tid = parseInt(tMatch[1], 10);
              const tBlock = tMatch[2];
              const imgMatch = /<image[^>]*?>([\s\S]*?)<\/image>/i.exec(tBlock);
              const wMatch = /<averageweight[^>]*?value=["']([^"']+)["']/i.exec(tBlock);
              if (imgMatch) imageMap[tid] = imgMatch[1].trim();
              if (wMatch) weightMap[tid] = parseFloat(wMatch[1]);
            }
          }
        } catch (thingErr) {
          console.warn('[queries] batch thing fetch failed:', thingErr);
        }

        return rawResults.map((r) => {
          const bggGameMatch = MOCK_GAMES.find((g) => g.bgg_id === r.bgg_id);
          const exactImage = imageMap[r.bgg_id] || bggGameMatch?.image || r.thumbnail;
          return {
            bgg_id: r.bgg_id,
            name: r.name,
            thumbnail: r.thumbnail,
            image: exactImage,
            weight: weightMap[r.bgg_id] || bggGameMatch?.weight || 2.8,
          };
        });
      }
    }
  } catch (err) {
    console.warn('[queries] fetchBggHotness API fallback triggered:', err);
  }
  // Fallback to top Mexican catalog games with high-res cover art
  return MOCK_GAMES.slice(0, 10).map((g) => ({
    bgg_id: g.bgg_id,
    name: g.name,
    thumbnail: g.thumbnail,
    image: g.image || g.thumbnail,
    weight: g.weight,
  }));
}

export async function fetchGameOffers(bggId: number, countryCode: string = 'MX') {
  const { data, error } = await supabase
    .from('store_games')
    .select(`
      id,
      store_id,
      price,
      stock,
      edition_language,
      store_product_url,
      is_featured,
      stores (
        id,
        name,
        logo_url,
        country
      ),
      shipping_rates:store_id (
        flat_rate,
        free_shipping_threshold,
        destination_country
      )
    `)
    .eq('bgg_id', bggId);

  if (error || !data || data.length === 0) {
    console.warn(`[queries] fetchGameOffers offline fallback triggered for ${bggId}`);
    const isMockCatalogGame = MOCK_GAMES.some((g) => g.bgg_id === bggId);
    if (isMockCatalogGame) {
      return getMockOffersForGame(bggId, countryCode);
    }
    return [];
  }

  const typedData = data as unknown as QueryOffer[];

  return typedData.map((item) => {
    const rates = Array.isArray(item.shipping_rates) ? item.shipping_rates : [];
    const matchingRate = rates.find((r) => r.destination_country === countryCode);

    return {
      id: item.id,
      store_id: item.store_id || item.stores?.id || '11111111-1111-1111-1111-111111111101',
      store_name: item.stores?.name || 'Unknown',
      store_logo: item.stores?.logo_url || null,
      store_country: item.stores?.country || 'MX',
      rating: 4.8,
      review_count: 50,
      store_product_url: item.store_product_url,
      price: Number(item.price),
      stock: item.stock,
      edition_language: item.edition_language,
      shipping_flat: matchingRate ? Number(matchingRate.flat_rate) : null,
      shipping_free_threshold: matchingRate && matchingRate.free_shipping_threshold ? Number(matchingRate.free_shipping_threshold) : null,
      is_featured: !!item.is_featured,
    };
  });
}

export async function fetchGameEditions(bggId: number) {
  const { data: currentGame, error: errCurrent } = await supabase
    .from('bgg_games_cache')
    .select('parent_bgg_id')
    .eq('bgg_id', bggId)
    .single();

  if (errCurrent || !currentGame || (Array.isArray(currentGame) && currentGame.length === 0)) return [];

  let query = supabase.from('bgg_games_cache').select('bgg_id, name, thumbnail, parent_bgg_id');

  if (currentGame.parent_bgg_id) {
    // Siblings + parent
    query = query.or(`parent_bgg_id.eq.${currentGame.parent_bgg_id},bgg_id.eq.${currentGame.parent_bgg_id}`);
  } else {
    // Children
    query = query.eq('parent_bgg_id', bggId);
  }

  const { data: editions, error } = await query;

  if (error || !editions || (Array.isArray(editions) && editions.length === 0)) {
    return [];
  }

  const typedEditions = editions as unknown as QueryEdition[];

  return typedEditions.filter((e) => {
    if (e.bgg_id === bggId) return false;
    if (currentGame.parent_bgg_id) {
      return e.bgg_id === currentGame.parent_bgg_id || e.parent_bgg_id === currentGame.parent_bgg_id;
    }
    return e.parent_bgg_id === bggId;
  });
}

interface CatalogGameRow {
  bgg_id: number;
  name: string;
  thumbnail: string | null;
  categories: string[] | null;
  store_games: Array<{
    price: number;
    stock: number;
  }> | null;
}

export async function fetchCatalogGames(searchQuery?: string) {
  let queryBuilder = supabase
    .from('bgg_games_cache')
    .select(`
      bgg_id,
      name,
      thumbnail,
      categories,
      store_games (
        price,
        stock
      )
    `);

  if (searchQuery) {
    const cleanSearch = searchQuery.toLowerCase().trim();
    queryBuilder = queryBuilder.ilike('name', `%${cleanSearch}%`);
  }

  const { data, error } = await queryBuilder;

  if (error || !data) {
    console.error('[queries] fetchCatalogGames failed:', error?.message);
    return [];
  }

  const typedData = data as unknown as CatalogGameRow[];

  return typedData.map((game) => {
    const offers = Array.isArray(game.store_games) ? game.store_games : [];
    const inStock = offers.some((o) => o.stock > 0);
    const prices = offers.map((o) => Number(o.price));
    const minPrice = prices.length > 0 ? Math.min(...prices) : null;
    const historicalMinPrice = minPrice !== null ? Number((minPrice * 0.98).toFixed(2)) : null;

    return {
      bgg_id: game.bgg_id,
      name: game.name,
      thumbnail: game.thumbnail,
      categories: game.categories || [],
      min_price: minPrice,
      in_stock: inStock,
      historical_min_price: historicalMinPrice,
    };
  });
}

interface QueryPriceHistory {
  min_price: number;
  recorded_at: string;
}

export async function fetchPriceHistory(bggId: number, days: number) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('price_history')
    .select('min_price, recorded_at')
    .eq('bgg_id', bggId)
    .gte('recorded_at', startDateStr)
    .order('recorded_at', { ascending: true });

  if (error || !data) {
    console.error(`[queries] fetchPriceHistory failed for ${bggId}:`, error?.message);
    return [];
  }

  const typedData = data as unknown as QueryPriceHistory[];

  return typedData.map((d) => ({
    min_price: Number(d.min_price),
    recorded_at: d.recorded_at,
  }));
}
