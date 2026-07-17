import { NextResponse } from 'next/server';
import { db } from '@/lib/db/db';
import { runFullFeedIngestion } from '@/lib/engine/feed-ingestion-worker';

export async function GET() {
  const stores = db.getStores();
  const shippingRates = db.getShippingRates();
  const queueItems = db.getQueueItems();
  const totalOffers = db.getOffers().length;

  const enrichedStores = stores.map(store => {
    const shipping = db.getShippingRateForStore(store.id);
    const storeOffers = db.getOffers().filter(o => o.store_id === store.id);
    const storeQueue = queueItems.filter(q => q.store_id === store.id && q.status === 'pending');

    return {
      ...store,
      flat_rate_shipping: shipping.flat_rate,
      free_shipping_threshold: shipping.free_shipping_threshold,
      active_offers_count: storeOffers.length,
      pending_queue_count: storeQueue.length,
    };
  });

  return NextResponse.json({
    stores: enrichedStores,
    total_stores: stores.length,
    total_offers: totalOffers,
    total_pending_queue: queueItems.filter(q => q.status === 'pending').length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Action 1: Update store settings (logo_url, shipping, feed_url)
    if (body.action === 'update_store') {
      const { store_id, name, logo_url, feed_url, flat_rate_shipping, free_shipping_threshold } = body;
      if (!store_id) {
        return NextResponse.json({ error: 'store_id es requerido' }, { status: 400 });
      }

      const updated = db.updateStoreSettings(store_id, {
        name,
        logo_url,
        feed_url,
        flat_rate_shipping,
        free_shipping_threshold,
      });

      return NextResponse.json({
        success: true,
        store: updated,
        shipping: db.getShippingRateForStore(store_id),
      });
    }

    // Action 2: Trigger live feed ingestion across all or specific stores
    if (body.action === 'trigger_ingestion') {
      const { max_stores, store_id } = body;
      const results = await runFullFeedIngestion({
        maxStores: max_stores || 5, // Process batch of 5 stores by default for fast API response
        storeId: store_id,
      });

      return NextResponse.json({
        success: true,
        results,
      });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error del servidor' }, { status: 500 });
  }
}
