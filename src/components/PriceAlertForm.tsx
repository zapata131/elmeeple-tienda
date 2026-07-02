/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Props {
  bggId: number;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export function PriceAlertForm({ bggId }: Props) {
  const { data: session, status } = useSession();
  const [targetPrice, setTargetPrice] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedCurrency = getCookie('meeple_currency');
    if (savedCurrency) setCurrency(savedCurrency);
  }, []);

  if (status === 'loading') {
    return <div className="text-sm text-gray-500">Loading alert panel...</div>;
  }

  if (status === 'unauthenticated' || !session) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
        <p className="text-sm text-gray-600 font-medium">
          Sign in to set price alerts and monitor deals.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const priceNum = Number(targetPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMsg('Target price must be a positive number');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/price-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bgg_id: bggId,
          target_price: priceNum,
          currency: currency,
        }),
      });

      if (res.ok) {
        setSuccessMsg('Alert successfully created!');
        setTargetPrice('');
      } else {
        const err = await res.json();
        setErrorMsg(err.error || 'Failed to create price alert.');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-250 rounded-xl p-5 shadow-sm flex flex-col gap-4">
      <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
        🔔 Crear Alerta de Precio
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="target-price-input" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Target Price ({currency})
          </label>
          <div className="relative">
            <input
              type="number"
              id="target-price-input"
              aria-label="target price"
              step="0.01"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="e.g. 29.99"
              className="w-full pl-3 pr-12 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={isSubmitting}
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-400 font-bold">
              {currency}
            </span>
          </div>
        </div>

        {errorMsg && (
          <p className="text-xs text-red-650 font-semibold bg-red-50 px-2.5 py-1.5 rounded-lg">
            ⚠️ {errorMsg}
          </p>
        )}

        {successMsg && (
          <p className="text-xs text-green-700 font-semibold bg-green-50 px-2.5 py-1.5 rounded-lg">
            ✅ {successMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-sm transition-all shadow-sm disabled:opacity-50"
        >
          {isSubmitting ? 'Creando...' : 'Crear Alerta'}
        </button>
      </form>
    </div>
  );
}
