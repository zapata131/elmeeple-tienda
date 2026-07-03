import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { optimizeCart, StoreGameOffer, ShippingRateInfo, StoreInfo } from '@/utils/cart_optimizer';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface OfferRow {
  store_id: string;
  bgg_id: number;
  price: number;
  stock: number;
  store_product_url: string;
  bgg_games_cache?: { name?: string } | Array<{ name?: string }> | null;
}

interface ShippingRow {
  store_id: string;
  destination_country: string;
  flat_rate: number;
  free_shipping_threshold: number | null;
}

export async function POST(request: NextRequest) {
  try {
    const { gameIds, destinationCountry } = await request.json();

    if (!Array.isArray(gameIds) || gameIds.length === 0 || !destinationCountry) {
      return NextResponse.json({ error: 'Missing or invalid gameIds list or destinationCountry.' }, { status: 400 });
    }

    // 1. Fetch available store_games offers for requested games
    const { data: offersData, error: offersErr } = await supabase
      .from('store_games')
      .select('store_id, bgg_id, price, stock, store_product_url, bgg_games_cache(name)')
      .in('bgg_id', gameIds);

    if (offersErr) {
      console.error('[Cart Optimize API] Offers fetch failed:', offersErr.message);
      return NextResponse.json({ error: 'Failed to query catalog offers.' }, { status: 500 });
    }

    const offers: StoreGameOffer[] = (offersData || []).map((row: OfferRow) => ({
      store_id: row.store_id,
      bgg_id: row.bgg_id,
      price: Number(row.price),
      stock: Number(row.stock),
      store_product_url: row.store_product_url,
      game_name:
        (Array.isArray(row.bgg_games_cache)
          ? row.bgg_games_cache[0]?.name
          : row.bgg_games_cache?.name) || `Juego #${row.bgg_id}`,
    }));

    // 2. Fetch stores info
    const storeIds = Array.from(new Set(offers.map((o) => o.store_id)));
    const { data: storesData } = await supabase
      .from('stores')
      .select('id, name, base_url')
      .in('id', storeIds);

    const storesMap: Record<string, StoreInfo> = {};
    for (const st of storesData || []) {
      storesMap[st.id] = st;
    }

    // 3. Fetch shipping rates for these stores and country
    const { data: shippingData } = await supabase
      .from('shipping_rates')
      .select('store_id, destination_country, flat_rate, free_shipping_threshold')
      .in('store_id', storeIds)
      .eq('destination_country', destinationCountry.toUpperCase());

    const shippingRates: ShippingRateInfo[] = (shippingData || []).map((row: ShippingRow) => ({
      store_id: row.store_id,
      destination_country: row.destination_country,
      flat_rate: Number(row.flat_rate),
      free_shipping_threshold: row.free_shipping_threshold !== null ? Number(row.free_shipping_threshold) : null,
    }));

    // 4. Run optimizer algorithm
    const combinations = optimizeCart(gameIds, destinationCountry, offers, shippingRates, storesMap);

    return NextResponse.json({ combinations });
  } catch (err: unknown) {
    console.error('[Cart Optimize API] Crash:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
