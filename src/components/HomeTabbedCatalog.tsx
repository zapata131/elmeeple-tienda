'use client';

import React, { useState } from 'react';
import { GameCard } from './GameCard';
import { BggGame } from '@/types';
import Link from 'next/link';

interface EnrichedGame extends BggGame {
  lowest_price?: number;
  offer_count?: number;
}

interface HomeTabbedCatalogProps {
  bggTop10Games: EnrichedGame[];
  mostSearchedGames: EnrichedGame[];
}

export const HomeTabbedCatalog: React.FC<HomeTabbedCatalogProps> = ({
  bggTop10Games,
  mostSearchedGames,
}) => {
  const [activeTab, setActiveTab] = useState<'bgg_top10' | 'most_searched'>('bgg_top10');

  const currentGames = activeTab === 'bgg_top10' ? bggTop10Games : mostSearchedGames;

  return (
    <section className="space-y-6 max-w-6xl mx-auto">
      {/* Header & Tab Switcher Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#3A3A3A] tracking-tight">
            Descubre juegos destacados
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Compara precios de los títulos mejor valorados y más buscados en México
          </p>
        </div>

        {/* Tactile Tab Pill Switcher (Google Sentence Case) */}
        <div className="inline-flex p-1 rounded-2xl bg-[#F5F0E9] border border-gray-200/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('bgg_top10')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'bgg_top10'
                ? 'bg-[#8367C7] text-white shadow-sm'
                : 'text-[#3A3A3A] hover:text-[#8367C7]'
            }`}
          >
            Top 10 de BoardGameGeek
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('most_searched')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === 'most_searched'
                ? 'bg-[#8367C7] text-white shadow-sm'
                : 'text-[#3A3A3A] hover:text-[#8367C7]'
            }`}
          >
            Más buscados en México
          </button>
        </div>
      </div>

      {/* Active Tab Subtitle Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#73D8D4]" />
          <span className="text-xs font-semibold text-gray-600">
            {activeTab === 'bgg_top10'
              ? 'Los 10 mejores juegos del ranking mundial BGG'
              : 'Los títulos con mayor volumen de búsqueda en México'}
          </span>
        </div>

        <Link
          href="/search"
          className="text-xs font-bold text-[#8367C7] hover:underline flex items-center gap-1"
        >
          Ver catálogo completo ➔
        </Link>
      </div>

      {/* Grid of Enriched Game Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {currentGames.map((game) => (
          <GameCard key={game.bgg_id} game={game} />
        ))}
      </div>
    </section>
  );
};
