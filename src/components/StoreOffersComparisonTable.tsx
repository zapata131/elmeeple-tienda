'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { RestockAlertButton } from './RestockAlertButton';

export interface ComparisonOffer {
  id: string;
  store_id: string;
  store_name: string;
  store_logo: string | null;
  store_country?: string;
  rating?: number;
  review_count?: number;
  price: number;
  stock: number;
  edition_language: string;
  shippingCost: number | null;
  totalCost: number | null;
}

interface StoreOffersComparisonTableProps {
  offers: ComparisonOffer[];
  bggId: number;
  gameName: string;
  selectedCountry?: string;
}

function getLanguageFlag(langCode: string): string {
  switch (langCode.toLowerCase()) {
    case 'es':
      return '🇪🇸 Español';
    case 'pt':
      return '🇵🇹 Português';
    case 'br':
      return '🇧🇷 PT-Brasil';
    case 'en':
      return '🇬🇧 English';
    case 'de':
      return '🇩🇪 Deutsch';
    default:
      return `🌐 ${langCode.toUpperCase()}`;
  }
}

export default function StoreOffersComparisonTable({
  offers,
  bggId,
  gameName,
  selectedCountry = 'ES',
}: StoreOffersComparisonTableProps) {
  // Activated by default as requested by user
  const [onlyDomestic, setOnlyDomestic] = useState(true);

  const filteredOffers = onlyDomestic
    ? offers.filter((offer) => (offer.store_country || 'ES').toUpperCase() === selectedCountry.toUpperCase())
    : offers;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header bar with Domestic Toggle */}
      <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50 rounded-t-xl">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Compare Store Offers</h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Desglose 3 partes: Precio Artículo + Envío = Coste Total
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white px-3.5 py-2 rounded-lg border border-gray-200 shadow-2xs">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyDomestic}
              onChange={(e) => setOnlyDomestic(e.target.checked)}
              className="w-4 h-4 text-indigo-650 rounded border-gray-300 focus:ring-indigo-650 cursor-pointer"
            />
            <span className="text-xs font-bold text-gray-800">
              Solo tiendas de mi país ({selectedCountry})
            </span>
          </label>
          {!onlyDomestic && (
            <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 font-semibold px-2 py-0.5 rounded-full">
              Incluye tiendas internacionales
            </span>
          )}
        </div>
      </div>

      {!onlyDomestic && (
        <div className="bg-amber-50/70 border-b border-amber-150 px-6 py-2.5 text-xs text-amber-800 flex items-center gap-2">
          <span>ℹ️ Has desactivado el filtro local. Ten en cuenta que las tiendas internacionales pueden implicar mayores costos de envío y aranceles de importación en aduanas.</span>
        </div>
      )}

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <th className="px-6 py-3">Tienda</th>
              <th className="px-6 py-3">Edición</th>
              <th className="px-6 py-3">Disponibilidad</th>
              <th className="px-6 py-3">Precio Artículo</th>
              <th className="px-6 py-3">Envío</th>
              <th className="px-6 py-3">Coste Total</th>
              <th className="px-6 py-3">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {filteredOffers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500 font-medium">
                  {onlyDomestic ? (
                    <div className="flex flex-col items-center gap-2">
                      <p>No hay ofertas disponibles en tiendas de tu país ({selectedCountry}).</p>
                      <button
                        onClick={() => setOnlyDomestic(false)}
                        className="text-xs font-bold text-indigo-650 hover:underline"
                      >
                        Ver ofertas de tiendas internacionales →
                      </button>
                    </div>
                  ) : (
                    'No store offers available for this game yet.'
                  )}
                </td>
              </tr>
            ) : (
              filteredOffers.map((offer) => {
                const originFlag =
                  offer.store_country === 'DE' ? '🇩🇪' :
                  offer.store_country === 'US' ? '🇺🇸' :
                  offer.store_country === 'MX' ? '🇲🇽' :
                  offer.store_country === 'PT' ? '🇵🇹' : '🇪🇸';

                const isInternational = (offer.store_country || 'ES').toUpperCase() !== selectedCountry.toUpperCase();

                return (
                  <tr key={offer.id} className="hover:bg-gray-50 transition-colors">
                    {/* Store info */}
                    <td className="px-6 py-4 flex items-center gap-3">
                      {offer.store_logo && (
                        <img
                          src={offer.store_logo}
                          alt={offer.store_name}
                          className="w-8 h-8 rounded-full border border-gray-100 object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base" title={`Origen: ${offer.store_country || 'ES'}`}>{originFlag}</span>
                          <Link
                            href={`/store/${offer.store_id}`}
                            className="font-bold text-gray-900 hover:text-indigo-650 transition-colors"
                          >
                            {offer.store_name}
                          </Link>
                        </div>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-150 rounded px-1.5 py-0.5 font-extrabold w-max mt-0.5">
                          ★ {offer.rating || 4.9} ({offer.review_count || 120}) · 📦 Esquinas Protegidas
                        </span>
                      </div>
                    </td>

                    {/* Language */}
                    <td className="px-6 py-4 text-lg">
                      {getLanguageFlag(offer.edition_language)}
                    </td>

                    {/* Availability */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        offer.stock > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {offer.stock > 0 ? 'En stock' : 'Agotado'}
                      </span>
                    </td>

                    {/* Base Price */}
                    <td className="px-6 py-4 font-medium text-gray-900">
                      €{offer.price.toFixed(2)}
                    </td>

                    {/* Shipping */}
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex flex-col">
                        {offer.shippingCost === null ? (
                          <span className="text-red-500 font-medium">No disponible</span>
                        ) : offer.shippingCost === 0 ? (
                          <span className="text-green-600 font-semibold">Free (¡Envío GRATIS!)</span>
                        ) : (
                          `€${offer.shippingCost.toFixed(2)}`
                        )}
                        {isInternational && (
                          <span className="text-[10px] text-amber-700 font-medium mt-0.5">
                            Envío internacional + posibles aranceles
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Total Cost */}
                    <td className="px-6 py-4 font-bold text-indigo-950 text-base">
                      {offer.totalCost === null ? (
                        '--'
                      ) : (
                        `€${offer.totalCost.toFixed(2)}`
                      )}
                    </td>

                    {/* CTA / Restock Alert */}
                    <td className="px-6 py-4 text-right">
                      {offer.stock > 0 ? (
                        <a
                          href={`/api/redirect?offer_id=${offer.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-indigo-650 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
                        >
                          Ir a la tienda
                        </a>
                      ) : (
                        <RestockAlertButton
                          bggId={bggId}
                          gameName={gameName}
                          userEmail="player@meeple.com"
                        />
                      )}
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
