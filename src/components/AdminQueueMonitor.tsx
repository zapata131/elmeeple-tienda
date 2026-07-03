'use client';

import React, { useState } from 'react';

interface QueueItem {
  id: string;
  store_id: string;
  ean: string | null;
  title: string;
  store_product_url: string;
  status: string;
  created_at: string;
}

interface Props {
  initialItems: QueueItem[];
}

export function AdminQueueMonitor({ initialItems }: Props) {
  const [items, setItems] = useState<QueueItem[]>(initialItems);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleDelete = async (id: string) => {
    setLoadingId(id);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/admin/feed-queue', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        setSuccessMsg('Ítem purgado de la cola con éxito.');
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to delete item.');
      }
    } catch {
      setErrorMsg('Network error.');
    } finally {
      setLoadingId(null);
    }
  };

  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcessQueue = async () => {
    setIsProcessing(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/cron/process-bgg-queue', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Lote procesado: ${data.processed || 0} ítems. Resueltos: ${data.resolved || 0}, Reintentos: ${data.retried || 0}`);
        // Refresh items list
        const refreshRes = await fetch('/api/admin/feed-queue');
        if (refreshRes.ok) {
          const body = await refreshRes.json();
          if (body.items) {
            setItems(body.items);
          }
        }
      } else {
        setErrorMsg(data.error || 'Error al procesar la cola de metadatos BGG.');
      }
    } catch {
      setErrorMsg('Error de red al conectar con el worker BGG.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Monitor de Cola de Metadatos BGG</h2>
          <p className="text-xs text-gray-500 mt-1">
            Juegos de mesa no catalogados detectados en feeds de tiendas. Esperando resolución BGG API (US-15).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleProcessQueue}
            disabled={isProcessing || items.length === 0}
            className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow-sm transition-colors disabled:opacity-50"
          >
            {isProcessing ? 'Procesando BGG API...' : 'Procesar Cola BGG Ahora'}
          </button>
          <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-extrabold px-4 py-2 rounded-lg shadow-sm">
            En Cola: {items.length}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-150 text-red-700 text-xs font-semibold px-4 py-2.5 rounded-lg">
          ⚠️ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 border border-green-150 text-green-800 text-xs font-semibold px-4 py-2.5 rounded-lg">
          ✅ {successMsg}
        </div>
      )}

      <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm text-gray-700">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-250 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-3">Título en Feed</th>
              <th className="px-6 py-3">EAN (Barcode)</th>
              <th className="px-6 py-3">URL de Tienda</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  La cola está vacía. Todos los juegos de los feeds están catalogados en BGG.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-950">{item.title}</td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-600">{item.ean || 'N/A'}</td>
                  <td className="px-6 py-4 text-xs">
                    <a
                      href={item.store_product_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-650 hover:underline truncate max-w-xs inline-block"
                    >
                      {item.store_product_url}
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={loadingId === item.id}
                      className="text-xs bg-white hover:bg-red-50 text-red-600 font-bold px-3 py-1.5 rounded-lg transition-colors border border-gray-300 disabled:opacity-50 shadow-sm"
                    >
                      {loadingId === item.id ? 'Borrando...' : 'Purgar'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
