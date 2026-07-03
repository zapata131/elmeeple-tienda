'use client';

import React, { useState } from 'react';

interface Props {
  bggId: number;
  gameName: string;
  userEmail: string;
  className?: string;
}

export function RestockAlertButton({
  bggId,
  gameName,
  userEmail,
  className = '',
}: Props) {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubscribe = async () => {
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch('/api/user/restock-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bggId,
          gameName,
          email: userEmail || 'player@meeple.com',
        }),
      });

      if (res.ok) {
        setSubscribed(true);
        setMsg('¡Alerta de Stock Activada!');
      } else {
        setMsg('Error al activar alerta');
      }
    } catch {
      setMsg('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 shadow-xs ${className}`}>
        <span>🔔 ¡Alerta de Stock Activada!</span>
      </span>
    );
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleSubscribe}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-extrabold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors shadow-sm disabled:opacity-50 ${className}`}
      >
        <span>⚡ Avísame cuando haya stock</span>
      </button>
      {msg && <span className="text-[10px] font-bold text-red-600">{msg}</span>}
    </div>
  );
}
