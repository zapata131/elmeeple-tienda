import React from 'react';
import { db } from '@/lib/db/mock-db';
import { SearchBar } from '@/components/SearchBar';
import { GameCard } from '@/components/GameCard';
import Link from 'next/link';

export default function HomePage() {
  const games = db.getBggGames();
  const stores = db.getStores();

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
    <div className="space-y-16 py-4">
      {/* Minimal Hero Section */}
      <section className="text-center py-10 px-4 sm:px-6 max-w-2xl mx-auto space-y-4">
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white border border-gray-200 text-gray-600">
          Comparador de precios en México
        </span>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#3A3A3A] tracking-tight leading-tight">
          Compara precios de juegos de mesa
        </h1>

        <p className="text-sm text-gray-500 max-w-lg mx-auto">
          Encuentra el menor costo entregado con envío a domicilio en pesos mexicanos ($ MXN).
        </p>

        <div className="pt-2">
          <SearchBar />
        </div>
      </section>

      {/* Popular Games Catalog */}
      <section className="space-y-4 max-w-6xl mx-auto">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div>
            <h2 className="text-lg font-bold text-[#3A3A3A]">Juegos populares</h2>
            <p className="text-xs text-gray-500">Catálogo disponible en tiendas mexicanas</p>
          </div>
          <Link
            href="/search"
            className="text-xs font-semibold text-[#8367C7] hover:underline"
          >
            Ver todo ➔
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {enrichedGames.map((game) => (
            <GameCard key={game.bgg_id} game={game} />
          ))}
        </div>
      </section>

      {/* Partner Stores Grid */}
      <section className="p-6 rounded-2xl bg-white border border-gray-200/80 space-y-4 max-w-6xl mx-auto">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-base font-bold text-[#3A3A3A]">Tiendas asociadas</h2>
          <span className="text-xs text-gray-400">Sincronización automática de inventario</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stores.map((store) => (
            <Link
              key={store.id}
              href={`/store/${store.id}`}
              className="p-3 rounded-xl bg-[#F5F0E9]/40 hover:bg-[#F5F0E9] border border-gray-200/60 transition-all text-center flex flex-col items-center gap-1.5 group"
            >
              {store.logo_url ? (
                <img
                  src={store.logo_url}
                  alt={store.name}
                  className="w-10 h-10 rounded-lg object-cover border border-gray-200 group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-[#3A3A3A] text-white flex items-center justify-center font-bold text-sm">
                  {store.name.charAt(0)}
                </div>
              )}
              <span className="text-xs font-semibold text-[#3A3A3A] group-hover:text-[#8367C7] transition-colors">
                {store.name}
              </span>
              <span className="text-[10px] text-gray-500">
                ★ {store.rating?.toFixed(2)}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
