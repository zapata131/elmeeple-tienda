'use client';

import React, { useState, useEffect } from 'react';
import { Store, QueueItem, StoreGameOffer } from '@/types';
import Link from 'next/link';

export default function MerchantDashboardPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [unmatchedItems, setUnmatchedItems] = useState<QueueItem[]>([]);
  const [offers, setOffers] = useState<StoreGameOffer[]>([]);
  const [mappingInput, setMappingInput] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const resSearch = await fetch('/api/search');
        if (resSearch.ok) {
          const data = await resSearch.json();
          setStores(data.stores || []);
          if (data.stores && data.stores.length > 0) {
            setSelectedStoreId(data.stores[0].id);
          }
        }
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!selectedStoreId) return;

    async function loadStoreData() {
      try {
        const resMap = await fetch(`/api/merchant/mapping?store_id=${selectedStoreId}`);
        if (resMap.ok) {
          const data = await resMap.json();
          setUnmatchedItems(data.items || []);
        }

        const resSearch = await fetch('/api/search');
        if (resSearch.ok) {
          const data = await resSearch.json();
          const allGames = data.games || [];
          const storeOffersList: StoreGameOffer[] = [];
          allGames.forEach((g: any) => {
            if (g.offers) {
              g.offers.forEach((o: any) => {
                if (o.store_id === selectedStoreId) {
                  storeOffersList.push(o);
                }
              });
            }
          });
          setOffers(storeOffersList);
        }
      } catch {
        // Fallback silently
      }
    }
    loadStoreData();
  }, [selectedStoreId]);

  const activeStore = stores.find((s) => s.id === selectedStoreId);

  const handleMapSku = async (queueItem: QueueItem) => {
    const bggId = mappingInput[queueItem.id];
    if (!bggId) return;

    try {
      const res = await fetch('/api/merchant/mapping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: selectedStoreId,
          merchant_sku: queueItem.ean || queueItem.title,
          bgg_id: parseInt(bggId, 10),
        }),
      });

      if (res.ok) {
        setFeedback(`¡Producto "${queueItem.title}" vinculado con éxito al BGG ID ${bggId}!`);
        setUnmatchedItems((prev) => prev.filter((item) => item.id !== queueItem.id));
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch {
      setFeedback('Error al vincular el producto.');
    }
  };

  const handleToggleFeatured = async (offerId: string, currentFeatured: boolean) => {
    try {
      const res = await fetch('/api/merchant/featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offer_id: offerId,
          is_featured: !currentFeatured,
        }),
      });

      if (res.ok) {
        setOffers((prev) =>
          prev.map((o) => (o.id === offerId ? { ...o, is_featured: !currentFeatured } : o))
        );
      }
    } catch {
      // Fallback
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-[#3A3A3A] font-medium">Cargando portal de tienda...</div>;
  }

  return (
    <div className="space-y-10">
      {/* Header & Store Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#3A3A3A]">Portal de autoservicio para tiendas</h1>
          <p className="text-xs text-gray-500 mt-1">
            Administra el estado de tu feed de productos, mapeo manual de SKUs y ofertas destacadas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-gray-600">Seleccionar tienda:</label>
          <select
            value={selectedStoreId}
            onChange={(e) => setSelectedStoreId(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-sm font-bold focus:ring-2 focus:ring-[#8367C7] focus:outline-none"
          >
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold shadow-sm">
          {feedback}
        </div>
      )}

      {/* Feed Diagnostics & Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-gray-400 uppercase">Estado del feed</span>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-lg font-extrabold text-[#3A3A3A] uppercase">
              {activeStore?.feed_status || 'Activo'}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Formato: <span className="font-bold">{activeStore?.feed_type || 'Shopify JSON'}</span>
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-gray-400 uppercase">Productos procesados</span>
          <div className="text-2xl font-extrabold text-[#8367C7]">
            {activeStore?.feed_last_processed_count || 0}
          </div>
          <p className="text-xs text-gray-500">
            {activeStore?.feed_last_matched_count || 0} vinculados automáticamente
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase">Configuración de envíos</span>
            <p className="text-xs text-gray-600 mt-1">Matriz de tarifas planas y umbral de envío gratis</p>
          </div>
          <Link
            href="/merchant/shipping"
            className="inline-block text-center px-4 py-2 rounded-xl bg-[#F5F0E9] text-[#3A3A3A] hover:bg-[#8367C7] hover:text-white text-xs font-bold transition-colors mt-2"
          >
            Editar tarifas de envío ➔
          </Link>
        </div>
      </div>

      {/* Unmatched Products Mapping Portal (US-09) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-[#3A3A3A]">Productos no vinculados en tu feed</h2>
          <p className="text-xs text-gray-500">
            Mapea manualmente estos títulos ingresando su BGG ID para publicar tus ofertas en MeeplePrecios.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {unmatchedItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">
              🎉 ¡Excelente! No tienes productos pendientes por vincular en tu feed.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase text-gray-500 bg-gray-50">
                  <th className="py-3.5 px-6 font-semibold">Título en tienda</th>
                  <th className="py-3.5 px-4 font-semibold">EAN / SKU</th>
                  <th className="py-3.5 px-4 font-semibold">Confianza</th>
                  <th className="py-3.5 px-6 font-semibold">BGG ID para vincular</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {unmatchedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F5F0E9]/30">
                    <td className="py-4 px-6 font-semibold text-[#3A3A3A]">{item.title}</td>
                    <td className="py-4 px-4 text-xs font-mono text-gray-500">{item.ean || 'N/A'}</td>
                    <td className="py-4 px-4 text-xs">
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                        {(item.match_confidence * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Ej. 13"
                          value={mappingInput[item.id] || ''}
                          onChange={(e) =>
                            setMappingInput({ ...mappingInput, [item.id]: e.target.value })
                          }
                          className="w-28 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-mono focus:ring-1 focus:ring-[#8367C7] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleMapSku(item)}
                          className="px-3 py-1.5 rounded-lg bg-[#8367C7] text-white text-xs font-bold hover:bg-[#8367C7]/90 transition-colors"
                        >
                          Vincular SKU
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Sponsored Placement Toggle (US-08) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-[#3A3A3A]">Gestión de ofertas destacadas</h2>
          <p className="text-xs text-gray-500">
            Activa el distintivo "★ Tienda recomendada" para dar máxima visibilidad a tus mejores ofertas.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {offers.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">
              No hay ofertas activas catalogadas para esta tienda.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase text-gray-500 bg-gray-50">
                  <th className="py-3.5 px-6 font-semibold">Oferta</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Precio base</th>
                  <th className="py-3.5 px-6 text-center font-semibold">Posición destacada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {offers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-[#F5F0E9]/30">
                    <td className="py-4 px-6 font-bold text-[#3A3A3A]">
                      <a href={offer.store_product_url} target="_blank" rel="noreferrer" className="hover:text-[#8367C7]">
                        Ver producto en tu tienda ↗
                      </a>
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-[#8367C7]">
                      ${offer.price.toFixed(2)} MXN
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(offer.id, offer.is_featured)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                          offer.is_featured
                            ? 'bg-[#FF9E8A] text-rose-950 shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {offer.is_featured ? '★ Destacado activo' : 'Hacer destacado'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
