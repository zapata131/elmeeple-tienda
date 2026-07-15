import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/mock-db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  const games = db.searchBggGames(query);
  const stores = db.getStores();

  const enrichedGames = games.map(game => {
    const offers = db.getOffersForGame(game.bgg_id);
    const sortedOffers = offers.sort((a, b) => a.total_delivered_cost - b.total_delivered_cost);
    const lowestPrice = sortedOffers.length > 0 ? sortedOffers[0].total_delivered_cost : undefined;

    return {
      ...game,
      lowest_price: lowestPrice,
      offer_count: offers.length,
      offers: sortedOffers,
    };
  });

  return NextResponse.json({
    games: enrichedGames,
    stores,
  });
}
