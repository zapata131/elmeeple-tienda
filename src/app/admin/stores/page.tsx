import React from 'react';
import { db } from '@/lib/db/db';
import { AdminStoresClient } from './AdminStoresClient';

export default function AdminStoresPage() {
  const stores = db.getStores();
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

  return (
    <AdminStoresClient
      initialStores={enrichedStores}
      totalOffers={totalOffers}
      totalPendingQueue={queueItems.filter(q => q.status === 'pending').length}
    />
  );
}
