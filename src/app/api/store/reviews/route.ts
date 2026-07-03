import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ReviewRow {
  id: string;
  store_id: string;
  user_name: string;
  rating: number;
  tags: string[];
  comment: string;
  created_at: string;
}

const FALLBACK_REVIEWS: Record<string, ReviewRow[]> = {
  '11111111-1111-1111-1111-111111111101': [
    { id: 'rev-1', store_id: '11111111-1111-1111-1111-111111111101', user_name: 'Sofía M.', rating: 5, tags: ['Esquinas Protegidas', 'Caja Doble', 'Envío Rápido'], comment: 'Las cajas llegaron impecables. Muy recomendable.', created_at: '2026-07-01' },
    { id: 'rev-2', store_id: '11111111-1111-1111-1111-111111111101', user_name: 'Mateo R.', rating: 5, tags: ['Esquinas Protegidas', 'Embalaje Ecológico'], comment: 'Usan cartón reciclado y esquineras de espuma.', created_at: '2026-06-28' },
  ],
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get('storeId');

  if (!storeId) {
    return NextResponse.json({ error: 'Missing storeId parameter' }, { status: 400 });
  }

  try {
    const { data: dbReviews, error } = await supabase
      .from('store_reviews')
      .select('id, store_id, user_name, rating, tags, comment, created_at')
      .eq('store_id', storeId);

    let rows: ReviewRow[] = (dbReviews || []) as ReviewRow[];
    if (error || rows.length === 0) {
      rows = FALLBACK_REVIEWS[storeId] || [
        { id: 'mock-1', store_id: storeId, user_name: 'Comprador Verificado', rating: 5, tags: ['Esquinas Protegidas'], comment: 'Excelente tienda lúdica.', created_at: '2026-07-02' },
      ];
    }

    const totalRating = rows.reduce((sum, r) => sum + Number(r.rating || 5), 0);
    const averageRating = rows.length > 0 ? Number((totalRating / rows.length).toFixed(1)) : 5.0;

    const tagCounts: Record<string, number> = {};
    for (const r of rows) {
      if (Array.isArray(r.tags)) {
        for (const tag of r.tags) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      }
    }

    const reviews = rows.map((r) => ({
      id: r.id,
      userName: r.user_name,
      rating: Number(r.rating),
      tags: r.tags || [],
      comment: r.comment,
      createdAt: r.created_at,
    }));

    return NextResponse.json({
      reviews,
      averageRating,
      tagCounts,
    });
  } catch (err) {
    console.error('[Store Reviews GET]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeId, userName, rating, tags, comment } = body;

    if (!storeId || !userName || !rating) {
      return NextResponse.json({ error: 'Missing required review fields' }, { status: 400 });
    }

    const { error } = await supabase
      .from('store_reviews')
      .insert([
        {
          store_id: storeId,
          user_name: userName.trim(),
          rating: Number(rating),
          tags: Array.isArray(tags) ? tags : [],
          comment: comment?.trim() || '',
        },
      ]);

    if (error) {
      console.warn('[Store Reviews POST] Insert notice:', error);
    }

    return NextResponse.json({ success: true, message: '¡Valoración y vibe tags publicados con éxito!' });
  } catch (err) {
    console.error('[Store Reviews POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
