'use client';

import React, { useState } from 'react';

interface StoreDetails {
  id: string;
  name: string;
  feed_status: string;
  feed_last_processed_count: number;
  feed_last_matched_count: number;
  feed_last_unmatched_count: number;
  google_shopping_feed_url: string | null;
}

interface Props {
  store: StoreDetails;
}

export function FeedDiagnosticsPanel({ store }: Props) {
  const [stats, setStats] = useState({
    status: store.feed_status,
    processed: store.feed_last_processed_count,
    matched: store.feed_last_matched_count,
    unmatched: store.feed_last_unmatched_count,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const triggerSync = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/merchant/sync-feed', {
        method: 'POST',
      });

      const data = await res.json();

      if (res.ok) {
        setStats({
          status: 'success',
          processed: data.processed || 0,
          matched: data.matched || 0,
          unmatched: data.unmatched || 0,
        });
        setSuccessMsg('Sincronización del feed completada con éxito.');
      } else {
        setErrorMsg(data.error || 'Failed to trigger feed sync.');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm p-8 my-6 flex flex-col gap-6">
      
      <div>
        <h2 className="text-xl font-bold text-gray-900">Diagnóstico de Feed y Sincronización</h2>
        <p className="text-xs text-gray-500 mt-1">
          Configuración actual: <span className="font-semibold text-gray-700">{store.google_shopping_feed_url || 'No configurado'}</span>
        </p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-150 text-red-700 text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2">
          <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 border border-green-150 text-green-800 text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2">
          <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-3 gap-4 border border-gray-200 rounded-xl p-5 bg-gray-50">
        <div className="flex flex-col text-center">
          <span className="text-[10px] text-gray-500 font-bold uppercase">Procesados</span>
          <span className="text-2xl font-extrabold text-gray-950 mt-1">{stats.processed}</span>
        </div>
        <div className="flex flex-col text-center border-x border-gray-200">
          <span className="text-[10px] text-gray-500 font-bold uppercase text-indigo-600">Coincidentes</span>
          <span className="text-2xl font-extrabold text-indigo-600 mt-1">{stats.matched}</span>
        </div>
        <div className="flex flex-col text-center">
          <span className="text-[10px] text-gray-500 font-bold uppercase text-red-650">No Coincidentes</span>
          <span className="text-2xl font-extrabold text-red-650 mt-1">{stats.unmatched}</span>
        </div>
      </div>

      {/* Info Warning */}
      {stats.unmatched > 0 && (
        <div className="bg-amber-50 border border-amber-150 text-amber-800 text-xs px-4 py-3 rounded-lg flex flex-col gap-1">
          <span className="font-bold flex items-center gap-1.5 text-amber-900">
            <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Juegos de mesa no catalogados ({stats.unmatched})</span>
          </span>
          <span className="text-[10px] text-amber-700">
            Algunos productos en tu feed no coinciden con nuestro catálogo global. Asegúrate de incluir códigos EAN (GTIN) correctos en tu feed XML.
          </span>
        </div>
      )}

      <button
        onClick={triggerSync}
        disabled={isLoading || !store.google_shopping_feed_url}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50"
      >
        {isLoading ? 'Sincronizando Catálogo...' : 'Sincronizar Feed Ahora'}
      </button>

    </div>
  );
}
