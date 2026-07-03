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

const FALLBACK_STORE_OFFERS = [
  {
    id: 'off-101',
    store_id: '11111111-1111-1111-1111-111111111101',
    store_name: 'Zygomatic España',
    store_logo: null,
    store_country: 'ES',
    rating: 4.9,
    review_count: 142,
    store_product_url: 'https://zygomatic.es',
    price: 37.90,
    stock: 12,
    edition_language: 'es',
    shipping_flat: 3.99,
    shipping_free_threshold: 50.0,
  },
  {
    id: 'off-102',
    store_id: '22222222-2222-2222-2222-222222222202',
    store_name: 'Jugamos Una',
    store_logo: null,
    store_country: 'ES',
    rating: 4.8,
    review_count: 89,
    store_product_url: 'https://jugamosuna.es',
    price: 36.50,
    stock: 5,
    edition_language: 'es',
    shipping_flat: 4.50,
    shipping_free_threshold: 45.0,
  },
  {
    id: 'off-103',
    store_id: '33333333-3333-3333-3333-333333333303',
    store_name: 'Ludopolis Portugal',
    store_logo: null,
    store_country: 'PT',
    rating: 4.7,
    review_count: 45,
    store_product_url: 'https://ludopolis.pt',
    price: 35.00,
    stock: 8,
    edition_language: 'pt',
    shipping_flat: 5.90,
    shipping_free_threshold: 60.0,
  },
  {
    id: 'off-104',
    store_id: '44444444-4444-4444-4444-444444444404',
    store_name: 'Brettspiel-Meeple DE',
    store_logo: null,
    store_country: 'DE',
    rating: 4.9,
    review_count: 310,
    store_product_url: 'https://brettspielpreise.de',
    price: 32.90,
    stock: 20,
    edition_language: 'de',
    shipping_flat: 8.50,
    shipping_free_threshold: null,
  },
  {
    id: 'off-105',
    store_id: '55555555-5555-5555-5555-555555555505',
    store_name: 'Meepleland USA',
    store_logo: null,
    store_country: 'US',
    rating: 4.6,
    review_count: 18,
    store_product_url: 'https://boardgameprices.com',
    price: 34.00,
    stock: 0,
    edition_language: 'en',
    shipping_flat: 14.00,
    shipping_free_threshold: null,
  },
  {
    id: 'off-106',
    store_id: '66666666-6666-6666-6666-666666666606',
    store_name: 'El Duende Juegos MX',
    store_logo: null,
    store_country: 'MX',
    rating: 4.8,
    review_count: 67,
    store_product_url: 'https://elduende.mx',
    price: 39.00,
    stock: 4,
    edition_language: 'es',
    shipping_flat: 5.00,
    shipping_free_threshold: 55.0,
  }
];

export async function fetchGameDetails(bggId: number) {
  const { data, error } = await supabase
    .from('bgg_games_cache')
    .select('bgg_id, name, thumbnail, weight, min_players, max_players, playing_time')
    .eq('bgg_id', bggId)
    .single();

  if (error || !data) {
    console.warn(`[queries] fetchGameDetails offline fallback for ${bggId}`);
    return {
      bgg_id: bggId,
      name: bggId === 169786 ? 'Scythe' : bggId === 342942 ? 'Ark Nova' : bggId === 167791 ? 'Terraforming Mars' : 'Catan',
      thumbnail: 'https://cf.geekdo-images.com/W3Bsga_uLP9kO91gZ7H8yw__thumb/img/8a9HeqFydO7Uun_le9bXWPnidcA=/fit-in/200x150/filters:strip_icc()/pic2419375.jpg',
      weight: 2.3,
      min_players: 3,
      max_players: 4,
      playing_time: 75,
    };
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
    return FALLBACK_STORE_OFFERS.map((item) => {
      const hasFreeShipping = item.shipping_free_threshold !== null && item.price >= item.shipping_free_threshold;
      const shipping_flat = item.shipping_flat === null ? null : hasFreeShipping ? 0 : item.shipping_flat;
      return {
        ...item,
        shipping_flat,
      };
    });
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
      store_country: item.stores?.country || 'ES',
      rating: 4.8,
      review_count: 50,
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
