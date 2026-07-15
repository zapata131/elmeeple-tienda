-- Extension Setup (Enables Fast Trigram Fuzzy Searching)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table 1: Merchant Stores
CREATE TABLE IF NOT EXISTS public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  country TEXT NOT NULL DEFAULT 'MX',
  is_domestic BOOLEAN NOT NULL DEFAULT true,
  rating NUMERIC(3,2) DEFAULT 4.80 CHECK (rating >= 0.00 AND rating <= 5.00),
  review_count INTEGER DEFAULT 50 CHECK (review_count >= 0),
  feed_url TEXT,
  feed_type TEXT CHECK (feed_type IN ('google_xml', 'shopify_json')),
  feed_status TEXT DEFAULT 'pending' CHECK (feed_status IN ('pending', 'success', 'failed')),
  feed_last_processed_count INTEGER DEFAULT 0 CHECK (feed_last_processed_count >= 0),
  feed_last_matched_count INTEGER DEFAULT 0 CHECK (feed_last_matched_count >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 2: Shipping Rates (1-to-Many Normalized per Destination Market)
CREATE TABLE IF NOT EXISTS public.shipping_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  destination_country TEXT NOT NULL DEFAULT 'MX',
  flat_rate NUMERIC(10,2) NOT NULL DEFAULT 105.00 CHECK (flat_rate >= 0),
  free_shipping_threshold NUMERIC(10,2) DEFAULT 1200.00 CHECK (free_shipping_threshold >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, destination_country)
);

-- Table 3: Board Games Catalog Cache (Canonical BGG Entities)
CREATE TABLE IF NOT EXISTS public.bgg_games_cache (
  bgg_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  alternate_names TEXT[] DEFAULT '{}',
  thumbnail TEXT,
  image TEXT,
  description TEXT,
  weight NUMERIC(3,2) CHECK (weight >= 0.00 AND weight <= 5.00),
  min_players INTEGER CHECK (min_players >= 1),
  max_players INTEGER CHECK (max_players >= min_players),
  playing_time INTEGER CHECK (playing_time >= 0),
  base_price_eur NUMERIC(10,2) CHECK (base_price_eur >= 0),
  ean TEXT,
  item_type TEXT DEFAULT 'boardgame' CHECK (item_type IN ('boardgame', 'expansion', 'accessory', 'pseudo_game')),
  last_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 4: Multi-Barcode GTIN/EAN Registry (Tier 1 Matcher)
CREATE TABLE IF NOT EXISTS public.game_barcodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode TEXT NOT NULL UNIQUE,
  bgg_id INTEGER NOT NULL REFERENCES public.bgg_games_cache(bgg_id) ON DELETE CASCADE,
  edition_language TEXT NOT NULL DEFAULT 'es' CHECK (edition_language IN ('es', 'en', 'multi')),
  publisher_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 5: Merchant SKU Mapping Memory (Tier 2 Matcher)
CREATE TABLE IF NOT EXISTS public.merchant_product_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  merchant_sku TEXT NOT NULL,
  bgg_id INTEGER NOT NULL REFERENCES public.bgg_games_cache(bgg_id) ON DELETE CASCADE,
  is_verified BOOLEAN NOT NULL DEFAULT true,
  mapped_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, merchant_sku)
);

-- Table 6: Store Inventory & Comparison Offers
CREATE TABLE IF NOT EXISTS public.store_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  bgg_id INTEGER NOT NULL REFERENCES public.bgg_games_cache(bgg_id) ON DELETE CASCADE,
  store_product_url TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 1 CHECK (stock >= 0),
  edition_language TEXT NOT NULL DEFAULT 'es' CHECK (edition_language IN ('es', 'en', 'multi')),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  match_confidence NUMERIC(3,2) DEFAULT 1.00 CHECK (match_confidence >= 0.00 AND match_confidence <= 1.00),
  match_tier INTEGER DEFAULT 1 CHECK (match_tier BETWEEN 1 AND 4),
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, bgg_id, store_product_url)
);

-- Table 7: Outbound Affiliate Click Analytics
CREATE TABLE IF NOT EXISTS public.clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  bgg_id INTEGER NOT NULL REFERENCES public.bgg_games_cache(bgg_id) ON DELETE CASCADE,
  store_product_url TEXT NOT NULL,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 8: Admin & BGG Staging Queue
CREATE TABLE IF NOT EXISTS public.bgg_metadata_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  ean TEXT,
  title TEXT NOT NULL,
  store_product_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'staged', 'resolved', 'rejected')),
  match_confidence NUMERIC(3,2) DEFAULT 0.00 CHECK (match_confidence >= 0.00 AND match_confidence <= 1.00),
  suggested_bgg_id INTEGER REFERENCES public.bgg_games_cache(bgg_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexing Strategy
CREATE INDEX IF NOT EXISTS idx_stores_country ON public.stores(country);
CREATE INDEX IF NOT EXISTS idx_shipping_rates_store_id ON public.shipping_rates(store_id);
CREATE INDEX IF NOT EXISTS idx_bgg_games_alternate_names ON public.bgg_games_cache USING GIN(alternate_names);
CREATE INDEX IF NOT EXISTS idx_game_barcodes_barcode ON public.game_barcodes(barcode);
CREATE INDEX IF NOT EXISTS idx_merchant_product_mappings_lookup ON public.merchant_product_mappings(store_id, merchant_sku);
CREATE INDEX IF NOT EXISTS idx_store_games_bgg_id ON public.store_games(bgg_id);
CREATE INDEX IF NOT EXISTS idx_store_games_store_id ON public.store_games(store_id);
CREATE INDEX IF NOT EXISTS idx_bgg_metadata_queue_status ON public.bgg_metadata_queue(status);
CREATE INDEX IF NOT EXISTS idx_clicks_store_clicked_at ON public.clicks(store_id, clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_clicks_bgg_id ON public.clicks(bgg_id);

-- Row Level Security (RLS) Policies
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bgg_games_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_barcodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_product_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bgg_metadata_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on stores" ON public.stores FOR SELECT USING (true);
CREATE POLICY "Allow public read access on shipping_rates" ON public.shipping_rates FOR SELECT USING (true);
CREATE POLICY "Allow public read access on bgg_games_cache" ON public.bgg_games_cache FOR SELECT USING (true);
CREATE POLICY "Allow public read access on game_barcodes" ON public.game_barcodes FOR SELECT USING (true);
CREATE POLICY "Allow public read access on merchant_product_mappings" ON public.merchant_product_mappings FOR SELECT USING (true);
CREATE POLICY "Allow public read access on store_games" ON public.store_games FOR SELECT USING (true);
CREATE POLICY "Allow public read access on bgg_metadata_queue" ON public.bgg_metadata_queue FOR SELECT USING (true);
CREATE POLICY "Allow public insert on clicks" ON public.clicks FOR INSERT WITH CHECK (true);
