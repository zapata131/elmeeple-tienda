'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_GAMES } from '@/utils/mockData';

interface GameSuggestion {
  type: 'game';
  bgg_id: number;
  name: string;
  thumbnail: string;
}

interface StoreSuggestion {
  type: 'store';
  id: string;
  name: string;
  base_url?: string;
}

interface CategorySuggestion {
  type: 'category';
  tag: string;
}

type SuggestionItem = GameSuggestion | StoreSuggestion | CategorySuggestion;

interface RawGame {
  bgg_id: number;
  name: string;
  thumbnail: string;
}

interface RawStore {
  id: string;
  name: string;
  base_url?: string;
}

interface RawCategory {
  tag: string;
}

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [games, setGames] = useState<GameSuggestion[]>([]);
  const [stores, setStores] = useState<StoreSuggestion[]>([]);
  const [categories, setCategories] = useState<CategorySuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 1) {
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          const gList: GameSuggestion[] = (data.games || []).map((g: RawGame) => ({ ...g, type: 'game' }));
          const sList: StoreSuggestion[] = (data.stores || []).map((s: RawStore) => ({ ...s, type: 'store' }));
          const cList: CategorySuggestion[] = (data.categories || []).map((c: RawCategory) => ({ ...c, type: 'category' }));

          setGames(gList);
          setStores(sList);
          setCategories(cList);

          const totalCount = gList.length + sList.length + cList.length;
          setIsOpen(totalCount > 0);
          setActiveIndex(-1);
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const flattenedItems: SuggestionItem[] = [...games, ...stores, ...categories];

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (val.trim().length < 1) {
      setGames([]);
      setStores([]);
      setCategories([]);
      setIsOpen(false);
    }
  };

  const selectItem = (item: SuggestionItem) => {
    setIsOpen(false);
    if (item.type === 'game') {
      router.push(`/game/${item.bgg_id}`);
    } else if (item.type === 'store') {
      router.push(`/store/${item.id}`);
    } else if (item.type === 'category') {
      if (games.length > 0) {
        router.push(`/game/${games[0].bgg_id}`);
      } else {
        router.push('/game/13');
      }
    }
  };

  const handleSearchSubmit = () => {
    setIsOpen(false);
    if (activeIndex >= 0 && activeIndex < flattenedItems.length) {
      selectItem(flattenedItems[activeIndex]);
    } else if (games.length > 0) {
      router.push(`/game/${games[0].bgg_id}`);
    } else if (stores.length > 0) {
      router.push(`/store/${stores[0].id}`);
    } else {
      const numericId = parseInt(query.trim(), 10);
      if (!isNaN(numericId) && numericId > 0) {
        router.push(`/game/${numericId}`);
      } else {
        const match = MOCK_GAMES.find((g) => g.name.toLowerCase().includes(query.trim().toLowerCase()));
        router.push(`/game/${match ? match.bgg_id : 13}`);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || flattenedItems.length === 0) {
      if (e.key === 'Enter' && query.trim().length > 0) {
        e.preventDefault();
        handleSearchSubmit();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < flattenedItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : flattenedItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  let currentIndexCounter = 0;

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (flattenedItems.length > 0) setIsOpen(true);
          }}
          placeholder="Buscar juegos de mesa, tiendas o categorías... / Search board games..."
          className="w-full px-4 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
        />
        {isLoading && (
          <div className="absolute right-3 top-3">
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {isOpen && (
        <div
          role="listbox"
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-96 overflow-y-auto divide-y divide-gray-150"
        >
          {/* Games Section */}
          {games.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                Juegos de Mesa
              </div>
              {games.map((g) => {
                const idx = currentIndexCounter++;
                return (
                  <div
                    key={`game-${g.bgg_id}`}
                    role="option"
                    aria-selected={idx === activeIndex}
                    onClick={() => selectItem(g)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
                      idx === activeIndex ? 'bg-indigo-50 text-indigo-900 font-bold' : 'hover:bg-gray-50 text-gray-800'
                    }`}
                  >
                    <img
                      src={g.thumbnail}
                      alt={g.name}
                      className="w-8 h-8 object-cover rounded-lg shrink-0 bg-gray-100 border border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs truncate">{g.name}</div>
                      <span className="text-[10px] text-gray-400 font-mono">BGG #{g.bgg_id}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Stores Section */}
          {stores.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                Tiendas Asociadas
              </div>
              {stores.map((st) => {
                const idx = currentIndexCounter++;
                return (
                  <div
                    key={`store-${st.id}`}
                    role="option"
                    aria-selected={idx === activeIndex}
                    onClick={() => selectItem(st)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                      idx === activeIndex ? 'bg-indigo-50 text-indigo-900 font-bold' : 'hover:bg-gray-50 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#73D8D4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-xs">{st.name}</span>
                    </div>
                    <span className="text-[10px] bg-green-50 text-green-700 font-extrabold px-2 py-0.5 rounded">
                      Verificada
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Categories Section */}
          {categories.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                Categorías y Temáticas
              </div>
              <div className="flex flex-wrap gap-1.5 p-2">
                {categories.map((cat) => {
                  const idx = currentIndexCounter++;
                  return (
                    <span
                      key={`cat-${cat.tag}`}
                      role="option"
                      aria-selected={idx === activeIndex}
                      onClick={() => selectItem(cat)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`text-xs px-3 py-1 rounded-full cursor-pointer transition-all inline-flex items-center gap-1.5 ${
                        idx === activeIndex
                          ? 'bg-indigo-650 text-white font-bold shadow-sm'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium'
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span>{cat.tag}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
