/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const supportedCountries = [
  { code: 'ES', name: 'España' },
  { code: 'PT', name: 'Portugal' },
  { code: 'MX', name: 'México' },
  { code: 'BR', name: 'Brasil' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CO', name: 'Colombia' },
  { code: 'CL', name: 'Chile' },
  { code: 'PE', name: 'Perú' },
];

interface ShippingRate {
  destination_country: string;
  flat_rate: number;
  free_shipping_threshold: number | null;
}

interface Props {
  storeId: string;
  initialRates: ShippingRate[];
}

export function ShippingMatrix({ storeId, initialRates }: Props) {
  const { data: session, status } = useSession();
  const [rates, setRates] = useState<Map<string, ShippingRate>>(new Map());
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const ratesMap = new Map<string, ShippingRate>();
    
    // Set defaults
    supportedCountries.forEach((c) => {
      ratesMap.set(c.code, {
        destination_country: c.code,
        flat_rate: 0,
        free_shipping_threshold: null,
      });
    });

    // Merge actual database rates
    initialRates.forEach((rate) => {
      ratesMap.set(rate.destination_country, {
        destination_country: rate.destination_country,
        flat_rate: Number(rate.flat_rate),
        free_shipping_threshold: rate.free_shipping_threshold !== null ? Number(rate.free_shipping_threshold) : null,
      });
    });

    setRates(ratesMap);
  }, [initialRates]);

  if (status === 'loading') {
    return <div className="text-sm text-gray-500 text-center py-12">Loading shipping matrix...</div>;
  }

  if (status === 'unauthenticated' || !session) {
    return (
      <div className="max-w-md mx-auto bg-white border border-gray-250 p-8 rounded-xl shadow-sm text-center my-12 flex flex-col gap-4">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-900">Acceso Restringido</h2>
        <p className="text-sm text-gray-600">
          Please sign in as a partner to configure shipping rates.
        </p>
      </div>
    );
  }

  const handleInputChange = (country: string, field: 'flat_rate' | 'free_shipping_threshold', value: string) => {
    setRates((prev) => {
      const next = new Map(prev);
      const current = next.get(country) || { destination_country: country, flat_rate: 0, free_shipping_threshold: null };
      
      const numVal = value === '' ? (field === 'free_shipping_threshold' ? null : 0) : Number(value);
      
      next.set(country, {
        ...current,
        [field]: numVal,
      });
      return next;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validations
    const ratesArray = Array.from(rates.values());
    const hasNegative = ratesArray.some(
      (r) => r.flat_rate < 0 || (r.free_shipping_threshold !== null && r.free_shipping_threshold < 0)
    );

    if (hasNegative) {
      setErrorMsg('Las tarifas de envío no pueden ser negativas.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/merchant/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: storeId,
          rates: ratesArray,
        }),
      });

      if (res.ok) {
        setSuccessMsg('Gastos de envío actualizados con éxito.');
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Fallo al actualizar la matriz de gastos.');
      }
    } catch {
      setErrorMsg('Error de red. Inténtelo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm p-8 my-6 flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Configuración de Tarifas de Envío</h2>
        <p className="text-xs text-gray-500 mt-1">
          Configura tus tarifas planas de transporte y umbrales de envío gratuito para cada país de destino.
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

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          <table className="w-full border-collapse text-left text-sm text-gray-700">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-250 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">País de Destino</th>
                <th className="px-6 py-3">Tarifa Plana (€)</th>
                <th className="px-6 py-3">Envío Gratis Desde (€)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {supportedCountries.map((c) => {
                const rate = rates.get(c.code) || { destination_country: c.code, flat_rate: 0, free_shipping_threshold: null };
                return (
                  <tr key={c.code} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-950">
                      {c.name} ({c.code})
                    </td>
                    <td className="px-6 py-3">
                      <input
                        type="number"
                        step="0.01"
                        aria-label={`flat-rate-${c.code}`}
                        value={rate.flat_rate}
                        onChange={(e) => handleInputChange(c.code, 'flat_rate', e.target.value)}
                        className="w-32 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={isSaving}
                      />
                    </td>
                    <td className="px-6 py-3">
                      <input
                        type="number"
                        step="0.01"
                        aria-label={`free-threshold-${c.code}`}
                        value={rate.free_shipping_threshold !== null ? rate.free_shipping_threshold : ''}
                        onChange={(e) => handleInputChange(c.code, 'free_shipping_threshold', e.target.value)}
                        placeholder="N/A"
                        className="w-32 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={isSaving}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50"
        >
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  );
}
