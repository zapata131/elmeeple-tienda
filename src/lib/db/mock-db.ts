import { Store, ShippingRate, BggGame, GameBarcode, MerchantProductMapping, StoreGameOffer, QueueItem, CalculatedOffer } from '@/types';
import {
  INITIAL_STORES,
  INITIAL_SHIPPING_RATES,
  INITIAL_BGG_GAMES,
  INITIAL_BARCODES,
  INITIAL_MAPPINGS,
  INITIAL_OFFERS,
  INITIAL_QUEUE_ITEMS,
} from './seed-data';

class MockDatabase {
  private stores: Store[] = [...INITIAL_STORES];
  private shippingRates: ShippingRate[] = [...INITIAL_SHIPPING_RATES];
  private bggGames: BggGame[] = [...INITIAL_BGG_GAMES];
  private barcodes: GameBarcode[] = [...INITIAL_BARCODES];
  private mappings: MerchantProductMapping[] = [...INITIAL_MAPPINGS];
  private offers: StoreGameOffer[] = [...INITIAL_OFFERS];
  private queue: QueueItem[] = [...INITIAL_QUEUE_ITEMS];
  private clicks: { id: string; store_id: string; bgg_id: number; store_product_url: string; clicked_at: string }[] = [];

  // Stores
  getStores(): Store[] {
    return this.stores;
  }

  getStoreById(id: string): Store | undefined {
    return this.stores.find(s => s.id === id);
  }

  addStore(store: Omit<Store, 'id'>): Store {
    const newStore: Store = {
      ...store,
      id: `store-${Date.now()}`,
      rating: 4.80,
      review_count: 0,
      feed_status: 'pending',
      feed_last_processed_count: 0,
      feed_last_matched_count: 0,
      created_at: new Date().toISOString(),
    };
    this.stores.push(newStore);
    return newStore;
  }

  updateStore(id: string, updates: Partial<Store>): Store | undefined {
    const store = this.getStoreById(id);
    if (!store) return undefined;
    Object.assign(store, updates);
    return store;
  }

  // Shipping Rates
  getShippingRates(): ShippingRate[] {
    return this.shippingRates;
  }

  getShippingRateForStore(storeId: string): ShippingRate {
    const rate = this.shippingRates.find(r => r.store_id === storeId);
    return rate || {
      store_id: storeId,
      destination_country: 'MX',
      flat_rate: 105.00,
      free_shipping_threshold: 1200.00,
    };
  }

  setShippingRate(storeId: string, flatRate: number, freeThreshold?: number | null): ShippingRate {
    const existing = this.shippingRates.find(r => r.store_id === storeId);
    if (existing) {
      existing.flat_rate = flatRate;
      existing.free_shipping_threshold = freeThreshold;
      return existing;
    }
    const newRate: ShippingRate = {
      id: `ship-${Date.now()}`,
      store_id: storeId,
      destination_country: 'MX',
      flat_rate: flatRate,
      free_shipping_threshold: freeThreshold,
      created_at: new Date().toISOString(),
    };
    this.shippingRates.push(newRate);
    return newRate;
  }

  // BGG Games Cache
  getBggGames(): BggGame[] {
    return this.bggGames;
  }

  getBggGameById(bggId: number): BggGame | undefined {
    return this.bggGames.find(g => g.bgg_id === bggId);
  }

  searchBggGames(query: string): BggGame[] {
    if (!query || !query.trim()) return this.bggGames;
    const q = query.toLowerCase().trim();
    return this.bggGames.filter(g =>
      g.name.toLowerCase().includes(q) ||
      (g.alternate_names && g.alternate_names.some(alt => alt.toLowerCase().includes(q))) ||
      g.bgg_id.toString() === q ||
      (g.ean && g.ean.includes(q))
    );
  }

  upsertBggGame(game: BggGame): BggGame {
    const index = this.bggGames.findIndex(g => g.bgg_id === game.bgg_id);
    if (index >= 0) {
      this.bggGames[index] = { ...this.bggGames[index], ...game, last_updated_at: new Date().toISOString() };
      return this.bggGames[index];
    }
    const newGame = { ...game, last_updated_at: new Date().toISOString() };
    this.bggGames.push(newGame);
    return newGame;
  }

  // Barcodes Registry (Tier 1)
  getBarcodes(): GameBarcode[] {
    return this.barcodes;
  }

  findBarcode(barcode: string): GameBarcode | undefined {
    return this.barcodes.find(b => b.barcode === barcode);
  }

  addBarcode(barcode: Omit<GameBarcode, 'id'>): GameBarcode {
    const newBarcode: GameBarcode = {
      ...barcode,
      id: `gb-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.barcodes.push(newBarcode);
    return newBarcode;
  }

  // Merchant SKU Mappings (Tier 2)
  getMappings(): MerchantProductMapping[] {
    return this.mappings;
  }

  findMapping(storeId: string, merchantSku: string): MerchantProductMapping | undefined {
    return this.mappings.find(m => m.store_id === storeId && m.merchant_sku === merchantSku);
  }

  upsertMapping(storeId: string, merchantSku: string, bggId: number): MerchantProductMapping {
    const existing = this.findMapping(storeId, merchantSku);
    if (existing) {
      existing.bgg_id = bggId;
      existing.mapped_at = new Date().toISOString();
      return existing;
    }
    const newMapping: MerchantProductMapping = {
      id: `mpm-${Date.now()}`,
      store_id: storeId,
      merchant_sku: merchantSku,
      bgg_id: bggId,
      is_verified: true,
      mapped_at: new Date().toISOString(),
    };
    this.mappings.push(newMapping);
    return newMapping;
  }

  // Offers & 3-Part Cost Calculations
  getOffers(): StoreGameOffer[] {
    return this.offers;
  }

  getOffersForGame(bggId: number): CalculatedOffer[] {
    const offers = this.offers.filter(o => o.bgg_id === bggId && o.stock > 0);
    return offers.map(offer => this.calculateDeliveredCost(offer));
  }

  calculateDeliveredCost(offer: StoreGameOffer): CalculatedOffer {
    const store = this.getStoreById(offer.store_id);
    const shipping = this.getShippingRateForStore(offer.store_id);
    
    const qualifiesFreeShipping = Boolean(
      shipping.free_shipping_threshold && offer.price >= shipping.free_shipping_threshold
    );
    const shippingCost = qualifiesFreeShipping ? 0 : Number(shipping.flat_rate);
    const totalDeliveredCost = Number((Number(offer.price) + shippingCost).toFixed(2));

    return {
      ...offer,
      store_name: store ? store.name : 'Tienda desconocida',
      store_logo: store?.logo_url,
      is_domestic: store ? store.is_domestic : true,
      shipping_cost: shippingCost,
      total_delivered_cost: totalDeliveredCost,
      qualifies_free_shipping: qualifiesFreeShipping,
    };
  }

  upsertOffer(offer: Omit<StoreGameOffer, 'id'>): StoreGameOffer {
    const existingIndex = this.offers.findIndex(
      o => o.store_id === offer.store_id && o.bgg_id === offer.bgg_id && o.store_product_url === offer.store_product_url
    );
    if (existingIndex >= 0) {
      this.offers[existingIndex] = {
        ...this.offers[existingIndex],
        ...offer,
        last_updated_at: new Date().toISOString(),
      };
      return this.offers[existingIndex];
    }
    const newOffer: StoreGameOffer = {
      ...offer,
      id: `offer-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      last_updated_at: new Date().toISOString(),
    };
    this.offers.push(newOffer);
    return newOffer;
  }

  setOfferFeatured(offerId: string, isFeatured: boolean): boolean {
    const offer = this.offers.find(o => o.id === offerId);
    if (!offer) return false;
    offer.is_featured = isFeatured;
    return true;
  }

  // Admin Queue
  getQueueItems(status?: string): QueueItem[] {
    if (status) {
      return this.queue.filter(q => q.status === status);
    }
    return this.queue;
  }

  addQueueItem(item: Omit<QueueItem, 'id' | 'created_at'>): QueueItem {
    const newItem: QueueItem = {
      ...item,
      id: `queue-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString(),
    };
    this.queue.push(newItem);
    return newItem;
  }

  resolveQueueItem(id: string, action: 'approve' | 'remap' | 'reject', bggId?: number): boolean {
    const item = this.queue.find(q => q.id === id);
    if (!item) return false;

    if (action === 'reject') {
      item.status = 'rejected';
      return true;
    }

    const targetBggId = bggId || item.suggested_bgg_id;
    if (!targetBggId) return false;

    item.status = 'resolved';
    
    // Auto-create store offer upon queue resolution
    this.upsertOffer({
      store_id: item.store_id,
      bgg_id: targetBggId,
      store_product_url: item.store_product_url,
      price: 899.00,
      stock: 5,
      edition_language: 'es',
      is_featured: false,
      match_confidence: 1.00,
      match_tier: 4,
    });

    return true;
  }

  // Click Analytics
  logClick(storeId: string, bggId: number, url: string) {
    const click = {
      id: `click-${Date.now()}`,
      store_id: storeId,
      bgg_id: bggId,
      store_product_url: url,
      clicked_at: new Date().toISOString(),
    };
    this.clicks.push(click);
    return click;
  }

  getClicks() {
    return this.clicks;
  }
}

export const db = new MockDatabase();
