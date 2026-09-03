import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db/db';
import { EditionLanguage } from '../../../types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const language = (searchParams.get('language') || 'all') as EditionLanguage | 'all';
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  const games = await db.searchGames(q, language);
  const paginated = games.slice(0, limit);

  return NextResponse.json({
    games: paginated,
    total: games.length,
  });
}
