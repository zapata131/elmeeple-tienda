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
  stores: { id: string; name: string; logo_url: string | null } | null;
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

export async function fetchGameDetails(bggId: number) {
  const { data, error } = await supabase
    .from('bgg_games_cache')
    .select('bgg_id, name, thumbnail, weight, min_players, max_players, playing_time')
    .eq('bgg_id', bggId)
    .single();

  if (error) {
    console.error(`[queries] fetchGameDetails failed for ${bggId}:`, error.message);
    return null;
  }
  return data;
}

export async function fetchGameOffers(bggId: number, countryCode: string) {
  const { data, error } = await supabase
    .from('store_games')
    .select(`
      id,
      store_id,
      price,
      stock,
      edition_language,
      store_product_url,
      stores (
        id,
        name,
        logo_url
      ),
      shipping_rates:store_id (
        flat_rate,
        free_shipping_threshold,
        destination_country
      )
    `)
    .eq('bgg_id', bggId);

  if (error || !data) {
    console.error(`[queries] fetchGameOffers failed for ${bggId}:`, error?.message);
    return [];
  }

  const typedData = data as unknown as QueryOffer[];

  return typedData.map((item) => {
    // Treat the joined shipping_rates array as a relation search
    const rates = Array.isArray(item.shipping_rates) ? item.shipping_rates : [];
    const matchingRate = rates.find((r) => r.destination_country === countryCode);

    return {
      id: item.id,
      store_id: item.store_id || item.stores?.id || '11111111-1111-1111-1111-111111111101',
      store_name: item.stores?.name || 'Unknown',
      store_logo: item.stores?.logo_url || null,
      store_product_url: item.store_product_url,
      price: Number(item.price),
      stock: item.stock,
      edition_language: item.edition_language,
      shipping_flat: matchingRate ? Number(matchingRate.flat_rate) : null,
      shipping_free_threshold: matchingRate && matchingRate.free_shipping_threshold ? Number(matchingRate.free_shipping_threshold) : null,
    };
  });
}

export async function fetchGameEditions(bggId: number) {
  const { data: currentGame, error: errCurrent } = await supabase
    .from('bgg_games_cache')
    .select('parent_bgg_id')
    .eq('bgg_id', bggId)
    .single();

  if (errCurrent || !currentGame) return [];

  let query = supabase.from('bgg_games_cache').select('bgg_id, name, thumbnail, parent_bgg_id');

  if (currentGame.parent_bgg_id) {
    // Siblings + parent
    query = query.or(`parent_bgg_id.eq.${currentGame.parent_bgg_id},bgg_id.eq.${currentGame.parent_bgg_id}`);
  } else {
    // Children
    query = query.eq('parent_bgg_id', bggId);
  }

  const { data: editions, error } = await query;

  if (error || !editions) {
    return [];
  }

  const typedEditions = editions as unknown as QueryEdition[];

  return typedEditions.filter((e) => e.bgg_id !== bggId);
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

    return {
      bgg_id: game.bgg_id,
      name: game.name,
      thumbnail: game.thumbnail,
      categories: game.categories || [],
      min_price: minPrice,
      in_stock: inStock,
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
