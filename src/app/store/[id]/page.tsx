import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { StoreReviewPanel, StoreReviewItem } from '@/components/StoreReviewPanel';
import { Toolbar } from '@/components/Toolbar';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface StoreReviewRow {
  id: string;
  user_name: string;
  rating: number;
  tags: string[];
  comment: string;
  created_at: string;
}

export default async function StoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const storeId = resolvedParams.id;

  const { data: storeData } = await supabase
    .from('stores')
    .select('id, name, base_url, country')
    .eq('id', storeId)
    .single();

  const storeName = storeData?.name || (storeId === '11111111-1111-1111-1111-111111111101' ? 'Zygomatic España' : `Tienda Asociada #${storeId.slice(0, 6)}`);

  // Fetch reviews
  const { data: dbReviews } = await supabase
    .from('store_reviews')
    .select('id, store_id, user_name, rating, tags, comment, created_at')
    .eq('store_id', storeId);

  let rows = dbReviews || [];
  if (rows.length === 0 && storeId === '11111111-1111-1111-1111-111111111101') {
    rows = [
      { id: 'rev-1', store_id: storeId, user_name: 'Sofía M.', rating: 5, tags: ['Esquinas Protegidas', 'Caja Doble'], comment: 'Las cajas llegaron impecables.', created_at: '2026-07-01' },
      { id: 'rev-2', store_id: storeId, user_name: 'Mateo R.', rating: 5, tags: ['Esquinas Protegidas', 'Embalaje Ecológico'], comment: 'Cartón reciclado muy robusto.', created_at: '2026-06-28' },
    ];
  }

  const initialReviews: StoreReviewItem[] = rows.map((r: StoreReviewRow) => ({
    id: r.id,
    userName: r.user_name,
    rating: Number(r.rating),
    tags: r.tags || [],
    comment: r.comment,
    createdAt: r.created_at,
  }));

  const totalRating = initialReviews.reduce((sum, r) => sum + r.rating, 0);
  const initialAvgRating = initialReviews.length > 0 ? Number((totalRating / initialReviews.length).toFixed(1)) : 5.0;

  const initialTagCounts: Record<string, number> = {};
  for (const r of initialReviews) {
    for (const tag of r.tags) {
      initialTagCounts[tag] = (initialTagCounts[tag] || 0) + 1;
    }
  }

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
            <span className="text-xs text-gray-500 font-medium">Perfil de Vibe Tags de Embalaje & Reputación</span>
          </div>
          <Link
            href="/catalog"
            className="text-xs font-bold text-indigo-650 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl transition-colors"
          >
            ← Volver al Catálogo
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto py-12 px-6">
        <StoreReviewPanel
          storeId={storeId}
          storeName={storeName}
          initialReviews={initialReviews}
          initialAvgRating={initialAvgRating}
          initialTagCounts={initialTagCounts}
        />
      </main>

      <footer className="bg-gray-900 text-white border-t border-gray-800 py-8 px-6 text-center text-xs text-gray-500 mt-12">
        <p>© 2026 MeeplePrecios. Comparador Inteligente LATAM & Península Ibérica.</p>
      </footer>
    </div>
  );
}
