import React from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db/db';
import Link from 'next/link';

interface StoreProfilePageProps {
  params: Promise<{ id: string }>;
}

import { runFullFeedIngestion } from '@/lib/engine/feed-ingestion-worker';

export default async function StoreProfilePage({ params }: StoreProfilePageProps) {
  const { id } = await params;
  const store = db.getStoreById(id);

  if (!store) {
    notFound();
  }

  const shippingRate = db.getShippingRateForStore(store.id);
  let storeOffers = db.getOffers().filter(o => o.store_id === store.id);

  // On-demand live feed ingestion if store currently has 0 offers cached
  if (storeOffers.length === 0 && store.feed_url) {
    try {
      await runFullFeedIngestion({ storeId: store.id });
      storeOffers = db.getOffers().filter(o => o.store_id === store.id);
    } catch (e) {
      console.error(`[STORE-PAGE] On-demand ingestion failed for ${store.id}:`, e);
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Store Header Card */}
      <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
        {store.logo_url ? (
          <img
            src={store.logo_url}
            alt={store.name}
            className="w-24 h-24 rounded-2xl object-cover border border-gray-200 shadow-sm"
          />
        ) : (
          <div className="w-24 h-24 rounded-2xl bg-[#8367C7] text-white flex items-center justify-center font-bold text-3xl">
            {store.name.charAt(0)}
          </div>
        )}

        <div className="space-y-2 text-center md:text-left flex-1">
          <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
            <h1 className="text-3xl font-extrabold text-[#3A3A3A]">{store.name}</h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              ★ {store.rating?.toFixed(2)} ({store.review_count} opiniones)
            </span>
          </div>

          <p className="text-xs text-gray-500">
            Tienda verificada en México • Sincronización automática de inventario activo ({store.feed_type || 'Shopify'})
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-[#3A3A3A]">
            <div className="px-3 py-1.5 rounded-xl bg-[#F5F0E9]">
              Tarifa de envío: <span className="font-bold text-[#8367C7]">${shippingRate.flat_rate.toFixed(2)} MXN</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[#F5F0E9]">
              Envío gratis desde:{' '}
              <span className="font-bold text-emerald-700">
                {shippingRate.free_shipping_threshold
                  ? `$${shippingRate.free_shipping_threshold.toFixed(2)} MXN`
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Store Offers Listing */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#3A3A3A]">
          Inventario catalogado en MeeplePrecios ({storeOffers.length} juegos)
        </h2>

        {storeOffers.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white border border-gray-200 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-[#F5F0E9] text-[#8367C7] flex items-center justify-center font-bold text-2xl mx-auto">
              🏪
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#3A3A3A]">No hay juegos activos en catálogo actualmente</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                Los productos de esta tienda están siendo procesados o sincronizados desde su feed de inventario.
              </p>
            </div>
            <Link
              href="/admin/stores"
              className="inline-block px-4 py-2 rounded-xl bg-[#8367C7] text-white font-bold text-xs shadow-sm hover:bg-[#7357B7] transition-all"
            >
              Sincronizar feed desde panel de administración 🔄
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 bg-gray-50">
                  <th className="py-3.5 px-6 font-semibold">Juego</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Precio</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Stock</th>
                  <th className="py-3.5 px-6 text-center font-semibold">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {storeOffers.map(offer => {
                  const game = db.getBggGameById(offer.bgg_id);

                  return (
                    <tr key={offer.id} className="hover:bg-[#F5F0E9]/30 transition-colors">
                      <td className="py-4 px-6">
                        <Link href={`/game/${offer.bgg_id}`} className="font-bold text-[#3A3A3A] hover:text-[#8367C7]">
                          {game?.name || `BGG ID: ${offer.bgg_id}`}
                        </Link>
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-[#8367C7]">
                        ${offer.price.toFixed(2)} MXN
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          {offer.stock} en stock
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <a
                          href={`/api/redirect?store_id=${store.id}&bgg_id=${offer.bgg_id}&url=${encodeURIComponent(
                            offer.store_product_url
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#8367C7] text-white hover:bg-[#8367C7]/90 transition-colors"
                        >
                          Ir a la tienda
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
