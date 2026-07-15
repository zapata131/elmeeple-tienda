'use client';

import React, { useState } from 'react';
import { CalculatedOffer } from '@/types';
import { LanguageBadge } from './LanguageBadge';
import { TactileSwitch } from './TactileSwitch';

interface PriceComparisonTableProps {
  bggId: number;
  offers: CalculatedOffer[];
}

export const PriceComparisonTable: React.FC<PriceComparisonTableProps> = ({ bggId, offers }) => {
  const [isDomesticOnly, setIsDomesticOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'total' | 'price'>('total');

  const filteredOffers = offers.filter((offer) => {
    if (isDomesticOnly && !offer.is_domestic) return false;
    return true;
  });

  const sortedOffers = [...filteredOffers].sort((a, b) => {
    // Sponsored featured offers always appear at top if sorting by total
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;

    if (sortBy === 'total') {
      return a.total_delivered_cost - b.total_delivered_cost;
    }
    return a.price - b.price;
  });

  if (offers.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-white border border-gray-200 text-center">
        <p className="text-[#3A3A3A] font-medium">Actualmente no hay ofertas disponibles para este juego.</p>
        <p className="text-xs text-gray-500 mt-1">Nuestros robots de búsqueda actualizan el catálogo diariamente.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#8367C7]/20 shadow-sm overflow-hidden">
      {/* Table Controls & Filter Header */}
      <div className="p-4 sm:p-6 bg-[#F5F0E9]/50 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#3A3A3A]">Comparativa de ofertas por tienda</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Costos ordenados por precio final entregado en Pesos Mexicanos ($ MXN)
          </p>
        </div>

        <div className="flex items-center gap-6">
          <TactileSwitch
            id="domestic-filter"
            checked={isDomesticOnly}
            onChange={setIsDomesticOnly}
            label="Solo tiendas nacionales"
          />

          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 font-medium">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'total' | 'price')}
              className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-[#3A3A3A] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#8367C7]"
            >
              <option value="total">Costo total entregado</option>
              <option value="price">Precio base</option>
            </select>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 bg-gray-50/50">
              <th className="py-3.5 px-4 sm:px-6 font-semibold">Tienda</th>
              <th className="py-3.5 px-4 font-semibold">Edición</th>
              <th className="py-3.5 px-4 font-semibold text-right">Precio base</th>
              <th className="py-3.5 px-4 font-semibold text-right">Envío estimado</th>
              <th className="py-3.5 px-4 font-semibold text-right">Costo total entregado</th>
              <th className="py-3.5 px-4 sm:px-6 text-center font-semibold">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {sortedOffers.map((offer, index) => {
              const isLowest = index === 0;

              return (
                <tr
                  key={offer.id}
                  className={`transition-colors hover:bg-[#F5F0E9]/40 ${
                    offer.is_featured ? 'bg-[#FF9E8A]/10' : ''
                  }`}
                >
                  {/* Store Name & Badges */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      {offer.store_logo ? (
                        <img
                          src={offer.store_logo}
                          alt={offer.store_name}
                          className="w-8 h-8 rounded-lg object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-[#8367C7]/10 text-[#8367C7] flex items-center justify-center font-bold text-xs">
                          {offer.store_name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#3A3A3A]">{offer.store_name}</span>
                          {offer.is_featured && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#FF9E8A]/30 text-rose-950">
                              ★ Tienda recomendada
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-400">
                          {offer.is_domestic ? '🇲🇽 Envío nacional' : '✈️ Internacional'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Language Badge */}
                  <td className="py-4 px-4">
                    <LanguageBadge language={offer.edition_language} />
                  </td>

                  {/* Base Price */}
                  <td className="py-4 px-4 text-right font-semibold text-[#3A3A3A]">
                    ${offer.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </td>

                  {/* Shipping Cost */}
                  <td className="py-4 px-4 text-right text-xs text-gray-600">
                    {offer.qualifies_free_shipping ? (
                      <span className="font-bold text-emerald-600">¡Envío gratis!</span>
                    ) : (
                      `+$${offer.shipping_cost.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`
                    )}
                  </td>

                  {/* 3-Part Total Cost */}
                  <td className="py-4 px-4 text-right">
                    <div className="inline-block text-right">
                      <span
                        className={`text-base font-extrabold ${
                          isLowest ? 'text-[#8367C7]' : 'text-[#3A3A3A]'
                        }`}
                      >
                        ${offer.total_delivered_cost.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                      </span>
                      {isLowest && (
                        <div className="text-[10px] font-bold text-[#2B8C88] bg-[#73D8D4]/30 px-1.5 py-0.5 rounded text-center mt-0.5">
                          Mejor precio actual
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Affiliate CTA */}
                  <td className="py-4 px-4 sm:px-6 text-center">
                    <a
                      href={`/api/redirect?store_id=${offer.store_id}&bgg_id=${bggId}&url=${encodeURIComponent(
                        offer.store_product_url
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold bg-[#8367C7] text-white hover:bg-[#8367C7]/90 shadow-sm transition-all transform active:scale-95"
                    >
                      Ir a la tienda ➔
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
