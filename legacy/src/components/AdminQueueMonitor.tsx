'use client';

import React, { useState } from 'react';

export interface QueueItem {
  id: string;
  store_id: string;
  ean: string | null;
  title: string;
  store_product_url: string;
  status: string;
  match_confidence?: number | null;
  suggested_bgg_id?: number | null;
  suggested_game_name?: string | null;
  suggested_game_thumbnail?: string | null;
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
  const [activeRemapId, setActiveRemapId] = useState<string | null>(null);
  const [remapBggIdInput, setRemapBggIdInput] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ bgg_id: number; name: string; thumbnail?: string }>>([]);

  const handleSearchInputChange = async (val: string) => {
    setRemapBggIdInput(val);
    if (!val || val.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(val)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.games || []);
      }
    } catch {
      // Ignore search error
    }
  };

  const handleApprove = async (id: string, suggestedBggId?: number | null) => {
    setLoadingId(id);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/admin/feed-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'approve', bgg_id: suggestedBggId }),
      });

      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        setSuccessMsg('Coincidencia aprobada correctamente y guardada en memoria.');
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Error al aprobar coincidencia.');
      }
    } catch {
      setErrorMsg('Error de red al aprobar.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleRemapSubmit = async (id: string, overrideBggId?: number) => {
    const targetId = overrideBggId || parseInt(remapBggIdInput.trim(), 10);
    if (!targetId || isNaN(targetId)) {
      setErrorMsg('Por favor ingrese un ID de BGG válido o seleccione un juego.');
      return;
    }

    setLoadingId(id);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/admin/feed-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'remap', bgg_id: targetId }),
      });

      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        setActiveRemapId(null);
        setRemapBggIdInput('');
        setSearchResults([]);
        setSuccessMsg(`Juego mapeado a BGG #${targetId} correctamente.`);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Error al reasignar juego.');
      }
    } catch {
      setErrorMsg('Error de red al reasignar.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setLoadingId(id);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/admin/feed-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'reject' }),
      });

      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        setSuccessMsg('Ítem descartado de la cola de moderación.');
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Error al descartar el ítem.');
      }
    } catch {
      setErrorMsg('Error de red al descartar.');
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
        setSuccessMsg(`Lote procesado: ${data.processed || 0} ítems. Resueltos: ${data.resolved || 0}`);
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
    <div className="flex flex-col gap-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Moderación y estaging de catálogo (Waterfall Engine)</h2>
          <p className="text-xs text-gray-500 mt-1">
            Revisión de coincidencias de confianza media (0.70 - 0.91) y productos pendientes de catalogación.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleProcessQueue}
            disabled={isProcessing || items.length === 0}
            className="bg-[#8367C7] hover:bg-[#7256b6] text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition-colors disabled:opacity-50"
          >
            {isProcessing ? 'Procesando BGG API...' : 'Procesar cola BGG ahora'}
          </button>
          <div className="bg-[#8367C7]/15 border border-[#8367C7]/30 text-[#8367C7] text-xs font-extrabold px-4 py-2 rounded-xl shadow-sm">
            En cola: {items.length}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2 shadow-sm">
          <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2 shadow-sm">
          <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{successMsg}</span>
        </div>
      )}

      <div className="overflow-x-auto border border-gray-200 rounded-2xl bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm text-gray-700">
          <thead>
            <tr className="bg-[#F5F0E9] border-b border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-wider">
              <th className="px-6 py-4">Título en feed</th>
              <th className="px-6 py-4">Confianza / Sugerencia</th>
              <th className="px-6 py-4">EAN / SKU</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-400 font-medium">
                  La cola de moderación está limpia. No hay coincidencias pendientes de revisión.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const confidencePct = item.match_confidence
                  ? Math.round(item.match_confidence * 100)
                  : null;

                return (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-950">{item.title}</div>
                      <a
                        href={item.store_product_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#8367C7] hover:underline truncate max-w-xs block mt-0.5"
                      >
                        {item.store_product_url}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {confidencePct !== null && (
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-lg border ${
                              confidencePct >= 80
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}>
                              {confidencePct}% coincidencia
                            </span>
                            {item.suggested_bgg_id && (
                              <span className="text-xs text-gray-500 font-medium">
                                BGG #{item.suggested_bgg_id}
                              </span>
                            )}
                          </div>
                        )}
                        {item.suggested_game_name && (
                          <div className="flex items-center gap-2 mt-1">
                            {item.suggested_game_thumbnail && (
                              <img
                                src={item.suggested_game_thumbnail}
                                alt={item.suggested_game_name}
                                className="w-7 h-7 object-cover rounded-md border border-gray-200 shadow-2xs"
                              />
                            )}
                            <span className="text-xs font-bold text-gray-900">{item.suggested_game_name}</span>
                          </div>
                        )}
                        {!confidencePct && !item.suggested_game_name && (
                          <span className="text-xs text-gray-400">Sin sugerencia</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">
                      {item.ean || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                        item.status === 'staged'
                          ? 'bg-purple-50 text-[#8367C7] border-purple-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {activeRemapId === item.id ? (
                        <div className="flex flex-col items-end gap-2 relative">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Buscar juego en BGG..."
                              value={remapBggIdInput}
                              onChange={(e) => handleSearchInputChange(e.target.value)}
                              className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 w-56 focus:outline-none focus:ring-2 focus:ring-[#8367C7]"
                            />
                            <button
                              onClick={() => handleRemapSubmit(item.id)}
                              disabled={loadingId === item.id}
                              className="bg-[#8367C7] hover:bg-[#7256b6] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                            >
                              Guardar
                            </button>
                            <button
                              onClick={() => {
                                setActiveRemapId(null);
                                setSearchResults([]);
                              }}
                              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5"
                            >
                              Cancelar
                            </button>
                          </div>
                          {searchResults.length > 0 && (
                            <div className="absolute top-10 right-0 z-20 w-72 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-gray-100">
                              {searchResults.map((game) => (
                                <button
                                  key={game.bgg_id}
                                  onClick={() => handleRemapSubmit(item.id, game.bgg_id)}
                                  className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex items-center justify-between transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    {game.thumbnail && (
                                      <img src={game.thumbnail} alt={game.name} className="w-6 h-6 object-cover rounded" />
                                    )}
                                    <span className="text-xs font-bold text-gray-900 truncate">{game.name}</span>
                                  </div>
                                  <span className="text-[10px] font-mono text-indigo-600 font-bold">#{game.bgg_id}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          {item.suggested_bgg_id && (
                            <button
                              onClick={() => handleApprove(item.id, item.suggested_bgg_id)}
                              disabled={loadingId === item.id}
                              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                            >
                              {loadingId === item.id ? 'Aprobando...' : 'Aprobar coincidencia'}
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setActiveRemapId(item.id);
                              setRemapBggIdInput(item.suggested_bgg_id ? String(item.suggested_bgg_id) : '');
                            }}
                            disabled={loadingId === item.id}
                            className="text-xs bg-white hover:bg-gray-100 text-gray-800 font-bold px-3 py-1.5 rounded-lg transition-colors border border-gray-300 shadow-sm disabled:opacity-50"
                          >
                            Reasignar catálogo
                          </button>
                          <button
                            onClick={() => handleReject(item.id)}
                            disabled={loadingId === item.id}
                            className="text-xs bg-white hover:bg-red-50 text-red-600 font-bold px-2.5 py-1.5 rounded-lg transition-colors border border-gray-300 shadow-sm disabled:opacity-50"
                          >
                            Descartar
                          </button>
                        </div>
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
