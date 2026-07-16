'use client';

import React, { useState, useEffect } from 'react';
import { TactileSwitch } from '@/components/TactileSwitch';

interface StoreDiagnosticsStatus {
  id: string;
  name: string;
  feed_type: 'shopify_json' | 'google_xml';
  feed_status: 'pending' | 'success' | 'failed';
  feed_last_processed_count: number;
  feed_last_matched_count: number;
  broken_offers_count: number;
}

interface DiagnosticsData {
  total_offers: number;
  active_offers: number;
  broken_offers: number;
  total_stores: number;
  feed_error_rate: number;
  auto_audit_enabled: boolean;
  auto_hydration_enabled: boolean;
  stores_status: StoreDiagnosticsStatus[];
  last_updated_at: string;
}

export default function AdminDiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchDiagnostics = async () => {
    try {
      const res = await fetch('/api/admin/diagnostics');
      if (res.ok) {
        const data = await res.json();
        setDiagnostics(data.diagnostics);
      }
    } catch {
      // Graceful error handling
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const handleAction = async (action: string, enabled?: boolean) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/admin/diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, enabled }),
      });

      if (res.ok) {
        const data = await res.json();
        setNotification(data.message || 'Acción ejecutada correctamente.');
        if (data.diagnostics) {
          setDiagnostics(data.diagnostics);
        }
        setTimeout(() => setNotification(null), 4000);
      }
    } catch {
      setNotification('Error al ejecutar la acción.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-[#3A3A3A] font-medium">
        Cargando diagnóstico de catálogo y feeds...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#3A3A3A]">
            Diagnóstico de catálogo y salud de feeds
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Monitoreo en tiempo real de ofertas activas, enlaces rotos y re-sincronización de tiendas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => handleAction('trigger_resync')}
            className="px-4 py-2.5 rounded-2xl bg-[#8367C7] text-white text-xs font-bold shadow-sm hover:bg-[#8367C7]/90 disabled:opacity-50 transition-all"
          >
            Re-sincronizar feeds
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => handleAction('trigger_audit')}
            className="px-4 py-2.5 rounded-2xl bg-[#73D8D4] text-teal-950 text-xs font-bold shadow-sm hover:bg-[#73D8D4]/90 disabled:opacity-50 transition-all"
          >
            Auditar enlaces
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => handleAction('trigger_hydration')}
            className="px-4 py-2.5 rounded-2xl bg-white border border-gray-300 text-[#3A3A3A] text-xs font-bold shadow-sm hover:bg-gray-50 disabled:opacity-50 transition-all"
          >
            Hidratar metadatos BGG
          </button>
        </div>
      </div>

      {/* User Notifications */}
      {notification && (
        <div className="p-4 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold shadow-sm">
          {notification}
        </div>
      )}

      {/* Diagnostic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Ofertas activas
          </span>
          <div className="text-3xl font-extrabold text-[#3A3A3A]">
            {diagnostics?.active_offers || 0}
          </div>
          <p className="text-[11px] text-gray-400">
            De un total de {diagnostics?.total_offers || 0} ofertas catalogadas
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Enlaces rotos
          </span>
          <div className={`text-3xl font-extrabold ${(diagnostics?.broken_offers || 0) > 0 ? 'text-[#FF9E8A]' : 'text-emerald-600'}`}>
            {diagnostics?.broken_offers || 0}
          </div>
          <p className="text-[11px] text-gray-400">
            Ofertas en cuarentena por HTTP 404/500
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Tasa de error en feeds
          </span>
          <div className="text-3xl font-extrabold text-[#3A3A3A]">
            {diagnostics?.feed_error_rate || 0}%
          </div>
          <p className="text-[11px] text-gray-400">
            Fallas de ingestión o formateo XML/JSON
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Tiendas conectadas
          </span>
          <div className="text-3xl font-extrabold text-[#8367C7]">
            {diagnostics?.total_stores || 0}
          </div>
          <p className="text-[11px] text-gray-400">
            Tiendas de juegos integradas activas
          </p>
        </div>
      </div>

      {/* Automated Workers Controls Section */}
      <div className="p-6 rounded-3xl bg-[#F5F0E9]/80 border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-[#3A3A3A]">
          Configuración de automatizaciones y tareas programadas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="p-4 rounded-2xl bg-white border border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#3A3A3A]">
                Auditoría automática de enlaces
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Verifica URLs de productos periódicamente y desactiva links 404/500.
              </p>
            </div>
            <TactileSwitch
              id="switch-auto-audit"
              checked={diagnostics?.auto_audit_enabled ?? true}
              onChange={(checked) => handleAction('toggle_auto_audit', checked)}
              label=""
            />
          </div>

          <div className="p-4 rounded-2xl bg-white border border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#3A3A3A]">
                Hidratación automática BGG
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Enriquece peso, jugadores e imágenes con tasa controlada de 1200 ms.
              </p>
            </div>
            <TactileSwitch
              id="switch-auto-hydration"
              checked={diagnostics?.auto_hydration_enabled ?? true}
              onChange={(checked) => handleAction('toggle_auto_hydration', checked)}
              label=""
            />
          </div>
        </div>
      </div>

      {/* Store Feeds Diagnostics Table */}
      <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#3A3A3A]">
            Estado detallado de feeds por tienda
          </h2>
          <span className="text-xs text-gray-400">
            Última actualización: {diagnostics?.last_updated_at ? new Date(diagnostics.last_updated_at).toLocaleTimeString('es-MX') : 'Reciente'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
                <th className="py-3 px-4">Tienda</th>
                <th className="py-3 px-4">Tipo de feed</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Procesados</th>
                <th className="py-3 px-4 text-right">Coincidencias</th>
                <th className="py-3 px-4 text-right">Enlaces rotos</th>
                <th className="py-3 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-[#3A3A3A]">
              {diagnostics?.stores_status.map((store) => (
                <tr key={store.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold">{store.name}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-gray-100 text-gray-600">
                      {store.feed_type === 'shopify_json' ? 'Shopify JSON' : 'Google Atom XML'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        store.feed_status === 'success'
                          ? 'bg-emerald-100 text-emerald-800'
                          : store.feed_status === 'pending'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {store.feed_status === 'success'
                        ? 'Correcto'
                        : store.feed_status === 'pending'
                        ? 'Pendiente'
                        : 'Falla'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold">
                    {store.feed_last_processed_count}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[#8367C7]">
                    {store.feed_last_matched_count}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-[#FF9E8A]">
                    {store.broken_offers_count}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleAction('trigger_resync')}
                      className="px-3 py-1 rounded-lg bg-[#8367C7]/10 text-[#8367C7] hover:bg-[#8367C7]/20 font-bold text-[11px] disabled:opacity-50 transition-all"
                    >
                      Re-sincronizar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
