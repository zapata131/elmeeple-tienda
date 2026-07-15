# Master specification and ground-up implementation blueprint: MeeplePrecios 🇲🇽

> [!IMPORTANT]
> **Specification Purpose:** This document is the definitive, self-contained master blueprint for constructing **MeeplePrecios**, Mexico's board game price comparison engine, from the ground up. It contains the complete technical architecture, environment variables, directory file map, TypeScript data interfaces, Supabase DDL scripts, RLS policies, indexing strategy, REST API contracts, feed parsing algorithms, affiliate redirect mechanics, UI design system tokens, page route maps, and AI agent execution rules. An engineer or autonomous AI agent can build the entire system from scratch using this blueprint without architectural drift or cataloguing errors.

---

## 1. Executive summary and core purpose 🎲

### 1.1 Commercial vision
**MeeplePrecios** is the primary tabletop price comparison engine for Mexico (`MX` / `$ MXN`). The platform aggregates real-time inventory, pricing, and shipping data from independent Mexican board game e-commerce stores (for example, *El Duende CDMX, La Caravana Gamelab, Dungeoneers México, Roll Games, Con T de Tlacuache, Quantum Boardgames, Alfa y Delta, Bundaba*).

### 1.2 Core value proposition
- **For Players:** Eliminates price and stock fragmentation by providing a single portal that ranks store offers by **3-part total delivered cost** ($\text{Base Price} + \text{Shipping} = \text{Total Cost (\$ MXN)}$) with explicit language and edition badges (`Español (ES)`, `Inglés (EN)`, `Multilingüe (MULTI)`).
- **For Store Owners (Merchants):** Drives high-intent organic and affiliate checkout traffic without manual listing maintenance by automatically syncing Google Shopping XML and Shopify JSON feeds, backed by self-service mapping override tools.

---

## 2. Target personas and user journeys 👥

### 2.1 Persona 1: The Mexican board game buyer (Player / Comprador)
* **Demographics:** Board game enthusiasts, casual gamers, and collectors across Mexico (CDMX, Guadalajara, Monterrey, Puebla).
* **Primary Goals:**
  1. Locate specific games in stock at the lowest total delivered cost in Mexican Pesos ($ MXN).
  2. Differentiate between Spanish (`ES`) and English (`EN`) editions.
  3. Ensure that clicking an offer leads directly to the merchant product page without broken links or expansion mis-attributions.
* **Key User Journey:**
  `Homepage (Search / BGG Hotness) -> Game Detail Page (/game/[id]) -> Compare Total Delivered Costs -> Click "Ir a la tienda" -> Affiliate Checkout Redirect (/api/redirect)`

### 2.2 Persona 2: The independent store partner (Merchant / Socio)
* **Demographics:** Owners and e-commerce managers of independent Mexican tabletop shops.
* **Primary Goals:**
  1. Increase online sales and customer acquisition without paying marketplace commission fees.
  2. Keep stock and price listings in sync automatically without manual data entry.
  3. Access a self-service SKU mapping portal to map unmatched feed products directly to BGG IDs.
  4. Feature store deals (sponsored placements) to gain top visibility on high-demand games.
* **Key User Journey:**
  `Merchant Portal (/merchant/onboard) -> Register Store & Flat Shipping Rates in MXN -> Submit Feed URL -> Map Unmatched SKUs (/merchant/dashboard) -> View Diagnostics`

### 2.3 Persona 3: The platform administrator (Admin)
* **Primary Goals:**
  1. Monitor merchant feed health, failed fetch logs, and un-indexed BoardGameGeek (BGG) queue items.
  2. Review medium-confidence feed items in the **Admin Staging Queue** (`/admin/queue`) and approve/re-map candidates with live BGG autocomplete.
  3. Verify new merchant registrations and manage sponsored placement flags.
  4. Trigger automated catalog audits (`/api/cron/audit-urls`) to purge broken links and mis-attributed expansions.

### 2.4 Persona 4: The autonomous AI developer (Agent persona)
* **Primary Goals:**
  1. Execute feature requests using test-driven development (TDD), atomic user stories, and single-persona branch isolation.
  2. Enforce Google sentence case governance, brand visual tokens, and tactile switch components.
  3. Run the four-tier verification gate (`npm run verify`) before merging pull requests into `main`.

---

## 3. Comprehensive user stories inventory 📜

Every feature in the platform is decomposed into single-persona, single-feature Agile User Stories:

### Epic A: Discovery and comparison (Player persona)
- **[US-01] Homepage Search and Hotness:** `As a Player, I want to search for board games on the homepage or view live BGG Hotness trends, so that I can quickly locate games available in Mexico.`
- **[US-02] Hero Comparative UI:** `As a Player, I want to see a full-width box art header, typographic stats, and a 3-part price comparison table on /game/[id], so that I can evaluate total delivered costs at a glance.`
- **[US-03] Explicit Language Badges:** `As a Player, I want store offers to display clear language badges (Español (ES), Inglés (EN), Multilingüe (MULTI)), so that I don't accidentally buy a game in a language I don't want.`
- **[US-04] Direct Affiliate Checkout:** `As a Player, I want clicking "Ir a la tienda" to redirect me to the store's exact product page with UTM tracking, so that I can complete my purchase immediately.`
- **[US-05] Scope Lock:** `MeeplePrecios is locked strictly to Mexico (MX / $ MXN), making all participating stores domestic Mexican shops by default.`
- **[US-102] Spin-Off Game Variant Cataloging:** `As a Player, I want spin-off variants like Spot It! Catan or Dobble Catan to be cataloged as distinct game entries rather than merged into base game pages, so that I can view accurate price comparisons for both base games and spin-offs independently.`

### Epic B: Merchant self-serve portal (Merchant persona)
- **[US-06] Merchant Onboarding:** `As a Store Owner, I want to register my storefront name, logo, and XML/JSON feed URL on /merchant/onboard, so that my inventory is automatically listed on MeeplePrecios.`
- **[US-07] Shipping Rate Matrix:** `As a Store Owner, I want to set my flat-rate domestic shipping fee and free shipping threshold in MXN, so that player total cost calculations are accurate.`
- **[US-08] Sponsored Placement Toggles:** `As a Store Owner, I want to toggle sponsored featuring for my store on /merchant/dashboard, so that my offers appear at the top of comparison tables with a "★ Tienda recomendada" badge.`
- **[US-107] Merchant Self-Service Feed Mapping Portal:** `As a Store Owner, I want a self-service product mapping portal on /merchant/dashboard to view unmatched feed items and bind them to BGG IDs, so that I can maximize my catalog coverage on MeeplePrecios.`

### Epic C: Ingestion, barcode registry & catalog integrity (Developer / Admin persona)
- **[US-09] Multi-Format Feed Processing:** `As a Developer, I want feed ingestion to parse both Shopify JSON and Google Shopping XML feeds, so that all Mexican stores can be integrated without custom scrapers.`
- **[US-10] Automated Catalog Audit Worker:** `As a Developer, I want a background audit worker to scan store_games for HTTP 404 links and expansion/accessory mis-attributions, so that base game pages remain 100% clean.`
- **[US-11] BGG Pseudo-Game Resolution:** `As a Developer, I want auto-created games (bgg_id >= 8,000,000) to automatically resolve their real BGG ID via BGG XMLAPI2, so that buyers never see empty or broken game pages.`
- **[US-103] EAN/GTIN Multi-Barcode Registry Table:** `As a Developer, I want a dedicated EAN/GTIN multi-barcode registry table (public.game_barcodes) linking barcodes to game editions and canonical BGG IDs, so that feed ingestion achieves 100% deterministic matching without string ambiguities.`
- **[US-104] Historical Merchant SKU Mapping Memory Table:** `As a Developer, I want a historical merchant SKU mapping memory table (public.merchant_product_mappings), so that manual merchant and admin re-mappings permanently persist across daily automated feed re-syncs.`
- **[US-105] 4-Tier Waterfall Feed Matching Engine:** `As a Developer, I want a 4-tier waterfall matching engine (EAN Barcode -> SKU Memory -> Tokenized Fuzzy Match -> Manual Queue) with confidence scoring (>=0.92 auto-publish, 0.70-0.91 queue), so that product ingestion operates with 99.9% accuracy.`
- **[US-106] Admin Staging and Moderation Queue UI:** `As an Admin, I want a staging queue UI on /admin/queue for medium-confidence feed items (confidence 0.70 to 0.91), so that I can review, approve, or re-map uncertain catalog matches with live BGG autocomplete.`

---

## 4. Technical stack architecture & repository structure 🛠️

```mermaid
flowchart TD
    subgraph Frontend["Presentation Layer (Next.js 16 App Router)"]
        React["React 19 Server / Client Components"]
        Tailwind["Tailwind CSS v4 & Brand Tokens"]
        TS["TypeScript 5 (Strict Mode)"]
    end

    subgraph CoreEngine["4-Tier Matching Engine & Business Logic"]
        Tier1["Tier 1: EAN / GTIN Barcode Matcher"]
        Tier2["Tier 2: Historical SKU Memory Lookup"]
        Tier3["Tier 3: Tokenized Fuzzy Match & Subtitle Isolator"]
        Tier4["Tier 4: Staging Queue & Merchant Override Portal"]
        FeedParser["Multi-Format Feed Parser<br/>(Shopify JSON & Google Atom XML)"]
        LanguageDetector["Language & Publisher Engine<br/>(ES, EN, MULTI Badging)"]
        AuditWorker["Automated Catalog Audit Worker<br/>(HTTP Health Check & Title Match)"]
        RedirectEngine["Outbound Affiliate Redirect Engine<br/>(/api/redirect)"]
    end

    subgraph DataLayer["Persistence Layer (Supabase / PostgreSQL)"]
        StoresDB[("stores Table<br/>(Merchant Details & Feed Status)")]
        ShippingDB[("shipping_rates Table<br/>(Flat Domestic Rates in MXN)")]
        BggCache[("bgg_games_cache Table<br/>(BGG Metadata & Box Art)")]
        GameBarcodes[("game_barcodes Table<br/>(EAN/GTIN/UPC Multi-Barcode Registry)")]
        MerchantMappings[("merchant_product_mappings Table<br/>(Historical SKU Memory)")]
        StoreGames[("store_games Table<br/>(Inventory, Stock & Prices)")]
        ClicksLog[("clicks Table<br/>(Affiliate Conversion Tracking)")]
        QueueDB[("bgg_metadata_queue Table<br/>(Staging Queue Items)")]
    end

    subgraph VerificationGate["Testing & Quality Assurance Gate"]
        Jest["Serial Jest Unit Tests (--runInBand)"]
        Playwright["Playwright E2E Browser Suite"]
        Eslint["ESLint & TypeScript Verification"]
    end

    Frontend -->|Queries & Directives| CoreEngine
    CoreEngine -->|Reads / Writes| DataLayer
    CoreEngine -->|Verified By| VerificationGate
```

### 4.1 Required environment variables (`.env.local`)
```ini
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# NextAuth Configuration
NEXTAUTH_SECRET=fallback-secret-for-development-and-tests
NEXTAUTH_URL=http://localhost:3001

# Cron Authorization Secret
CRON_SECRET=your-secure-cron-secret-token

# Feature Flags
NEXT_PUBLIC_ENABLE_SPONSORED_DEALS=false
```

### 4.2 Repository directory tree & file layout
```none
elmeeple-stores/
├── .agents/                    # Agent skills & living rules
│   └── skills/
├── e2e/                        # Playwright E2E integration tests
│   └── waterfall_matching_and_portals.spec.ts
├── src/
│   ├── app/                    # Next.js 16 App Router pages & API routes
│   │   ├── admin/
│   │   │   ├── dashboard/page.tsx
│   │   │   └── queue/page.tsx
│   │   ├── api/
│   │   │   ├── admin/feed-queue/route.ts
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── cron/
│   │   │   │   ├── audit-urls/route.ts
│   │   │   │   ├── process-bgg-queue/route.ts
│   │   │   │   └── sync-feeds/route.ts
│   │   │   ├── merchant/
│   │   │   │   ├── featured/route.ts
│   │   │   │   ├── mapping/route.ts
│   │   │   │   └── shipping/route.ts
│   │   │   ├── redirect/route.ts
│   │   │   └── search/route.ts
│   │   ├── game/[id]/page.tsx
│   │   ├── login/page.tsx
│   │   ├── merchant/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── diagnostics/page.tsx
│   │   │   ├── onboard/page.tsx
│   │   │   └── shipping/page.tsx
│   │   ├── search/page.tsx
│   │   ├── store/[id]/page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/             # Reusable UI components
│   │   ├── AdminGamesCatalogTable.tsx
│   │   ├── AdminQueueMonitor.tsx
│   │   ├── AdminStoreList.tsx
│   │   ├── MerchantAnalyticsCharts.tsx
│   │   ├── MerchantClickAnalytics.tsx
│   │   ├── MerchantFeaturedDealsPanel.tsx
│   │   ├── MerchantFeedInspector.tsx
│   │   ├── MerchantMappingPortal.tsx
│   │   ├── RegionalStoreToggle.tsx
│   │   ├── SearchBar.tsx
│   │   ├── StoreOffersComparisonTable.tsx
│   │   └── Toolbar.tsx
│   ├── lib/                    # Supabase server/client connectors & queries
│   │   ├── queries.ts
│   │   ├── supabaseClient.ts
│   │   └── supabaseServer.ts
│   ├── types/                  # TypeScript Data Interfaces
│   │   └── index.ts
│   └── utils/                  # Core engines, workers & parsers
│       ├── bgg_resolution_worker.ts
│       ├── feed_parser.ts
│       ├── local_file_cache.ts
│       ├── mockData.ts
│       ├── real_feed_data.ts
│       ├── url_product_audit_worker.ts
│       └── waterfall_matching_engine.ts
├── jest.config.ts
├── next.config.ts
├── package.json
├── playwright.config.ts
└── tsconfig.json
```

### 4.3 Core TypeScript data interfaces (`src/types/index.ts`)
```ts
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
  shipping_rates?: ShippingRate[];
}

export interface ShippingRate {
  id?: string;
  store_id: string;
  destination_country: string;
  flat_rate: number;
  free_shipping_threshold?: number | null;
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
  item_type?: 'boardgame' | 'expansion' | 'accessory';
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
  stores?: Store;
}
```

---

## 5. Complete database DDL, indexing & RLS specification 🗄️

### 5.1 Production SQL DDL specification

```sql
-- Table 1: Merchant Stores
CREATE TABLE IF NOT EXISTS public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  country TEXT NOT NULL DEFAULT 'MX',
  is_domestic BOOLEAN NOT NULL DEFAULT true,
  rating NUMERIC(3,2) DEFAULT 4.80,
  review_count INTEGER DEFAULT 50,
  feed_url TEXT,
  feed_type TEXT CHECK (feed_type IN ('google_xml', 'shopify_json')),
  feed_status TEXT DEFAULT 'pending',
  feed_last_processed_count INTEGER DEFAULT 0,
  feed_last_matched_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 2: Shipping Rates
CREATE TABLE IF NOT EXISTS public.shipping_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  destination_country TEXT NOT NULL DEFAULT 'MX',
  flat_rate NUMERIC(10,2) NOT NULL DEFAULT 105.00,
  free_shipping_threshold NUMERIC(10,2) DEFAULT 1200.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, destination_country)
);

-- Table 3: Board Games Catalog Cache
CREATE TABLE IF NOT EXISTS public.bgg_games_cache (
  bgg_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  alternate_names TEXT[],
  thumbnail TEXT,
  image TEXT,
  description TEXT,
  weight NUMERIC(3,2),
  min_players INTEGER,
  max_players INTEGER,
  playing_time INTEGER,
  base_price_eur NUMERIC(10,2),
  ean TEXT,
  item_type TEXT DEFAULT 'boardgame',
  last_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 4: Multi-Barcode GTIN/EAN Registry (Tier 1)
CREATE TABLE IF NOT EXISTS public.game_barcodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode TEXT NOT NULL UNIQUE,
  bgg_id INTEGER NOT NULL REFERENCES public.bgg_games_cache(bgg_id) ON DELETE CASCADE,
  edition_language TEXT NOT NULL DEFAULT 'es',
  publisher_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 5: Merchant SKU Mapping Memory (Tier 2)
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
  price NUMERIC(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 1,
  edition_language TEXT NOT NULL DEFAULT 'es',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  match_confidence NUMERIC(3,2) DEFAULT 1.00,
  match_tier INTEGER DEFAULT 1,
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, bgg_id, store_product_url)
);

-- Table 7: Outbound Affiliate Click Analytics
CREATE TABLE IF NOT EXISTS public.clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id),
  bgg_id INTEGER NOT NULL REFERENCES public.bgg_games_cache(bgg_id),
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
  match_confidence NUMERIC(3,2) DEFAULT 0.00,
  suggested_bgg_id INTEGER REFERENCES public.bgg_games_cache(bgg_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexing Strategy
CREATE INDEX IF NOT EXISTS idx_game_barcodes_barcode ON public.game_barcodes(barcode);
CREATE INDEX IF NOT EXISTS idx_merchant_product_mappings_lookup ON public.merchant_product_mappings(store_id, merchant_sku);
CREATE INDEX IF NOT EXISTS idx_store_games_bgg_id ON public.store_games(bgg_id);
CREATE INDEX IF NOT EXISTS idx_store_games_store_id ON public.store_games(store_id);
CREATE INDEX IF NOT EXISTS idx_bgg_metadata_queue_status ON public.bgg_metadata_queue(status);
CREATE INDEX IF NOT EXISTS idx_clicks_store_id ON public.clicks(store_id);
```

### 5.2 Row level security (RLS) policies

```sql
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
```

---

## 6. Complete REST API contract inventory 🔌

| Endpoint Path | Method | Auth Scope | Payload / Parameters | Success Response (200/201) |
| :--- | :--- | :--- | :--- | :--- |
| `/api/search` | `GET` | Public | `?q=query_string` | `{ games: [...], stores: [...] }` |
| `/api/redirect` | `GET` | Public | `?offer_id=uuid&url=http...` | HTTP 302 Redirect to merchant URL with UTM tags |
| `/api/admin/feed-queue` | `GET` | Admin | None | `{ items: [ QueueItem, ... ] }` |
| `/api/admin/feed-queue` | `POST` | Admin | `{ id, action: 'approve'/'remap'/'reject', bgg_id }` | `{ success: true, message: '...' }` |
| `/api/merchant/mapping` | `GET` | Merchant | `?store_id=uuid` | `{ items: [ UnmatchedItem, ... ] }` |
| `/api/merchant/mapping` | `POST` | Merchant | `{ store_id, merchant_sku, bgg_id }` | `{ success: true, mapped_bgg_id: ... }` |
| `/api/merchant/shipping` | `POST` | Merchant | `{ store_id, flat_rate, free_shipping_threshold }` | `{ success: true }` |
| `/api/merchant/featured` | `POST` | Merchant | `{ store_id, offer_id, is_featured }` | `{ success: true, is_featured: boolean }` |
| `/api/cron/sync-feeds` | `POST` | `CRON_SECRET` | Header `Authorization: Bearer <CRON_SECRET>` | `{ success: true, stores_processed: N, total_offers: M }` |
| `/api/cron/process-bgg-queue` | `POST` | `CRON_SECRET` | Header `Authorization: Bearer <CRON_SECRET>` | `{ processed: N, resolved: M }` |
| `/api/cron/audit-urls` | `POST` | `CRON_SECRET` | Header `Authorization: Bearer <CRON_SECRET>` | `{ audited: N, broken_links: M, misattributions: K }` |

---

## 7. The 4-tier waterfall ingestion & affiliate engines ⚙️

### 7.1 Title sanitization algorithm (`cleanBoardGameTitle`)
```ts
export function cleanBoardGameTitle(rawTitle: string): string {
  if (!rawTitle) return '';
  let title = rawTitle.toLowerCase();

  const noisePatterns = [
    /juego de mesa/gi, /edición especial/gi, /edición en español/gi,
    /edicion espanol/gi, /en español/gi, /ingles/gi, /inglés/gi,
    /preventa/gi, /nuevo/gi, /original/gi, /devir/gi, /asmodee/gi
  ];

  for (const pattern of noisePatterns) {
    title = title.replace(pattern, '');
  }

  title = title.replace(/[^\w\s\u00C0-\u024F]/gi, ' ');
  return title.replace(/\s+/g, ' ').trim();
}
```

### 7.2 Language detection algorithm (`detectLanguage`)
```ts
export function detectLanguage(title: string, description: string = ''): 'es' | 'en' | 'multi' {
  const text = `${title} ${description}`.toLowerCase();
  
  if (/\b(multilingüe|multilenguaje|multi-language)\b/i.test(text)) return 'multi';
  if (/\b(inglés|ingles|english|en)\b/i.test(text) && !/\b(español|espanol)\b/i.test(text)) return 'en';
  return 'es'; // Default to Spanish for Mexican store feeds
}
```

### 7.3 Composite similarity score math
$$\text{Score} = (0.5 \times \text{JaroWinkler}) + (0.3 \times \text{TokenOverlap}) + (0.2 \times \text{Levenshtein})$$

Exclusion keyword penalty: If title contains standalone word boundaries for `/\bfundas?\b/i`, `/\bprimer\b/i`, `/\bpuzzles?\b/i`, `/\bsleeves?\b/i`, `/\bexpansion\b/i` not present in catalog game title, apply `-0.35` penalty.

### 7.4 Multi-format feed parsers (Shopify JSON & Google Atom XML)
- **Shopify JSON Ingestion:** Fetches `/products.json?limit=250&page=N` up to 100 pages, extracting `id`, `sku`, `barcode`, `price`, `available`, `images`.
- **Google Atom XML Ingestion:** Parses `<item>` or `<entry>`, extracting `<title>`, `<link>`, `<g:gtin>`, `<g:price>`, `<g:availability>`.

### 7.5 Outbound affiliate redirect engine (`/api/redirect`)
When a user clicks **Ir a la tienda**:
1. Extracts `offer_id`, `store_id`, `url`.
2. Asynchronously logs an outbound click row to `public.clicks`.
3. Appends UTM tracking query params (`?utm_source=meepleprecios&utm_medium=affiliate&utm_campaign=price_comparison`).
4. Responds with HTTP `302 Found` redirecting the browser to the merchant's target product page.

---

## 8. Feed processing, database sequencing & testing gotchas ⚡

### 8.1 Database write sequence integrity
Inserting `store_games` rows referencing parent `bgg_id`s before parent rows exist in `bgg_games_cache` causes foreign key violations.
- **Rule:** Always flush new parent game entries to `bgg_games_cache` *before* inserting rows into `store_games`.

### 8.2 Buffered batch upserts
Executing individual SQL queries in large loops causes timeouts during feed syncs.
- **Rule:** Buffer discovered games in memory (`newGamesToUpsert`) and execute bulk upserts in batches of up to 500 records.

### 8.3 Disk cache fallback
When remote crawls fail or return 0 items due to status 429 rate-limiting:
- **Rule:** Load existing store offers from disk cache (`loadLocalCatalogCache`) and upsert them to database to preserve comparison table continuity.

### 8.4 BGG XMLAPI2 rate-limiting & pseudo-game resolution
When resolving auto-created games (`bgg_id >= 8,000,000`):
- **Rule:** Throttle requests with `delayMs = 1200` between consecutive XMLAPI2 fetches to avoid HTTP 429 rate limits.

---

## 9. UI design system and token specification 🎨

### 9.1 Color palette
| Purpose | Color Name | Hex Code | Tailwind / CSS Class |
| :--- | :--- | :--- | :--- |
| Base / Background | Blanco roto | `#F5F0E9` | `bg-[#F5F0E9]` |
| Dark UI / Headers | Carbón suave | `#3A3A3A` | `text-[#3A3A3A]` |
| Primary Accent / CTAs | Malva suave | `#8367C7` | `bg-[#8367C7] text-white` |
| Secondary Accent / Badges | Turquesa pastel | `#73D8D4` | `bg-[#73D8D4]/20 text-[#2B8C88]` |
| Price Highlights | Coral deslavado | `#FF9E8A` | `bg-[#FF9E8A]/25 text-rose-950` |

### 9.2 Google sentence case governance
All headings (`h1`, `h2`, `h3`), buttons, and table labels MUST strictly follow sentence case (for example, *Comparativa de ofertas por tienda*, *★ Tienda recomendada*, *Mejor precio actual*).

### 9.3 Tactile switch component standard (`role="switch"`)
All boolean toggles (for example, Domestic Store Toggle `onlyDomestic`) MUST use accessible switch controls:
```tsx
<input 
  type="checkbox" 
  role="switch" 
  aria-checked={isDomesticOnly} 
  onChange={(e) => { e.stopPropagation(); setIsDomesticOnly(e.target.checked); }} 
/>
```

---

## 10. Complete application page routes & UI map 🗺️

| Route Path | Description | Key Components & Links |
| :--- | :--- | :--- |
| `/` | Homepage & Game Discovery | `Toolbar`, `SearchBar`, BGG Hotness Cards, Footer Links (`/merchant/onboard`, `/merchant/dashboard`, `/admin/dashboard`, `/admin/queue`) |
| `/game/[id]` | Hero Comparative Details | Full-width cover art header, typographic stats, `StoreOffersComparisonTable` (3-part total cost calculation & affiliate redirects) |
| `/search` | Dedicated Search Results | `Toolbar`, `SearchBar`, paginated game result grid linking to `/game/[id]` |
| `/store/[id]` | Merchant Store Profile | Store details, official website button (`/api/redirect`), catalog inventory table |
| `/login` | Persona Switcher | Quick login buttons for Admin (`/admin/dashboard`), Merchant (`/merchant/dashboard`), and Player (`/`) |
| `/merchant/onboard` | Store Registration | Onboarding form submitting XML/JSON feed URL & shipping rates |
| `/merchant/dashboard` | Merchant Self-Service | Feed status, KPI cards, `<MerchantMappingPortal>`, `<MerchantFeaturedDealsPanel>`, shipping link (`/merchant/shipping`), diagnostics link (`/merchant/diagnostics`) |
| `/merchant/shipping` | Shipping Rates Matrix | Domestic flat-rate shipping & free threshold configuration in MXN |
| `/merchant/diagnostics` | Feed Sync Diagnostics | Real-time XML/JSON feed validation & raw payload inspection |
| `/admin/dashboard` | Admin Catalog Audit | Store verification table, indexed BGG games catalog, link to `/admin/queue` |
| `/admin/queue` | Admin Staging Queue | `<AdminQueueMonitor>` displaying staged items ($0.70 \dots 0.91$), suggested game thumbnails, one-click approval, and live BGG search autocomplete |
| `/api/redirect` | Outbound Affiliate Engine | Logs click event to `public.clicks` with UTM tracking and redirects buyer to store product page |

---

## 11. Four-tier verification and quality assurance gate 🧪

```bash
# 1. Type Check & ESLint
npx tsc --noEmit && npm run lint

# 2. Production Build Check
npm run build

# 3. Serial Jest Unit & Integration Test Suite
npm run test -- --runInBand --forceExit

# 4. Playwright E2E Browser Test Suite
npm run test:e2e

# 5. Master Verification Meta-Command
npm run verify
```

---

## 12. Ground-up execution roadmap (Sprint Sequence) 🚀

```mermaid
timeline
    title MeeplePrecios Ground-Up Development Timeline
    section Phase 1: Core Foundation
        Sprint 1 : Next.js 16 Setup : Supabase RLS DDL : Seed MOCK_GAMES
        Sprint 2 : Ingestion Engine : Language & Publisher Engine : Feed Parsers
    section Phase 2: Integrity & UI
        Sprint 3 : URL & Title Audit Worker : Auto-Healing Cron : API Route
        Sprint 4 : Full-Width Hero UI : Predictive SearchBar : Store Comparison Table
    section Phase 3: Commercial MVP
        Sprint 5 : Merchant Dashboard : Self-Serve Onboarding : Affiliate Redirects
        Sprint 6 : Playwright E2E Suite : CI/CD Gate : npm run verify
    section Phase 4: Enterprise Precision
        Sprint 7 : Multi-Barcode Registry : Merchant SKU Memory Table : US-103 & US-104
        Sprint 8 : 4-Tier Matching Engine : Admin Staging Queue : Merchant Self-Mapping Portal : US-105 to US-107
```

---

## 13. Autonomous AI agent operating guide 🤖

When executing tasks on this codebase, an autonomous AI agent MUST:
1. Audit the user prompt against the Three-Point Compliance Filter (Persona Atomicity, Scope Atomicity, Agile Syntax).
2. Create a dedicated feature branch matching the active issue (`git checkout -b feature/issue-<num>-<title>`).
3. Write tests first (TDD), implement minimal code to pass them, and enforce Google sentence case.
4. Run the four-tier verification gate (`npm run verify`) before merging into `main`.
5. Keep living documentation (`HANDOFF.md`, `DESIGN.md`, `AGENTS.md`, `MASTER_SPECIFICATION.md`) updated in real-time.
