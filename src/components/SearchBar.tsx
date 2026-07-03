'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

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
      router.push(`/catalog?store=${item.id}`);
    } else if (item.type === 'category') {
      router.push(`/catalog?category=${encodeURIComponent(item.tag)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || flattenedItems.length === 0) {
      if (e.key === 'Enter' && query.trim().length > 0) {
        e.preventDefault();
        setIsOpen(false);
        router.push(`/catalog?q=${encodeURIComponent(query)}`);
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
      if (activeIndex >= 0 && activeIndex < flattenedItems.length) {
        selectItem(flattenedItems[activeIndex]);
      } else if (query.trim().length > 0) {
        setIsOpen(false);
        router.push(`/catalog?q=${encodeURIComponent(query)}`);
      }
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
                      <span className="text-sm">🏪</span>
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
                      className={`text-xs px-3 py-1 rounded-full cursor-pointer transition-all ${
                        idx === activeIndex
                          ? 'bg-indigo-650 text-white font-bold shadow-sm'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium'
                      }`}
                    >
                      🏷️ {cat.tag}
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
