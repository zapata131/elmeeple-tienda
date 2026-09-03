'use client';

import React, { useState, useEffect, useRef, useId } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';
import { CatalogGame } from '../types';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  inputId?: string;
}

export function SearchBar({
  placeholder = 'Buscar juegos de mesa (ej. Catan, Wingspan, Flamecraft)...',
  className = '',
  inputId,
}: SearchBarProps) {
  const router = useRouter();
  const generatedId = useId();
  const effectiveId = inputId || `search-${generatedId}`;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CatalogGame[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.games || []);
          setIsOpen(true);
        }
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleSelect(results[selectedIndex].slug);
      } else if (results.length > 0) {
        handleSelect(results[0].slug);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (slug: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/game/${slug}`);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        <input
          id={effectiveId}
          name="q"
          type="search"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          aria-label="Buscar juegos de mesa"
          autoComplete="off"
          className="w-full px-4 py-3 pl-11 pr-10 text-sm md:text-base text-[#3A3A3A] bg-white border border-stone-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8367C7] focus:border-transparent transition-all"
        />
        <Search className="absolute left-3.5 w-5 h-5 text-stone-400 pointer-events-none" />
        {isLoading && (
          <Loader2 className="absolute right-3.5 w-5 h-5 text-stone-400 animate-spin" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 w-full mt-2 bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden py-1"
        >
          {results.map((game, index) => (
            <li
              key={game.id}
              role="option"
              aria-selected={index === selectedIndex}
              onClick={() => handleSelect(game.slug)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                index === selectedIndex ? 'bg-[#8367C7]/10 text-[#8367C7]' : 'hover:bg-stone-50 text-[#3A3A3A]'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                {game.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={game.image_url} alt={game.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-semibold text-stone-400">🎲</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{game.title}</p>
                <p className="text-xs text-stone-500 truncate">
                  {game.min_players && game.max_players ? `${game.min_players}-${game.max_players} jugadores` : 'Juego de mesa'}
                  {game.playing_time ? ` · ${game.playing_time} min` : ''}
                </p>
              </div>
              <span className="text-xs text-stone-400">Ver precios →</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
