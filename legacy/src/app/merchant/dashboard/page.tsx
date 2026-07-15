import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Toolbar } from '@/components/Toolbar';
import { MerchantAnalyticsCharts, ClickLogItem } from '@/components/MerchantAnalyticsCharts';
import { MerchantFeaturedDealsPanel } from '@/components/MerchantFeaturedDealsPanel';
import { MerchantFeedInspector } from '@/components/MerchantFeedInspector';
import { MerchantClickAnalytics, ClickRecord } from '@/components/MerchantClickAnalytics';
import { MerchantMappingPortal, UnmatchedFeedItem } from '@/components/MerchantMappingPortal';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function MerchantDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect('/');
  }

  // Load merchant store details
  const { data: store, error: storeErr } = await supabase
    .from('stores')
    .select('id, name, feed_status, base_url, google_shopping_feed_url')
    .eq('owner_email', session.user.email)
    .single();

  if (storeErr || !store) {
    redirect('/merchant/onboard');
  }

  // Fetch clicks logs
  const { data: clicksData } = await supabase
    .from('clicks')
    .select(`
      id,
      created_at,
      bgg_id,
      bgg_games_cache (
        name
      )
    `)
    .eq('store_id', store.id)
    .order('created_at', { ascending: false });

  const rawClicks = (clicksData || []) as Array<{ id?: string; created_at: string; bgg_id: number; bgg_games_cache?: { name?: string } | null }>;
  const clicks = rawClicks.map((c, index) => ({
    id: c.id || `click-${index}`,
    created_at: c.created_at,
    bgg_id: c.bgg_id,
    bgg_games_cache: c.bgg_games_cache,
  }));

  const clicksCount = clicks.length;

  // Fetch store deals for sponsored placement management
  const { data: storeGamesData } = await supabase
    .from('store_games')
    .select(`
      id,
      bgg_id,
      price,
      stock,
      is_featured,
      bgg_games_cache (
        name
      )
    `)
    .eq('store_id', store.id)
    .limit(10);

  const initialDeals = (storeGamesData && Array.isArray(storeGamesData) && storeGamesData.length > 0)
    ? storeGamesData.map((g: Record<string, unknown>) => {
        const cache = g.bgg_games_cache as { name?: string } | null;
        return {
          id: String(g.id || ''),
          bgg_id: Number(g.bgg_id || 0),
          game_name: cache?.name || `Juego #${g.bgg_id}`,
          price: Number(g.price || 39.90),
          stock: Number(g.stock || 5),
          is_featured: !!g.is_featured,
        };
      })
    : [
        { id: 'deal-default-1', bgg_id: 13, game_name: 'Catan Español', price: 37.50, stock: 12, is_featured: true },
        { id: 'deal-default-2', bgg_id: 266192, game_name: 'Wingspan Edición Española', price: 49.90, stock: 8, is_featured: false },
        { id: 'deal-default-3', bgg_id: 167791, game_name: 'Terraforming Mars', price: 54.95, stock: 4, is_featured: false },
      ];

  // US-107: Fetch unmatched feed items for Merchant Self-Service Mapping Portal
  const { data: queueData } = await supabase
    .from('bgg_metadata_queue')
    .select('id, store_id, ean, title, store_product_url, status, created_at')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false });

  const rawQueue = (queueData || []) as UnmatchedFeedItem[];
  const unmatchedItems = rawQueue.filter((item) => item.status === 'pending' || item.status === 'staged');

  const ctrRatio = clicksCount > 0 ? '4.2%' : '0.0%';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      
      {/* Settings Toolbar */}
      <Toolbar />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-6 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-gray-900">{store.name}</h1>
            <span className="text-xs text-gray-500 font-semibold">Panel de Control del Socio</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/merchant/shipping"
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-2 rounded-lg transition-colors shadow-sm"
            >
              Matriz de envíos
            </Link>
            <Link
              href="/merchant/diagnostics"
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-3 py-2 rounded-lg transition-colors border border-gray-300 shadow-2xs"
            >
              Diagnósticos
            </Link>
            <Link
              href="/"
              className="text-xs font-semibold text-gray-600 hover:text-gray-900"
            >
              Regresar al inicio
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto py-12 px-6 flex flex-col gap-8">
        
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Total Clicks */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col gap-1">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Clics de Referencia</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-gray-950">{clicksCount}</span>
              <span className="text-xs text-green-600 font-bold">↑ 12%</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-2">Total de clics salientes redireccionados a tu tienda.</p>
          </div>

          {/* Card 2: CTR */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col gap-1">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Ratio de Clic (CTR)</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-gray-950">{ctrRatio}</span>
              <span className="text-xs text-indigo-600 font-bold">Estable</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-2">Porcentaje estimado de clics por visualizaciones de ofertas.</p>
          </div>

          {/* Card 3: Sync Feed Status */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col gap-1">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Estado de Catálogo Feed</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className={`text-sm font-bold uppercase px-2.5 py-0.5 rounded-full ${
                store.feed_status === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {store.feed_status || 'pending'}
              </span>
            </div>
            <p className="text-[10px] text-gray-500 mt-4">Última sincronización programada del feed de Google.</p>
          </div>

        </div>

        {/* US-107: Merchant Self-Service Feed Mapping Portal */}
        <MerchantMappingPortal storeId={store.id} initialItems={unmatchedItems} />

        {/* US-[#41]: Sponsored Featured Store Placements Panel */}
        <MerchantFeaturedDealsPanel storeId={store.id} initialDeals={initialDeals} />

        {/* US-99: Interactive Merchant Feed Inspection & Diagnostic Debugger */}
        <MerchantFeedInspector initialFeedUrl={store.google_shopping_feed_url || ''} />

        {/* US-100: Merchant Outbound Click Analytics & CPC Monthly Billing Generator */}
        <MerchantClickAnalytics clicks={clicks as ClickRecord[]} storeName={store.name} defaultCpcRate={3.00} />

        {/* Interactive Analytics Charts, Top Games, and UTM Guide */}
        <MerchantAnalyticsCharts clicks={clicks as ClickLogItem[]} storeUrl={store.base_url || 'https://tutienda.es'} />

        {/* Clicks Log Table */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-sm font-bold text-gray-950">Historial de Redirecciones Recientes</h3>
            <p className="text-xs text-gray-500 mt-0.5">Listado detallado de clics salientes en ofertas de juegos.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs text-gray-700">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-250 font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Juego de Mesa</th>
                  <th className="px-6 py-3">Fecha y Hora (UTC)</th>
                  <th className="px-6 py-3">Canal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clicks.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-400 font-medium">
                      No clicks recorded yet.
                    </td>
                  </tr>
                ) : (
                  clicks.map((click, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {click.bgg_games_cache?.name || 'Unknown Game'}
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">
                        {new Date(click.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase border border-indigo-200">
                          Outbound Referral
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white border-t border-gray-800 py-8 px-6 text-center text-xs text-gray-500 mt-12">
        <p>© 2026 MeeplePrecios. Todos los derechos reservados. El Meeple España & LATAM.</p>
      </footer>

    </div>
  );
}
