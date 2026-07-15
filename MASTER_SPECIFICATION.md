# Master specification and ground-up implementation blueprint: MeeplePrecios 🇲🇽

> [!IMPORTANT]
> **Specification Purpose:** This document is the definitive blueprint for constructing **MeeplePrecios**, Mexico's board game price comparison engine, from the ground up. It defines the technical stack, database DDL, user stories, ingestion algorithms, UI design tokens, and AI agent skills required to build a production-ready system with zero architectural drift or cataloguing errors.

---

## 1. Executive summary and core purpose 🎲

### 1.1 Commercial vision
**MeeplePrecios** is the primary tabletop price comparison engine for Mexico (`MX` / `$ MXN`). The platform aggregates real-time inventory, pricing, and shipping data from independent Mexican board game e-commerce stores (for example, *El Duende CDMX, La Caravana Gamelab, Dungeoneers México, Roll Games, Con T de Tlacuache, Quantum Boardgames, Alfa y Delta, Bundaba*).

### 1.2 Core value proposition
- **For Players:** Eliminates price and stock fragmentation by providing a single, transparent portal that ranks store offers by **3-part total delivered cost** ($\text{Base Price} + \text{Shipping} = \text{Total Cost (\$ MXN)}$) with explicit language and edition badges (`Español (ES)`, `Inglés (EN)`, `Multilingüe (MULTI)`).
- **For Store Owners (Merchants):** Drives high-intent organic and affiliate checkout traffic without manual listing maintenance by automatically syncing Google Shopping XML and Shopify JSON feeds, with self-service mapping override tools.

---

## 2. Target personas and user journeys 👥

### 2.1 Persona 1: The Mexican board game buyer (Player / Comprador)
* **Demographics:** Board game enthusiasts, casual gamers, and collectors across Mexico (CDMX, Guadalajara, Monterrey, Puebla).
* **Primary Goals:**
  1. Locate specific games in stock at the lowest total delivered cost in Mexican Pesos ($ MXN).
  2. Differentiate between Spanish (`ES`) and English (`EN`) editions.
  3. Ensure that clicking an offer leads directly to the merchant product page without broken links or expansion mis-attributions.
* **Key User Journey:**
  `Homepage (Search / BGG Hotness) -> Game Detail Page (/game/id) -> Compare Total Delivered Costs -> Click "Ir a la tienda" -> Affiliate Checkout Redirect (/api/redirect)`

### 2.2 Persona 2: The independent store partner (Merchant / Socio)
* **Demographics:** Owners and e-commerce managers of independent Mexican tabletop shops.
* **Primary Goals:**
  1. Increase online sales and customer acquisition without paying marketplace commission fees.
  2. Keep stock and price listings in sync automatically without manual data entry.
  3. Access a self-service SKU mapping portal to map unmatched feed products directly to BGG IDs.
  4. Feature store deals (sponsored placements) to gain top visibility on high-demand games.
* **Key User Journey:**
  `Merchant Portal (/merchant/onboard) -> Register Store & Flat Shipping Rates in MXN -> Submit Shopify / XML Feed URL -> Map Unmatched SKUs (/merchant/dashboard) -> View Diagnostics -> Toggle Sponsored Deals`

### 2.3 Persona 3: The platform administrator (Admin)
* **Primary Goals:**
  1. Monitor merchant feed health, failed fetch logs, and un-indexed BoardGameGeek (BGG) queue items.
  2. Review medium-confidence feed items in the **Admin Staging Queue** (`/admin/queue`) and approve/re-map candidates with one click.
  3. Verify new merchant registrations and manage sponsored placement flags.
  4. Trigger automated catalog audits (`/api/admin/audit-urls`) to purge broken links and mis-attributed expansions.

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
- **[US-05] (Deprecated / Single-Market Scope Lock):** `Domestic store filter removed because MeeplePrecios is locked strictly to Mexico (MX / $ MXN), making all participating stores domestic Mexican shops by default.`
- **[US-102] Spin-Off Game Variant Cataloging:** `As a Player, I want spin-off variants like Spot It! Catan or Dobble Catan to be cataloged as distinct game entries rather than merged into base game pages, so that I can view accurate price comparisons for both base games and spin-offs independently.`

### Epic B: Merchant self-serve portal (Merchant persona)
- **[US-06] Merchant Onboarding:** `As a Store Owner, I want to register my storefront name, logo, and XML/JSON feed URL on /merchant/onboard, so that my inventory is automatically listed on MeeplePrecios.`
- **[US-07] Shipping Rate Matrix:** `As a Store Owner, I want to set my flat-rate domestic shipping fee and free shipping threshold in MXN, so that player total cost calculations are accurate.`
- **[US-08] Sponsored Placement Toggles (Feature-Flagged: `NEXT_PUBLIC_ENABLE_SPONSORED_DEALS=false`):** `As a Store Owner, I want to toggle sponsored featuring for my store on /merchant/dashboard after launch, so that my offers appear at the top of comparison tables with a "★ Tienda recomendada" badge once client onboarding reaches scale.`
- **[US-107] Merchant Self-Service Feed Mapping Portal:** `As a Store Owner, I want a self-service product mapping portal on /merchant/dashboard to view unmatched feed items and bind them to BGG IDs, so that I can maximize my catalog coverage on MeeplePrecios.`

### Epic C: Ingestion, barcode registry & catalog integrity (Developer / Admin persona)
- **[US-09] Multi-Format Feed Processing:** `As a Developer, I want feed ingestion to parse both Shopify JSON and Google Shopping XML feeds, so that all Mexican stores can be integrated without custom scrapers.`
- **[US-10] Automated Catalog Audit Worker:** `As a Developer, I want a background audit worker to scan store_games for HTTP 404 links and expansion/accessory mis-attributions, so that base game pages remain 100% clean.`
- **[US-11] BGG Pseudo-Game Resolution:** `As a Developer, I want auto-created games (bgg_id >= 8,000,000) to automatically resolve their real BGG ID via BGG XMLAPI2, so that buyers never see empty or broken game pages.`
- **[US-103] EAN/GTIN Multi-Barcode Registry Table:** `As a Developer, I want a dedicated EAN/GTIN multi-barcode registry table (public.game_barcodes) linking barcodes to game editions and canonical BGG IDs, so that feed ingestion achieves 100% deterministic matching without string ambiguities.`
- **[US-104] Historical Merchant SKU Mapping Memory Table:** `As a Developer, I want a historical merchant SKU mapping memory table (public.merchant_product_mappings), so that manual merchant and admin re-mappings permanently persist across daily automated feed re-syncs.`
- **[US-105] 4-Tier Waterfall Feed Matching Engine:** `As a Developer, I want a 4-tier waterfall matching engine (EAN Barcode -> SKU Memory -> Tokenized Fuzzy Match -> Manual Queue) with confidence scoring (>=0.92 auto-publish, 0.70-0.91 queue), so that product ingestion operates with 99.9% accuracy.`
- **[US-106] Admin Staging and Moderation Queue UI:** `As an Admin, I want a staging queue UI on /admin/queue for medium-confidence feed items (confidence 0.70 to 0.91), so that I can review, approve, or re-map uncertain catalog matches with a single click.`

---

## 4. Technical stack architecture 🛠️

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
        Tier3["Tier 3: Tokenized Fuzzy Match & Confidence Scorer"]
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

- **Monolith Framework:** Next.js 16 (App Router) using React 19 and TypeScript 5.
- **Styling and Design Tokens:** Tailwind CSS v4 + Vanilla CSS custom properties (`Blanco roto #F5F0E9`, `Carbón #3A3A3A`, `Malva #8367C7`, `Turquesa #73D8D4`, `Coral #FF9E8A`).
- **Database and Auth:** Supabase (PostgreSQL) with Row-Level Security (RLS) policies.
- **HTTP Client and Parsing:** `undici` and native `fetch` with `AbortSignal.timeout(3000)`.
- **Testing Framework:** Serial Jest with JSDOM (`npm run test -- --runInBand --forceExit`) and Playwright E2E (`npm run test:e2e`).

---

## 5. Complete database DDL and RLS specification 🗄️

### 5.1 Entity-relationship (ER) diagram

```mermaid
erDiagram
    stores ||--o{ shipping_rates : "has flat rates"
    stores ||--o{ store_games : "lists inventory"
    stores ||--o{ merchant_product_mappings : "defines SKU overrides"
    bgg_games_cache ||--o{ store_games : "matched to"
    bgg_games_cache ||--o{ game_barcodes : "indexed by EANs"
    bgg_games_cache ||--o{ merchant_product_mappings : "mapped to"
    stores ||--o{ clicks : "tracks outbound clicks"
    bgg_games_cache ||--o{ clicks : "tracks clicked game"

    stores {
        uuid id PK
        string name
        string feed_url
        string feed_type
        string feed_status
        boolean is_domestic
    }

    shipping_rates {
        uuid id PK
        uuid store_id FK
        string destination_country
        numeric flat_rate
        numeric free_shipping_threshold
    }

    bgg_games_cache {
        integer bgg_id PK
        string name
        string thumbnail
        string image
        string description
        numeric weight
        string item_type
    }

    game_barcodes {
        uuid id PK
        string barcode
        integer bgg_id FK
        string edition_language
        string publisher_name
    }

    merchant_product_mappings {
        uuid id PK
        uuid store_id FK
        string merchant_sku
        integer bgg_id FK
        boolean is_verified
        timestamptz mapped_at
    }

    store_games {
        uuid id PK
        uuid store_id FK
        integer bgg_id FK
        string store_product_url
        numeric price
        integer stock
        string edition_language
        boolean is_featured
        numeric match_confidence
        integer match_tier
    }

    clicks {
        uuid id PK
        uuid store_id FK
        integer bgg_id FK
        string store_product_url
        timestamptz clicked_at
    }
```

### 5.2 Production SQL DDL specification

#### Table 1: Merchant Stores (`public.stores`)
```sql
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
```

#### Table 2: Shipping Rates (`public.shipping_rates`)
```sql
CREATE TABLE IF NOT EXISTS public.shipping_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  destination_country TEXT NOT NULL DEFAULT 'MX',
  flat_rate NUMERIC(10,2) NOT NULL DEFAULT 105.00,
  free_shipping_threshold NUMERIC(10,2) DEFAULT 1200.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, destination_country)
);
```

#### Table 3: Board Games Catalog Cache (`public.bgg_games_cache`)
```sql
CREATE TABLE IF NOT EXISTS public.bgg_games_cache (
  bgg_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
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
```

#### Table 4: Multi-Barcode Registry (`public.game_barcodes`)
```sql
CREATE TABLE IF NOT EXISTS public.game_barcodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode TEXT NOT NULL UNIQUE,
  bgg_id INTEGER NOT NULL REFERENCES public.bgg_games_cache(bgg_id) ON DELETE CASCADE,
  edition_language TEXT NOT NULL DEFAULT 'es',
  publisher_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_game_barcodes_barcode ON public.game_barcodes(barcode);
```

#### Table 5: Merchant SKU Mapping Memory (`public.merchant_product_mappings`)
```sql
CREATE TABLE IF NOT EXISTS public.merchant_product_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  merchant_sku TEXT NOT NULL,
  bgg_id INTEGER NOT NULL REFERENCES public.bgg_games_cache(bgg_id) ON DELETE CASCADE,
  is_verified BOOLEAN NOT NULL DEFAULT true,
  mapped_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, merchant_sku)
);
```

#### Table 6: Store Inventory and Offers (`public.store_games`)
```sql
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
```

#### Table 7: Outbound Affiliate Click Log (`public.clicks`)
```sql
CREATE TABLE IF NOT EXISTS public.clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id),
  bgg_id INTEGER NOT NULL REFERENCES public.bgg_games_cache(bgg_id),
  store_product_url TEXT NOT NULL,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.3 Row level security (RLS) policies

```sql
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bgg_games_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_barcodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchant_product_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on stores" ON public.stores FOR SELECT USING (true);
CREATE POLICY "Allow public read access on shipping_rates" ON public.shipping_rates FOR SELECT USING (true);
CREATE POLICY "Allow public read access on bgg_games_cache" ON public.bgg_games_cache FOR SELECT USING (true);
CREATE POLICY "Allow public read access on game_barcodes" ON public.game_barcodes FOR SELECT USING (true);
CREATE POLICY "Allow public read access on merchant_product_mappings" ON public.merchant_product_mappings FOR SELECT USING (true);
CREATE POLICY "Allow public read access on store_games" ON public.store_games FOR SELECT USING (true);
CREATE POLICY "Allow public insert on clicks" ON public.clicks FOR INSERT WITH CHECK (true);
```

---

## 6. The 4-tier waterfall ingestion and matching engine ⚙️

```mermaid
flowchart TD
    Item["Incoming Merchant Product Feed Item"] --> T1{"Tier 1: EAN/GTIN Match?"}
    T1 -- Yes --> Match1["Match Found (Confidence: 1.00, Tier: 1)<br/>Auto-Publish Offer"]
    T1 -- No --> T2{"Tier 2: Historical SKU Memory Match?"}
    T2 -- Yes --> Match2["Match Found (Confidence: 1.00, Tier: 2)<br/>Auto-Publish Offer"]
    T2 -- No --> T3["Tier 3: Tokenized Fuzzy Matcher & Subtitle Isolator"]
    T3 --> ScoreEval{"Score Evaluation"}
    ScoreEval -- "Score >= 0.92" --> Match3["High Confidence Auto-Match<br/>Auto-Publish Offer"]
    ScoreEval -- "0.70 <= Score < 0.92" --> Staging["Medium Confidence Match<br/>Route to Admin Staging Queue (/admin/queue)"]
    ScoreEval -- "Score < 0.70" --> SpinOffCheck{"Spin-off or New Game?"}
    SpinOffCheck -- Valid Game --> AutoCreate["Auto-Create Distinct BGG Entry (bgg_id >= 8,000,000)<br/>Enqueue BGG Resolution"]
    SpinOffCheck -- Accessory/Non-Game --> Reject["Reject Non-Boardgame Item"]
    Staging --> T4["Tier 4: Human Override Panel (Admin / Merchant)"]
    T4 --> SaveMemory["Save SKU Mapping to merchant_product_mappings<br/>(Permanent Tier 2 Memory)"]
```

### 6.1 Tier 1: EAN / GTIN / UPC barcode matcher
- Queries `<g:gtin>` or `variant.barcode` against `public.game_barcodes`.
- Deterministic, 100% accurate, bypasses string ambiguities completely.

### 6.2 Tier 2: Historical merchant SKU mapping memory
- Queries `(store_id, merchant_sku)` against `public.merchant_product_mappings`.
- Persists human admin and merchant manual override decisions permanently across daily automated feed re-syncs.

### 6.3 Tier 3: Tokenized fuzzy matching & subtitle isolator
- Calculates token overlap and string similarity:
  $$\text{Score} = (0.5 \times \text{JaroWinkler}) + (0.3 \times \text{TokenOverlap}) + (0.2 \times \text{Levenshtein})$$
- Evaluates tokenized exclusion penalties (`-0.35` if feed title contains standalone spin-off keywords like `"spot it"`, `"dobble"`, `"junior"` when evaluating base games).
- **Threshold Routing:**
  - $\text{Score} \ge 0.92$: Auto-publish to comparison table.
  - $0.70 \le \text{Score} < 0.92$: Route to **Admin Staging Queue** (`/admin/queue`).
  - $\text{Score} < 0.70$: Auto-create distinct game entry if valid game, or reject if accessory.

### 6.4 Tier 4: Human override & merchant self-service portal
- **Admin Staging Queue (`/admin/queue`):** One-click approval or manual search re-mapping for medium-confidence items.
- **Merchant Self-Service Portal (`/merchant/dashboard`):** Allows store owners to view unmatched feed products and bind them directly to BGG IDs.
- **Permanent Memory Persistence:** Any Tier 4 manual link writes a row to `public.merchant_product_mappings` (Tier 2), guaranteeing future feed syncs retain the human decision.

---

## 7. UI and UX design system and token specification 🎨

### 7.1 Color palette
| Purpose | Color Name | Hex Code | Tailwind / CSS |
| :--- | :--- | :--- | :--- |
| Base / Background | Blanco roto | `#F5F0E9` | `bg-[#F5F0E9]` |
| Dark UI / Headers | Carbón suave | `#3A3A3A` | `text-[#3A3A3A]` |
| Primary Accent / CTAs | Malva suave | `#8367C7` | `bg-[#8367C7] text-white` |
| Secondary Accent / Badges | Turquesa pastel | `#73D8D4` | `bg-[#73D8D4]/20 text-[#2B8C88]` |
| Price Highlights | Coral deslavado | `#FF9E8A` | `bg-[#FF9E8A]/25 text-rose-950` |

### 7.2 Wise strategic emoji guidance
- **Policy:** Emojis (for example, 🇲🇽, 🎲, ⭐, 📦, ⚡) may be used strategically in headings and documentation for visual warmth and scannability, but MUST NOT be used as raw unstyled unicode inside functional data table cells.

### 7.3 Google sentence case governance
- **Rule:** All headings (`h1`, `h2`, `h3`), buttons, and table labels MUST strictly follow sentence case (for example, *Comparativa de ofertas por tienda*, *★ Tienda recomendada*, *Mejor precio actual*). Regression tests in `src/__tests__/sentence_case_style.test.tsx` catch violations during `npm run verify`.

### 7.4 Tactile switch component standard (`role="switch"`)
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

## 8. AI agent personas, workflows, and directives 🤖

### 8.1 The four AI agent personas
1. **The Architect:** Drafts TDD execution plans and issue breakdowns. Does NOT write production code.
2. **The UX Expert:** Audits layouts, typography, Google sentence case, and tactile switch accessibility.
3. **The Builder:** Writes tests first (TDD), implements minimal code on `feature/issue-<num>-<title>` branches.
4. **The Reviewer:** Runs `npm run verify` and `npm run test:e2e`, opens PRs (`gh pr create`), and merges into `main` (`gh pr merge`).

---

## 9. Exhaustive workspace skills specification (`.agents/skills/`) 🧰

### Skill 1: `backlog_auditor`
### Skill 2: `github_issue_solve`
### Skill 3: `github_issue_complete`
### Skill 4: `ux_expert`
### Skill 5: `document_sync`

---

## 10. Four-tier verification and quality assurance gate 🧪

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

## 11. Ground-up execution roadmap (Sprint Sequence) 🚀

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

## 12. Autonomous AI agent implementation and operating guide 🤖

This guide defines the exact operational protocol an autonomous AI agent MUST follow to execute this specification cleanly without human intervention or architectural drift.
