'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export interface AlertItem {
  id: string;
  bggId: number;
  gameName: string;
  thumbnail: string;
  targetPrice: number;
  currentLowestPrice: number;
  isTriggered: boolean;
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
        setErrorMsg('Error al eliminar la alerta.');
      }
    } catch {
      setErrorMsg('Error de conexión de red.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleUpdatePrice = async (alertId: string, currentTarget: number) => {
    const input = prompt('Introduce el nuevo precio objetivo (€):', currentTarget.toString());
    if (!input) return;
    const val = Number(input);
    if (isNaN(val) || val <= 0) {
      alert('Precio inválido');
      return;
    }

    setLoadingId(alertId);
    setErrorMsg('');
    try {
      const res = await fetch('/api/user/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, targetPrice: val }),
      });
      if (res.ok) {
        setAlerts((prev) =>
          prev.map((a) =>
            a.id === alertId
              ? { ...a, targetPrice: val, isTriggered: a.currentLowestPrice <= val }
              : a
          )
        );
      } else {
        setErrorMsg('Error al actualizar el precio.');
      }
    } catch {
      setErrorMsg('Error de conexión de red.');
    } finally {
      setLoadingId(null);
    }
  };

  const triggeredCount = alerts.filter((a) => a.isTriggered).length;

  return (
    <div className="flex flex-col gap-8">
      
      {/* Stats Header Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Alertas Activas</span>
          <span className="text-3xl font-extrabold text-gray-950 mt-2">{alerts.length}</span>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">¡Precios Alcanzados!</span>
          <span className="text-3xl font-extrabold text-emerald-600 mt-2">{triggeredCount}</span>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cuenta Asociada</span>
          <span className="text-sm font-extrabold text-indigo-650 truncate mt-2">{userEmail}</span>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-150 text-red-700 text-xs font-semibold px-4 py-2.5 rounded-xl">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Alerts Grid */}
      {alerts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
          <span className="text-4xl">🔔</span>
          <h3 className="font-extrabold text-gray-900 text-base">No tienes alertas de bajada de precio activas</h3>
          <p className="text-xs text-gray-500 max-w-md">
            Navega por nuestro catálogo de juegos, entra en la ficha del juego que desees y activa una alerta para recibir avisos instantáneos cuando alcance tu precio objetivo.
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
              className={`bg-white border rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-5 relative transition-all ${
                alert.isTriggered ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-gray-200'
              }`}
            >
              {alert.isTriggered && (
                <span className="absolute -top-3 right-5 bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-0.5 rounded-full shadow-sm">
                  🔥 ¡Precio Alcanzado!
                </span>
              )}

              <div className="flex items-start gap-4">
                {alert.thumbnail ? (
                  <img
                    src={alert.thumbnail}
                    alt={alert.gameName}
                    className="w-16 h-16 object-cover rounded-xl border border-gray-200 shrink-0 bg-gray-50"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl shrink-0">
                    🎲
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

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-150">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Tu Objetivo</span>
                      <span className="text-base font-extrabold text-indigo-650">€{alert.targetPrice.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Mejor Precio Actual</span>
                      <span className={`text-base font-extrabold ${alert.isTriggered ? 'text-emerald-600' : 'text-gray-900'}`}>
                        €{alert.currentLowestPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleUpdatePrice(alert.id, alert.targetPrice)}
                  disabled={loadingId === alert.id}
                  className="text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  Editar Objetivo
                </button>
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

    </div>
  );
}
