'use client';

import React, { useState } from 'react';
import { CartCombinationResult } from '@/utils/cart_optimizer';

interface AvailableGame {
  bgg_id: number;
  name: string;
  thumbnail: string | null;
}

interface Props {
  initialGames: AvailableGame[];
}

const COUNTRIES = [
  { code: 'ES', label: 'España (Península y Baleares)' },
  { code: 'PT', label: 'Portugal' },
  { code: 'MX', label: 'México' },
  { code: 'BR', label: 'Brasil' },
  { code: 'AR', label: 'Argentina' },
  { code: 'CO', label: 'Colombia' },
  { code: 'CL', label: 'Chile' },
  { code: 'PE', label: 'Perú' },
];

export function CartOptimizerPanel({ initialGames }: Props) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [country, setCountry] = useState('ES');
  const [results, setResults] = useState<CartCombinationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const toggleGame = (bggId: number) => {
    setSelectedIds((prev) =>
      prev.includes(bggId) ? prev.filter((id) => id !== bggId) : [...prev, bggId]
    );
  };

  const handleOptimize = async () => {
    if (selectedIds.length === 0) {
      setErrorMsg('Selecciona al menos un juego de mesa para optimizar la compra.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setHasSearched(false);

    try {
      const res = await fetch('/api/cart/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameIds: selectedIds, destinationCountry: country }),
      });

      const data = await res.json();
      if (res.ok) {
        setResults(data.combinations || []);
        setHasSearched(true);
      } else {
        setErrorMsg(data.error || 'Error al calcular combinaciones óptimas.');
      }
    } catch {
      setErrorMsg('Error de red de conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* Selection Box */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Selecciona tu Lista de Compra (Wishlist)</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Marca los juegos que deseas combinar. Nuestro algoritmo evaluará todas las tiendas para minimizar costes de productos y envíos.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="country-select" className="text-xs font-bold text-gray-700">
              Envío a:
            </label>
            <select
              id="country-select"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-150 text-red-700 text-xs font-semibold px-4 py-2.5 rounded-lg">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
          {initialGames.map((game) => {
            const isSelected = selectedIds.includes(game.bgg_id);
            return (
              <div
                key={game.bgg_id}
                onClick={() => toggleGame(game.bgg_id)}
                className={`cursor-pointer border rounded-xl p-3 flex items-center gap-3 transition-all select-none ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}} // handled by div click
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-bold text-gray-900 truncate">{game.name}</h3>
                  <span className="text-[10px] text-gray-400 font-mono">BGG #{game.bgg_id}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-bold text-gray-600">
            Juegos seleccionados: <span className="text-indigo-650 font-extrabold">{selectedIds.length}</span>
          </span>
          <button
            onClick={handleOptimize}
            disabled={isLoading || selectedIds.length === 0}
            className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-md disabled:opacity-50"
          >
            {isLoading ? 'Calculando Combinaciones...' : 'Optimizar Carrito Ahora'}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {hasSearched && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-gray-950">Top 3 Combinaciones Óptimas</h2>
            <span className="text-xs font-bold text-gray-500">
              Desglose consolidado incluyendo envíos a <span className="text-gray-900 font-extrabold">{country}</span>
            </span>
          </div>

          {results.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-8 rounded-2xl text-center flex flex-col gap-2">
              <span className="text-2xl">⚠️</span>
              <h3 className="font-bold text-sm">Sin combinación disponible en stock</h3>
              <p className="text-xs text-amber-800 max-w-md mx-auto">
                No hemos podido encontrar tiendas con disponibilidad en stock para todos los juegos seleccionados simultáneamente en la región.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {results.map((combo, idx) => (
                <div
                  key={combo.id}
                  className={`bg-white border rounded-2xl p-6 flex flex-col justify-between gap-6 shadow-sm relative ${
                    idx === 0 ? 'border-indigo-600 ring-2 ring-indigo-600/10 shadow-md' : 'border-gray-200'
                  }`}
                >
                  {idx === 0 && (
                    <span className="absolute -top-3 left-6 bg-indigo-650 text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-0.5 rounded-full shadow-sm">
                      Opción #1: Más Económica
                    </span>
                  )}

                  <div className="flex flex-col gap-4 mt-2">
                    <div className="flex items-baseline justify-between border-b border-gray-150 pb-4">
                      <div>
                        <span className="text-xs text-gray-500 font-bold uppercase">Coste Total</span>
                        <div className="text-2xl font-extrabold text-gray-950">€{combo.totalCost.toFixed(2)}</div>
                      </div>
                      <div className="text-right text-xs">
                        <span className="text-gray-500 block">Tiendas: <strong className="text-gray-900 font-extrabold">{combo.storeCount}</strong></span>
                        <span className="text-indigo-650 font-bold block">Envío: €{combo.totalShippingCost.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Store Breakdowns */}
                    <div className="flex flex-col gap-4">
                      {combo.storeBreakdowns.map((store) => (
                        <div key={store.storeId} className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-900">{store.storeName}</span>
                            {store.qualifiesForFreeShipping ? (
                              <span className="bg-green-100 text-green-800 text-[9px] font-extrabold px-2 py-0.5 rounded">
                                Envío GRATIS
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-gray-600">
                                Envío: €{store.shippingFee.toFixed(2)}
                              </span>
                            )}
                          </div>

                          <ul className="divide-y divide-gray-200/60 text-xs text-gray-700">
                            {store.items.map((item) => (
                              <li key={item.bggId} className="py-1.5 flex items-center justify-between">
                                <span className="truncate pr-2 font-medium">{item.gameName}</span>
                                <span className="font-bold text-gray-950 shrink-0">€{item.price.toFixed(2)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-150 text-center">
                    <p className="text-[10px] text-gray-400">
                      Haz clic en los productos o visita cada tienda asociada para realizar el pedido con nuestras tarifas verificadas.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
