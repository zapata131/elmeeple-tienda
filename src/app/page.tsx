import React from 'react';
import { db } from '@/lib/db/db';
import { SearchBar } from '@/components/SearchBar';
import { HomeTabbedCatalog } from '@/components/HomeTabbedCatalog';
import Link from 'next/link';
import { BggGame } from '@/types';

function enrichGame(game: BggGame) {
  const offers = db.getOffersForGame(game.bgg_id);
  const sortedOffers = offers.sort((a, b) => a.total_delivered_cost - b.total_delivered_cost);
  const lowestPrice = sortedOffers.length > 0 ? sortedOffers[0].total_delivered_cost : undefined;

  return {
    ...game,
    lowest_price: lowestPrice,
    offer_count: offers.length,
  };
}

export default function HomePage() {
  const top10Games = db.getBggTop10().map(enrichGame);
  const mostSearchedGames = db.getMostSearchedGames().map(enrichGame);
  const stores = db.getStores();

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
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

      {/* Tabbed Catalog Section: BGG Top 10 & Most Searched (US-25) */}
      <HomeTabbedCatalog
        bggTop10Games={top10Games}
        mostSearchedGames={mostSearchedGames}
      />

      {/* Partner Stores Grid */}
      <section className="p-6 rounded-2xl bg-white border border-gray-200/80 space-y-4 max-w-6xl mx-auto">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-[#3A3A3A]">Tiendas asociadas ({stores.length})</h2>
            <p className="text-xs text-gray-500">Sincronización automática de inventario en tiendas mexicanas</p>
          </div>
          <Link
            href="/admin/diagnostics"
            className="text-xs font-semibold text-[#8367C7] hover:underline"
          >
            Ver catálogo completo ➔
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {stores.slice(0, 12).map((store) => (
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
              <span className="text-xs font-semibold text-[#3A3A3A] group-hover:text-[#8367C7] transition-colors line-clamp-1">
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
