# MeeplePrecios 🇲🇽 - Technical Design Document

## 🎨 Visual Design Tokens & UI Architecture
- **Base Background:** `Blanco roto` (`#F5F0E9`)
- **Headers / Dark UI:** `Carbón suave` (`#3A3A3A`)
- **Primary Accent / CTAs:** `Malva suave` (`#8367C7`)
- **Secondary Accent:** `Turquesa pastel` (`#73D8D4`)
- **Highlights:** `Coral deslavado` (`#FF9E8A`)

### UX & Accessibility Rules
1. **Google Sentence Case Governance:** All user-facing headings (`h1`, `h2`, `h3`), form labels, and buttons strictly use sentence case.
2. **Tactile Switch Standard:** All boolean toggles implement `role="switch"` and `aria-checked`.
3. **Explicit Edition Badges:** Offers clearly display `Español (ES)`, `Inglés (EN)`, and `Multilingüe (MULTI)`.
4. **3-Part Delivered Price Calculation:** $\text{Base Price} + \text{Shipping} = \text{Total Cost (\$ MXN)}$.

---

## 🗄️ Database Tables & Schemas
1. `public.stores` (Merchant registry, flat shipping configuration, feed tracking, and promo codes)
2. `public.shipping_rates` (Normalized destination shipping fees and free shipping thresholds in MXN)
3. `public.catalog_games` (Master canonical games catalog: UUID PK, slug UK, optional `bgg_id`, and alternate title array) [US-15]
4. `public.game_barcodes` (GTIN/EAN-13 deterministic multi-barcode registry linked to `catalog_games(id)`) [US-11]
5. `public.merchant_product_mappings` (Permanent SKU memory lookup table linked to `catalog_games(id)`) [US-12]
6. `public.store_offers` (Live comparison offers, stock, prices, and edition languages linked to `catalog_games(id)`)
7. `public.clicks` (Outbound affiliate redirect click log with UTM parameters)
8. `public.feed_item_queue` (Multi-candidate staging queue with store/admin RLS isolation) [US-18, US-19]
9. `public.bgg_sync_queue` (Throttled background BGG metadata hydration queue) [US-21]
10. `public.ingestion_jobs` (Serverless chunking ingestion state machine tracking batch processing)

---

## ⚖️ 3-Party Consensus Architectural Invariants
1. **Unified Autonomous Catalog Law:** Games are identified by `id UUID` and SEO-friendly `slug TEXT UNIQUE`. The external `bgg_id` is an optional lookup attribute, preventing foreign key failures on independent or un-indexed Mexican tabletop games.
2. **Serverless Chunked Ingestion Architecture:** Master cron `/api/cron/sync-feeds?batch_size=3` dispatches micro-batches to `ingestion_jobs`, processing 3 stores per invocation ordered by `feed_last_synced_at ASC NULLS FIRST` to eliminate serverless execution timeouts.
3. **Dynamic Stale Price Shield (Non-Blocking Freshness Check):** Outbound `/api/redirect` remains sub-100ms. On `/game/[slug]`, offers older than 6 hours trigger an asynchronous background ping to `/api/offers/verify?offer_id=...` to re-verify stock and price without blocking page rendering.
4. **Localized Spanish Title & Alternate Name Trigram Resolution:** GIN Trigram index (`idx_catalog_games_alternate_names`) on `catalog_games(alternate_titles)` powers sub-second fuzzy matching for localized titles (*Ticket to Ride* vs *Aventureros al Tren*), keeping game identity and edition language decoupled.
5. **Zero-Friction Mexican Merchant Monetization:** Eliminates complex merchant-side affiliate SDKs in favor of clean UTM tracking, direct community promo codes (`public.stores.promo_code`), and sponsored store placement flags (`is_featured = true`).

---

## ⚙️ 4-Tier Matching Engine Math, Classifiers & Staging Thresholds
- **Automated Non-Game Classifier (US-16):** Filters out sleeves (`fundas`), playmats, dice, and TCG booster packs prior to matching.
- **Base Game vs. Expansion Classifier (US-17):** Categorizes valid feed items into `boardgame` or `expansion` and binds expansions to `parent_game_id`.
- **Tier 1:** GTIN/EAN Barcode Matcher ($1.00$ confidence)
- **Tier 2:** Merchant SKU Memory Matcher ($1.00$ confidence)
- **Tier 3:** Tokenized Fuzzy Matcher:
  - Composite Score Math: $(0.5 \times \text{JaroWinkler}) + (0.3 \times \text{TokenOverlap}) + (0.2 \times \text{Levenshtein})$
  - Alternate Title Resolution: GIN Trigram search against `alternate_titles` for localized editions.
  - Auto-publish threshold: $\text{score} \ge 0.92$
  - Staging queue routing: $\text{score} < 0.92$ (Generates top 5 candidate suggestions in `suggested_candidates`)
- **Tier 4:** Multi-Tenant Staging Queue Authorization (US-19):
  - Stores access strictly their own queue items (`WHERE store_id = (auth.jwt() -> 'app_metadata' ->> 'store_id')::UUID`).
  - Admins access cross-store queue items (`WHERE role = 'admin'`).

---

## 🛠️ Phase 6: Catalog Audit, Resilience & Health Diagnostics Architecture
- **Automated URL & Redirect Audit Worker (`/api/cron/audit-urls`) [US-20]:** Periodically pings store product URLs, detects HTTP 404/500/broken links, updates offer health status, and auto-quarantines dead offers.
- **Automated BGG Metadata Hydration Worker (`/api/cron/process-bgg-queue`) [US-21]:** Asynchronously fetches missing BGG metadata (player counts, weight, high-res covers) for catalog games with $\ge 1200\text{ ms}$ rate limiting.
- **Admin Catalog Health & Feed Diagnostics Dashboard (`/admin/diagnostics`) [US-22]:** Interactive admin view displaying real-time feed error rates, total catalog offers, dead link counts, and manual feed re-sync controls.

---

## 🏗️ Full-Stack TypeScript Tech Stack Architecture
- **Framework:** Next.js 15+ (App Router, React 19, TypeScript).
  - *React Server Components (RSC):* Direct server-side PostgreSQL reads for zero-bundle initial page loads, instant SEO, and optimal CWV.
  - *Server Actions:* Typesafe mutations for merchant onboarding, shipping matrix edits, and queue moderation.
  - *Route Handlers:* Outbound redirect engine (`/api/redirect`) and cron workers (`/api/cron/*`).
- **Persistence & Auth:** Supabase (PostgreSQL 15+).
  - Extensions: `pg_trgm` (trigram fuzzy search), `pgcrypto` (UUID v4), `uuid-ossp`.
  - Security: Declarative Row-Level Security (RLS) enforcing tenant isolation.
- **Styling & Design System:** Tailwind CSS v4 configured with brand tokens (`#F5F0E9`, `#3A3A3A`, `#8367C7`, `#73D8D4`, `#FF9E8A`).
- **Quality Assurance:** Vitest for sub-second unit tests, Playwright for E2E user journeys, and Chrome DevTools MCP for visual rendering and console audits.

---

## 🌐 Modern Web Standards Architecture (Modern Web Guidance)
- **View Transitions API:** Implements `document.startViewTransition()` with `view-transition-name: game-hero-art` to morph game card box art directly into full-bleed detail headers across navigations, with `prefers-reduced-motion` fallbacks.
- **Sub-Second LCP & Resource Prioritization:** Hero box art on `/game/[slug]` enforces `fetchpriority="high"`, AVIF/WebP automatic negotiation, and `decoding="async"`. Offscreen carousel cards and merchant logos enforce native `loading="lazy"`.
- **Native HTML Overlays:** Employs HTML `<dialog>` with `.showModal()` for merchant SKU mapping modals and the native HTML `popover` API (`popover="auto"`) for filter dropdowns and coupon tooltips.
- **Adaptive Container Queries:** 3-part price comparison cards leverage `@container` queries and `:has()` to dynamically shift between 4-column desktop rows and stacked mobile cards based on available layout width.
- **Modern Accessible Forms:** Implements CSS `:user-valid` and `:user-invalid` pseudo-classes to prevent premature validation errors, `inputmode="numeric"` for monetary amounts, and tactile switches with `role="switch"` and `aria-checked`.

