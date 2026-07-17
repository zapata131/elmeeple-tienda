import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db/db';

export default function AdminDashboardPage() {
  const stores = db.getStores();
  const games = db.getBggGames();
  const offers = db.getOffers();
  const queueItems = db.getQueueItems();

  const totalStores = stores.length;
  const totalGames = games.length;
  const totalOffers = offers.length;
  const pendingQueue = queueItems.filter(q => q.status === 'pending').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-4">
      {/* Page Header (Google Sentence Case) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#8367C7]/10 text-[#8367C7] border border-[#8367C7]/20 mb-2">
            Panel de control principal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3A3A3A] tracking-tight">
            Panel de administración general
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Resumen general de tiendas, juegos catalogados, ofertas en vivo y salud del sistema.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/stores"
            className="px-4 py-2.5 rounded-xl bg-[#8367C7] hover:bg-[#7357B7] text-white font-bold text-xs shadow-sm transition-all"
          >
            Configurar tiendas y logos ⚙️
          </Link>
          <Link
            href="/admin/diagnostics"
            className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-[#3A3A3A] hover:bg-gray-50 font-bold text-xs transition-all"
          >
            Ver diagnóstico técnico 🔍
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Tiendas registradas</span>
            <span className="p-2 rounded-xl bg-[#8367C7]/10 text-[#8367C7] text-sm">🏪</span>
          </div>
          <p className="text-3xl font-black text-[#3A3A3A] mt-3">{totalStores}</p>
          <p className="text-[11px] text-gray-400 mt-1">Tiendas de juegos en México</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Juegos catalogados</span>
            <span className="p-2 rounded-xl bg-[#73D8D4]/20 text-[#3A3A3A] text-sm">🎲</span>
          </div>
          <p className="text-3xl font-black text-[#3A3A3A] mt-3">{totalGames.toLocaleString()}</p>
          <p className="text-[11px] text-gray-400 mt-1">Títulos con datos reales BGG</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Ofertas activas en vivo</span>
            <span className="p-2 rounded-xl bg-green-100 text-green-700 text-sm">🏷️</span>
          </div>
          <p className="text-3xl font-black text-[#3A3A3A] mt-3">{totalOffers.toLocaleString()}</p>
          <p className="text-[11px] text-gray-400 mt-1">Precios en tiempo real</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">Pendientes en cola</span>
            <span className="p-2 rounded-xl bg-amber-100 text-amber-700 text-sm">⏳</span>
          </div>
          <p className="text-3xl font-black text-[#3A3A3A] mt-3">{pendingQueue}</p>
          <p className="text-[11px] text-gray-400 mt-1">Productos por emparejar</p>
        </div>
      </div>

      {/* Admin Quick Modules Hub */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-[#3A3A3A] tracking-tight">
          Módulos de administración
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            href="/admin/stores"
            className="p-6 rounded-2xl bg-white border border-gray-200/80 hover:border-[#8367C7]/50 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#8367C7]/10 text-[#8367C7] flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-105 transition-transform">
              🏪
            </div>
            <h3 className="text-base font-bold text-[#3A3A3A] group-hover:text-[#8367C7] transition-colors">
              Gestión de tiendas y logos
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Edita URLs de logos, tarifas de envío, feeds Shopify/XML y ejecuta ingestas en vivo.
            </p>
            <span className="inline-flex items-center text-xs font-bold text-[#8367C7] mt-4">
              Acceder a tiendas ➔
            </span>
          </Link>

          <Link
            href="/admin/diagnostics"
            className="p-6 rounded-2xl bg-white border border-gray-200/80 hover:border-[#8367C7]/50 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#73D8D4]/20 text-[#3A3A3A] flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-105 transition-transform">
              📊
            </div>
            <h3 className="text-base font-bold text-[#3A3A3A] group-hover:text-[#8367C7] transition-colors">
              Diagnóstico de salud del sistema
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Inspecciona enlaces rotos, discrepancias de precios y estado técnico de conexiones.
            </p>
            <span className="inline-flex items-center text-xs font-bold text-[#8367C7] mt-4">
              Ver diagnósticos ➔
            </span>
          </Link>

          <Link
            href="/admin/queue"
            className="p-6 rounded-2xl bg-white border border-gray-200/80 hover:border-[#8367C7]/50 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-105 transition-transform">
              ⚙️
            </div>
            <h3 className="text-base font-bold text-[#3A3A3A] group-hover:text-[#8367C7] transition-colors">
              Cola de procesamiento BGG
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Supervisa la hidratación de metadatos BGG y la resolución de nombres de juegos.
            </p>
            <span className="inline-flex items-center text-xs font-bold text-[#8367C7] mt-4">
              Ver cola de ingesta ➔
            </span>
          </Link>
        </div>
      </div>

      {/* Top Stores Overview Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#3A3A3A]">
              Resumen de tiendas en plataforma
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Estado de sincronización y cantidad de ofertas activas por comercio
            </p>
          </div>
          <Link
            href="/admin/stores"
            className="text-xs font-bold text-[#8367C7] hover:underline"
          >
            Ver las 51 tiendas ➔
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5F0E9]/50 border-b border-gray-200/60 text-[11px] font-bold text-gray-600">
                <th className="py-3 px-4">Tienda</th>
                <th className="py-3 px-4">Dominio</th>
                <th className="py-3 px-4 text-center">Ofertas activas</th>
                <th className="py-3 px-4 text-right">Envío plano</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-[#3A3A3A]">
              {stores.slice(0, 8).map(store => {
                const shipping = db.getShippingRateForStore(store.id);
                const storeOffersCount = db.getOffers().filter(o => o.store_id === store.id).length;
                const domain = store.feed_url ? store.feed_url.replace(/^https?:\/\//, '').replace(/\/.*$/, '') : 'N/A';

                return (
                  <tr key={store.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 font-semibold flex items-center gap-2.5">
                      <img
                        src={store.logo_url || `https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
                        alt={store.name}
                        className="w-5 h-5 object-contain rounded-sm"
                      />
                      <span>{store.name}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">{domain}</td>
                    <td className="py-3 px-4 text-center font-bold text-[#8367C7]">{storeOffersCount}</td>
                    <td className="py-3 px-4 text-right font-medium">
                      ${shipping.flat_rate.toFixed(2)} MXN
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
