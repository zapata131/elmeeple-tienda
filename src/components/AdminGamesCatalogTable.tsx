'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export interface AdminGameRow {
  bgg_id: number;
  name: string;
  thumbnail?: string;
  last_updated_at?: string;
}

interface AdminGamesCatalogTableProps {
  games: AdminGameRow[];
}

export function AdminGamesCatalogTable({ games }: AdminGamesCatalogTableProps) {
  const [filterText, setFilterText] = useState('');

  const filteredGames = games.filter((g) => {
    const query = filterText.toLowerCase().trim();
    if (!query) return true;
    return (
      (g.name || '').toLowerCase().includes(query) ||
      g.bgg_id.toString().includes(query)
    );
  });

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600">Auditoría del catálogo</span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-950 mt-0.5">
            Catálogo general de juegos indexados
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Revisión en tiempo real de todos los títulos registrados en la plataforma en México.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold px-3.5 py-1.5 rounded-xl">
            📚 Total registrados: {games.length} juego(s)
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="relative max-w-md w-full">
        <input
          type="search"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Buscar por título o BGG ID (ej. Excalibur, Catan, 13)..."
          className="w-full pl-4 pr-10 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
        />
        {filterText && (
          <button
            onClick={() => setFilterText('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {filteredGames.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-500 font-semibold">
          No se encontraron juegos que coincidan con &quot;{filterText}&quot;.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-[11px] font-extrabold uppercase tracking-wider text-gray-500 bg-gray-50">
                <th className="py-3 px-4">Juego</th>
                <th className="py-3 px-4">BGG ID</th>
                <th className="py-3 px-4">Última actualización</th>
                <th className="py-3 px-4 text-right">Comparativa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredGames.map((game) => (
                <tr key={game.bgg_id} className="hover:bg-indigo-50/40 transition-colors group">
                  <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {game.thumbnail ? (
                        <img src={game.thumbnail} alt={game.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-gray-400 font-bold">BGG</span>
                      )}
                    </div>
                    <span className="group-hover:text-indigo-600 transition-colors truncate max-w-xs sm:max-w-md">
                      {game.name}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-gray-600">#{game.bgg_id}</td>
                  <td className="py-3.5 px-4 text-gray-500">
                    {game.last_updated_at ? new Date(game.last_updated_at).toLocaleDateString('es-MX') : 'Reciente'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/game/${game.bgg_id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold px-3 py-1.5 rounded-lg text-[11px] transition-all shadow-2xs hover:shadow-sm"
                    >
                      <span>Ver comparativa</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
