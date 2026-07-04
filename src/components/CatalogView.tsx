'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { RegionalStoreToggle } from './RegionalStoreToggle';

interface CatalogGame {
  bgg_id: number;
  name: string;
  thumbnail: string | null;
  categories: string[];
  min_price: number | null;
  in_stock: boolean;
  historical_min_price?: number | null;
}

interface Props {
  initialGames: CatalogGame[];
}

export function CatalogView({ initialGames }: Props) {
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Calculate maximum price among catalog candidates
  const highestPrice = initialGames.reduce((max, g) => {
    if (g.min_price !== null && g.min_price > max) return g.min_price;
    return max;
  }, 100);
  
  const [maxPrice, setMaxPrice] = useState(Math.ceil(highestPrice));

  // Extract unique categories for filter chips
  const allCategories = Array.from(
    new Set(initialGames.flatMap((g) => g.categories))
  );

  // Apply filters
  const filteredGames = initialGames.filter((game) => {
    if (inStockOnly && !game.in_stock) return false;
    
    if (selectedCategory && !game.categories.includes(selectedCategory)) return false;
    
    if (game.min_price !== null && game.min_price > maxPrice) return false;
    
    return true;
  });

  return (
    <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl mx-auto px-4 py-8">
      {/* Sidebar Filter Panel */}
      <aside className="w-full md:w-64 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-6 h-fit">
        <h3 className="font-bold text-gray-900 text-lg border-b border-gray-150 pb-2">Filters</h3>

        {/* Regional Domestic Store Filter */}
        <div className="flex flex-col gap-2">
          <RegionalStoreToggle className="!justify-start [&>label]:!bg-gray-50 [&>label]:!text-gray-800 [&>label]:!border-gray-200 [&>label]:w-full" />
        </div>

        {/* In Stock Tactile Switch */}
        <div className="flex items-center gap-2.5">
          <div className="relative inline-flex items-center">
            <input
              type="checkbox"
              id="in-stock-checkbox"
              role="switch"
              aria-checked={inStockOnly}
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              onClick={(e) => e.stopPropagation()}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 cursor-pointer"></div>
          </div>
          <label htmlFor="in-stock-checkbox" className="text-sm text-gray-700 font-medium select-none cursor-pointer">
            Only show in stock
          </label>
        </div>

        {/* Price Slider */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-sm font-medium">
            <label htmlFor="price-slider" className="text-gray-700">Max Price</label>
            <span className="text-indigo-600 font-bold">€{maxPrice}</span>
          </div>
          <input
            type="range"
            id="price-slider"
            aria-label="max price"
            min={0}
            max={Math.ceil(highestPrice)}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        {/* Categories Section */}
        {allCategories.length > 0 && (
          <div className="flex flex-col gap-3">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Categories</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  selectedCategory === null
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                All
              </button>
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Catalog Grid Column */}
      <div className="flex-1">
        {filteredGames.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500 font-medium shadow-sm">
            No games match your selected filters. Try broadening your criteria!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <Link
                key={game.bgg_id}
                href={`/game/${game.bgg_id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 group flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 bg-gray-50 flex items-center justify-center overflow-hidden relative border-b border-gray-100">
                    {game.thumbnail && (
                      <img
                        src={game.thumbnail}
                        alt={game.name}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                      {game.name}
                    </h3>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {game.categories.slice(0, 2).map((cat) => (
                        <span key={cat} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-medium">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-medium">Min Price</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-gray-900">
                        {game.min_price !== null ? `€${game.min_price.toFixed(2)}` : '--'}
                      </span>
                      {game.min_price !== null &&
                        game.historical_min_price != null &&
                        game.min_price <= game.historical_min_price * 1.03 && (
                          <span
                            data-testid="catalog-best-price-badge"
                            className="inline-flex items-center gap-1 text-[10px] text-rose-950 bg-[#FF9E8A]/25 border border-[#FF9E8A]/50 rounded px-1.5 py-0.5 font-extrabold"
                          >
                            ★ Mínimo Histórico
                          </span>
                        )}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    game.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {game.in_stock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
