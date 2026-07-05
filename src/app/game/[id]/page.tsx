import React from 'react';
import Link from 'next/link';
import { fetchGameDetails, fetchGameOffers, fetchGameEditions, fetchPriceHistory } from '@/lib/queries';
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
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 select-none">
        <Toolbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center max-w-md">
            <h1 className="text-xl font-bold text-gray-900 mb-2">Juego no encontrado</h1>
            <p className="text-sm text-gray-500 mb-6">No pudimos encontrar los datos de esta edición en el catálogo de México.</p>
            <Link href="/" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors">
              Volver al buscador
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const offersRaw = await fetchGameOffers(bggId, 'MX');
  const editions = await fetchGameEditions(bggId);
  const history = await fetchPriceHistory(bggId, 365);
  const historicalMinPrice = history.length > 0 ? Math.min(...history.map((h) => h.min_price)) : null;

  // Map and calculate total prices in $ MXN
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
    .sort((a, b) => {
      if (a.totalCost === null) return 1;
      if (b.totalCost === null) return -1;
      return a.totalCost - b.totalCost;
    });

  const coverUrl = game.image || game.thumbnail;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 select-none">
      <Toolbar />
      
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8 w-full">
        
        {/* Full-Width Hero Cover & Metadata Card */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center gap-8">
          {/* High-Resolution Cover Image Box Art */}
          <div className="w-48 h-48 sm:w-56 sm:h-56 shrink-0 rounded-xl bg-gray-100 border border-gray-200 shadow-sm overflow-hidden flex items-center justify-center relative group mx-auto md:mx-0">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={game.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <span className="text-xs text-gray-400 font-medium">Sin imagen</span>
            )}
          </div>

          {/* Game Title, Synopsis, and Stats Strip */}
          <div className="flex-1 flex flex-col justify-between h-full min-w-0">
              <div className="mb-2">
                <span className="text-xs text-gray-400 font-mono">BGG ID: {game.bgg_id}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                {game.name}
              </h1>
              {game.description && (
                <p className="text-sm text-gray-600 leading-relaxed mt-3 line-clamp-3">
                  {game.description}
                </p>
              )}

            {/* Stats Pill Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-gray-150">
              <div className="flex flex-col">
                <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Jugadores</span>
                <span className="text-sm font-extrabold text-gray-800">
                  {game.min_players === game.max_players ? `${game.min_players}` : `${game.min_players}-${game.max_players}`} jug.
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Duración</span>
                <span className="text-sm font-extrabold text-gray-800">{game.playing_time || 60} min</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Complejidad</span>
                <span className="text-sm font-extrabold text-gray-800">{game.weight ? Number(game.weight).toFixed(2) : '2.50'} / 5.0</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Disponibilidad</span>
                <span className="text-sm font-extrabold text-indigo-600">{offers.length} tiendas MX</span>
              </div>
            </div>

            {/* Other Versions Selector */}
            {editions.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-150 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-gray-600 mr-1">Otras ediciones y expansiones:</span>
                {editions.map((ed) => (
                  <Link
                    key={ed.bgg_id}
                    href={`/game/${ed.bgg_id}`}
                    className="inline-flex items-center gap-2 bg-gray-50 hover:bg-indigo-50 border border-gray-250 hover:border-indigo-300 text-gray-700 hover:text-indigo-700 px-3 py-1 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <span>{ed.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono">#{ed.bgg_id}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Full-Width Comparison Table Section */}
        <section className="w-full">
          <StoreOffersComparisonTable
            offers={offers}
            bggId={game.bgg_id}
            gameName={game.name}
            selectedCountry="MX"
            historicalMinPrice={historicalMinPrice}
          />
        </section>

      </main>

      <footer className="bg-gray-900 text-white border-t border-gray-800 py-8 px-6 text-center text-xs text-gray-500 mt-auto">
        <p className="mb-3">© 2026 MeeplePrecios México. Todos los derechos reservados.</p>
        <div className="flex justify-center gap-6 text-gray-400 font-medium">
          <Link href="/merchant/onboard" className="hover:text-gray-300 transition-colors">¿Eres una tienda de juegos? Únete como socio</Link>
          <Link href="/merchant/dashboard" className="hover:text-gray-300 transition-colors">Portal de socios</Link>
        </div>
      </footer>
    </div>
  );
}
