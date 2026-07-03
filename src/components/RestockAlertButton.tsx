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
        <svg className="w-4 h-4 text-[#73D8D4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span>¡Alerta de Stock Activada!</span>
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
        <svg className="w-4 h-4 text-[#FF9E8A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span>Avísame cuando haya stock</span>
      </button>
      {msg && <span className="text-[10px] font-bold text-red-600">{msg}</span>}
    </div>
  );
}
