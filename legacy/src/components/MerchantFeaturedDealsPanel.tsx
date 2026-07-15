'use client';

import React, { useState } from 'react';

export interface MerchantDealItem {
  id: string;
  bgg_id: number;
  game_name: string;
  price: number;
  stock: number;
  is_featured?: boolean;
}

interface MerchantFeaturedDealsPanelProps {
  storeId: string;
  initialDeals?: MerchantDealItem[];
  onToggleFeatured?: (dealId: string, featured: boolean) => void;
}

export function MerchantFeaturedDealsPanel({
  storeId,
  initialDeals = [],
  onToggleFeatured,
}: MerchantFeaturedDealsPanelProps) {
  const [deals, setDeals] = useState<MerchantDealItem[]>(initialDeals);

  const handleToggle = (dealId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setDeals((prev) =>
      prev.map((item) => (item.id === dealId ? { ...item, is_featured: nextStatus } : item))
    );
    if (onToggleFeatured) {
      onToggleFeatured(dealId, nextStatus);
    }
  };

  return (
    <div data-store-id={storeId} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-950">Gestión de ofertas destacadas patrocinadas</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Activa la posición prioritaria en la tabla comparativa de precios con el distintivo de tienda recomendada.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8367C7]/15 text-[#8367C7] border border-[#8367C7]/30 text-xs font-bold">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <span>Posición patrocinada activa</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs text-gray-700">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 font-bold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-3">Juego de mesa</th>
              <th className="px-6 py-3">Precio base</th>
              <th className="px-6 py-3">Stock disponible</th>
              <th className="px-6 py-3">Posición en tabla</th>
              <th className="px-6 py-3">Destacar en comparativa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {deals.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400 font-medium">
                  No tienes ofertas activas en el catálogo sincronizado.
                </td>
              </tr>
            ) : (
              deals.map((deal) => {
                const featured = !!deal.is_featured;
                return (
                  <tr key={deal.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{deal.game_name}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">€{deal.price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-semibold ${
                          deal.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {deal.stock > 0 ? `${deal.stock} uds.` : 'Agotado'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {featured ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#8367C7]/15 text-[#8367C7] border border-[#8367C7]/30">
                          ★ Tienda recomendada
                        </span>
                      ) : (
                        <span className="text-gray-400 font-medium">Estándar</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <label className="inline-flex items-center cursor-pointer select-none">
                        <div className="relative inline-flex items-center">
                          <input
                            type="checkbox"
                            role="switch"
                            aria-checked={featured}
                            checked={featured}
                            onChange={() => handleToggle(deal.id, featured)}
                            onClick={(e) => e.stopPropagation()}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8367C7] cursor-pointer"></div>
                        </div>
                      </label>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
