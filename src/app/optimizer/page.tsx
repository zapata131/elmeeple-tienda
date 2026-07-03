import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { CartOptimizerPanel } from '@/components/CartOptimizerPanel';
import { Toolbar } from '@/components/Toolbar';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function CartOptimizerPage() {
  // Fetch cached catalog games to select from
  const { data: gamesData } = await supabase
    .from('bgg_games_cache')
    .select('bgg_id, name, thumbnail')
    .order('name')
    .limit(100);

  const initialGames = gamesData || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      
      {/* Settings Toolbar */}
      <Toolbar />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-6 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-gray-900">Optimizar Lista de Compra Multi-Juego</h1>
            <span className="text-xs text-gray-500 font-semibold">Comparador Inteligente por Combos de Tiendas y Envíos</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/catalog"
              className="text-xs font-semibold text-gray-600 hover:text-gray-900"
            >
              Catálogo Global
            </Link>
            <Link
              href="/"
              className="text-xs font-semibold text-gray-600 hover:text-gray-900"
            >
              Inicio
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto py-12 px-6">
        <CartOptimizerPanel initialGames={initialGames} />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white border-t border-gray-800 py-8 px-6 text-center text-xs text-gray-500 mt-12">
        <p>© 2026 MeeplePrecios. Comparador Inteligente LATAM & Península Ibérica.</p>
      </footer>

    </div>
  );
}
