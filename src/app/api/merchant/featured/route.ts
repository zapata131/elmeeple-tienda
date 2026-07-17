import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { offer_id, is_featured } = body;

    if (!offer_id) {
      return NextResponse.json({ error: 'ID de oferta requerido.' }, { status: 400 });
    }

    const success = db.setOfferFeatured(offer_id, Boolean(is_featured));

    return NextResponse.json({
      success,
      is_featured: Boolean(is_featured),
    });
  } catch {
    return NextResponse.json({ error: 'Error al actualizar destacado.' }, { status: 500 });
  }
}
