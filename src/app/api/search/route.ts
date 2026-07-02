import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { stripDiacritics } from '@/utils/string';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length < 3) {
    return NextResponse.json([]);
  }

  const normalizedQuery = stripDiacritics(query.toLowerCase().trim());

  try {
    const supabase = await createClient();

    // Fetch the cache catalog to filter. Limit queries for scalability.
    const { data: games, error } = await supabase
      .from('bgg_games_cache')
      .select('bgg_id, name, thumbnail, alternate_names')
      .limit(1000); // safety cap

    if (error || !games) {
      console.error('[API Search] Supabase query failed:', error?.message);
      return NextResponse.json([]);
    }

    // Filter results using full diacritic-insensitivity in JS
    const filteredGames = games.filter((game) => {
      const normName = stripDiacritics(game.name.toLowerCase());
      if (normName.includes(normalizedQuery)) return true;

      if (game.alternate_names && Array.isArray(game.alternate_names)) {
        return game.alternate_names.some((altName: string) =>
          stripDiacritics(altName.toLowerCase()).includes(normalizedQuery)
        );
      }

      return false;
    });

    // Format and return top 10 matches
    const results = filteredGames.slice(0, 10).map((game) => ({
      bgg_id: game.bgg_id,
      name: game.name,
      thumbnail: game.thumbnail,
    }));

    return NextResponse.json(results);
  } catch (err) {
    console.error('[API Search] Error:', err);
    return NextResponse.json([]);
  }
}
