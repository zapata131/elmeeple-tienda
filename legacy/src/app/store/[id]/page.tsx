import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { Toolbar } from '@/components/Toolbar';
import Link from 'next/link';
import { MOCK_IBEROAMERICAN_STORES } from '@/utils/mockData';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function StoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const storeId = resolvedParams.id;

  const { data: storeData } = await supabase
    .from('stores')
    .select('id, name, base_url, country')
    .eq('id', storeId)
    .single();

  const mockMatch = MOCK_IBEROAMERICAN_STORES.find((s) => s.id === storeId);
  const storeName = storeData?.name || mockMatch?.name || (storeId === '11111111-1111-1111-1111-111111111101' ? 'Zygomatic España' : `Tienda Asociada #${storeId.slice(0, 6)}`);
  const baseUrl = storeData?.base_url || mockMatch?.website || 'https://fichaydado.com';
  const country = storeData?.country || mockMatch?.country || 'MX';

  const city = mockMatch?.city || 'Ciudad de México, CDMX';
  const address = mockMatch?.address || 'Envíos verificados a toda la República Mexicana';
  const description = mockMatch?.description || 'Tienda especializada en juegos de mesa modernos y accesorios para el aficionado en México.';
  const specialties = mockMatch?.specialties || ['Juegos modernos', 'Novedades', 'Accesorios'];
  const shippingFlat = mockMatch?.default_shipping_flat ?? 99;
  const freeThreshold = mockMatch?.free_shipping_threshold ?? 1200;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Toolbar />

      <header className="bg-white border-b border-gray-200 py-6 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-extrabold text-gray-900">{storeName}</h1>
              <span className="text-[10px] bg-green-50 text-green-700 font-extrabold px-2.5 py-0.5 rounded-full border border-green-200">
                ✓ Tienda verificada
              </span>
            </div>
            <span className="text-xs text-gray-500 font-medium">Socio comercial MeeplePrecios ({country})</span>
          </div>
          <Link
            href="/"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl transition-colors"
          >
            ← Volver a inicio
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto py-12 px-6">
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm flex flex-col gap-8">
          {/* Bio / Description */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Información de la tienda</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Location and Logistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-xl border border-gray-200/80">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Ubicación y logística</h3>
              <p className="text-sm font-semibold text-gray-900">{city}</p>
              <p className="text-xs text-gray-600 mt-0.5">{address}</p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Políticas de envío ($ MXN)</h3>
              <p className="text-sm font-semibold text-gray-900">
                Tarifa fija: ${shippingFlat.toFixed(2)}
              </p>
              <p className="text-xs text-green-700 font-semibold mt-0.5">
                Envío gratis en pedidos mayores a ${freeThreshold.toLocaleString('es-MX')}
              </p>
            </div>
          </div>

          {/* Specialties */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Especialidades del catálogo</h3>
            <div className="flex flex-wrap gap-2">
              {specialties.map((spec, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-100"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
            <a
              href={`/api/redirect?url=${encodeURIComponent(baseUrl)}&store_id=${storeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
            >
              <span>Visitar sitio web oficial</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-white border-t border-gray-800 py-8 px-6 text-center text-xs text-gray-500 mt-12">
        <p>© 2026 MeeplePrecios. Comparador Inteligente de Juegos de Mesa.</p>
      </footer>
    </div>
  );
}
