import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, logo_url, feed_url, feed_type, flat_rate, free_shipping_threshold } = body;

    if (!name || !feed_url) {
      return NextResponse.json({ error: 'Nombre y URL de feed son requeridos.' }, { status: 400 });
    }

    const newStore = db.addStore({
      name,
      logo_url,
      country: 'MX',
      is_domestic: true,
      feed_url,
      feed_type: feed_type || 'shopify_json',
    });

    db.setShippingRate(newStore.id, flat_rate || 105.00, free_shipping_threshold);

    return NextResponse.json({
      success: true,
      store: newStore,
    });
  } catch {
    return NextResponse.json({ error: 'Error al registrar tienda.' }, { status: 500 });
  }
}
