'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Toolbar } from '@/components/Toolbar';

interface GameItem {
  bgg_id: number;
  name: string;
  thumbnail: string;
}

interface StoreItem {
  id: string;
  name: string;
  base_url?: string;
}

interface CategoryItem {
  tag: string;
}

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [games, setGames] = useState<GameItem[]>([]);
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!query.trim()) {
      return;
    }

    let isMounted = true;

    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setGames(data.games || []);
          setStores(data.stores || []);
          setCategories(data.categories || []);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error loading search results:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [query]);

  const totalResults = games.length + stores.length + categories.length;

  return (
    <main className="flex-1 max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8 w-full">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600">Búsqueda en catálogo México</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 mt-1">
            {query ? `Opciones viables para "${query}"` : 'Búsqueda general'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {isLoading
              ? 'Consultando base de datos y feeds XML en tiempo real...'
              : `${totalResults} opción(es) encontrada(s) en juegos, tiendas y categorías.`}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-gray-600">Buscando las mejores coincidencias en México...</span>
        </div>
      ) : totalResults === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 text-xl font-bold">
            ?
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">No encontramos coincidencias exactas para &quot;{query}&quot;</h2>
            <p className="text-xs text-gray-500 max-w-md mt-1">
              Verifica la ortografía o explora algunos de nuestros títulos más populares y tiendas verificadas.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <Link href="/game/13" className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-4 py-2 rounded-xl text-xs transition-colors border border-indigo-200">
              🎲 Ver Catan
            </Link>
            <Link href="/game/359871" className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-4 py-2 rounded-xl text-xs transition-colors border border-indigo-200">
              🚀 Ver Arcs
            </Link>
            <Link href="/game/266192" className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-4 py-2 rounded-xl text-xs transition-colors border border-indigo-200">
              🦅 Ver Wingspan
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Games Section */}
          {games.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>🎲 Juegos de mesa viables</span>
                <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-0.5 rounded-full font-bold">{games.length}</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {games.map((game) => (
                  <Link
                    key={game.bgg_id}
                    href={`/game/${game.bgg_id}`}
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:border-indigo-400 hover:shadow-md transition-all flex items-center gap-4 group"
                  >
                    <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {game.thumbnail ? (
                        <img src={game.thumbnail} alt={game.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <span className="text-xs text-gray-400 font-bold">BGG</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-gray-400 font-mono">BGG #{game.bgg_id}</span>
                      <h3 className="font-bold text-sm text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                        {game.name}
                      </h3>
                      <span className="text-xs font-semibold text-indigo-600 mt-1 inline-block">
                        Comparar precios en tiendas →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Stores Section */}
          {stores.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>🏪 Tiendas mexicanas asociadas</span>
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-bold">{stores.length}</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {stores.map((st) => (
                  <Link
                    key={st.id}
                    href={`/store/${st.id}`}
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
                  >
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 group-hover:text-emerald-700 transition-colors">
                        {st.name}
                      </h3>
                      {st.base_url && (
                        <span className="text-xs text-gray-400 block truncate mt-0.5">{st.base_url}</span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-emerald-700">
                      Ver perfil y catálogo en México →
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Categories Section */}
          {categories.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-bold text-gray-900">Etiqueta y categorías relacionadas</h2>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.tag}
                    href={`/search?q=${encodeURIComponent(cat.tag)}`}
                    className="bg-gray-100 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 text-gray-700 hover:text-indigo-700 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                  >
                    🏷️ {cat.tag}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>
  );
}

export default function SearchResultsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 select-none">
      <Toolbar />
      <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-gray-500">Cargando opciones viables...</div>}>
        <SearchResultsContent />
      </Suspense>
    </div>
  );
}
