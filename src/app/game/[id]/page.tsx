import React from 'react';
import { fetchGameDetails, fetchGameOffers, fetchGameEditions, fetchPriceHistory } from '@/lib/queries';
import Link from 'next/link';
import { PriceChart } from '@/components/PriceChart';
import StoreOffersComparisonTable from '@/components/StoreOffersComparisonTable';
import { Toolbar } from '@/components/Toolbar';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GameDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const bggId = Number(resolvedParams.id);

  const game = await fetchGameDetails(bggId);
  if (!game) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
        <Toolbar />
        <div className="flex-1 flex items-center justify-center">
          <h1 className="text-xl font-semibold text-gray-900">Game not found in cache</h1>
        </div>
      </div>
    );
  }

  const offersRaw = await fetchGameOffers(bggId, 'ES');
  const editions = await fetchGameEditions(bggId);
  const history = await fetchPriceHistory(bggId, 365);
  const historicalMinPrice = history.length > 0 ? Math.min(...history.map((h) => h.min_price)) : null;

  // Map and calculate total prices
  const offers = offersRaw
    .map((offer) => {
      const hasFreeShipping =
        offer.shipping_free_threshold !== null && offer.price >= offer.shipping_free_threshold;
      const shippingCost = offer.shipping_flat === null ? null : hasFreeShipping ? 0 : offer.shipping_flat;
      const totalCost = shippingCost === null ? null : offer.price + shippingCost;

      return {
        ...offer,
        shippingCost,
        totalCost,
      };
    })
    // Sort: items with valid shipping first, sorted by totalCost ASC. Items with null shipping at the end.
    .sort((a, b) => {
      if (a.totalCost === null) return 1;
      if (b.totalCost === null) return -1;
      return a.totalCost - b.totalCost;
    });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Toolbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-8 w-full">
        
        {/* Game Meta & Alternative Editions Column */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            {game.thumbnail && (
              <img
                src={game.thumbnail}
                alt={game.name}
                className="w-full h-auto rounded-lg object-cover mb-4"
              />
            )}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{game.name}</h1>
            
            <div className="flex flex-col gap-2 text-sm text-gray-600">
              <p>{game.min_players}-{game.max_players} players</p>
              <p>Complexity: {game.weight} / 5</p>
              <p>Duration: {game.playing_time} mins</p>
            </div>
          </div>


          {/* US-16 Other Versions Switcher */}
          {editions.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Other Versions</h3>
              <ul className="flex flex-col gap-3">
                {editions.map((ed) => (
                  <li key={ed.bgg_id}>
                    <Link
                      href={`/game/${ed.bgg_id}`}
                      className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors border border-transparent hover:border-gray-150"
                    >
                      {ed.thumbnail && (
                        <img
                          src={ed.thumbnail}
                          alt={ed.name}
                          className="w-10 h-10 rounded object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium truncate">{ed.name}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Comparison Deals Table Column */}
        <div className="md:col-span-3 flex flex-col gap-6">
          <StoreOffersComparisonTable
            offers={offers}
            bggId={game.bgg_id}
            gameName={game.name}
            selectedCountry="ES"
            historicalMinPrice={historicalMinPrice}
          />
          <PriceChart bggId={game.bgg_id} />
        </div>

      </main>
    </div>
  );
}
