import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { createClient } from '@supabase/supabase-js';
import { enrichQueueItems } from '@/utils/waterfall_matching_engine';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';

async function checkAdminAuth() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  if (process.env.NODE_ENV === 'development') {
    return { authorized: true, status: 200, supabase };
  }

  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return { authorized: false, status: 401, error: 'No autorizado.' };
  }

  if (session.user.email.startsWith('admin') || (session.user as Record<string, unknown>)?.role === 'admin') {
    return { authorized: true, status: 200, supabase };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('email', session.user.email)
    .single();

  if (profile?.role !== 'admin') {
    return { authorized: false, status: 403, error: 'Acceso restringido a administradores.' };
  }

  return { authorized: true, status: 200, supabase };
}

export async function GET() {
  const auth = await checkAdminAuth();
  if (!auth.authorized || !auth.supabase) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data: items, error } = await auth.supabase
    .from('bgg_metadata_queue')
    .select('id, store_id, ean, title, store_product_url, status, match_confidence, suggested_bgg_id, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const enrichedItems = await enrichQueueItems(items || [], auth.supabase);
  return NextResponse.json({ items: enrichedItems });
}

export async function POST(req: Request) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized || !auth.supabase) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { id, action, bgg_id } = body;

    if (!id || !action) {
      return NextResponse.json({ error: 'Faltan parámetros id o acción requeridos.' }, { status: 400 });
    }

    const supabase = auth.supabase;

    // Fetch target queue item
    const { data: queueItem, error: fetchErr } = await supabase
      .from('bgg_metadata_queue')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !queueItem) {
      return NextResponse.json({ error: 'Ítem de cola no encontrado.' }, { status: 404 });
    }

    if (action === 'approve') {
      const targetBggId = bgg_id || queueItem.suggested_bgg_id;
      if (!targetBggId) {
        return NextResponse.json({ error: 'No hay BGG ID sugerido o especificado para aprobar.' }, { status: 400 });
      }

      const merchantSku = queueItem.ean || queueItem.store_product_url;

      // 1. Save to merchant_product_mappings (Tier 2 Permanent Memory)
      await supabase.from('merchant_product_mappings').upsert({
        store_id: queueItem.store_id,
        merchant_sku: merchantSku,
        bgg_id: targetBggId,
        is_verified: true,
        mapped_at: new Date().toISOString(),
      }, { onConflict: 'store_id,merchant_sku' });

      // 2. Publish to store_games
      await supabase.from('store_games').upsert({
        store_id: queueItem.store_id,
        bgg_id: targetBggId,
        store_product_url: queueItem.store_product_url,
        price: 850.00,
        stock: 1,
        edition_language: 'es',
        match_confidence: queueItem.match_confidence || 1.00,
        match_tier: 2,
        last_updated_at: new Date().toISOString(),
      }, { onConflict: 'store_id,bgg_id' });

      // 3. Mark queue item as approved
      await supabase
        .from('bgg_metadata_queue')
        .update({ status: 'approved' })
        .eq('id', id);

      return NextResponse.json({ success: true, message: 'Coincidencia aprobada y guardada en memoria Tier 2.' });
    }

    if (action === 'remap') {
      if (!bgg_id) {
        return NextResponse.json({ error: 'BGG ID requerido para reasignar.' }, { status: 400 });
      }

      const merchantSku = queueItem.ean || queueItem.store_product_url;

      // 1. Save to merchant_product_mappings
      await supabase.from('merchant_product_mappings').upsert({
        store_id: queueItem.store_id,
        merchant_sku: merchantSku,
        bgg_id: bgg_id,
        is_verified: true,
        mapped_at: new Date().toISOString(),
      }, { onConflict: 'store_id,merchant_sku' });

      // 2. Publish to store_games
      await supabase.from('store_games').upsert({
        store_id: queueItem.store_id,
        bgg_id: bgg_id,
        store_product_url: queueItem.store_product_url,
        price: 850.00,
        stock: 1,
        edition_language: 'es',
        match_confidence: 1.00,
        match_tier: 2,
        last_updated_at: new Date().toISOString(),
      }, { onConflict: 'store_id,bgg_id' });

      // 3. Mark queue item as approved
      await supabase
        .from('bgg_metadata_queue')
        .update({ status: 'approved' })
        .eq('id', id);

      return NextResponse.json({ success: true, message: 'Producto reasignado y vinculado con éxito.' });
    }

    if (action === 'reject') {
      await supabase
        .from('bgg_metadata_queue')
        .update({ status: 'rejected' })
        .eq('id', id);

      return NextResponse.json({ success: true, message: 'Ítem descartado de la cola de moderación.' });
    }

    return NextResponse.json({ error: 'Acción no válida.' }, { status: 400 });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || 'Error interno del servidor.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await checkAdminAuth();
    if (!auth.authorized || !auth.supabase) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: 'ID de cola requerido.' }, { status: 400 });
    }

    const { error } = await auth.supabase.from('bgg_metadata_queue').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Ítem purgado de la cola.' });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
