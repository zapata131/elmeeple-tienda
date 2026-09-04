'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Clock, Trophy, Flame, Sparkles } from 'lucide-react';
import { CatalogGame, CalculatedOffer } from '../types';
import { SearchBar } from '../components/SearchBar';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'trending' | 'top_bgg'>('trending');
  const [games, setGames] = useState<CatalogGame[]>([]);
  const [lowestPrices, setLowestPrices] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadGames() {
      try {
        const res = await fetch('/api/search?limit=20');
        if (res.ok) {
          const data = await res.json();
          const allGames: CatalogGame[] = data.games || [];
          setGames(allGames);

          // Fetch lowest price for each game
          const priceMap: Record<string, number> = {};
          for (const g of allGames) {
            try {
              const offerRes = await fetch(`/api/games/${g.slug}`);
              if (offerRes.ok) {
                const offerData = await offerRes.json();
                const offers: CalculatedOffer[] = offerData.offers || [];
                if (offers.length > 0) {
                  const minPrice = Math.min(...offers.map(o => o.price));
                  priceMap[g.id] = minPrice;
                }
              }
            } catch {}
          }
          setLowestPrices(priceMap);
        }
      } catch (err) {
        console.error('Failed to fetch games', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadGames();
  }, []);

  // Filter games based on active tab
  const displayedGames = [...games].sort((a, b) => {
    if (activeTab === 'top_bgg') {
      return (a.bgg_rank || 9999) - (b.bgg_rank || 9999);
    }
    // Trending in Mexico (prefer verified and popular games)
    return (a.playing_time || 0) - (b.playing_time || 0);
  });

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-16 px-4 rounded-3xl bg-gradient-to-b from-white to-stone-50 border border-stone-200/80 shadow-xs relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#8367C7]/10 text-[#8367C7] border border-[#8367C7]/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>El comparador de precios más completo de México</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#3A3A3A] tracking-tight leading-tight">
            Compara precios de juegos de mesa en México
          </h1>

          <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto">
            Encuentra las mejores ofertas y disponibilidad en tiempo real de tiendas mexicanas verificadas.
          </p>

          <div className="pt-2 max-w-xl mx-auto">
            <SearchBar placeholder="Busca tu próximo juego de mesa favorito..." />
          </div>
        </div>
      </section>

      {/* Tabbed Catalog Discovery */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-[#3A3A3A]">Catálogo destacado</h2>
            <p className="text-sm text-stone-500 mt-0.5">
              Explora títulos populares con disponibilidad inmediata en México.
            </p>
          </div>

          {/* Accessible Tabs */}
          <div className="flex items-center p-1 bg-white border border-stone-200 rounded-xl shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab('trending')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'trending'
                  ? 'bg-[#8367C7] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>Más buscados en México</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('top_bgg')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'top_bgg'
                  ? 'bg-[#8367C7] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Top 10 BoardGameGeek</span>
            </button>
          </div>
        </div>

        {/* Games Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="bg-white rounded-2xl border border-stone-200 h-80 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedGames.map(game => {
              const lowestPrice = lowestPrices[game.id];

              return (
                <Link
                  key={game.id}
                  href={`/game/${game.slug}`}
                  className="group bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-md hover:border-[#8367C7]/40 transition-all overflow-hidden flex flex-col"
                >
                  <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
                    {game.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={game.image_url}
                        alt={game.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 game-thumbnail"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">🎲</div>
                    )}
                    {game.bgg_rank && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/90 backdrop-blur text-stone-800 border border-stone-200 shadow-xs">
                        BGG #{game.bgg_rank}
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-bold text-[#3A3A3A] group-hover:text-[#8367C7] transition-colors line-clamp-1">
                        {game.title}
                      </h3>
                      <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                        {game.description || 'Juego de mesa moderno disponible en tiendas de México.'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-stone-500">
                        {game.min_players && game.max_players && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {game.min_players}-{game.max_players}
                          </span>
                        )}
                        {game.playing_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {game.playing_time}m
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        {lowestPrice ? (
                          <>
                            <span className="text-[10px] text-stone-400 block leading-tight">Desde</span>
                            <span className="text-sm font-black text-[#3A3A3A]">
                              ${lowestPrice.toLocaleString('es-MX', { minimumFractionDigits: 0 })} MXN
                            </span>
                          </>
                        ) : (
                          <span className="text-xs font-medium text-[#8367C7]">Ver ofertas</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
