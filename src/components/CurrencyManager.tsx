'use client';

import React, { useState } from 'react';

interface ExchangeRateItem {
  currency: string;
  rate: number;
  enabled: boolean;
  updated_at: string;
}

interface Props {
  initialRates: ExchangeRateItem[];
}

export function CurrencyManager({ initialRates }: Props) {
  const [rates, setRates] = useState<ExchangeRateItem[]>(initialRates);
  const [loadingCode, setLoadingCode] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRateChange = (currency: string, newRateStr: string) => {
    const numVal = parseFloat(newRateStr);
    setRates((prev) =>
      prev.map((item) => (item.currency === currency ? { ...item, rate: isNaN(numVal) ? 0 : numVal } : item))
    );
  };

  const handleSaveRate = async (currency: string, rate: number, enabled: boolean) => {
    if (rate <= 0) {
      setErrorMsg('El tipo de cambio debe ser un número positivo.');
      return;
    }

    setLoadingCode(currency);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/admin/fx-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency, rate, enabled }),
      });

      if (res.ok) {
        setSuccessMsg(`Tasa para ${currency} actualizada con éxito.`);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || `Error al actualizar tasa para ${currency}.`);
      }
    } catch {
      setErrorMsg('Error de red. Verifique su conexión.');
    } finally {
      setLoadingCode(null);
    }
  };

  const handleToggleEnabled = async (currency: string, currentEnabled: boolean, rate: number) => {
    const nextEnabled = !currentEnabled;
    setRates((prev) =>
      prev.map((item) => (item.currency === currency ? { ...item, enabled: nextEnabled } : item))
    );
    await handleSaveRate(currency, rate, nextEnabled);
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/cron/sync-fx', { method: 'POST' });
      if (res.ok) {
        setSuccessMsg('Sincronización externa completada con éxito.');
        // Refresh local cache via GET
        const refreshRes = await fetch('/api/fx-rates');
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          if (data.rates) {
            setRates(data.rates);
          }
        }
      } else {
        setErrorMsg('Error durante la sincronización automática.');
      }
    } catch {
      setErrorMsg('Error de conexión al sincronizar.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestión de Tipos de Cambio</h2>
          <p className="text-xs text-gray-500 mt-1">
            Revisa y ajusta las tasas de conversión locales referenciadas a EUR. Caché local de 24 horas activa.
          </p>
        </div>
        <button
          onClick={handleSyncNow}
          disabled={isSyncing}
          className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-xs shadow-sm transition-colors disabled:opacity-50"
        >
          {isSyncing ? 'Sincronizando FX...' : 'Sincronizar FX Ahora'}
        </button>
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

      <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm text-gray-700">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-250 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-3">Moneda (ISO)</th>
              <th className="px-6 py-3">Tasa vs EUR (€1.00 =)</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3">Última Actualización</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rates.map((item) => (
              <tr key={item.currency} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-extrabold text-gray-950">{item.currency}</td>
                <td className="px-6 py-3">
                  <input
                    type="number"
                    step="0.01"
                    aria-label={`rate-input-${item.currency}`}
                    value={item.rate}
                    onChange={(e) => handleRateChange(item.currency, e.target.value)}
                    disabled={item.currency === 'EUR' || loadingCode === item.currency}
                    className="w-32 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 font-semibold"
                  />
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                      item.enabled
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    {item.enabled ? 'Habilitada' : 'Inactiva'}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">
                  {new Date(item.updated_at).toLocaleString()}
                </td>
                <td className="px-6 py-3 text-right flex items-center justify-end gap-2">
                  {item.currency !== 'EUR' && (
                    <>
                      <button
                        onClick={() => handleSaveRate(item.currency, item.rate, item.enabled)}
                        disabled={loadingCode === item.currency}
                        className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-lg transition-colors border border-indigo-200 disabled:opacity-50"
                      >
                        {loadingCode === item.currency ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button
                        onClick={() => handleToggleEnabled(item.currency, item.enabled, item.rate)}
                        disabled={loadingCode === item.currency}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors border disabled:opacity-50 ${
                          item.enabled
                            ? 'bg-white hover:bg-gray-50 text-red-600 border-gray-300'
                            : 'bg-green-600 hover:bg-green-700 text-white border-transparent'
                        }`}
                      >
                        {item.enabled ? 'Deshabilitar' : 'Habilitar'}
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
