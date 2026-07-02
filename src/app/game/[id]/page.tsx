import React from 'react';
import { fetchGameDetails, fetchGameOffers, fetchGameEditions } from '@/lib/queries';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>;
}

const getLanguageFlag = (lang: string) => {
  switch (lang) {
    case 'es':
      return '🇪🇸';
    case 'pt':
      return '🇵🇹';
    case 'en':
    default:
      return '🇬🇧';
  }
};

export default async function GameDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const bggId = Number(resolvedParams.id);

  const game = await fetchGameDetails(bggId);
  if (!game) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <h1 className="text-xl font-semibold text-gray-900">Game not found in cache</h1>
      </div>
    );
  }

  // Fetch offers for default country ES (Spain) for now
  const offersRaw = await fetchGameOffers(bggId, 'ES');
  const editions = await fetchGameEditions(bggId);

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
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
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
        <div className="md:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Compare Store Offers</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <th className="px-6 py-3">Store</th>
                    <th className="px-6 py-3">Language</th>
                    <th className="px-6 py-3">Availability</th>
                    <th className="px-6 py-3">Price</th>
                    <th className="px-6 py-3">Shipping (ES)</th>
                    <th className="px-6 py-3">Total</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {offers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500 font-medium">
                        No stores are currently selling this game.
                      </td>
                    </tr>
                  ) : (
                    offers.map((offer) => (
                      <tr key={offer.id} className="hover:bg-gray-50 transition-colors">
                        {/* Store info */}
                        <td className="px-6 py-4 flex items-center gap-3">
                          {offer.store_logo && (
                            <img
                              src={offer.store_logo}
                              alt={offer.store_name}
                              className="w-8 h-8 rounded-full border border-gray-100 object-cover flex-shrink-0"
                            />
                          )}
                          <span className="font-semibold text-gray-900">{offer.store_name}</span>
                        </td>
                        
                        {/* Language */}
                        <td className="px-6 py-4 text-lg">
                          {getLanguageFlag(offer.edition_language)}
                        </td>
                        
                        {/* Availability */}
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            offer.stock > 0
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {offer.stock > 0 ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        
                        {/* Base Price */}
                        <td className="px-6 py-4 font-medium text-gray-900">
                          €{offer.price.toFixed(2)}
                        </td>
                        
                        {/* Shipping */}
                        <td className="px-6 py-4 text-gray-600">
                          {offer.shippingCost === null ? (
                            <span className="text-red-500 font-medium">Unavailable</span>
                          ) : offer.shippingCost === 0 ? (
                            <span className="text-green-600 font-semibold">Free</span>
                          ) : (
                            `€${offer.shippingCost.toFixed(2)}`
                          )}
                        </td>
                        
                        {/* Total Cost */}
                        <td className="px-6 py-4 font-bold text-gray-900">
                          {offer.totalCost === null ? (
                            '--'
                          ) : (
                            `€${offer.totalCost.toFixed(2)}`
                          )}
                        </td>
                        
                        {/* CTA */}
                        <td className="px-6 py-4 text-right">
                          <a
                            href={`${offer.store_product_url}?ref=meepleprecios&utm_source=meepleprecios&utm_medium=affiliate`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                          >
                            Go to store
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
