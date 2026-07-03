import React from 'react';
import { SearchBar } from '@/components/SearchBar';
import { RegionalStoreToggle } from '@/components/RegionalStoreToggle';
import { Toolbar } from '@/components/Toolbar';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DEFAULT_HOT_GAMES = [
  {
    bgg_id: 23,
    name: 'Catan',
    thumbnail: 'https://d2qg6c07ydxh2f.cloudfront.net/items/23/img_23_MAIN.png',
    weight: 2.3,
  },
  {
    bgg_id: 822,
    name: 'Carcassonne',
    thumbnail: 'https://cf.geekdo-images.com/okO0nd7JZ1wdfcv2LsB2jg__thumb/img/h7_K6qN6vV6r-C11w03M-7p26xQ=/fit-in/200x150/filters:strip_icc():format(jpeg)/pic6544250.jpg',
    weight: 1.9,
  },
  {
    bgg_id: 169786,
    name: 'Scythe',
    thumbnail: 'https://cf.geekdo-images.com/7kPt9ilrj-HG4KB2reUN8A__thumb/img/qL_fJ_2b7m4vE0C7x0O4s1m8-K8=/fit-in/200x150/filters:strip_icc():format(jpeg)/pic3163924.jpg',
    weight: 3.4,
  },
  {
    bgg_id: 39856,
    name: 'Dixit',
    thumbnail: 'https://cf.geekdo-images.com/z7qjHhP_z26z64h-S0u_7w__thumb/img/o2i4oN8u1Z29-m1L9k1W3_U9qM0=/fit-in/200x150/filters:strip_icc():format(jpeg)/pic5053229.jpg',
    weight: 1.2,
  },
];

export default async function Home() {
  let hotGames = [];
  try {
    const { data } = await supabase
      .from('bgg_games_cache')
      .select('bgg_id, name, thumbnail, weight')
      .limit(4);
    
    if (data && data.length > 0) {
      hotGames = data;
    } else {
      hotGames = DEFAULT_HOT_GAMES;
    }
  } catch {
    hotGames = DEFAULT_HOT_GAMES;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      
      {/* Global Settings Toolbar */}
      <Toolbar />

      {/* Hero Header Section */}
      <header className="bg-gray-900 text-white py-16 px-6 border-b border-gray-800 flex flex-col items-center text-center">
        <div className="max-w-3xl flex flex-col items-center">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#8367C7]/20 border border-[#8367C7]/40 flex items-center justify-center text-[#8367C7]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">
              Meeple<span className="text-indigo-500">Precios</span>
            </h1>
          </div>
          <p className="text-lg text-gray-400 max-w-xl mb-8">
            El buscador y comparador de precios de juegos de mesa más rápido para España y Latinoamérica. Encuentra la edición exacta en tu moneda local.
          </p>
          
          {/* Autocomplete Search Bar and Consolidated Regional Store Toggle */}
          <div className="w-full flex flex-col items-center gap-3">
            <SearchBar />
            <RegionalStoreToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-12 w-full flex flex-col gap-12">
        
        {/* Hot Games Section */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-[#FF9E8A]/20 text-[#FF9E8A] flex items-center justify-center border border-[#FF9E8A]/30">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
              </span>
              <span>Juegos del Momento</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {hotGames.map((game) => (
              <Link
                key={game.bgg_id}
                href={`/game/${game.bgg_id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 group flex flex-col"
              >
                <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden relative">
                  {game.thumbnail && (
                    <img
                      src={game.thumbnail}
                      alt={game.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                    {game.name}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <span>Complexity: {game.weight} / 5</span>
                    <span className="text-indigo-500 font-semibold group-hover:underline">Compare Prices →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Brand Value Proposition Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#73D8D4]/20 border border-[#73D8D4]/40 flex items-center justify-center text-[#73D8D4]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-bold text-lg text-gray-900">Envíos Localizados</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Selecciona tu país de destino (España, Portugal, México, Brasil, Chile...) y calculamos las tarifas de envío y aranceles de importación exactos automáticamente.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF9E8A]/20 border border-[#FF9E8A]/40 flex items-center justify-center text-[#FF9E8A]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-bold text-lg text-gray-900">Tu Moneda Local</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Convierte los precios de origen en EUR, USD o GBP directamente a tu divisa de preferencia (MXN, BRL, ARS, COP, CLP, PEN) en tiempo real con tasas de cambio diarias.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8367C7]/20 border border-[#8367C7]/40 flex items-center justify-center text-[#8367C7]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h4 className="font-bold text-lg text-gray-900">Detección de Idioma</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Evita importar ediciones en el idioma equivocado. Filtramos e indicamos claramente si la caja es en Español (<strong className="font-mono text-[#8367C7]">ES</strong>), Portugués (<strong className="font-mono text-[#73D8D4]">PT</strong>) o Inglés (<strong className="font-mono text-gray-700">EN</strong>).
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white border-t border-gray-800 py-8 px-6 text-center text-xs text-gray-500">
        <p>© 2026 MeeplePrecios. Todos los derechos reservados. El Meeple España & LATAM.</p>
      </footer>

    </div>
  );
}
