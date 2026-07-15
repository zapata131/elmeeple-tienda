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
      className="group bg-white rounded-xl border border-gray-200/80 hover:border-[#8367C7]/40 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
    >
      <div className="relative aspect-square w-full bg-[#F5F0E9]/60 overflow-hidden p-2">
        <img
          src={game.image || game.thumbnail || 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=400&h=400&fit=crop'}
          alt={game.name}
          className="w-full h-full object-contain rounded-lg group-hover:scale-102 transition-transform duration-200"
        />
        {game.item_type === 'expansion' && (
          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 text-[9px] font-medium rounded bg-[#3A3A3A] text-white">
            Expansión
          </span>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-[#3A3A3A] group-hover:text-[#8367C7] transition-colors line-clamp-1">
            {game.name}
          </h3>
          <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1.5">
            <span>{game.min_players}-{game.max_players} jug.</span>
            <span>•</span>
            <span>{game.playing_time} min</span>
            {game.weight && (
              <>
                <span>•</span>
                <span>{game.weight.toFixed(1)}/5</span>
              </>
            )}
          </p>
        </div>

        <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 block font-medium">
              Desde
            </span>
            <span className="text-sm font-bold text-[#8367C7]">
              {game.lowest_price
                ? `$${game.lowest_price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`
                : 'Consultar'}
            </span>
          </div>

          <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-gray-100 text-gray-700 group-hover:bg-[#8367C7] group-hover:text-white transition-all">
            Comparar ({game.offer_count || 0})
          </span>
        </div>
      </div>
    </Link>
  );
};
