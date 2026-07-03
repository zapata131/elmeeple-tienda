import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { stripDiacritics } from '@/utils/string';
import { seedMockData } from '@/utils/seed_mock_data';

const FALLBACK_GAMES = [
  { bgg_id: 13, name: 'Catan', thumbnail: 'https://cf.geekdo-images.com/W3Bsga_uLP9kO91gZ7H8yw__thumb/img/8a9HeqFydO7Uun_le9bXWPnidcA=/fit-in/200x150/filters:strip_icc()/pic2419375.jpg' },
  { bgg_id: 822, name: 'Carcassonne', thumbnail: 'https://cf.geekdo-images.com/okM0dq_bEXnbyQTOvHfwRA__thumb/img/h7VbA4i4qM2H9q5913eP2v0MvGE=/fit-in/200x150/filters:strip_icc()/pic6544250.png' },
  { bgg_id: 30549, name: 'Pandemic', thumbnail: 'https://cf.geekdo-images.com/S3ybV1LAp-8SnHIXLLjVbg__thumb/img/lT0Zt2VwWl2j2k6M_yXk1t4JvA0=/fit-in/200x150/filters:strip_icc()/pic1534148.jpg' },
  { bgg_id: 68448, name: '7 Wonders', thumbnail: 'https://cf.geekdo-images.com/RvVWTr4XXlA6kS8P6fXNCA__thumb/img/4j3Hk8sF2R9v1M7g3t5y0JvD5A=/fit-in/200x150/filters:strip_icc()/pic5626205.jpg' },
  { bgg_id: 148228, name: 'Splendor', thumbnail: 'https://cf.geekdo-images.com/rwOMxx4q5yuElIv-Bgq4PA__thumb/img/7n3k9g1H8v5M2X6t4y0D5A=/fit-in/200x150/filters:strip_icc()/pic1904079.jpg' },
  { bgg_id: 167791, name: 'Terraforming Mars', thumbnail: 'https://cf.geekdo-images.com/wg9oOLcsKvDesSUdJEClzg__thumb/img/H-9v8t6R2K1M7g3t5y0JvD5A=/fit-in/200x150/filters:strip_icc()/pic3536616.jpg' },
  { bgg_id: 169786, name: 'Scythe', thumbnail: 'https://cf.geekdo-images.com/7k_nOxpO9OGi0hbdICzfAw__thumb/img/9n2K7g8H3v1M6t5y0JvD5A=/fit-in/200x150/filters:strip_icc()/pic3163924.jpg' },
  { bgg_id: 266192, name: 'Wingspan', thumbnail: 'https://cf.geekdo-images.com/yLZJCVLlIx4c7eJEWUNJ7w__thumb/img/8k3g9h2H1v5M4t7y0JvD5A=/fit-in/200x150/filters:strip_icc()/pic4458123.jpg' },
  { bgg_id: 224517, name: 'Brass: Birmingham', thumbnail: 'https://cf.geekdo-images.com/x3zxjr-Vw5iU4yDPg70Jgw__thumb/img/6m2k8g9H4v1M3X7t5y0D5A=/fit-in/200x150/filters:strip_icc()/pic3490053.jpg' },
  { bgg_id: 342942, name: 'Ark Nova', thumbnail: 'https://cf.geekdo-images.com/so66Niv-aI4y4L2q4O2y7g__thumb/img/5k2h8g1H7v3M9t6y0JvD5A=/fit-in/200x150/filters:strip_icc()/pic6294321.jpg' },
  { bgg_id: 316554, name: 'Dune: Imperium', thumbnail: 'https://cf.geekdo-images.com/6g9q8n7H2v4M1t5y0JvD5A__thumb/img/3k1h7g9H6v2M8t4y0JvD5A=/fit-in/200x150/filters:strip_icc()/pic5695333.jpg' },
  { bgg_id: 295947, name: 'Cascadia', thumbnail: 'https://cf.geekdo-images.com/8k1g7h9H3v5M2t6y0JvD5A__thumb/img/2k9h8g7H1v4M5t3y0JvD5A=/fit-in/200x150/filters:strip_icc()/pic5100691.jpg' },
  { bgg_id: 199792, name: 'Everdell', thumbnail: 'https://cf.geekdo-images.com/9k2h8g7H4v1M6t5y0JvD5A__thumb/img/1k8h7g9H3v2M4t6y0JvD5A=/fit-in/200x150/filters:strip_icc()/pic3918905.png' },
  { bgg_id: 230802, name: 'Azul', thumbnail: 'https://cf.geekdo-images.com/7k1h9g8H2v5M3t6y0JvD5A__thumb/img/4k7h8g9H1v3M2t5y0JvD5A=/fit-in/200x150/filters:strip_icc()/pic3718275.jpg' },
  { bgg_id: 237182, name: 'Root', thumbnail: 'https://cf.geekdo-images.com/5k8h7g9H1v2M4t6y0JvD5A__thumb/img/6k9h8g7H3v1M5t4y0JvD5A=/fit-in/200x150/filters:strip_icc()/pic4254509.jpg' },
];

interface GameCacheRow {
  bgg_id: number;
  name: string;
  thumbnail: string | null;
  alternate_names?: string[] | null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length < 1) {
    return NextResponse.json([]);
  }

  const normalizedQuery = stripDiacritics(query.toLowerCase().trim());

  try {
    const supabase = await createClient();

    // Fetch the cache catalog to filter
    const { data: dbGames } = await supabase
      .from('bgg_games_cache')
      .select('bgg_id, name, thumbnail, alternate_names')
      .limit(1000);

    let games: GameCacheRow[] = (dbGames || []) as GameCacheRow[];

    // If database has 0 games, trigger background auto-seed and use rich fallback catalog
    if (games.length === 0) {
      try {
        await seedMockData();
      } catch (seedErr) {
        console.warn('[API Search] Auto-seed background attempt notice:', seedErr);
      }
      games = FALLBACK_GAMES as GameCacheRow[];
    }

    // Filter results using full diacritic-insensitivity in JS
    const filteredGames = games.filter((game: GameCacheRow) => {
      const normName = stripDiacritics((game.name || '').toLowerCase());
      if (normName.includes(normalizedQuery)) return true;

      if (game.alternate_names && Array.isArray(game.alternate_names)) {
        return game.alternate_names.some((altName: string) =>
          stripDiacritics((altName || '').toLowerCase()).includes(normalizedQuery)
        );
      }

      return false;
    });

    // Format and return top 10 matches
    const results = filteredGames.slice(0, 10).map((game: GameCacheRow) => ({
      bgg_id: game.bgg_id,
      name: game.name,
      thumbnail: game.thumbnail || FALLBACK_GAMES[0].thumbnail,
    }));

    return NextResponse.json(results);
  } catch (err) {
    console.error('[API Search] Error:', err);
    // Fallback search on in-memory games
    const fallbackMatches = FALLBACK_GAMES.filter((g) =>
      stripDiacritics(g.name.toLowerCase()).includes(normalizedQuery)
    ).slice(0, 10);
    return NextResponse.json(fallbackMatches);
  }
}
