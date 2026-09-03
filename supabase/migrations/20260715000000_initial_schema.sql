-- MeeplePrecios 🇲🇽 - Canonical Initial Database Schema Migration
-- Migration: 20260715000000_initial_schema.sql

-- ==============================================================================
-- 0. Clean Slate: Drop all legacy & existing tables/types (if any exist)
-- ==============================================================================
DROP TABLE IF EXISTS public.ingestion_jobs CASCADE;
DROP TABLE IF EXISTS public.bgg_sync_queue CASCADE;
DROP TABLE IF EXISTS public.bgg_metadata_queue CASCADE;
DROP TABLE IF EXISTS public.feed_item_queue CASCADE;
DROP TABLE IF EXISTS public.clicks CASCADE;
DROP TABLE IF EXISTS public.store_offers CASCADE;
DROP TABLE IF EXISTS public.store_games CASCADE;
DROP TABLE IF EXISTS public.merchant_product_mappings CASCADE;
DROP TABLE IF EXISTS public.game_barcodes CASCADE;
DROP TABLE IF EXISTS public.catalog_games CASCADE;
DROP TABLE IF EXISTS public.bgg_games_cache CASCADE;
DROP TABLE IF EXISTS public.internal_games CASCADE;
DROP TABLE IF EXISTS public.shipping_rates CASCADE;
DROP TABLE IF EXISTS public.stores CASCADE;

-- ==============================================================================
-- 1. PostgreSQL Extensions Setup
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. Table 1: Merchant Stores
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  website_url TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'MX',
  is_domestic BOOLEAN NOT NULL DEFAULT true,
  rating NUMERIC(3,2) DEFAULT 4.85 CHECK (rating >= 0.00 AND rating <= 5.00),
  review_count INTEGER DEFAULT 50 CHECK (review_count >= 0),
  feed_url TEXT,
  feed_type TEXT CHECK (feed_type IN ('google_xml', 'shopify_json', 'shopify_atom')),
  feed_status TEXT DEFAULT 'pending' CHECK (feed_status IN ('pending', 'success', 'failed')),
  feed_last_processed_count INTEGER DEFAULT 0 CHECK (feed_last_processed_count >= 0),
  feed_last_matched_count INTEGER DEFAULT 0 CHECK (feed_last_matched_count >= 0),
  feed_last_synced_at TIMESTAMPTZ,
  promo_code TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. Table 2: Shipping Rates (1-to-Many Normalized per Destination Market)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.shipping_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  destination_country TEXT NOT NULL DEFAULT 'MX',
  flat_rate NUMERIC(10,2) NOT NULL DEFAULT 120.00 CHECK (flat_rate >= 0),
  free_shipping_threshold NUMERIC(10,2) DEFAULT 1499.00 CHECK (free_shipping_threshold >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, destination_country)
);

-- ==============================================================================
-- 4. Table 3: Master Canonical Games Catalog [US-15]
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.catalog_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  original_title TEXT,
  alternate_titles TEXT[] DEFAULT '{}',
  description TEXT,
  image_url TEXT,
  thumbnail_url TEXT,
  min_players INTEGER CHECK (min_players >= 1),
  max_players INTEGER CHECK (max_players >= min_players),
  playing_time INTEGER CHECK (playing_time >= 0),
  weight NUMERIC(3,2) CHECK (weight >= 0.00 AND weight <= 5.00),
  bgg_id INTEGER UNIQUE,
  bgg_rank INTEGER,
  search_popularity INTEGER DEFAULT 100,
  item_type TEXT DEFAULT 'boardgame' CHECK (item_type IN ('boardgame', 'expansion', 'accessory', 'spinoff')),
  parent_game_id UUID REFERENCES public.catalog_games(id) ON DELETE SET NULL,
  is_verified BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. Table 4: Multi-Barcode GTIN/EAN Registry (Tier 1 Matcher) [US-11]
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.game_barcodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode TEXT NOT NULL UNIQUE,
  game_id UUID NOT NULL REFERENCES public.catalog_games(id) ON DELETE CASCADE,
  edition_language TEXT NOT NULL DEFAULT 'es' CHECK (edition_language IN ('es', 'en', 'multi')),
  publisher_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. Table 5: Merchant SKU Mapping Memory (Tier 2 Matcher) [US-12]
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.merchant_product_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  merchant_sku TEXT NOT NULL,
  game_id UUID NOT NULL REFERENCES public.catalog_games(id) ON DELETE CASCADE,
  is_verified BOOLEAN NOT NULL DEFAULT true,
  mapped_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, merchant_sku)
);

-- ==============================================================================
-- 7. Table 6: Store Inventory & Comparison Offers
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.store_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES public.catalog_games(id) ON DELETE CASCADE,
  store_product_url TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 1 CHECK (stock >= 0),
  edition_language TEXT NOT NULL DEFAULT 'es' CHECK (edition_language IN ('es', 'en', 'multi')),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  match_confidence NUMERIC(3,2) DEFAULT 1.00 CHECK (match_confidence >= 0.00 AND match_confidence <= 1.00),
  match_tier INTEGER DEFAULT 1 CHECK (match_tier BETWEEN 1 AND 4),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, game_id, store_product_url)
);

-- ==============================================================================
-- 8. Table 7: Outbound Affiliate Click Analytics
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID REFERENCES public.store_offers(id) ON DELETE SET NULL,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES public.catalog_games(id) ON DELETE CASCADE,
  destination_url TEXT NOT NULL,
  user_ip_hash TEXT,
  user_agent TEXT,
  referrer TEXT,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 9. Table 8: Multi-Candidate Staging Queue (Multi-Tenant Store & Admin) [US-18, US-19]
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.feed_item_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  sku TEXT,
  barcode TEXT,
  raw_title TEXT NOT NULL,
  clean_title TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  store_product_url TEXT NOT NULL,
  image_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  match_confidence NUMERIC(3,2) DEFAULT 0.00 CHECK (match_confidence >= 0.00 AND match_confidence <= 1.00),
  suggested_candidates JSONB DEFAULT '[]'::jsonb,
  resolved_game_id UUID REFERENCES public.catalog_games(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 10. Table 9: Background BGG Metadata Hydration Queue [US-21]
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.bgg_sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.catalog_games(id) ON DELETE CASCADE,
  bgg_id INTEGER,
  search_query TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempts INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 11. Table 10: Ingestion Batch Jobs (Serverless Chunking State Machine)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ingestion_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  items_processed INTEGER DEFAULT 0,
  items_matched INTEGER DEFAULT 0,
  error_log TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 12. Performance Indexing Strategy
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_stores_country ON public.stores(country);
CREATE INDEX IF NOT EXISTS idx_shipping_rates_store_id ON public.shipping_rates(store_id);
CREATE INDEX IF NOT EXISTS idx_catalog_games_slug ON public.catalog_games(slug);
CREATE INDEX IF NOT EXISTS idx_catalog_games_bgg_id ON public.catalog_games(bgg_id);
CREATE INDEX IF NOT EXISTS idx_catalog_games_title_trgm ON public.catalog_games USING GIN(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_catalog_games_alternate_names ON public.catalog_games USING GIN(alternate_titles);
CREATE INDEX IF NOT EXISTS idx_catalog_games_parent_id ON public.catalog_games(parent_game_id);
CREATE INDEX IF NOT EXISTS idx_game_barcodes_barcode ON public.game_barcodes(barcode);
CREATE INDEX IF NOT EXISTS idx_merchant_mappings_sku ON public.merchant_product_mappings(store_id, merchant_sku);
CREATE INDEX IF NOT EXISTS idx_store_offers_lookup ON public.store_offers(game_id, is_active);
CREATE INDEX IF NOT EXISTS idx_store_offers_store ON public.store_offers(store_id);
CREATE INDEX IF NOT EXISTS idx_feed_queue_lookup ON public.feed_item_queue(store_id, status);
CREATE INDEX IF NOT EXISTS idx_clicks_store_date ON public.clicks(store_id, clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_clicks_game_id ON public.clicks(game_id);
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_status ON public.ingestion_jobs(status, created_at);

-- ==============================================================================
-- 13. Row-Level Security (RLS) Policies
-- ==============================================================================
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_barcodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_product_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_item_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bgg_sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestion_jobs ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Public Read Stores" ON public.stores FOR SELECT USING (true);
CREATE POLICY "Public Read Shipping" ON public.shipping_rates FOR SELECT USING (true);
CREATE POLICY "Public Read Catalog" ON public.catalog_games FOR SELECT USING (true);
CREATE POLICY "Public Read Barcodes" ON public.game_barcodes FOR SELECT USING (true);
CREATE POLICY "Public Read Offers" ON public.store_offers FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Mappings" ON public.merchant_product_mappings FOR SELECT USING (true);
CREATE POLICY "Public Read Sync Queue" ON public.bgg_sync_queue FOR SELECT USING (true);

-- Public Insert for Clicks
CREATE POLICY "Public Click Insertion" ON public.clicks FOR INSERT WITH CHECK (true);

-- Policy 1: Store owners can only view & update their own store's pending queue items [US-19]
CREATE POLICY store_owner_queue_isolation ON public.feed_item_queue
  FOR ALL
  USING (
    store_id = (SELECT (auth.jwt() -> 'app_metadata' ->> 'store_id')::UUID)
  );

-- Policy 2: Admins can view & moderate all queues across all stores [US-19]
CREATE POLICY admin_full_queue_access ON public.feed_item_queue
  FOR ALL
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

