'use client';

import React, { useState, useEffect } from 'react';
import { QueueItem, BggGame } from '@/types';

export default function AdminQueuePage() {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [bggCatalog, setBggCatalog] = useState<BggGame[]>([]);
  const [remapInputs, setRemapInputs] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/admin/feed-queue');
      if (res.ok) {
        const data = await res.json();
        setQueueItems(data.items || []);
      }

      const resSearch = await fetch('/api/search');
      if (resSearch.ok) {
        const data = await resSearch.json();
        setBggCatalog(data.games || []);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleResolve = async (id: string, action: 'approve' | 'remap' | 'reject', customBggId?: number) => {
    try {
      const res = await fetch('/api/admin/feed-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action,
          bgg_id: customBggId,
        }),
      });

      if (res.ok) {
        setNotification(`Elemento ${action === 'approve' ? 'aprobado' : action === 'reject' ? 'rechazado' : 're-mapeado'} correctamente.`);
        fetchQueue();
        setTimeout(() => setNotification(null), 3000);
      }
    } catch {
      setNotification('Error al procesar acción.');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-[#3A3A3A] font-medium">Cargando cola de moderación...</div>;
  }

  const pendingItems = queueItems.filter(i => i.status === 'pending');

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#3A3A3A]">Cola de moderación y staging admin</h1>
          <p className="text-xs text-gray-500 mt-1">
            Revisa y aprueba coincidencias de confianza media (0.70 a 0.91) provenientes de feeds automáticos.
          </p>
        </div>

        <span className="px-4 py-2 rounded-2xl bg-[#8367C7]/10 text-[#8367C7] text-xs font-bold">
          {pendingItems.length} elementos pendientes
        </span>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold shadow-sm">
          {notification}
        </div>
      )}

      {pendingItems.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white text-center border border-gray-200 shadow-sm space-y-3">
          <span className="text-4xl">🎉</span>
          <h3 className="text-base font-bold text-[#3A3A3A]">¡La cola de moderación está vacía!</h3>
          <p className="text-xs text-gray-500">Todos los productos de los feeds han sido procesados correctamente.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingItems.map((item) => {
            const suggestedGame = item.suggested_game;

            return (
              <div
                key={item.id}
                className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
              >
                {/* Store Feed Info */}
                <div className="lg:col-span-4 space-y-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-gray-100 text-gray-700">
                    {item.store?.name || 'Tienda socia'}
                  </span>
                  <h3 className="text-base font-bold text-[#3A3A3A]">{item.title}</h3>
                  <div className="text-xs text-gray-500 space-y-0.5">
                    <p>EAN: <span className="font-mono">{item.ean || 'No especificado'}</span></p>
                    <a
                      href={item.store_product_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#8367C7] hover:underline block"
                    >
                      Ver producto original ↗
                    </a>
                  </div>
                </div>

                {/* Match Confidence & Suggested BGG Game */}
                <div className="lg:col-span-5 bg-[#F5F0E9]/60 p-4 rounded-2xl border border-gray-200 flex items-center gap-4">
                  {suggestedGame?.thumbnail ? (
                    <img
                      src={suggestedGame.thumbnail}
                      alt={suggestedGame.name}
                      className="w-14 h-14 object-cover rounded-xl border border-gray-300 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-[#8367C7]/20 text-[#8367C7] flex items-center justify-center font-bold text-xs rounded-xl flex-shrink-0">
                      BGG
                    </div>
                  )}

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-gray-500 uppercase">Sugerencia BGG</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-900">
                        Confianza: {(item.match_confidence * 100).toFixed(0)}%
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#3A3A3A] truncate">
                      {suggestedGame ? suggestedGame.name : 'Sin sugerencia clara'}
                    </h4>
                    {suggestedGame && (
                      <p className="text-[11px] text-gray-500">BGG ID: {suggestedGame.bgg_id}</p>
                    )}
                  </div>
                </div>

                {/* Moderation Action Controls */}
                <div className="lg:col-span-3 space-y-3 flex flex-col justify-center">
                  {item.suggested_bgg_id && (
                    <button
                      type="button"
                      onClick={() => handleResolve(item.id, 'approve', item.suggested_bgg_id!)}
                      className="w-full py-2.5 rounded-xl bg-[#8367C7] text-white text-xs font-bold shadow-sm hover:bg-[#8367C7]/90 transition-all"
                    >
                      ✓ Aprobar sugerencia
                    </button>
                  )}

                  <div className="flex items-center gap-2">
                    <select
                      value={remapInputs[item.id] || ''}
                      onChange={(e) =>
                        setRemapInputs({ ...remapInputs, [item.id]: e.target.value })
                      }
                      className="w-full px-2 py-1.5 rounded-lg border border-gray-300 text-xs text-[#3A3A3A] focus:ring-1 focus:ring-[#8367C7]"
                    >
                      <option value="">Re-mapear BGG...</option>
                      {bggCatalog.map((g) => (
                        <option key={g.bgg_id} value={g.bgg_id}>
                          {g.name} ({g.bgg_id})
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      disabled={!remapInputs[item.id]}
                      onClick={() =>
                        handleResolve(item.id, 'remap', parseInt(remapInputs[item.id], 10))
                      }
                      className="px-3 py-1.5 rounded-lg bg-[#73D8D4] text-teal-950 text-xs font-bold hover:bg-[#73D8D4]/90 disabled:opacity-40"
                    >
                      Mapear
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleResolve(item.id, 'reject')}
                    className="w-full py-1.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors"
                  >
                    ✕ Rechazar producto
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
