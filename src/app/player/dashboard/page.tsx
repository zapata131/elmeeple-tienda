/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import { Toolbar } from '@/components/Toolbar';
import Link from 'next/link';

export default function PlayerDashboardPage() {
  const [onlyDomestic, setOnlyDomestic] = useState(true);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortPreference, setSortPreference] = useState('totalCost');
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    const savedDom = localStorage.getItem('meeple_pref_domestic');
    const savedStock = localStorage.getItem('meeple_pref_instock');
    const savedSort = localStorage.getItem('meeple_pref_sort');

    if (savedDom !== null) setOnlyDomestic(savedDom === 'true');
    if (savedStock !== null) setInStockOnly(savedStock === 'true');
    if (savedSort) setSortPreference(savedSort);
  }, []);

  const handleSave = () => {
    localStorage.setItem('meeple_pref_domestic', String(onlyDomestic));
    localStorage.setItem('meeple_pref_instock', String(inStockOnly));
    localStorage.setItem('meeple_pref_sort', sortPreference);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 select-none">
      <Toolbar />

      <header className="bg-white border-b border-gray-200 py-6 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <span>Perfil de comprador y preferencias</span>
              <span className="text-base" title="México">🇲🇽</span>
            </h1>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Administra tu cuenta de jugador y personaliza cómo exploras las ofertas en México ($ MXN).
            </p>
          </div>
          <Link
            href="/catalog"
            className="text-xs font-bold text-indigo-650 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl transition-colors shadow-sm"
          >
            ← Ir al catálogo
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto py-10 px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Mock User Identity Card */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>Identidad del usuario mock</span>
              <span className="text-sm">⭐</span>
            </h2>

            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center text-lg shadow-inner">
                SM
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">Sofía M.</p>
                <p className="text-xs text-gray-500 truncate">sofia@meeple.mx</p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-400">Rol activo:</span>
                <span className="font-bold text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded">Jugador / Comprador</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-400">Ubicación:</span>
                <span className="font-bold text-gray-800">CDMX, México 🇲🇽</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-400">Moneda base:</span>
                <span className="font-bold text-gray-800">Pesos ($ MXN)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Control Panel */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <span>Preferencias de búsqueda en catálogo</span>
                <span className="text-sm">🎲</span>
              </h2>
              <p className="text-xs text-gray-500">
                Ajusta la visibilidad y el orden en que se presentan los juegos y las tiendas socias.
              </p>
            </div>

            <div className="flex flex-col gap-5 pt-4 border-t border-gray-100">
              {/* Tactile Switch 1: Domestic Stores Only */}
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex flex-col pr-4">
                  <span className="text-sm font-bold text-gray-800 group-hover:text-indigo-650 transition-colors">
                    Priorizar tiendas en México ($ MXN)
                  </span>
                  <span className="text-xs text-gray-500">
                    Muestra por defecto únicamente tiendas con inventario y envíos nacionales verificados.
                  </span>
                </div>
                <div className="relative inline-flex items-center flex-shrink-0">
                  <input
                    type="checkbox"
                    role="switch"
                    aria-checked={onlyDomestic}
                    checked={onlyDomestic}
                    onChange={(e) => setOnlyDomestic(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </div>
              </label>

              {/* Tactile Switch 2: In Stock Only */}
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex flex-col pr-4">
                  <span className="text-sm font-bold text-gray-800 group-hover:text-indigo-650 transition-colors">
                    Mostrar solo juegos en stock inmediato
                  </span>
                  <span className="text-xs text-gray-500">
                    Oculta artículos agotados o en preventa en las cuadrículas de búsqueda.
                  </span>
                </div>
                <div className="relative inline-flex items-center flex-shrink-0">
                  <input
                    type="checkbox"
                    role="switch"
                    aria-checked={inStockOnly}
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </div>
              </label>

              {/* Select: Default Sort */}
              <div className="flex flex-col gap-2 pt-2">
                <label htmlFor="sort-pref" className="text-sm font-bold text-gray-800">
                  Ordenación por defecto en comparativas
                </label>
                <select
                  id="sort-pref"
                  value={sortPreference}
                  onChange={(e) => setSortPreference(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-xs font-semibold rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="totalCost">Precio total más bajo (Base + Envío)</option>
                  <option value="basePrice">Solo precio base del juego</option>
                  <option value="bggRating">Calificación de la comunidad BGG</option>
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
              >
                Guardar preferencias
              </button>

              {savedMessage && (
                <span className="text-xs font-extrabold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 animate-fadeIn">
                  ✓ Preferencias guardadas exitosamente
                </span>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
