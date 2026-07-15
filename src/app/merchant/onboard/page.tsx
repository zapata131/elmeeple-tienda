'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MerchantOnboardPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [feedUrl, setFeedUrl] = useState('');
  const [feedType, setFeedType] = useState<'shopify_json' | 'google_xml'>('shopify_json');
  const [flatRate, setFlatRate] = useState('105.00');
  const [freeThreshold, setFreeThreshold] = useState('1200.00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/merchant/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          logo_url: logoUrl,
          feed_url: feedUrl,
          feed_type: feedType,
          flat_rate: parseFloat(flatRate),
          free_shipping_threshold: freeThreshold ? parseFloat(freeThreshold) : null,
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: '¡Tienda registrada con éxito! Redirigiendo al panel de control...' });
        setTimeout(() => {
          router.push('/merchant/dashboard');
        }, 1200);
      } else {
        setMessage({ type: 'error', text: 'Ocurrió un error al registrar la tienda.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión con el servidor.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      <div className="text-center space-y-2">
        <span className="text-3xl">🏬</span>
        <h1 className="text-3xl font-extrabold text-[#3A3A3A]">Registro de nueva tienda socia</h1>
        <p className="text-xs text-gray-500">
          Integra tu catálogo automáticamente y comienza a recibir tráfico de compradores de juegos de mesa en México.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        {message && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold ${
              message.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#3A3A3A] mb-1">Nombre de la tienda</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. La Caravana Gamelab CDMX"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#8367C7] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3A3A3A] mb-1">URL del logotipo (opcional)</label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://tutienda.com/logo.png"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#8367C7] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#3A3A3A] mb-1">URL del feed de productos</label>
              <input
                type="url"
                required
                value={feedUrl}
                onChange={(e) => setFeedUrl(e.target.value)}
                placeholder="https://tutienda.com/products.json"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#8367C7] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3A3A3A] mb-1">Formato del feed</label>
              <select
                value={feedType}
                onChange={(e) => setFeedType(e.target.value as 'shopify_json' | 'google_xml')}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:ring-2 focus:ring-[#8367C7] focus:outline-none"
              >
                <option value="shopify_json">Shopify JSON</option>
                <option value="google_xml">Google Shopping XML</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-[#3A3A3A] mb-1">Tarifa de envío estándar ($ MXN)</label>
              <input
                type="number"
                step="0.50"
                required
                value={flatRate}
                onChange={(e) => setFlatRate(e.target.value)}
                placeholder="105.00"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#8367C7] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3A3A3A] mb-1">Monto mínimo para envío gratis ($ MXN)</label>
              <input
                type="number"
                step="50"
                value={freeThreshold}
                onChange={(e) => setFreeThreshold(e.target.value)}
                placeholder="1200.00"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#8367C7] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl bg-[#8367C7] text-white text-sm font-bold shadow-md hover:bg-[#8367C7]/90 transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'Registrando tienda...' : 'Completar registro de tienda'}
        </button>
      </form>
    </div>
  );
}
