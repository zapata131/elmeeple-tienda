import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/mock-db';

export async function GET() {
  const items = db.getQueueItems();

  // Enrich with store and suggested game details
  const enrichedItems = items.map(item => {
    const store = db.getStoreById(item.store_id);
    const suggestedGame = item.suggested_bgg_id ? db.getBggGameById(item.suggested_bgg_id) : undefined;
    return {
      ...item,
      store,
      suggested_game: suggestedGame,
    };
  });

  return NextResponse.json({
    items: enrichedItems,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, bgg_id } = body;

    if (!id || !['approve', 'remap', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Acción o ID inválidos.' }, { status: 400 });
    }

    const success = db.resolveQueueItem(id, action as 'approve' | 'remap' | 'reject', bgg_id ? parseInt(bgg_id, 10) : undefined);

    return NextResponse.json({
      success,
      message: success ? 'Elemento procesado correctamente.' : 'No se pudo procesar el elemento.',
    });
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
