'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MerchantShippingPage() {
  const router = useRouter();
  const [storeId] = useState('store-duende-01');
  const [flatRate, setFlatRate] = useState('99.00');
  const [freeThreshold, setFreeThreshold] = useState('1100.00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/merchant/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: storeId,
          flat_rate: parseFloat(flatRate),
          free_shipping_threshold: freeThreshold ? parseFloat(freeThreshold) : null,
        }),
      });

      if (res.ok) {
        setMessage('¡Tarifas de envío actualizadas correctamente!');
        setTimeout(() => {
          router.push('/merchant/dashboard');
        }, 1200);
      }
    } catch {
      setMessage('Error al guardar tarifas de envío.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 py-4">
      <div className="text-center space-y-2">
        <span className="text-3xl">🚚</span>
        <h1 className="text-3xl font-extrabold text-[#3A3A3A]">Matriz de tarifas de envío nacional</h1>
        <p className="text-xs text-gray-500">
          Configura tu tarifa plana estándar y umbral de envío gratis para calcular el costo total entregado.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        {message && (
          <div className="p-4 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold shadow-sm">
            {message}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#3A3A3A] mb-1">
              Tarifa plana de envío nacional ($ MXN)
            </label>
            <input
              type="number"
              step="0.50"
              required
              value={flatRate}
              onChange={(e) => setFlatRate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:ring-2 focus:ring-[#8367C7] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3A3A3A] mb-1">
              Monto mínimo de compra para envío gratis ($ MXN)
            </label>
            <input
              type="number"
              step="50"
              value={freeThreshold}
              onChange={(e) => setFreeThreshold(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:ring-2 focus:ring-[#8367C7] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-[#3A3A3A] hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-[#8367C7] text-white text-xs font-bold shadow-md hover:bg-[#8367C7]/90 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
