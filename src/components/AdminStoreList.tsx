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

  return (
    <div className="flex flex-col gap-6">
      {errorMsg && (
        <div className="bg-red-50 border border-red-150 text-red-700 text-xs font-semibold px-4 py-2.5 rounded-lg">
          ⚠️ {errorMsg}
        </div>
      )}

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
