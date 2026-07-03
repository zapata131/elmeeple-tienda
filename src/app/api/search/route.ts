import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { stripDiacritics } from '@/utils/string';
import { seedMockData } from '@/utils/seed_mock_data';

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

const FALLBACK_GAMES: GameCacheRow[] = [
  { bgg_id: 13, name: 'Catan', thumbnail: 'https://cf.geekdo-images.com/W3Bsga_uLP9kO91gZ7H8yw__thumb/img/8a9HeqFydO7Uun_le9bXWPnidcA=/fit-in/200x150/filters:strip_icc()/pic2419375.jpg', categories: ['Negociación', 'Familiar'] },
  { bgg_id: 822, name: 'Carcassonne', thumbnail: 'https://cf.geekdo-images.com/okM0dq_bEXnbyQTOvHfwRA__thumb/img/h7VbA4i4qM2H9q5913eP2v0MvGE=/fit-in/200x150/filters:strip_icc()/pic6544250.png', categories: ['Colocación de Losetas', 'Familiar'] },
  { bgg_id: 30549, name: 'Pandemic', thumbnail: 'https://cf.geekdo-images.com/S3ybV1LAp-8SnHIXLLjVbg__thumb/img/lT0Zt2VwWl2j2k6M_yXk1t4JvA0=/fit-in/200x150/filters:strip_icc()/pic1534148.jpg', categories: ['Cooperativo', 'Estrategia'] },
  { bgg_id: 68448, name: '7 Wonders', thumbnail: 'https://cf.geekdo-images.com/RvVWTr4XXlA6kS8P6fXNCA__thumb/img/4j3Hk8sF2R9v1M7g3t5y0JvD5A=/fit-in/200x150/filters:strip_icc()/pic5626205.jpg', categories: ['Drafting', 'Civilización'] },
  { bgg_id: 148228, name: 'Splendor', thumbnail: 'https://cf.geekdo-images.com/rwOMxx4q5yuElIv-Bgq4PA__thumb/img/7n3k9g1H8v5M2X6t4y0D5A=/fit-in/200x150/filters:strip_icc()/pic1904079.jpg', categories: ['Construcción de Motor', 'Familiar'] },
  { bgg_id: 167791, name: 'Terraforming Mars', thumbnail: 'https://cf.geekdo-images.com/wg9oOLcsKvDesSUdJEClzg__thumb/img/H-9v8t6R2K1M7g3t5y0JvD5A=/fit-in/200x150/filters:strip_icc()/pic3536616.jpg', categories: ['Estrategia', 'Ciencia Ficción'] },
  { bgg_id: 169786, name: 'Scythe', thumbnail: 'https://cf.geekdo-images.com/7k_nOxpO9OGi0hbdICzfAw__thumb/img/9n2K7g8H3v1M6t5y0JvD5A=/fit-in/200x150/filters:strip_icc()/pic3163924.jpg', categories: ['Estrategia', 'Eurogame'] },
  { bgg_id: 266192, name: 'Wingspan', thumbnail: 'https://cf.geekdo-images.com/yLZJCVLlIx4c7eJEWUNJ7w__thumb/img/8k3g9h2H1v5M4t7y0JvD5A=/fit-in/200x150/filters:strip_icc()/pic4458123.jpg', categories: ['Colección', 'Naturaleza'] },
  { bgg_id: 224517, name: 'Brass: Birmingham', thumbnail: 'https://cf.geekdo-images.com/x3zxjr-Vw5iU4yDPg70Jgw__thumb/img/6m2k8g9H4v1M3X7t5y0D5A=/fit-in/200x150/filters:strip_icc()/pic3490053.jpg', categories: ['Económico', 'Euro Avanzado'] },
  { bgg_id: 342942, name: 'Ark Nova', thumbnail: 'https://cf.geekdo-images.com/so66Niv-aI4y4L2q4O2y7g__thumb/img/5k2h8g1H7v3M9t6y0JvD5A=/fit-in/200x150/filters:strip_icc()/pic6294321.jpg', categories: ['Gestión de Zoológico', 'Euro Avanzado'] },
  { bgg_id: 316554, name: 'Dune: Imperium', thumbnail: 'https://cf.geekdo-images.com/6g9q8n7H2v4M1t5y0JvD5A__thumb/img/3k1h7g9H6v2M8t4y0JvD5A=/fit-in/200x150/filters:strip_icc()/pic5695333.jpg', categories: ['Construcción de Mazo', 'Trabajadores'] },
  { bgg_id: 295947, name: 'Cascadia', thumbnail: 'https://cf.geekdo-images.com/8k1g7h9H3v5M2t6y0JvD5A__thumb/img/2k9h8g7H1v4M5t3y0JvD5A=/fit-in/200x150/filters:strip_icc()/pic5100691.jpg', categories: ['Colocación de Losetas', 'Naturaleza'] },
];

const FALLBACK_STORES: StoreRow[] = [
  { id: '11111111-1111-1111-1111-111111111101', name: 'Zygomatic España', base_url: 'https://zygomatic.es' },
  { id: '11111111-1111-1111-1111-111111111104', name: 'Meeple Lisboa PT', base_url: 'https://meeplelisboa.pt' },
  { id: '11111111-1111-1111-1111-111111111106', name: 'Jugamos México', base_url: 'https://jugamos.mx' },
  { id: '11111111-1111-1111-1111-111111111108', name: 'Galápagos Brasil', base_url: 'https://galapagos.br' },
];

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

    let games: GameCacheRow[] = (dbGames || []) as GameCacheRow[];

    if (games.length === 0) {
      try {
        await seedMockData();
      } catch (seedErr) {
        console.warn('[API Search] Auto-seed notice:', seedErr);
      }
      games = FALLBACK_GAMES;
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
    }).slice(0, 6);

    // 2. Query stores
    const { data: dbStores } = await supabase
      .from('stores')
      .select('id, name, base_url')
      .limit(200);

    let stores: StoreRow[] = (dbStores || []) as StoreRow[];
    if (stores.length === 0) {
      stores = FALLBACK_STORES;
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
        thumbnail: g.thumbnail || FALLBACK_GAMES[0].thumbnail,
      })),
      stores: matchedStores,
      categories: matchedCategories,
    });
  } catch (err) {
    console.error('[API Search] Error:', err);
    const fallbackGames = FALLBACK_GAMES.filter((g) =>
      stripDiacritics(g.name.toLowerCase()).includes(normalizedQuery)
    ).slice(0, 6);

    const fallbackStores = FALLBACK_STORES.filter((st) =>
      stripDiacritics(st.name.toLowerCase()).includes(normalizedQuery)
    ).slice(0, 3);

    const tagSet = new Set<string>();
    for (const g of FALLBACK_GAMES) {
      if (g.categories) {
        for (const cat of g.categories) tagSet.add(cat);
      }
    }
    const fallbackCategories = Array.from(tagSet).slice(0, 3).map((tag) => ({ tag }));

    return NextResponse.json({
      games: fallbackGames,
      stores: fallbackStores,
      categories: fallbackCategories,
    });
  }
}
