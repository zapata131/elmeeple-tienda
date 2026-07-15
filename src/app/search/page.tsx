import React from 'react';
import { db } from '@/lib/db/mock-db';
import { SearchBar } from '@/components/SearchBar';
import { GameCard } from '@/components/GameCard';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = '' } = await searchParams;
  const games = db.searchBggGames(q);

  const enrichedGames = games.map(game => {
    const offers = db.getOffersForGame(game.bgg_id);
    const sortedOffers = offers.sort((a, b) => a.total_delivered_cost - b.total_delivered_cost);
    const lowestPrice = sortedOffers.length > 0 ? sortedOffers[0].total_delivered_cost : undefined;

    return {
      ...game,
      lowest_price: lowestPrice,
      offer_count: offers.length,
    };
  });

  return (
    <div className="space-y-8">
      <div className="max-w-xl mx-auto text-center space-y-4">
        <h1 className="text-3xl font-extrabold text-[#3A3A3A]">Catálogo de juegos de mesa</h1>
        <p className="text-xs text-gray-500">Busca entre títulos disponibles en tiendas independientes mexicanas</p>
        <SearchBar initialQuery={q} />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#3A3A3A]">
          {q ? `Resultados para "${q}" (${enrichedGames.length})` : `Todos los juegos (${enrichedGames.length})`}
        </h2>

        {enrichedGames.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white text-center border border-gray-200">
            <span className="text-4xl">🔍</span>
            <h3 className="text-base font-bold text-[#3A3A3A] mt-3">No encontramos juegos que coincidan</h3>
            <p className="text-xs text-gray-500 mt-1">Intenta buscar por palabras clave más generales como "Catan" o "Azul".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {enrichedGames.map(game => (
              <GameCard key={game.bgg_id} game={game} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
