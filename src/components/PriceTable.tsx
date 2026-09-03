'use client';

import React, { useState } from 'react';
import { ExternalLink, CheckCircle, Tag, Sparkles } from 'lucide-react';
import { CalculatedOffer } from '../types';
import { LanguageBadge } from './LanguageBadge';
import { TactileSwitch } from './TactileSwitch';

interface PriceTableProps {
  offers: CalculatedOffer[];
}

export function PriceTable({ offers }: PriceTableProps) {
  const [inStockOnly, setInStockOnly] = useState(false);

  const filteredOffers = inStockOnly ? offers.filter(o => o.stock > 0) : offers;

  return (
    <div className="w-full bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      <div className="p-4 md:p-6 border-b border-stone-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-stone-50/50">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-[#3A3A3A]">
            Comparativa de ofertas por tienda
          </h2>
          <p className="text-xs md:text-sm text-stone-500 mt-0.5">
            Precios actualizados en tiempo real ordenados por costo total entregado en México.
          </p>
        </div>
        <TactileSwitch
          id="stock-toggle"
          label="Solo ofertas con stock"
          checked={inStockOnly}
          onChange={setInStockOnly}
        />
      </div>

      {filteredOffers.length === 0 ? (
        <div className="p-8 text-center text-stone-500">
          <p className="text-sm">No hay ofertas disponibles con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="divide-y divide-stone-100">
          {filteredOffers.map((offer, index) => {
            const redirectUrl = `/api/redirect?offer_id=${offer.id}&store_id=${offer.store_id}&url=${encodeURIComponent(
              offer.store_product_url
            )}`;

            return (
              <div
                key={offer.id}
                className={`p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${
                  offer.is_best_price ? 'bg-[#FF9E8A]/5' : index % 2 === 0 ? 'bg-white' : 'bg-stone-50/30'
                }`}
              >
                {/* Store & badges */}
                <div className="flex items-center gap-3.5 min-w-[220px]">
                  <div className="w-12 h-12 rounded-xl bg-white border border-stone-200 p-1 flex items-center justify-center shadow-xs flex-shrink-0">
                    {offer.store.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={offer.store.logo_url}
                        alt={offer.store.name}
                        className="w-full h-full object-contain rounded"
                        loading="lazy"
                        onError={e => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-xs font-bold text-[#8367C7]">
                        {offer.store.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm md:text-base text-[#3A3A3A]">
                        {offer.store.name}
                      </span>
                      {offer.is_featured && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          Tienda recomendada
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <LanguageBadge language={offer.edition_language} />
                      <span className="text-xs text-stone-500 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        {offer.stock > 0 ? `${offer.stock} en stock` : 'Sin stock'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3-Part Delivered Cost Breakdown */}
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-start md:justify-center gap-2 sm:gap-6 text-xs md:text-sm text-stone-600">
                  <div>
                    <span className="text-stone-400 block text-[11px]">Precio base</span>
                    <span className="font-semibold text-stone-800 text-sm">
                      ${offer.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                    </span>
                  </div>
                  <span className="hidden sm:inline text-stone-300 text-lg">+</span>
                  <div>
                    <span className="text-stone-400 block text-[11px]">Envío nacional</span>
                    <span className="font-semibold text-stone-800 text-sm">
                      {offer.shipping.is_free_shipping ? (
                        <span className="text-emerald-700 font-bold">¡Envío gratis!</span>
                      ) : (
                        `$${offer.shipping.shipping_cost.toFixed(2)} MXN`
                      )}
                    </span>
                  </div>
                  <span className="hidden sm:inline text-stone-300 text-lg">=</span>
                  <div className="p-2 sm:p-0 rounded-lg bg-stone-100/50 sm:bg-transparent">
                    <span className="text-stone-400 block text-[11px]">Costo total entregado</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base md:text-lg font-black text-[#3A3A3A]">
                        ${offer.total_delivered_cost.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                      </span>
                      {offer.is_best_price && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF9E8A]/30 text-rose-950 border border-[#FF9E8A]">
                          Mejor precio
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Promo Code & Action Button */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
                  {offer.promo_code && (
                    <div className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-violet-50 text-[#8367C7] border border-violet-200 text-xs font-medium">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{offer.promo_code} (-{offer.discount_percent}%)</span>
                    </div>
                  )}

                  <a
                    href={redirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#8367C7] hover:bg-[#7254b8] active:scale-[0.98] transition-all shadow-sm"
                  >
                    <span>Ir a la tienda</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
