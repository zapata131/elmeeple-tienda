import React from 'react';
import Link from 'next/link';
import { BggGame } from '@/types';

interface GameCardProps {
  game: BggGame & { lowest_price?: number; offer_count?: number };
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  return (
    <Link
      href={`/game/${game.bgg_id}`}
      className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col justify-between"
    >
      <div className="relative aspect-square w-full bg-[#F5F0E9] overflow-hidden">
        <img
          src={game.image || game.thumbnail || 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=400&h=400&fit=crop'}
          alt={game.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {game.item_type === 'expansion' && (
          <span className="absolute top-2 right-2 px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg bg-[#3A3A3A] text-white">
            Expansión
          </span>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-[#3A3A3A] group-hover:text-[#8367C7] transition-colors line-clamp-1">
            {game.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
            <span>👥 {game.min_players}-{game.max_players} jug.</span>
            <span>•</span>
            <span>⏱️ {game.playing_time} min</span>
            {game.weight && (
              <>
                <span>•</span>
                <span>⚖️ {game.weight.toFixed(1)}/5</span>
              </>
            )}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
              Desde
            </span>
            <span className="text-base font-extrabold text-[#8367C7]">
              {game.lowest_price
                ? `$${game.lowest_price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`
                : 'Consultar'}
            </span>
          </div>

          <span className="px-3 py-1 rounded-xl text-xs font-bold bg-[#73D8D4]/20 text-[#2B8C88] group-hover:bg-[#8367C7] group-hover:text-white transition-all">
            Comparar ({game.offer_count || 0})
          </span>
        </div>
      </div>
    </Link>
  );
};
