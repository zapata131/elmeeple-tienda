'use client';

import React, { useState, useEffect } from 'react';
import { Store, QueueItem, StoreGameOffer } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

interface ExtendedOffer extends StoreGameOffer {
  game_name?: string;
  game_thumbnail?: string;
}

export default function MerchantDashboardPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [unmatchedItems, setUnmatchedItems] = useState<QueueItem[]>([]);
  const [offers, setOffers] = useState<ExtendedOffer[]>([]);
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
          const storeOffersList: ExtendedOffer[] = [];
          
          allGames.forEach((g: any) => {
            if (g.offers) {
              g.offers.forEach((o: any) => {
                if (o.store_id === selectedStoreId) {
                  storeOffersList.push({
                    ...o,
                    game_name: g.name,
                    game_thumbnail: g.thumbnail || g.image,
                  });
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
  const storeBaseUrl = activeStore?.feed_url
    ? activeStore.feed_url.replace(/\/collections\/.*$/, '')
    : 'https://tienda-demo.com';

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
      setFeedback('Error al vincular el producto con el ID de BGG.');
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
            Administra el estado de tu feed de productos, mapeo manual de SKUs a BGG ID y ofertas destacadas.
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2">
          <span className="text-xs font-bold text-gray-400 uppercase">URL de tu tienda (No editable)</span>
          <div className="text-sm font-mono font-bold text-[#3A3A3A] truncate bg-gray-50 p-2 rounded-lg border border-gray-200" title={storeBaseUrl}>
            {storeBaseUrl}
          </div>
          <p className="text-[11px] text-gray-400">Dominio registrado en la plataforma</p>
        </div>

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

      {/* SKU vs BGG ID Clarification Banner */}
      <div className="p-5 rounded-2xl bg-[#F5F0E9] border border-[#8367C7]/20 text-xs text-[#3A3A3A] space-y-2">
        <div className="flex items-center gap-2 font-bold text-[#8367C7] text-sm">
          <span>💡 ¿Cuál es la diferencia entre SKU y BGG ID?</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div>
            <span className="font-bold text-[#3A3A3A]">1. SKU del producto en tu tienda (Código EAN o Interno):</span>
            <p className="text-gray-600 mt-0.5">
              Es la clave de inventario interna que usas en tu tienda e-commerce o sistema ERP (ej. <code className="bg-white px-1 py-0.5 rounded font-mono text-[11px]">SKU-CATAN-ES</code> o código EAN/UPC <code className="bg-white px-1 py-0.5 rounded font-mono text-[11px]">8435407621458</code>).
            </p>
          </div>
          <div>
            <span className="font-bold text-[#8367C7]">2. BGG ID (BoardGameGeek ID):</span>
            <p className="text-gray-600 mt-0.5">
              Es la clave única oficial del juego en la base de datos de BoardGameGeek (ej. <code className="bg-white px-1 py-0.5 rounded font-mono text-[11px]">13</code> para <i>Catan</i>, <code className="bg-white px-1 py-0.5 rounded font-mono text-[11px]">23080</code> para <i>Azul</i>). Si tu producto no se vinculó automáticamente, ingresa aquí su <b>BGG ID</b>.
            </p>
          </div>
        </div>
      </div>

      {/* Unmatched Products Mapping Portal (US-09) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-[#3A3A3A]">Productos no vinculados en tu feed</h2>
          <p className="text-xs text-gray-500">
            Vincula el SKU de tu producto al <b>BGG ID (ID de BoardGameGeek)</b> del juego correspondiente para publicar tus ofertas en MeeplePrecios.
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
                  <th className="py-3.5 px-6 font-semibold">Título en tu tienda</th>
                  <th className="py-3.5 px-4 font-semibold">SKU del producto (EAN / Código interno)</th>
                  <th className="py-3.5 px-4 font-semibold">Confianza de coincidencia</th>
                  <th className="py-3.5 px-6 font-semibold">BGG ID (ID de BoardGameGeek)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {unmatchedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F5F0E9]/30">
                    <td className="py-4 px-6 font-semibold text-[#3A3A3A]">{item.title}</td>
                    <td className="py-4 px-4 text-xs font-mono text-gray-500">{item.ean || 'Sin SKU asignado'}</td>
                    <td className="py-4 px-4 text-xs">
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                        {(item.match_confidence * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Ej. 13 (BGG ID)"
                          value={mappingInput[item.id] || ''}
                          onChange={(e) =>
                            setMappingInput({ ...mappingInput, [item.id]: e.target.value })
                          }
                          className="w-36 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-mono focus:ring-1 focus:ring-[#8367C7] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleMapSku(item)}
                          className="px-3 py-1.5 rounded-lg bg-[#8367C7] text-white text-xs font-bold hover:bg-[#8367C7]/90 transition-colors"
                        >
                          Vincular con BGG ID
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

      {/* Sponsored Placement & Product Link Management (US-08) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-[#3A3A3A]">Gestión de ofertas publicadas y enlaces de productos</h2>
          <p className="text-xs text-gray-500">
            Revisa el juego en catálogo al que está vinculada cada oferta, la URL exacta de tu producto y activa el distintivo "★ Tienda recomendada".
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
                  <th className="py-3.5 px-6 font-semibold">Juego en catálogo MeeplePrecios</th>
                  <th className="py-3.5 px-6 font-semibold">URL del producto en tu tienda (No editable)</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Precio base</th>
                  <th className="py-3.5 px-6 text-center font-semibold">Posición destacada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {offers.map((offer, idx) => (
                  <tr key={`${offer.id}-${idx}`} className="hover:bg-[#F5F0E9]/30">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {offer.game_thumbnail && (
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                            <Image
                              src={offer.game_thumbnail}
                              alt={offer.game_name || 'Juego'}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <Link
                            href={`/game/${offer.bgg_id}`}
                            className="font-bold text-[#3A3A3A] hover:text-[#8367C7] transition-colors"
                          >
                            {offer.game_name || `Juego BGG ID ${offer.bgg_id}`}
                          </Link>
                          <span className="block text-[11px] font-mono text-gray-400">
                            BGG ID: {offer.bgg_id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 max-w-md">
                        <input
                          type="text"
                          readOnly
                          value={offer.store_product_url}
                          className="w-full px-2.5 py-1 rounded-lg border border-gray-200 bg-gray-50 text-xs font-mono text-gray-600 truncate focus:outline-none"
                        />
                        <a
                          href={offer.store_product_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-[#8367C7]/10 text-[#8367C7] hover:bg-[#8367C7]/20 text-xs font-bold shrink-0 transition-colors"
                          title="Abrir enlace de producto en tu tienda"
                        >
                          ↗
                        </a>
                      </div>
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
