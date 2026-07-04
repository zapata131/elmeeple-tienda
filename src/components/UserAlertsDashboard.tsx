'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export interface AlertItem {
  id: string;
  bggId: number;
  gameName: string;
  thumbnail: string;
  targetPrice?: number | null;
  currentLowestPrice?: number;
  isTriggered?: boolean;
  createdAt: string;
}

interface Props {
  initialAlerts: AlertItem[];
  userEmail: string;
}

export function UserAlertsDashboard({ initialAlerts, userEmail }: Props) {
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [bggUsername, setBggUsername] = useState('');
  const [syncingBgg, setSyncingBgg] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('');

  const handleSyncBgg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bggUsername.trim()) return;
    setSyncingBgg(true);
    setErrorMsg('');
    setSyncSuccessMsg('');
    try {
      const res = await fetch('/api/user/sync-bgg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: bggUsername.trim(), email: userEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setSyncSuccessMsg(data.message || `¡Sincronización exitosa (${data.importedCount} juegos)!`);
        setBggUsername('');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setErrorMsg(data.error || 'Error al importar wishlist desde BGG.');
      }
    } catch {
      setErrorMsg('Error de conexión de red.');
    } finally {
      setSyncingBgg(false);
    }
  };

  const handleDelete = async (alertId: string) => {
    setLoadingId(alertId);
    setErrorMsg('');
    try {
      const res = await fetch('/api/user/alerts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId }),
      });
      if (res.ok) {
        setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      } else {
        setErrorMsg('Error al eliminar el juego de la lista.');
      }
    } catch {
      setErrorMsg('Error de conexión de red.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* Stats Header Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total en Lista de Deseos</span>
          <span className="text-3xl font-extrabold text-gray-950 mt-2">{alerts.length}</span>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sincronizados BGG</span>
          <span className="text-3xl font-extrabold text-indigo-600 mt-2">{alerts.length}</span>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cuenta Asociada</span>
          <span className="text-sm font-extrabold text-indigo-650 truncate mt-2">{userEmail}</span>
        </div>
      </div>

      {/* BGG Wishlist Importer Card */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-indigo-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-800/80 border border-indigo-700 flex items-center justify-center text-[#8367C7] shrink-0 shadow-inner">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Sincronizar Wishlist desde BoardGameGeek</h3>
            <p className="text-xs text-indigo-200 mt-0.5">
              Importa automáticamente tus juegos deseados (wishlist/want to buy) desde tu colección de BGG.
            </p>
          </div>
        </div>
        <form onSubmit={handleSyncBgg} className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <input
            type="text"
            placeholder="Tu usuario de BGG..."
            value={bggUsername}
            onChange={(e) => setBggUsername(e.target.value)}
            disabled={syncingBgg}
            className="px-4 py-2 text-xs bg-indigo-950/90 text-white border border-indigo-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-indigo-400 min-w-[180px]"
          />
          <button
            type="submit"
            disabled={syncingBgg || !bggUsername.trim()}
            className="bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-colors shadow-sm whitespace-nowrap"
          >
            {syncingBgg ? 'Importando...' : 'Importar Wishlist BGG'}
          </button>
        </form>
      </div>

      {syncSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold px-4 py-3 rounded-xl shadow-sm flex items-center gap-2">
          <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{syncSuccessMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-150 text-red-700 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2">
          <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Wishlist Items Grid */}
      {alerts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#8367C7]/15 border border-[#8367C7]/30 flex items-center justify-center text-[#8367C7]">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="font-extrabold text-gray-900 text-base">Tu lista de deseos de BGG está vacía</h3>
          <p className="text-xs text-gray-500 max-w-md">
            Importa tu wishlist desde BoardGameGeek usando el formulario superior o explora nuestro catálogo para descubrir juegos de mesa al mejor precio en tiendas.
          </p>
          <Link
            href="/catalog"
            className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-colors shadow-sm mt-2"
          >
            Explorar Catálogo Ahora
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-5 transition-all"
            >
              <div className="flex items-start gap-4">
                {alert.thumbnail ? (
                  <img
                    src={alert.thumbnail}
                    alt={alert.gameName}
                    className="w-16 h-16 object-cover rounded-xl border border-gray-200 shrink-0 bg-gray-50"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-[#8367C7]/15 border border-[#8367C7]/30 flex items-center justify-center text-[#8367C7] shrink-0">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/game/${alert.bggId}`}
                    className="text-sm font-extrabold text-gray-950 hover:text-indigo-650 truncate block transition-colors"
                  >
                    {alert.gameName}
                  </Link>
                  <span className="text-[10px] text-gray-400 font-mono">BGG #{alert.bggId}</span>

                  <div className="mt-3 pt-3 border-t border-gray-150 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    {alert.currentLowestPrice !== undefined && alert.currentLowestPrice > 0 ? (
                      <div className="flex items-center justify-between sm:justify-start gap-3 w-full">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-400 block">Mejor Precio</span>
                          <span className="text-base font-extrabold text-gray-900">
                            €{alert.currentLowestPrice.toFixed(2)}
                          </span>
                        </div>
                        <Link
                          href={`/game/${alert.bggId}`}
                          className="ml-auto inline-flex items-center gap-1.5 bg-[#73D8D4]/15 hover:bg-[#73D8D4]/25 text-teal-900 border border-[#73D8D4]/40 text-xs font-extrabold px-3 py-1.5 rounded-xl transition-colors shadow-2xs"
                        >
                          <span>Ver Ofertas</span>
                          <svg className="w-3.5 h-3.5 text-[#73D8D4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-semibold text-gray-500 inline-flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-[#FF9E8A] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <span>Consultando ofertas en tiendas...</span>
                        </span>
                        <Link
                          href={`/game/${alert.bggId}`}
                          className="inline-flex items-center gap-1 bg-[#8367C7]/10 hover:bg-[#8367C7]/20 text-indigo-900 border border-[#8367C7]/30 text-xs font-extrabold px-3 py-1.5 rounded-xl transition-colors shrink-0"
                        >
                          <span>Ver Ofertas</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleDelete(alert.id)}
                  disabled={loadingId === alert.id}
                  className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loadingId === alert.id ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Restock Subscriptions Section */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-gray-150 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-gray-900">Suscripciones de Reabastecimiento (Restock)</h3>
            <p className="text-xs text-gray-500 mt-0.5">Avisos automáticos cuando tiendas asociadas reportan stock en el feed diario.</p>
          </div>
          <span className="text-xs font-extrabold bg-[#73D8D4]/20 text-teal-900 border border-[#73D8D4]/40 px-3 py-1 rounded-full inline-flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-[#73D8D4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Monitor Activo</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#73D8D4]/20 border border-[#73D8D4]/40 flex items-center justify-center text-teal-800 shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <Link href="/game/342942" className="text-xs font-extrabold text-gray-900 hover:text-indigo-650 block">Ark Nova</Link>
                <span className="text-[10px] text-gray-400 font-mono">BGG #342942</span>
              </div>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
              <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>¡Ya en Stock!</span>
            </span>
          </div>

          <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#FF9E8A]/20 border border-[#FF9E8A]/40 flex items-center justify-center text-rose-800 shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <Link href="/game/224517" className="text-xs font-extrabold text-gray-900 hover:text-indigo-650 block">Brass: Birmingham</Link>
                <span className="text-[10px] text-gray-400 font-mono">BGG #224517</span>
              </div>
            </div>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-1 rounded-lg">
              Esperando feed...
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
