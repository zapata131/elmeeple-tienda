import React from 'react';
import Link from 'next/link';

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
  store_product_url?: string;
  is_featured?: boolean;
}

interface StoreOffersComparisonTableProps {
  offers: ComparisonOffer[];
  bggId: number;
  gameName: string;
  selectedCountry?: string;
  historicalMinPrice?: number | null;
}

const renderEditionBadge = (langCode?: string) => {
  const code = (langCode || 'es').toLowerCase().trim();

  switch (code) {
    case 'es':
      return (
        <span
          data-testid="edition-badge-es"
          className="inline-flex items-center gap-1 bg-[#8367C7]/15 text-[#8367C7] border border-[#8367C7]/30 text-xs font-bold px-2 py-0.5 rounded shadow-2xs select-none"
          title="Edición en Español"
        >
          <svg className="w-3 h-3 text-[#8367C7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          <span>ES</span>
        </span>
      );
    case 'pt':
    case 'br':
      return (
        <span
          data-testid="edition-badge-pt"
          className="inline-flex items-center gap-1 bg-[#73D8D4]/20 text-[#2B8C88] border border-[#73D8D4]/50 text-xs font-bold px-2 py-0.5 rounded shadow-2xs select-none"
          title="Edição em Português"
        >
          <svg className="w-3 h-3 text-[#2B8C88]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          <span>PT</span>
        </span>
      );
    case 'en':
      return (
        <span
          data-testid="edition-badge-en"
          className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 border border-gray-300 text-xs font-bold px-2 py-0.5 rounded shadow-2xs select-none"
          title="English Edition"
        >
          <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          <span>EN</span>
        </span>
      );
    default:
      return (
        <span
          data-testid={`edition-badge-${code}`}
          className="inline-flex items-center gap-1 bg-[#FF9E8A]/20 text-[#C9533B] border border-[#FF9E8A]/40 text-xs font-bold px-2 py-0.5 rounded shadow-2xs select-none uppercase"
          title={`Edición: ${code.toUpperCase()}`}
        >
          <svg className="w-3 h-3 text-[#C9533B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          <span>{code.toUpperCase()}</span>
        </span>
      );
  }
};

export default function StoreOffersComparisonTable({
  offers,
  bggId: _bggId,
  gameName: _gameName,
  selectedCountry = 'MX',
  historicalMinPrice,
}: StoreOffersComparisonTableProps) {
  const filteredOffers = offers.slice().sort((a, b) => {
    const aInStock = a.stock > 0;
    const bInStock = b.stock > 0;
    if (aInStock && !bInStock) return -1;
    if (!aInStock && bInStock) return 1;
    if (a.totalCost === null) return 1;
    if (b.totalCost === null) return -1;
    return a.totalCost - b.totalCost;
  });

  const availableCosts = filteredOffers
    .filter((o) => o.stock > 0 && o.totalCost !== null)
    .map((o) => o.totalCost as number);
  const minCurrentCost = availableCosts.length > 0 ? Math.min(...availableCosts) : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header bar */}
      <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50 rounded-t-xl">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Comparativa de ofertas por tienda</h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Desglose 3 partes: Precio artículo + Envío = Coste total ($ MXN)
          </p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <th className="px-6 py-3">Tienda</th>
              <th className="px-6 py-3">Edición</th>
              <th className="px-6 py-3">Disponibilidad</th>
              <th className="px-6 py-3">Precio artículo</th>
              <th className="px-6 py-3">Envío</th>
              <th className="px-6 py-3">Coste total</th>
              <th className="px-6 py-3">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {filteredOffers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500 font-medium">
                  No hay ofertas disponibles para este juego en este momento.
                </td>
              </tr>
            ) : (
              filteredOffers.map((offer) => {
                const originCountryCode = (offer.store_country || 'MX').toUpperCase();
                const isInternational = originCountryCode !== selectedCountry.toUpperCase();
                const isBestCurrentOffer = minCurrentCost !== null && offer.stock > 0 && offer.totalCost === minCurrentCost;
                const isHistoricalRecord = historicalMinPrice != null && offer.totalCost !== null && offer.totalCost <= historicalMinPrice * 1.03;

                return (
                  <tr key={offer.id} data-testid={`store-offer-row-${offer.id}`} className="hover:bg-gray-50 transition-colors">
                    {/* Store info */}
                    <td className="px-6 py-4 flex items-center gap-3">
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
                            className="font-extrabold text-gray-900 text-sm hover:text-indigo-600 hover:underline transition-colors"
                          >
                            {offer.store_name}
                          </Link>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                          <span>Envío verificado en México 🇲🇽</span>
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
                      ${offer.price.toFixed(2)}
                    </td>

                    {/* Shipping */}
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex flex-col">
                        {offer.shippingCost === null ? (
                          <span className="text-red-500 font-medium">No disponible</span>
                        ) : offer.shippingCost === 0 ? (
                          <span className="text-green-600 font-semibold">Gratis (Supera umbral de envío gratis)</span>
                        ) : (
                          <span>
                            ${offer.shippingCost.toFixed(2)}{' '}
                            <span className="text-[11px] text-gray-500 block">
                              (Gratis desde ${((offer as { shipping_free_threshold?: number }).shipping_free_threshold || 1200).toLocaleString('es-MX')})
                            </span>
                          </span>
                        )}
                        {isInternational && (
                          <span className="text-[10px] text-amber-700 font-medium mt-0.5">
                            Envío internacional + posibles aranceles
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Total Cost */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-bold text-indigo-950 text-base">
                          {offer.totalCost === null ? (
                            '--'
                          ) : (
                            `$${offer.totalCost.toFixed(2)}`
                          )}
                        </span>
                        {isBestCurrentOffer && (
                          <span
                            data-testid="best-price-badge-current"
                            className="inline-flex items-center gap-1 text-[11px] text-teal-950 bg-[#73D8D4]/25 border border-[#73D8D4]/60 rounded-md px-2 py-0.5 font-extrabold shadow-2xs"
                          >
                            <svg className="w-3 h-3 text-teal-800 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>★ Mejor precio actual</span>
                          </span>
                        )}
                        {isHistoricalRecord && (
                          <span
                            data-testid="best-price-badge-historical"
                            className="inline-flex items-center gap-1 text-[11px] text-rose-950 bg-[#FF9E8A]/25 border border-[#FF9E8A]/60 rounded-md px-2 py-0.5 font-extrabold shadow-2xs"
                          >
                            <svg className="w-3 h-3 text-rose-900 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <span>★ Récord mínimo histórico</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* CTA / Restock Alert */}
                    <td className="px-6 py-4 text-right">
                      {offer.stock > 0 ? (
                        <a
                          href={`/api/redirect?offer_id=${offer.id}&url=${encodeURIComponent(offer.store_product_url || '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs hover:shadow-md transition-all duration-200 group"
                        >
                          <span>Ir a la tienda</span>
                          <svg className="w-3.5 h-3.5 text-indigo-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400 font-semibold">Agotado en tienda</span>
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
