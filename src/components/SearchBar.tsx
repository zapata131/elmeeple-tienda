'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BggGame } from '@/types';

export const SearchBar: React.FC<{ initialQuery?: string }> = ({ initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<BggGame[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.games ? data.games.slice(0, 5) : []);
          setIsOpen(true);
        }
      } catch {
        // Fallback silently
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por juego (ej. Catan, Wingspan)..."
          className="w-full px-4 py-3 pl-10 pr-24 rounded-xl bg-white border border-gray-300 text-[#3A3A3A] placeholder-gray-400 focus:outline-none focus:border-[#8367C7] text-sm transition-all shadow-xs"
        />
        <span className="absolute left-3 text-sm text-gray-400">🔍</span>
        <button
          type="submit"
          className="absolute right-1.5 px-4 py-1.5 rounded-lg bg-[#8367C7] text-white text-xs font-medium hover:bg-[#8367C7]/90 transition-all"
        >
          Buscar
        </button>
      </form>

      {/* Autocomplete Suggestions */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
          <ul className="divide-y divide-gray-100">
            {suggestions.map((game) => (
              <li key={game.bgg_id}>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    router.push(`/game/${game.bgg_id}`);
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#F5F0E9] transition-colors text-left"
                >
                  {game.thumbnail && (
                    <img
                      src={game.thumbnail}
                      alt={game.name}
                      className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-[#3A3A3A] truncate">{game.name}</h4>
                    <p className="text-xs text-gray-500">
                      {game.min_players}-{game.max_players} jugadores • {game.playing_time} min
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded bg-[#73D8D4]/20 text-[#2B8C88]">
                    Ver precios
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
