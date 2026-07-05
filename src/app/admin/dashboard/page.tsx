import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { createClient } from '@supabase/supabase-js';
import { AdminStoreList } from '@/components/AdminStoreList';
import { AdminGamesCatalogTable, AdminGameRow } from '@/components/AdminGamesCatalogTable';
import { MOCK_GAMES } from '@/utils/mockData';
import { Toolbar } from '@/components/Toolbar';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  let isAdmin = false;

  if (process.env.NODE_ENV === 'development') {
    isAdmin = true;
  } else if (session?.user?.email) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('email', session.user.email)
      .single();

    if (profile?.role === 'admin' || (session.user as Record<string, unknown>)?.role === 'admin') {
      isAdmin = true;
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
        <Toolbar />
        <main className="flex-1 flex items-center justify-center py-24 px-4">
          <div className="max-w-md w-full bg-white border border-gray-250 p-8 rounded-xl shadow-sm text-center flex flex-col gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Acceso Restringido</h2>
            <p className="text-sm text-gray-600">
              Only system administrators are authorized to access this auditing portal.
            </p>
            <Link
              href="/"
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg mt-2 block shadow-sm"
            >
              Back to Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Load all store profiles
  const { data: storesData } = await supabase
    .from('stores')
    .select('id, name, verified, owner_email')
    .order('name', { ascending: true });

  const stores = storesData || [];

  // Load all indexed games
  const { data: gamesData } = await supabase
    .from('bgg_games_cache')
    .select('bgg_id, name, thumbnail, last_updated_at')
    .order('name', { ascending: true })
    .limit(1000);

  let games: AdminGameRow[] = (gamesData || []) as AdminGameRow[];
  if (games.length === 0) {
    games = MOCK_GAMES.map((g) => ({
      bgg_id: g.bgg_id,
      name: g.name,
      thumbnail: g.thumbnail,
      last_updated_at: new Date().toISOString(),
    }));
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 select-none">
      
      {/* Global Navigation Header */}
      <Toolbar />

      {/* Admin Dashboard Header */}
      <header className="bg-white border-b border-gray-200 py-8 px-6 shadow-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600">
              Auditoría del Catálogo
            </span>
            <h1 className="text-2xl font-extrabold text-gray-950 mt-0.5">
              Panel de Administración
            </h1>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/admin/feed-queue"
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-4 py-2 rounded-lg transition-colors border border-gray-300 shadow-2xs"
            >
              Cola Feeds
            </Link>
            <Link
              href="/admin/currency"
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              Gestor FX
            </Link>
            <Link
              href="/"
              className="text-sm font-semibold text-gray-600 hover:text-gray-900"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Panel Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto py-12 px-6 flex flex-col gap-10">
        <AdminStoreList initialStores={stores} />
        <AdminGamesCatalogTable games={games} />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white border-t border-gray-800 py-8 px-6 text-center text-xs text-gray-500 mt-12">
        <p>© 2026 MeeplePrecios. Panel de Control de Administración del Sistema.</p>
      </footer>

    </div>
  );
}
