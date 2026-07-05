import { seedActualFeedsIntoDatabase } from '@/utils/real_feed_data';

export interface StoreMetadata {
  id?: string;
  name?: string;
  country?: string;
  base_url?: string;
}

export function filterDomesticOffers<T extends { store_id: string }>(
  offers: T[],
  storesMap: Record<string, StoreMetadata>,
  shippingCountry: string,
  domesticOnly: boolean
): T[] {
  if (!domesticOnly) {
    return offers;
  }

  const target = shippingCountry.toUpperCase();

  return offers.filter((offer) => {
    const store = storesMap[offer.store_id];
    if (!store) return false;

    if (store.country) {
      return store.country.toUpperCase() === target;
    }

    const url = (store.base_url || '').toLowerCase();
    if (target === 'ES' && url.endsWith('.es')) return true;
    if (target === 'PT' && url.endsWith('.pt')) return true;
    if (target === 'MX' && url.endsWith('.mx')) return true;
    if (target === 'BR' && url.endsWith('.br')) return true;
    if (target === 'AR' && url.endsWith('.ar')) return true;
    if (target === 'CO' && url.endsWith('.co')) return true;
    if (target === 'CL' && url.endsWith('.cl')) return true;
    if (target === 'PE' && url.endsWith('.pe')) return true;

    return false;
  });
}

// Deprecated synthetic generator replaced with genuine XML feed ingestion per US-71 (Issue #112)
export const seedMockData = seedActualFeedsIntoDatabase;
