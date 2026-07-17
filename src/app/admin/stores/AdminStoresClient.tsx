'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface StoreAdminData {
  id: string;
  name: string;
  logo_url?: string | null;
  country: string;
  rating?: number;
  feed_url?: string | null;
  feed_status?: 'success' | 'warning' | 'error' | 'failed' | 'pending';
  feed_last_processed_count?: number;
  feed_last_matched_count?: number;
  flat_rate_shipping: number;
  free_shipping_threshold?: number | null;
  active_offers_count: number;
  pending_queue_count: number;
}

interface AdminStoresClientProps {
  initialStores: StoreAdminData[];
  totalOffers: number;
  totalPendingQueue: number;
}

export const AdminStoresClient: React.FC<AdminStoresClientProps> = ({
  initialStores,
  totalOffers,
  totalPendingQueue,
}) => {
  const [stores, setStores] = useState<StoreAdminData[]>(initialStores);
  const [activeTab, setActiveTab] = useState<'settings' | 'diagnostics'>('settings');
  const [savingStoreId, setSavingStoreId] = useState<string | null>(null);
  const [ingesting, setIngesting] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpdateStore = async (store: StoreAdminData) => {
    setSavingStoreId(store.id);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_store',
          store_id: store.id,
          name: store.name,
          logo_url: store.logo_url,
          feed_url: store.feed_url,
          flat_rate_shipping: store.flat_rate_shipping,
          free_shipping_threshold: store.free_shipping_threshold,
        }),
      });

      if (res.ok) {
        setMessage(`Configuración guardada correctamente para ${store.name}.`);
      } else {
        setMessage(`Error al guardar cambios de ${store.name}.`);
      }
    } catch (e) {
      setMessage('Error de conexión con el servidor.');
    } finally {
      setSavingStoreId(null);
    }
  };

  const handleTriggerIngestion = async () => {
    setIngesting(true);
    setMessage('Ejecutando ingesta de feeds en vivo across tiendas mexicanas...');

    try {
      const res = await fetch('/api/admin/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'trigger_ingestion',
          max_stores: 10,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`Ingesta completada: ${data.results?.processedStores || 0} tiendas procesadas, ${data.results?.totalOffersIngested || 0} ofertas en vivo agregadas/actualizadas.`);
        // Refresh stores list
        const refreshRes = await fetch('/api/admin/stores');
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          setStores(refreshData.stores || []);
        }
      } else {
        setMessage(`Error en la ingesta: ${data.error}`);
      }
    } catch (e) {
      setMessage('Error durante la sincronización de feeds.');
    } finally {
      setIngesting(false);
    }
  };

  const [enriching, setEnriching] = useState<boolean>(false);

  const handleEnrichImages = async () => {
    setEnriching(true);
    setMessage('Buscando y enriqueciendo imágenes HD desde BoardGameGeek...');

    try {
      const res = await fetch('/api/admin/enrich-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 30 }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`Enriquecimiento finalizado: ${data.enriched_count || 0} imágenes HD actualizadas.`);
      } else {
        setMessage(`Error al enriquecer imágenes: ${data.error}`);
      }
    } catch (e) {
      setMessage('Error de conexión al enriquecer imágenes.');
    } finally {
      setEnriching(false);
    }
  };

  const handleInputChange = (id: string, field: keyof StoreAdminData, value: any) => {
    setStores(prev =>
      prev.map(s => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#8367C7]/10 text-[#8367C7] border border-[#8367C7]/20 mb-2">
            Panel de administración técnica
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3A3A3A] tracking-tight">
            Administración y configuración de tiendas
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Gestiona logos, tarifas de envío, URLs de feeds y monitorea la ingesta de datos en tiempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleEnrichImages}
            disabled={enriching}
            className="px-4 py-2.5 rounded-xl bg-[#73D8D4] hover:bg-[#5EC2BE] text-[#3A3A3A] font-bold text-xs shadow-sm disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {enriching ? 'Enriqueciendo imágenes HD...' : 'Enriquecer imágenes HD 🎨'}
          </button>

          <button
            type="button"
            onClick={handleTriggerIngestion}
            disabled={ingesting}
            className="px-4 py-2.5 rounded-xl bg-[#8367C7] hover:bg-[#7357B7] text-white font-bold text-xs shadow-sm disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {ingesting ? 'Sincronizando feeds...' : 'Sincronizar feeds en vivo 🔄'}
          </button>

          <Link
            href="/admin/diagnostics"
            className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-[#3A3A3A] hover:bg-gray-50 font-bold text-xs transition-all"
          >
            Ver diagnóstico completo ➔
          </Link>
        </div>
      </div>

      {/* Alert Message Notification */}
      {message && (
        <div className="p-4 rounded-xl bg-[#F5F0E9] border border-[#8367C7]/30 text-xs font-semibold text-[#3A3A3A]">
          {message}
        </div>
      )}

      {/* Key Metrics Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-medium">Tiendas asociadas</span>
          <p className="text-2xl font-black text-[#3A3A3A] mt-1">{stores.length}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-medium">Ofertas en vivo</span>
          <p className="text-2xl font-black text-[#8367C7] mt-1">{totalOffers}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-medium">Descoincidencias en cola</span>
          <p className="text-2xl font-black text-[#FF9E8A] mt-1">{totalPendingQueue}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <span className="text-xs text-gray-500 font-medium">Feeds sincronizados</span>
          <p className="text-2xl font-black text-[#73D8D4] mt-1">
            {stores.filter(s => s.feed_status === 'success').length} / {stores.length}
          </p>
        </div>
      </div>

      {/* Tab Switcher Controls */}
      <div className="inline-flex p-1 rounded-2xl bg-[#F5F0E9] border border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'settings'
              ? 'bg-[#8367C7] text-white shadow-xs'
              : 'text-[#3A3A3A] hover:text-[#8367C7]'
          }`}
        >
          Configuración de tiendas y logos
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('diagnostics')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'diagnostics'
              ? 'bg-[#8367C7] text-white shadow-xs'
              : 'text-[#3A3A3A] hover:text-[#8367C7]'
          }`}
        >
          Diagnóstico de ingesta y descoincidencias
        </button>
      </div>

      {/* Tab 1: Store Settings & Logo Management */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#3A3A3A]">Catálogo de tiendas y logos</h2>
              <p className="text-xs text-gray-500">Edita el logo de la tienda, tarifario de envío y URL del feed XML/JSON</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-[#F5F0E9]/50 text-[#3A3A3A] font-bold border-b border-gray-200">
                <tr>
                  <th className="p-3.5">Logo</th>
                  <th className="p-3.5">Nombre de la tienda</th>
                  <th className="p-3.5">Logo URL</th>
                  <th className="p-3.5">Envío fijo ($ MXN)</th>
                  <th className="p-3.5">Envío gratis desde ($ MXN)</th>
                  <th className="p-3.5">Estado del feed</th>
                  <th className="p-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stores.map(store => (
                  <tr key={store.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-3.5">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#F5F0E9] border border-gray-200 flex items-center justify-center shrink-0">
                        {store.logo_url ? (
                          <img
                            src={store.logo_url}
                            alt={store.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback image handling
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="font-bold text-xs text-[#3A3A3A]">{store.name.charAt(0)}</span>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5 font-bold text-[#3A3A3A]">
                      {store.name}
                      <span className="block text-[10px] text-gray-400 font-normal">ID: {store.id}</span>
                    </td>

                    <td className="p-3.5 max-w-xs">
                      <input
                        type="url"
                        value={store.logo_url || ''}
                        onChange={e => handleInputChange(store.id, 'logo_url', e.target.value)}
                        placeholder="https://tienda.com/logo.png"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-[#8367C7]"
                      />
                    </td>

                    <td className="p-3.5 w-32">
                      <input
                        type="number"
                        value={store.flat_rate_shipping ?? 105}
                        onChange={e => handleInputChange(store.id, 'flat_rate_shipping', parseFloat(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-[#8367C7]"
                      />
                    </td>

                    <td className="p-3.5 w-36">
                      <input
                        type="number"
                        value={store.free_shipping_threshold ?? ''}
                        onChange={e => handleInputChange(store.id, 'free_shipping_threshold', e.target.value ? parseFloat(e.target.value) : null)}
                        placeholder="Sin envío gratis"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-[#8367C7]"
                      />
                    </td>

                    <td className="p-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        store.feed_status === 'success'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {store.feed_status === 'success' ? 'Sincronizado' : 'Pendiente'}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleUpdateStore(store)}
                        disabled={savingStoreId === store.id}
                        className="px-3 py-1.5 rounded-lg bg-[#3A3A3A] hover:bg-[#8367C7] text-white font-bold text-xs transition-colors disabled:opacity-50"
                      >
                        {savingStoreId === store.id ? 'Guardando...' : 'Guardar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Ingestion Diagnostics & Mismatches */}
      {activeTab === 'diagnostics' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-[#3A3A3A]">Diagnóstico de ingesta y coincidencia de feeds</h2>
              <p className="text-xs text-gray-500">Métricas de procesamiento de feeds XML/JSON y descoincidencias detectadas</p>
            </div>

            <Link
              href="/admin/queue"
              className="px-3.5 py-2 rounded-xl bg-[#FF9E8A]/20 text-[#3A3A3A] border border-[#FF9E8A]/40 font-bold text-xs hover:bg-[#FF9E8A]/30 transition-all"
            >
              Resolver cola de descoincidencias ({totalPendingQueue}) ➔
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.slice(0, 15).map(store => {
              const processed = store.feed_last_processed_count || 0;
              const matched = store.feed_last_matched_count || 0;
              const rate = processed > 0 ? ((matched / processed) * 100).toFixed(1) : '100.0';

              return (
                <div key={store.id} className="p-4 rounded-xl bg-[#F5F0E9]/40 border border-gray-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#3A3A3A]">{store.name}</span>
                    <span className="text-[10px] font-bold text-[#8367C7]">{rate}% coincidencia</span>
                  </div>

                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#73D8D4] h-full transition-all"
                      style={{ width: `${rate}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                    <span>Procesados: {processed}</span>
                    <span>Emparejados: {matched}</span>
                    <span>Ofertas activas: {store.active_offers_count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
