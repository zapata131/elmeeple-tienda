import React from 'react';
import { db } from '@/lib/db/db';
import { AdminStoresClient } from './AdminStoresClient';

export default function AdminStoresPage() {
  const stores = db.getStores();
  const queueItems = db.getQueueItems();
  const allOffers = db.getOffers();
  const totalOffers = allOffers.length;

  const totalProcessedAcrossStores = stores.reduce((acc, s) => acc + (s.feed_last_processed_count || 0), 0);
  const totalMatchedAcrossStores = stores.reduce((acc, s) => acc + (s.feed_last_matched_count || 0), 0);
  const overallLinkingRate = totalProcessedAcrossStores > 0
    ? Number(((totalMatchedAcrossStores / totalProcessedAcrossStores) * 100).toFixed(1))
    : 100.0;

  const healthyOffersCount = allOffers.filter(o => !o.is_broken && o.stock > 0).length;
  const brokenOffersCount = allOffers.filter(o => o.is_broken === true).length;

  const enrichedStores = stores.map(store => {
    const shipping = db.getShippingRateForStore(store.id);
    const storeOffers = allOffers.filter(o => o.store_id === store.id);
    const storeQueue = queueItems.filter(q => q.store_id === store.id && q.status === 'pending');
    const processed = store.feed_last_processed_count || storeOffers.length;
    const matched = store.feed_last_matched_count || storeOffers.length;
    const linkingRate = processed > 0 ? Number(((matched / processed) * 100).toFixed(1)) : 100.0;

    let linkingStatus: 'excellent' | 'warning' | 'needs_attention' = 'excellent';
    if (storeQueue.length > 5 || linkingRate < 80) {
      linkingStatus = 'needs_attention';
    } else if (storeQueue.length > 0 || linkingRate < 95) {
      linkingStatus = 'warning';
    }

    return {
      ...store,
      flat_rate_shipping: shipping.flat_rate,
      free_shipping_threshold: shipping.free_shipping_threshold,
      active_offers_count: storeOffers.length,
      pending_queue_count: storeQueue.length,
      linking_rate: linkingRate,
      linking_status: linkingStatus,
      healthy_offers_count: storeOffers.filter(o => !o.is_broken).length,
      broken_offers_count: storeOffers.filter(o => o.is_broken).length,
    };
  });

  return (
    <AdminStoresClient
      initialStores={enrichedStores}
      totalOffers={totalOffers}
      totalPendingQueue={queueItems.filter(q => q.status === 'pending').length}
      overallLinkingRate={overallLinkingRate}
      healthyOffers={healthyOffersCount}
      brokenOffers={brokenOffersCount}
    />
  );
}
