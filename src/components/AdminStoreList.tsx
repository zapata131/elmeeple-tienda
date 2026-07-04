'use client';

import React, { useState } from 'react';

interface StoreItem {
  id: string;
  name: string;
  verified: boolean;
  owner_email: string;
}

interface Props {
  initialStores: StoreItem[];
}

export function AdminStoreList({ initialStores }: Props) {
  const [stores, setStores] = useState<StoreItem[]>(initialStores);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const toggleVerification = async (storeId: string, currentVerified: boolean) => {
    setLoadingId(storeId);
    setErrorMsg('');
    const targetStatus = !currentVerified;

    try {
      const res = await fetch('/api/admin/verify-store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: storeId,
          verified: targetStatus,
        }),
      });

      if (res.ok) {
        setStores((prev) =>
          prev.map((s) => (s.id === storeId ? { ...s, verified: targetStatus } : s))
        );
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to update store status.');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoadingId(null);
    }
  };

  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');

  const handleSeed = async () => {
    setIsSeeding(true);
    setSeedMsg('');
    try {
      const res = await fetch('/api/admin/seed-data', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setSeedMsg('¡Catálogo de prueba poblado con éxito! (22 juegos con portadas BGG y 12 tiendas regionales)');
      } else {
        setErrorMsg('Error al poblar datos de prueba.');
      }
    } catch {
      setErrorMsg('Error de red al poblar datos.');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {errorMsg && (
        <div className="bg-red-50 border border-red-150 text-red-700 text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2">
          <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Seed Mock Data Card */}
      <div className="bg-indigo-950 text-white p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-md border border-indigo-800">
        <div>
          <h3 className="font-extrabold text-sm text-indigo-100 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
            <span>Generador de Datos de Prueba (Mock Engine & BGG Covers)</span>
          </h3>
          <p className="text-xs text-indigo-300 mt-1 max-w-xl">
            Puebla la base de datos local con 22 juegos top (Catan, Scythe, Wingspan, Ark Nova...) con portadas auténticas de BGG y 12 tiendas en España, Portugal y Latinoamérica.
          </p>
          {seedMsg && (
            <p className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-300 mt-2">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{seedMsg}</span>
            </p>
          )}
        </div>
        <button
          onClick={handleSeed}
          disabled={isSeeding}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50 shrink-0"
        >
          {isSeeding ? 'Generando Datos...' : 'Poblar Catálogo Mock Ahora'}
        </button>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm text-gray-700">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-250 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-3">Nombre de la Tienda</th>
              <th className="px-6 py-3">Propietario (Email)</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {stores.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                  No stores registered yet.
                </td>
              </tr>
            ) : (
              stores.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold text-gray-950">{s.name}</td>
                  <td className="px-6 py-4 font-medium text-gray-600">{s.owner_email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                        s.verified
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {s.verified ? 'Verificada' : 'Suspendida'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => toggleVerification(s.id, s.verified)}
                      disabled={loadingId === s.id}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors border shadow-sm disabled:opacity-50 ${
                        s.verified
                          ? 'bg-white hover:bg-gray-50 text-red-600 border-gray-300'
                          : 'bg-indigo-650 hover:bg-indigo-700 text-white border-transparent'
                      }`}
                    >
                      {loadingId === s.id
                        ? 'Actualizando...'
                        : s.verified
                        ? 'Suspender'
                        : 'Verificar'}
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
