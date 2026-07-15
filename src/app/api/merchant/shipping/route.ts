import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/mock-db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { store_id, flat_rate, free_shipping_threshold } = body;

    if (!store_id || flat_rate === undefined) {
      return NextResponse.json({ error: 'Parámetros inválidos.' }, { status: 400 });
    }

    const updatedRate = db.setShippingRate(
      store_id,
      parseFloat(flat_rate),
      free_shipping_threshold !== undefined && free_shipping_threshold !== null
        ? parseFloat(free_shipping_threshold)
        : null
    );

    return NextResponse.json({
      success: true,
      shipping_rate: updatedRate,
    });
  } catch {
    return NextResponse.json({ error: 'Error al actualizar tarifa de envío.' }, { status: 500 });
  }
}
