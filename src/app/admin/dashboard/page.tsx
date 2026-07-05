import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { createClient } from '@supabase/supabase-js';
import { AdminStoreList } from '@/components/AdminStoreList';
import { AdminGamesCatalogTable, AdminGameRow } from '@/components/AdminGamesCatalogTable';
import { MOCK_GAMES } from '@/utils/mockData';
import { loadLocalCatalogCache } from '@/utils/local_file_cache';
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
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 select-none">
        <Toolbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center max-w-md w-full">
            <span className="text-xs font-extrabold uppercase tracking-wider text-red-600">Acceso Restringido</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">403 Forbidden</h1>
            <p className="text-gray-600 text-xs mt-2 font-medium leading-relaxed">
              Only system administrators are authorized to access this auditing portal.
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-block bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs"
              >
                ← Regresar al inicio
              </Link>
            </div>
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
    const fileCache = loadLocalCatalogCache();
    if (fileCache && fileCache.games.length > 0) {
      games = fileCache.games;
    } else {
      games = MOCK_GAMES.map((g) => ({
        bgg_id: g.bgg_id,
        name: g.name,
        thumbnail: g.thumbnail,
        last_updated_at: new Date().toISOString(),
      }));
    }
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
