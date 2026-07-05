import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { Toolbar } from '@/components/Toolbar';
import Link from 'next/link';

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

  const storeName = storeData?.name || (storeId === '11111111-1111-1111-1111-111111111101' ? 'Zygomatic España' : `Tienda Asociada #${storeId.slice(0, 6)}`);
  const baseUrl = storeData?.base_url || 'https://example.com';
  const country = storeData?.country || 'MX';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Toolbar />

      <header className="bg-white border-b border-gray-200 py-6 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-extrabold text-gray-900">{storeName}</h1>
              <span className="text-[10px] bg-green-50 text-green-700 font-extrabold px-2.5 py-0.5 rounded-full border border-green-200">
                ✓ Tienda Verificada
              </span>
            </div>
            <span className="text-xs text-gray-500 font-medium">Socio Comercial MeeplePrecios ({country})</span>
          </div>
          <Link
            href="/"
            className="text-xs font-bold text-indigo-650 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl transition-colors"
          >
            ← Volver a Inicio
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto py-12 px-6">
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Información de la tienda</h2>
            <p className="text-sm text-gray-600">
              Esta tienda se encuentra verificada para ventas y envíos dentro de nuestro catálogo en México.
            </p>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
            <a
              href={baseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
            >
              <span>Visitar sitio web oficial</span>
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
