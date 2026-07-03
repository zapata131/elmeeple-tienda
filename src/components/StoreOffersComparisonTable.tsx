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

function renderEditionBadge(langCode: string) {
  const code = langCode.toLowerCase();
  let label = code.toUpperCase();
  let testIdKey = code;
  let badgeColor = 'bg-[#8367C7]/15 text-[#8367C7] border-[#8367C7]/30';

  if (code === 'es') {
    label = 'ES · Español';
    testIdKey = 'es';
    badgeColor = 'bg-[#8367C7]/15 text-indigo-950 border-[#8367C7]/40 font-extrabold';
  } else if (code === 'pt') {
    label = 'PT · Português';
    testIdKey = 'pt';
    badgeColor = 'bg-[#73D8D4]/20 text-teal-950 border-[#73D8D4]/40 font-extrabold';
  } else if (code === 'br') {
    label = 'BR · PT-Brasil';
    testIdKey = 'br';
    badgeColor = 'bg-[#73D8D4]/20 text-teal-950 border-[#73D8D4]/40 font-extrabold';
  } else if (code === 'en') {
    label = 'EN · English';
    testIdKey = 'en';
    badgeColor = 'bg-blue-50 text-blue-900 border-blue-200 font-extrabold';
  } else if (code === 'de') {
    label = 'DE · Deutsch';
    testIdKey = 'de';
    badgeColor = 'bg-amber-50 text-amber-900 border-amber-200 font-extrabold';
  } else if (code === 'multi') {
    label = 'MULTI · Multi-idioma';
    testIdKey = 'multi';
    badgeColor = 'bg-[#FF9E8A]/20 text-rose-950 border-[#FF9E8A]/40 font-extrabold';
  } else {
    label = code.toUpperCase();
    testIdKey = code;
  }

  return (
    <span
      data-testid={`edition-badge-${testIdKey}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border shadow-2xs ${badgeColor}`}
    >
      <svg className="w-3.5 h-3.5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
      <span>{label}</span>
    </span>
  );
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
            <div className="relative inline-flex items-center">
              <input
                type="checkbox"
                role="switch"
                aria-checked={onlyDomestic}
                checked={onlyDomestic}
                onChange={(e) => setOnlyDomestic(e.target.checked)}
                onClick={(e) => e.stopPropagation()}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-650 cursor-pointer"></div>
            </div>
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
          <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Has desactivado el filtro local. Ten en cuenta que las tiendas internacionales pueden implicar mayores costos de envío y aranceles de importación en aduanas.</span>
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
                const originCountryCode = (offer.store_country || 'ES').toUpperCase();
                const isInternational = originCountryCode !== selectedCountry.toUpperCase();

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
                          <span
                            className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono font-bold bg-gray-100 text-gray-700 border border-gray-300 rounded"
                            title={`Origen: ${originCountryCode}`}
                          >
                            {originCountryCode}
                          </span>
                          <Link
                            href={`/store/${offer.store_id}`}
                            className="font-bold text-gray-900 hover:text-indigo-650 transition-colors"
                          >
                            {offer.store_name}
                          </Link>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-150 rounded px-1.5 py-0.5 font-extrabold w-max mt-0.5">
                          <svg className="w-3 h-3 text-emerald-600 fill-emerald-600" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span>{offer.rating || 4.9} ({offer.review_count || 120}) ·</span>
                          <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          <span>Esquinas Protegidas</span>
                        </span>
                      </div>
                    </td>

                    {/* Language */}
                    <td className="px-6 py-4 text-lg">
                      {renderEditionBadge(offer.edition_language)}
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
