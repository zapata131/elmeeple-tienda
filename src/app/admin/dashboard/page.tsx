import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { createClient } from '@supabase/supabase-js';
import { AdminStoreList } from '@/components/AdminStoreList';
import { Toolbar } from '@/components/Toolbar';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  let isAdmin = false;

  if (session?.user?.email) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('email', session.user.email)
      .single();

    if (profile?.role === 'admin') {
      isAdmin = true;
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
        <Toolbar />
        <main className="flex-1 flex items-center justify-center py-24 px-4">
          <div className="max-w-md w-full bg-white border border-gray-250 p-8 rounded-xl shadow-sm text-center flex flex-col gap-4">
            <span className="text-3xl">🔒</span>
            <h2 className="text-lg font-bold text-gray-900">Acceso Restringido</h2>
            <p className="text-sm text-gray-600">
              Only system administrators are authorized to access this auditing portal.
            </p>
            <Link
              href="/"
              className="text-xs bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg mt-2 block shadow-sm"
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
    .order('name');

  const stores = storesData || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      
      {/* Settings Toolbar */}
      <Toolbar />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-6 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-gray-900">Panel de Auditoría de Socios</h1>
            <span className="text-xs text-gray-500 font-semibold">Administración Global del Sistema</span>
          </div>
          <Link
            href="/"
            className="text-sm font-semibold text-gray-600 hover:text-gray-900"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Panel Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto py-12 px-6">
        <AdminStoreList initialStores={stores} />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white border-t border-gray-800 py-8 px-6 text-center text-xs text-gray-500 mt-12">
        <p>© 2026 MeeplePrecios. Panel de Control de Administración del Sistema.</p>
      </footer>

    </div>
  );
}
