import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!slug) {
    return NextResponse.json({ error: 'Slug requerido' }, { status: 400 });
  }

  const game = await db.getGameBySlug(slug);
  if (!game) {
    return NextResponse.json({ error: 'Juego no encontrado' }, { status: 404 });
  }

  const offers = await db.getOffersForGame(game.id);

  return NextResponse.json({
    game,
    offers,
  });
}
