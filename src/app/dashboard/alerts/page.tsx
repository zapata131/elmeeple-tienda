import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { createClient } from '@supabase/supabase-js';
import { UserAlertsDashboard, AlertItem } from '@/components/UserAlertsDashboard';
import { Toolbar } from '@/components/Toolbar';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface AlertRow {
  id: string;
  bgg_id: number;
  user_email: string;
  target_price: number;
  created_at: string;
}

export default async function AlertsDashboardPage() {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email || 'player@meeple.com'; // fallback demo email for immediate MVP preview

  // Fetch active alerts for this user
  const { data: alertsData } = await supabase
    .from('price_alerts')
    .select('id, bgg_id, user_email, target_price, created_at')
    .eq('user_email', userEmail);

  const rawAlerts: AlertRow[] = (alertsData || []) as AlertRow[];
  const bggIds = Array.from(new Set(rawAlerts.map((a: AlertRow) => a.bgg_id)));

  const gamesMap: Record<number, { name: string; thumbnail: string }> = {};
  const lowestPriceMap: Record<number, number> = {};

  if (bggIds.length > 0) {
    const { data: gamesData } = await supabase
      .from('bgg_games_cache')
      .select('bgg_id, name, thumbnail')
      .in('bgg_id', bggIds);

    for (const g of gamesData || []) {
      gamesMap[g.bgg_id] = { name: g.name, thumbnail: g.thumbnail };
    }

    const { data: offersData } = await supabase
      .from('store_games')
      .select('bgg_id, price')
      .in('bgg_id', bggIds);

    for (const o of offersData || []) {
      const p = Number(o.price);
      if (!lowestPriceMap[o.bgg_id] || p < lowestPriceMap[o.bgg_id]) {
        lowestPriceMap[o.bgg_id] = p;
      }
    }
  }

  const initialAlerts: AlertItem[] = rawAlerts.map((a: AlertRow) => {
    const g = gamesMap[a.bgg_id] || { name: `Juego #${a.bgg_id}`, thumbnail: '' };
    const currentLowest = lowestPriceMap[a.bgg_id] || Number(a.target_price);
    const isTriggered = currentLowest <= Number(a.target_price);

    return {
      id: a.id,
      bggId: a.bgg_id,
      gameName: g.name,
      thumbnail: g.thumbnail,
      targetPrice: Number(a.target_price),
      currentLowestPrice: currentLowest,
      isTriggered,
      createdAt: a.created_at,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      
      {/* Settings Toolbar */}
      <Toolbar />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-6 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-gray-900">Mis Alertas de Bajada de Precio</h1>
            <span className="text-xs text-gray-500 font-semibold">Monitor de Descuentos & Avisos Instantáneos</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/catalog"
              className="text-xs font-semibold text-gray-600 hover:text-gray-900"
            >
              Explorar Catálogo
            </Link>
            <Link
              href="/optimizer"
              className="text-xs font-semibold text-gray-600 hover:text-gray-900"
            >
              Comparador Multi-Juego
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto py-12 px-6">
        <UserAlertsDashboard initialAlerts={initialAlerts} userEmail={userEmail} />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white border-t border-gray-800 py-8 px-6 text-center text-xs text-gray-500 mt-12">
        <p>© 2026 MeeplePrecios. Comparador Inteligente LATAM & Península Ibérica.</p>
      </footer>

    </div>
  );
}
