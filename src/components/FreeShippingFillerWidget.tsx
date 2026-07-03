'use client';

import React, { useEffect, useState } from 'react';
import { FillerProduct } from '@/app/api/cart/fillers/route';

interface Props {
  storeId: string;
  storeName: string;
  currentSubtotal: number;
  freeShippingThreshold: number | null;
  onAddFiller?: (filler: FillerProduct) => void;
}

export function FreeShippingFillerWidget({
  storeId,
  storeName,
  currentSubtotal,
  freeShippingThreshold,
  onAddFiller,
}: Props) {
  const gap = freeShippingThreshold !== null ? freeShippingThreshold - currentSubtotal : 0;
  const showHelper = freeShippingThreshold !== null && gap > 0.01 && gap <= 15.0;

  const [fillers, setFillers] = useState<FillerProduct[]>([]);
  const [loading, setLoading] = useState(showHelper);
  const [addedIds, setAddedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!showHelper) return;

    let isMounted = true;

    fetch(`/api/cart/fillers?storeId=${storeId}&gap=${gap.toFixed(2)}`)
      .then((res) => (res.ok ? res.json() : { fillers: [] }))
      .then((data) => {
        if (isMounted && Array.isArray(data.fillers)) {
          setFillers(data.fillers);
        }
      })
      .catch(() => {
        if (isMounted) setFillers([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [storeId, gap, showHelper]);

  if (!showHelper) return null;

  const handleAdd = (item: FillerProduct) => {
    setAddedIds((prev) => [...prev, item.id]);
    if (onAddFiller) {
      onAddFiller(item);
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-sm my-4 text-gray-900">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚚</span>
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
              ¡Estás a solo €{gap.toFixed(2)} del Envío Gratis en {storeName}!
            </h4>
            <p className="text-xs text-amber-800 mt-0.5">
              Añade un pequeño accesorio o juego de bolsillo y ahórrate los portes de entrega.
            </p>
          </div>
        </div>
        <span className="text-xs font-bold bg-amber-200/80 text-amber-950 px-3 py-1 rounded-full shrink-0">
          Umbral: €{freeShippingThreshold?.toFixed(2)}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-4 text-xs text-amber-800 font-semibold gap-2">
          <div className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          Buscando accesorios óptimos en almacén...
        </div>
      ) : fillers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          {fillers.map((item) => {
            const isAdded = addedIds.includes(item.id);
            return (
              <div
                key={item.id}
                className="bg-white/90 border border-amber-200/60 rounded-xl p-3 flex flex-col justify-between shadow-xs hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start gap-2.5">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded-lg border border-gray-200 shrink-0"
                    />
                  ) : (
                    <span className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-base shrink-0">
                      🃏
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-bold text-amber-700 block truncate">
                      {item.category}
                    </span>
                    <span className="text-xs font-extrabold text-gray-900 line-clamp-2 leading-snug">
                      {item.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-150">
                  <span className="text-sm font-black text-gray-950">€{item.price.toFixed(2)}</span>
                  <button
                    type="button"
                    onClick={() => handleAdd(item)}
                    disabled={isAdded}
                    className={`text-xs font-extrabold px-3 py-1 rounded-lg transition-colors ${
                      isAdded
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                    }`}
                  >
                    {isAdded ? '✓ Añadido' : 'Añadir +'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-amber-700 font-medium mt-3">No hay accesorios en este rango de precio.</p>
      )}
    </div>
  );
}
