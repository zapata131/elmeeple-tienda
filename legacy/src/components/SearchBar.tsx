'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface GameSuggestion {
  type: 'game';
  bgg_id: number;
  name: string;
  thumbnail: string;
  offers_count?: number;
  in_stock_count?: number;
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
  offers_count?: number;
  in_stock_count?: number;
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
          const gList: GameSuggestion[] = (data.games || []).slice(0, 6).map((g: RawGame) => ({ ...g, type: 'game' }));
          const sList: StoreSuggestion[] = (data.stores || []).slice(0, 3).map((s: RawStore) => ({ ...s, type: 'store' }));
          const cList: CategorySuggestion[] = (data.categories || []).slice(0, 4).map((c: RawCategory) => ({ ...c, type: 'category' }));

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

  const handleSearchSubmit = async () => {
    setIsOpen(false);
    if (activeIndex >= 0 && activeIndex < flattenedItems.length) {
      selectItem(flattenedItems[activeIndex]);
      return;
    }

    const trimmed = query.trim();
    if (!trimmed) return;

    // Navigate directly to dedicated search results page to display all actual search hits
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearchSubmit();
        }}
        className="relative flex items-center"
      >
        <input
          type="search"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (flattenedItems.length > 0) setIsOpen(true);
          }}
          placeholder="Buscar juegos de mesa, tiendas o categorías... / Search board games..."
          className="w-full pl-4 pr-12 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
        />
        <div className="absolute right-2 flex items-center gap-1">
          {isLoading ? (
            <div className="p-1.5">
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <button
              type="submit"
              aria-label="Buscar"
              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg transition-colors focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}
        </div>
      </form>

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
                    <div className="w-8 h-8 rounded-lg shrink-0 bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                      {g.thumbnail ? (
                        <img
                          src={g.thumbnail}
                          alt={g.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-xs truncate font-semibold">{g.name}</div>
                        <span className="text-[9px] text-gray-400 font-mono block">BGG #{g.bgg_id}</span>
                      </div>
                      {g.in_stock_count !== undefined && g.in_stock_count > 0 ? (
                        <span className="bg-emerald-50 text-emerald-700 text-[8px] font-extrabold px-1.5 py-0.5 rounded-sm border border-emerald-250 shrink-0">
                          En stock
                        </span>
                      ) : g.offers_count !== undefined && g.offers_count > 0 ? (
                        <span className="bg-amber-50 text-amber-700 text-[8px] font-extrabold px-1.5 py-0.5 rounded-sm border border-amber-250 shrink-0">
                          Agotado
                        </span>
                      ) : null}
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
                          ? 'bg-indigo-600 text-white font-bold shadow-sm'
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
