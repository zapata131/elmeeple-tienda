import React from 'react';
import { SearchBar } from '@/components/SearchBar';
import { Toolbar } from '@/components/Toolbar';
import Link from 'next/link';
import { fetchBggHotness } from '@/lib/queries';

export default async function Home() {
  const hotGames = await fetchBggHotness();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 select-none">
      
      {/* Global Settings Toolbar */}
      <Toolbar />

      {/* Hero Header Section */}
      <header className="bg-gray-900 text-white py-16 px-6 border-b border-gray-800 flex flex-col items-center text-center">
        <div className="max-w-3xl flex flex-col items-center w-full">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#8367C7]/20 border border-[#8367C7]/40 flex items-center justify-center text-[#8367C7]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">
              Meeple<span className="text-indigo-500">Precios</span>
            </h1>
          </div>
          <p className="text-base text-gray-400 max-w-xl mb-8 font-medium">
            Buscador y comparador verificador de precios de juegos de mesa en México ($ MXN).
          </p>
          
          {/* Autocomplete Search Bar */}
          <div className="w-full max-w-2xl flex flex-col items-center">
            <SearchBar />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-12 w-full flex flex-col gap-8">
        
        {/* Hot Games Section (BGG Hotness Trending in Mexico) */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-[#FF9E8A]/20 text-[#FF9E8A] flex items-center justify-center border border-[#FF9E8A]/30">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
              </span>
              <span>Tendencias BGG (Disponibles en tiendas de México)</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {hotGames.map((game) => (
              <Link
                key={game.bgg_id}
                href={`/game/${game.bgg_id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 group flex flex-col justify-between"
              >
                <div className="h-44 bg-gray-100 flex items-center justify-center overflow-hidden relative border-b border-gray-100">
                  {game.thumbnail && (
                    <img
                      src={game.thumbnail}
                      alt={game.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate text-base">
                    {game.name}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-2 border-t border-gray-100">
                    <span>Complejidad: {game.weight || 2.5} / 5</span>
                    <span className="text-indigo-600 font-bold group-hover:underline">Comparar precios →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white border-t border-gray-800 py-6 px-6 text-center text-xs text-gray-500">
        <p>© 2026 MeeplePrecios México. Todos los derechos reservados.</p>
      </footer>

    </div>
  );
}
