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
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative text-center py-12 px-4 sm:px-6 rounded-3xl bg-gradient-to-b from-white/80 to-white/40 border border-[#8367C7]/20 shadow-sm overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#FF9E8A]/30 text-rose-950">
            🎲 Comparador oficial de precios en México
          </span>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#3A3A3A] tracking-tight leading-tight">
            Encuentra el mejor precio entregado para tu próximo juego de mesa
          </h1>

          <p className="text-base text-gray-600">
            Compara precios de tiendas mexicanas independientes incluyendo envío a domicilio en Pesos Mexicanos ($ MXN).
          </p>

          <div className="pt-2">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* BGG Hotness Trends Section (US-01) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#3A3A3A]">Tendencias populares en México</h2>
            <p className="text-xs text-gray-500 mt-1">Los juegos más buscados en el catálogo de tiendas socias</p>
          </div>
          <Link
            href="/search"
            className="text-xs font-bold text-[#8367C7] hover:underline flex items-center gap-1"
          >
            Ver catálogo completo ➔
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {enrichedGames.map((game) => (
            <GameCard key={game.bgg_id} game={game} />
          ))}
        </div>
      </section>

      {/* Partner Stores Grid */}
      <section className="p-8 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-xl font-bold text-[#3A3A3A]">Tiendas socias en México</h2>
          <p className="text-xs text-gray-500">
            Sincronizamos inventarios de tiendas independientes de CDMX, Guadalajara y toda la República Mexicana.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stores.map((store) => (
            <Link
              key={store.id}
              href={`/store/${store.id}`}
              className="p-4 rounded-2xl bg-[#F5F0E9]/50 hover:bg-[#F5F0E9] border border-gray-200 transition-all text-center flex flex-col items-center gap-2 group"
            >
              {store.logo_url ? (
                <img
                  src={store.logo_url}
                  alt={store.name}
                  className="w-12 h-12 rounded-xl object-cover border border-gray-300 group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[#8367C7] text-white flex items-center justify-center font-bold text-lg">
                  {store.name.charAt(0)}
                </div>
              )}
              <span className="text-xs font-bold text-[#3A3A3A] group-hover:text-[#8367C7] transition-colors">
                {store.name}
              </span>
              <span className="text-[10px] text-emerald-700 font-medium">
                ★ {store.rating?.toFixed(2)} ({store.review_count} reseñas)
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
