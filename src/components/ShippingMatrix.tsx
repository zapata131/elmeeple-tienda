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
        <span className="text-3xl">🔒</span>
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
        <div className="bg-red-50 border border-red-150 text-red-700 text-xs font-semibold px-4 py-2.5 rounded-lg">
          ⚠️ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 border border-green-150 text-green-800 text-xs font-semibold px-4 py-2.5 rounded-lg">
          ✅ {successMsg}
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
          className="w-full bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50"
        >
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  );
}
