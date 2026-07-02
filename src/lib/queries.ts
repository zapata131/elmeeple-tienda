import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';

const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

interface QueryOffer {
  id: string;
  price: number;
  stock: number;
  edition_language: string;
  store_product_url: string;
  stores: { name: string; logo_url: string | null } | null;
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
      price,
      stock,
      edition_language,
      store_product_url,
      stores (
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
