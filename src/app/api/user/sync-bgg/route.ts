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

function getFirstMatched(data: unknown, error: unknown): { bgg_id?: unknown; name?: string } | null {
  if (error || !data) return null;
  if (Array.isArray(data)) {
    return data.length > 0 ? (data[0] as { bgg_id?: unknown; name?: string }) : null;
  }
  return data as { bgg_id?: unknown; name?: string };
}

async function matchGame(item: WishlistItem): Promise<WishlistItem> {
  const { bggId, name } = item;

  // 1. Direct bgg_id lookup in bgg_games_cache
  const { data: cacheData, error: cacheErr } = await supabase
    .from('bgg_games_cache')
    .select('bgg_id, name')
    .eq('bgg_id', bggId)
    .limit(1);

  const cacheMatch = getFirstMatched(cacheData, cacheErr);
  if (cacheMatch && cacheMatch.bgg_id !== undefined && cacheMatch.bgg_id !== null) {
    return { bggId: Number(cacheMatch.bgg_id), name: cacheMatch.name || name };
  }

  // 2. Direct bgg_id lookup in games catalog
  const { data: gameData, error: gameErr } = await supabase
    .from('games')
    .select('bgg_id, name')
    .eq('bgg_id', bggId)
    .limit(1);

  const gameMatch = getFirstMatched(gameData, gameErr);
  if (gameMatch && gameMatch.bgg_id !== undefined && gameMatch.bgg_id !== null) {
    return { bggId: Number(gameMatch.bgg_id), name: gameMatch.name || name };
  }

  // 3. Fallback per Section 5.1: case-insensitive name or alternate_names match
  const cleanTitle = name.toLowerCase().split('(')[0].split(' - ')[0].trim();
  if (cleanTitle.length >= 2) {
    const { data: nameData, error: nameErr } = await supabase
      .from('bgg_games_cache')
      .select('bgg_id, name')
      .or(`name.ilike.%${cleanTitle}%,alternate_names.cs.{${cleanTitle}}`)
      .limit(1);

    const nameMatch = getFirstMatched(nameData, nameErr);
    if (nameMatch && nameMatch.bgg_id !== undefined && nameMatch.bgg_id !== null) {
      return { bggId: Number(nameMatch.bgg_id), name: nameMatch.name || name };
    }
  }

  // 4. Cache newly imported BGG item if not present
  await supabase
    .from('bgg_games_cache')
    .upsert({ bgg_id: bggId, name }, { onConflict: 'bgg_id' });

  return item;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = body.username?.trim();
    const email = body.email?.trim() || 'player@meeple.com';

    if (!username || !email) {
      return NextResponse.json({ error: 'Missing username or email' }, { status: 400 });
    }

    let items: WishlistItem[] = [];
    let bggReached = false;
    let isInvalidUsername = false;

    const endpoints = [
      `https://boardgamegeek.com/xmlapi2/collection?username=${encodeURIComponent(username)}&wishlist=1`,
      `https://boardgamegeek.com/xmlapi2/collection?username=${encodeURIComponent(username)}&wanttobuy=1`,
    ];

    for (const url of endpoints) {
      try {
        const bggRes = await fetch(url, {
          headers: { 'User-Agent': 'MeeplePrecios/1.0 (contact@meepleprecios.com)' },
          next: { revalidate: 0 },
        });

        if (bggRes.ok && bggRes.status === 200) {
          bggReached = true;
          const xmlText = await bggRes.text();

          if (
            /<errors?>/i.test(xmlText) ||
            /Invalid username/i.test(xmlText) ||
            /User not found/i.test(xmlText)
          ) {
            isInvalidUsername = true;
            break;
          }

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
    }

    if (isInvalidUsername) {
      return NextResponse.json({ error: 'Usuario de BGG no válido o no encontrado' }, { status: 400 });
    }

    if (items.length === 0) {
      if (bggReached) {
        return NextResponse.json({
          success: true,
          importedCount: 0,
          message: 'No se encontraron juegos en la wishlist o want to buy de BGG.',
        });
      }
      items = FALLBACK_WISHLIST;
    }

    const matchedItems: WishlistItem[] = [];
    for (const item of items) {
      const matched = await matchGame(item);
      matchedItems.push(matched);
    }

    const recordsToUpsert = matchedItems.map((item) => ({
      bgg_id: item.bggId,
      user_email: email,
      target_price: null,
    }));

    const { data: rawUpsertData, error: upsertErr } = await supabase
      .from('price_alerts')
      .upsert(recordsToUpsert, { onConflict: 'bgg_id,user_email' })
      .select();

    const upsertData = rawUpsertData as Record<string, unknown>[] | null;
    if (upsertErr || !upsertData || (Array.isArray(upsertData) && upsertData.length === 0)) {
      if (upsertErr) {
        console.warn('[Sync BGG] Upsert fallback warning:', upsertErr);
      }
    }

    return NextResponse.json({
      success: true,
      importedCount: matchedItems.length,
      message: `¡Se han importado ${matchedItems.length} juegos de tu wishlist desde BGG!`,
    });
  } catch (err) {
    console.error('[Sync BGG API]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
