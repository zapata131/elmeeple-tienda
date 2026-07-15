'use client';

import React, { useState } from 'react';

interface StoreItem {
  id: string;
  name: string;
  verified: boolean;
  owner_email: string;
  description?: string;
  city?: string;
  address?: string;
  specialties?: string[];
}

interface Props {
  initialStores: StoreItem[];
}

export function AdminStoreList({ initialStores }: Props) {
  const [stores, setStores] = useState<StoreItem[]>(initialStores);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ description: string; city: string; address: string; specialties: string }>({
    description: '',
    city: '',
    address: '',
    specialties: '',
  });

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

  const startEditing = (store: StoreItem) => {
    setEditingStoreId(store.id);
    setEditForm({
      description: store.description || 'Tienda especializada en juegos de mesa modernos en México.',
      city: store.city || 'Ciudad de México, CDMX',
      address: store.address || 'Envíos verificados a toda la República Mexicana',
      specialties: store.specialties ? store.specialties.join(', ') : 'Juegos modernos, Novedades, Accesorios',
    });
  };

  const handleSaveProfile = (storeId: string) => {
    const specs = editForm.specialties.split(',').map((s) => s.trim()).filter(Boolean);
    setStores((prev) =>
      prev.map((s) =>
        s.id === storeId
          ? {
              ...s,
              description: editForm.description,
              city: editForm.city,
              address: editForm.address,
              specialties: specs,
            }
          : s
      )
    );
    setEditingStoreId(null);
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
        setSeedMsg('¡Base de datos poblada con éxito desde los feeds XML reales de las 8 tiendas verificadas en México!');
      } else {
        setErrorMsg('Error al poblar datos reales desde los feeds.');
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

      {/* Real Feeds Ingestion Card */}
      <div className="bg-indigo-950 text-white p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-md border border-indigo-800">
        <div>
          <h3 className="font-extrabold text-sm text-indigo-100 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
            <span>Ingesta de Feeds XML Reales (Shopify Atom Engine)</span>
          </h3>
          <p className="text-xs text-indigo-300 mt-1 max-w-xl">
            Puebla la base de datos con ofertas auténticas extraídas de los feeds XML oficiales de las 8 tiendas verificadas en México.
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
          {isSeeding ? 'Ingestando feeds...' : 'Ingestar Feeds Reales Ahora'}
        </button>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm text-gray-700">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-250 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-3">Nombre de la tienda</th>
              <th className="px-6 py-3">Propietario (email)</th>
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
                <React.Fragment key={s.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-bold text-gray-950">
                      <div>{s.name}</div>
                      {s.city && <div className="text-xs font-normal text-gray-500 mt-0.5">📍 {s.city}</div>}
                    </td>
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
                    <td className="px-6 py-3 text-right space-x-2">
                      <button
                        onClick={() => startEditing(s)}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 shadow-sm"
                      >
                        Editar perfil
                      </button>
                      <button
                        onClick={() => toggleVerification(s.id, s.verified)}
                        disabled={loadingId === s.id}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors border shadow-sm disabled:opacity-50 ${
                          s.verified
                            ? 'bg-white hover:bg-gray-50 text-red-600 border-gray-300'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent'
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
                  {editingStoreId === s.id && (
                    <tr className="bg-gray-50/80">
                      <td colSpan={4} className="px-6 py-6 border-t border-gray-200">
                        <div className="max-w-2xl bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-4">
                          <h4 className="text-sm font-bold text-gray-900">Editar perfil de tienda: {s.name}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">Ciudad / Estado</label>
                              <input
                                type="text"
                                value={editForm.city}
                                onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">Especialidades (separadas por coma)</label>
                              <input
                                type="text"
                                value={editForm.specialties}
                                onChange={(e) => setEditForm({ ...editForm, specialties: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Dirección / Logística</label>
                            <input
                              type="text"
                              value={editForm.address}
                              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-600 mb-1">Biografía / Descripción</label>
                            <textarea
                              rows={2}
                              value={editForm.description}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                            />
                          </div>
                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              onClick={() => setEditingStoreId(null)}
                              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleSaveProfile(s.id)}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm"
                            >
                              Guardar cambios
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
