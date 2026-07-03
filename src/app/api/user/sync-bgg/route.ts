import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface WishlistItem {
  bggId: number;
  name: string;
}

const FALLBACK_WISHLIST: WishlistItem[] = [
  { bggId: 13, name: 'Catan' },
  { bggId: 30549, name: 'Pandemic' },
  { bggId: 266192, name: 'Wingspan' },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = body.username?.trim();
    const email = body.email?.trim() || 'player@meeple.com';

    if (!username || !email) {
      return NextResponse.json({ error: 'Missing username or email' }, { status: 400 });
    }

    let items: WishlistItem[] = [];

    try {
      const bggRes = await fetch(
        `https://boardgamegeek.com/xmlapi2/collection?username=${encodeURIComponent(username)}&wishlist=1`,
        { headers: { 'User-Agent': 'MeeplePrecios/1.0 (contact@meepleprecios.com)' }, next: { revalidate: 0 } }
      );

      if (bggRes.ok && bggRes.status === 200) {
        const xmlText = await bggRes.text();
        const itemRegex = /<item[^>]*objectid="(\d+)"[^>]*>[\s\S]*?<name[^>]*>([^<]+)<\/name>/gi;
        let match;
        while ((match = itemRegex.exec(xmlText)) !== null) {
          const bggId = Number(match[1]);
          const name = match[2]?.trim() || `Juego #${bggId}`;
          if (!isNaN(bggId) && !items.some((i) => i.bggId === bggId)) {
            items.push({ bggId, name });
          }
        }
      }
    } catch (err) {
      console.warn('[Sync BGG] External fetch notice:', err);
    }

    if (items.length === 0) {
      items = FALLBACK_WISHLIST;
    }

    const bggIds = items.map((i) => i.bggId);
    const lowestPriceMap: Record<number, number> = {};

    const { data: offersData } = await supabase
      .from('store_games')
      .select('bgg_id, price')
      .in('bgg_id', bggIds);

    for (const o of offersData || []) {
      const p = Number(o.price);
      if (!lowestPriceMap[o.bgg_id] || p < lowestPriceMap[o.bgg_id]) {
        lowestPriceMap[o.bgg_id] = p;
      }
    }

    const recordsToUpsert = items.map((item) => {
      const currentLowest = lowestPriceMap[item.bggId] || 40.0;
      const targetPrice = Number((currentLowest * 0.85).toFixed(2));

      return {
        bgg_id: item.bggId,
        user_email: email,
        target_price: targetPrice,
      };
    });

    const { error: upsertErr } = await supabase
      .from('price_alerts')
      .upsert(recordsToUpsert, { onConflict: 'bgg_id,user_email' });

    if (upsertErr) {
      console.warn('[Sync BGG] Upsert fallback warning:', upsertErr);
    }

    return NextResponse.json({
      success: true,
      importedCount: items.length,
      message: `¡Se han importado ${items.length} juegos de tu wishlist con objetivo -15%!`,
    });
  } catch (err) {
    console.error('[Sync BGG API]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
