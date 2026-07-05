import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { stripDiacritics } from '@/utils/string';
import { loadLocalCatalogCache } from '@/utils/local_file_cache';

interface GameCacheRow {
  bgg_id: number;
  name: string;
  thumbnail: string | null;
  categories?: string[] | null;
  alternate_names?: string[] | null;
}

interface StoreRow {
  id: string;
  name: string;
  base_url?: string;
}

import { MOCK_GAMES, MOCK_IBEROAMERICAN_STORES } from '@/utils/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length < 1) {
    return NextResponse.json({ games: [], stores: [], categories: [] });
  }

  const normalizedQuery = stripDiacritics(query.toLowerCase().trim());

  try {
    const supabase = await createClient();

    // 1. Query games
    const { data: dbGames } = await supabase
      .from('bgg_games_cache')
      .select('bgg_id, name, thumbnail, categories, alternate_names')
      .limit(1000);

    const games: GameCacheRow[] = (dbGames || []) as GameCacheRow[];

    const fileCache = loadLocalCatalogCache();
    if (fileCache && fileCache.games.length > 0) {
      const existingIds = new Set(games.map(g => g.bgg_id));
      for (const fg of fileCache.games) {
        if (!existingIds.has(fg.bgg_id)) {
          existingIds.add(fg.bgg_id);
          games.push({
            bgg_id: fg.bgg_id,
            name: fg.name,
            thumbnail: fg.thumbnail,
            categories: [],
            alternate_names: [],
          });
        }
      }
    }

    if (games.length < MOCK_GAMES.length) {
      const existingIds = new Set(games.map(g => g.bgg_id));
      for (const mg of MOCK_GAMES) {
        if (!existingIds.has(mg.bgg_id)) {
          games.push({
            bgg_id: mg.bgg_id,
            name: mg.name,
            thumbnail: mg.thumbnail,
            categories: [],
            alternate_names: [],
          });
        }
      }
    }

    const matchedGames = games.filter((game) => {
      const normName = stripDiacritics((game.name || '').toLowerCase());
      if (normName.includes(normalizedQuery)) return true;

      if (game.alternate_names && Array.isArray(game.alternate_names)) {
        return game.alternate_names.some((altName: string) =>
          stripDiacritics((altName || '').toLowerCase()).includes(normalizedQuery)
        );
      }
      return false;
    }).slice(0, 50);

    if (matchedGames.length === 0) {
      try {
        const bggRes = await fetch(`https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(query.trim())}&type=boardgame`);
        if (bggRes.ok) {
          const bggXml = await bggRes.text();
          const itemRegex = /<item[^>]*?id=["'](\d+)["'][^>]*?>([\s\S]*?)<\/item>/gi;
          let m;
          while ((m = itemRegex.exec(bggXml)) !== null && matchedGames.length < 6) {
            const bgg_id = parseInt(m[1], 10);
            const block = m[2];
            const nameMatch = /<name[^>]*?value=["']([^"']+)["']/i.exec(block);
            if (nameMatch) {
              matchedGames.push({
                bgg_id,
                name: nameMatch[1],
                thumbnail: 'https://cf.geekdo-images.com/W3Bsga_uLP9kO91gZ7H8yw__thumb/img/8a9HeqFydO7Uun_le9bXWPnidcA=/fit-in/200x150/filters:strip_icc()/pic2419375.jpg',
              });
            }
          }
        }
      } catch (bggErr) {
        console.warn('[API Search] BGG live fallback search failed:', bggErr);
      }
    }

    // 2. Query stores
    const { data: dbStores } = await supabase
      .from('stores')
      .select('id, name, base_url')
      .limit(200);

    let stores: StoreRow[] = (dbStores || []) as StoreRow[];
    if (stores.length === 0) {
      stores = MOCK_IBEROAMERICAN_STORES.map(s => ({ id: s.id, name: s.name, base_url: s.website }));
    }

    const matchedStores = stores.filter((st) =>
      stripDiacritics((st.name || '').toLowerCase()).includes(normalizedQuery) ||
      (st.base_url || '').toLowerCase().includes(normalizedQuery)
    ).slice(0, 3);

    // 3. Extract Categories / Tags matching query or belonging to matched games
    const tagSet = new Set<string>();
    for (const g of games) {
      if (g.categories && Array.isArray(g.categories)) {
        for (const cat of g.categories) {
          if (stripDiacritics(cat.toLowerCase()).includes(normalizedQuery) || matchedGames.some(mg => mg.bgg_id === g.bgg_id)) {
            tagSet.add(cat);
          }
        }
      }
    }

    const matchedCategories = Array.from(tagSet).slice(0, 4).map((tag) => ({ tag }));

    return NextResponse.json({
      games: matchedGames.map((g) => ({
        bgg_id: g.bgg_id,
        name: g.name,
        thumbnail: g.thumbnail || MOCK_GAMES[0].thumbnail,
      })),
      stores: matchedStores,
      categories: matchedCategories,
    });
  } catch (err) {
    console.error('[API Search] Error:', err);
    const fallbackGames = MOCK_GAMES.filter((g) =>
      stripDiacritics(g.name.toLowerCase()).includes(normalizedQuery)
    ).slice(0, 6);

    const fallbackStores = MOCK_IBEROAMERICAN_STORES.filter((st) =>
      stripDiacritics(st.name.toLowerCase()).includes(normalizedQuery)
    ).slice(0, 3).map(s => ({ id: s.id, name: s.name, base_url: s.website }));

    const fallbackCategories = [
      { tag: 'Estrategia' },
      { tag: 'Eurogame' },
      { tag: 'Familiar' }
    ];

    return NextResponse.json({
      games: fallbackGames,
      stores: fallbackStores,
      categories: fallbackCategories,
    });
  }
}
