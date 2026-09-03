export type EditionLanguage = 'es' | 'en' | 'multi';
export type FeedType = 'shopify' | 'atom_xml' | 'google_xml' | 'manual';
export type FeedStatus = 'active' | 'warning' | 'error' | 'disabled';
export type CatalogItemType = 'boardgame' | 'expansion' | 'accessory' | 'spinoff';

export interface Store {
  id: string;
  name: string;
  slug: string;
  website_url: string;
  feed_url: string | null;
  feed_type: FeedType;
  feed_status: FeedStatus;
  logo_url: string | null;
  rating: number;
  review_count: number;
  last_synced_at: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ShippingRate {
  id: string;
  store_id: string;
  flat_rate: number;
  free_shipping_threshold: number | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CatalogGame {
  id: string;
  slug: string;
  title: string;
  original_title: string | null;
  alternate_titles: string[];
  description: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  min_players: number | null;
  max_players: number | null;
  playing_time: number | null;
  weight: number | null;
  bgg_id: number | null;
  bgg_rank: number | null;
  item_type: CatalogItemType;
  parent_game_id: string | null;
  is_verified: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GameBarcode {
  id: string;
  game_id: string;
  barcode: string;
  barcode_type: 'EAN-13' | 'UPC-A' | 'GTIN-14';
  edition_language: EditionLanguage;
  created_at?: string;
}

export interface MerchantProductMapping {
  id: string;
  store_id: string;
  merchant_sku: string;
  raw_title: string;
  game_id: string;
  mapped_by: 'merchant' | 'admin' | 'auto';
  created_at?: string;
}

export interface StoreOffer {
  id: string;
  store_id: string;
  game_id: string;
  store_product_url: string;
  price: number;
  stock: number;
  edition_language: EditionLanguage;
  is_featured: boolean;
  promo_code: string | null;
  discount_percent: number;
  is_active: boolean;
  match_confidence: number;
  match_tier: number;
  created_at?: string;
  updated_at?: string;
}

export interface CalculatedOffer extends StoreOffer {
  store: Store;
  shipping: {
    flat_rate: number;
    free_shipping_threshold: number | null;
    shipping_cost: number;
    is_free_shipping: boolean;
  };
  total_delivered_cost: number;
  is_best_price: boolean;
}

export interface FeedItem {
  raw_title: string;
  product_url: string;
  price: number;
  sku?: string;
  barcode?: string;
  image_url?: string;
  item_type?: CatalogItemType;
}

export interface MatchResult {
  game_id: string | null;
  confidence: number;
  tier: 1 | 2 | 3 | 4;
  match_method: 'barcode' | 'sku_memory' | 'fuzzy_composite' | 'manual_queue';
  candidate_games?: Array<{ game: CatalogGame; score: number }>;
}

export interface ClickRecord {
  id?: string;
  offer_id: string;
  store_id: string;
  destination_url: string;
  user_agent?: string;
  ip_hash?: string;
  created_at?: string;
}
