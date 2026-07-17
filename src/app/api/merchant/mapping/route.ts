import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get('store_id') || '';

  const queueItems = db.getQueueItems('pending');
  const filtered = storeId ? queueItems.filter(i => i.store_id === storeId) : queueItems;

  return NextResponse.json({
    items: filtered,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { store_id, merchant_sku, bgg_id } = body;

    if (!store_id || !merchant_sku || !bgg_id) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos.' }, { status: 400 });
    }

    const mapping = db.upsertMapping(store_id, merchant_sku, parseInt(bgg_id, 10));

    return NextResponse.json({
      success: true,
      mapped_bgg_id: mapping.bgg_id,
    });
  } catch {
    return NextResponse.json({ error: 'Error al mapear SKU.' }, { status: 500 });
  }
}
