export interface Store {
  id: string;
  name: string;
  logo_url?: string | null;
  country: string;
  is_domestic: boolean;
  rating?: number;
  review_count?: number;
  feed_url?: string | null;
  feed_type?: 'google_xml' | 'shopify_json';
  feed_status?: 'pending' | 'success' | 'failed';
  feed_last_processed_count?: number;
  feed_last_matched_count?: number;
  created_at?: string;
}

export interface ShippingRate {
  id?: string;
  store_id: string;
  destination_country: string;
  flat_rate: number;
  free_shipping_threshold?: number | null;
  created_at?: string;
}

export interface BggGame {
  bgg_id: number;
  name: string;
  alternate_names?: string[];
  thumbnail?: string | null;
  image?: string | null;
  description?: string | null;
  weight?: number | null;
  min_players?: number | null;
  max_players?: number | null;
  playing_time?: number | null;
  base_price_eur?: number | null;
  ean?: string | null;
  bgg_rank?: number | null;
  search_count?: number | null;
  item_type?: 'boardgame' | 'expansion' | 'accessory' | 'pseudo_game';
  last_updated_at?: string;
}

export interface GameBarcode {
  id?: string;
  barcode: string;
  bgg_id: number;
  edition_language: 'es' | 'en' | 'multi';
  publisher_name?: string | null;
  created_at?: string;
}

export interface MerchantProductMapping {
  id?: string;
  store_id: string;
  merchant_sku: string;
  bgg_id: number;
  is_verified: boolean;
  mapped_at?: string;
}

export interface StoreGameOffer {
  id: string;
  store_id: string;
  bgg_id: number;
  store_product_url: string;
  price: number;
  stock: number;
  edition_language: 'es' | 'en' | 'multi';
  is_featured: boolean;
  match_confidence: number;
  match_tier: number;
  is_broken?: boolean;
  health_status?: 'healthy' | 'broken' | 'redirected' | 'quarantined';
  last_audited_at?: string;
  last_updated_at?: string;
  store?: Store;
  shipping_rate?: ShippingRate;
}

export interface ClickLog {
  id?: string;
  store_id: string;
  bgg_id: number;
  store_product_url: string;
  clicked_at?: string;
}

export interface QueueItem {
  id: string;
  store_id: string;
  ean?: string | null;
  title: string;
  store_product_url: string;
  status: 'pending' | 'staged' | 'resolved' | 'rejected';
  match_confidence: number;
  suggested_bgg_id?: number | null;
  created_at?: string;
  store?: Store;
  suggested_game?: BggGame;
}

export interface SearchResult {
  games: (BggGame & {
    lowest_price?: number;
    offer_count?: number;
    offers?: (StoreGameOffer & { store: Store })[];
  })[];
  stores: Store[];
}

export interface CalculatedOffer extends StoreGameOffer {
  store_name: string;
  store_logo?: string | null;
  is_domestic: boolean;
  shipping_cost: number;
  total_delivered_cost: number;
  qualifies_free_shipping: boolean;
}
