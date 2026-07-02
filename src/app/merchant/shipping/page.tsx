import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { ShippingMatrix } from '@/components/ShippingMatrix';
import { Toolbar } from '@/components/Toolbar';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function MerchantShippingPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect('/');
  }

  // Fetch the store owned by the user
  const { data: store, error: storeErr } = await supabase
    .from('stores')
    .select('id, name')
    .eq('owner_email', session.user.email)
    .single();

  if (storeErr || !store) {
    // If no store onboarding completed, redirect to onboard
    redirect('/merchant/onboard');
  }

  // Fetch current shipping rates
  const { data: rates } = await supabase
    .from('shipping_rates')
    .select('destination_country, flat_rate, free_shipping_threshold')
    .eq('store_id', store.id);

  const initialRates = rates || [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      
      {/* Settings Toolbar */}
      <Toolbar />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-6 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-gray-900">{store.name}</h1>
            <span className="text-xs text-gray-500 font-semibold">Configuración de Envío de Socio</span>
          </div>
          <Link
            href="/"
            className="text-sm font-semibold text-indigo-650 hover:text-indigo-700 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 px-4">
        <ShippingMatrix storeId={store.id} initialRates={initialRates} />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white border-t border-gray-800 py-8 px-6 text-center text-xs text-gray-500">
        <p>© 2026 MeeplePrecios. Todos los derechos reservados. El Meeple España & LATAM.</p>
      </footer>

    </div>
  );
}
