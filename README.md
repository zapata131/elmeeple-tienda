# MeeplePrecios 🇲🇽

> **Mexico's Board Game Price Comparison Engine**
> Aggregating live inventory, pricing, and 3-part delivered shipping costs ($\text{Base Price} + \text{Shipping} = \text{Total Cost (\$ MXN)}$) across independent Mexican board game e-commerce stores.
> 
> 📖 **Ground-Up Rebuild Specification:** For the complete, 100% self-contained engineering blueprint to rebuild this project from scratch, see [COMPLETE_GROUND_UP_SPECIFICATION.md](file:///Users/joseluiszapata/Documents/GitHub/elmeeple-stores/COMPLETE_GROUND_UP_SPECIFICATION.md).

---

## 🎲 Features & Highlights

- **Player Experience (Epic A):**
  - **Predictive Smart Search & BGG Hotness Trends (`US-01`):** Instant search bar with autocomplete suggestions and live trending board games in Mexico.
  - **3-Part Delivered Cost Comparison Table (`US-02`):** Transparent breakdown of base price, estimated domestic shipping, and total delivered cost in Mexican Pesos ($ MXN).
  - **Explicit Language Badges (`US-03`):** Visual badges for `Español (ES)`, `Inglés (EN)`, and `Multilingüe (MULTI)` editions.
  - **Direct Affiliate Checkout (`US-04`):** One-click outbound redirection to store product pages with automated UTM tracking (`?utm_source=meepleprecios&utm_medium=affiliate&utm_campaign=price_comparison`).
  - **Spin-Off Variant Cataloging (`US-05`):** Spin-offs (e.g. *Spot It! Catan*) are cataloged independently from base games for clear price tracking.

- **Merchant Self-Service Portal (Epic B):**
  - **Self-Serve Onboarding (`US-06`):** Simple storefront registration for Shopify JSON and Google Shopping XML feeds.
  - **Shipping Rate Matrix (`US-07`):** Flat domestic shipping rates and free shipping threshold configuration in MXN.
  - **Sponsored Offer Featuring (`US-08`):** Toggles to promote store deals at the top of price comparison tables with `★ Tienda recomendada` badges.
  - **Self-Service Product Binding (`US-09`):** Direct BGG ID mapping for unmatched feed SKUs.

- **Ingestion & Barcode Registry Engine (Epic C):**
  - **Multi-Format Feed Ingestion (`US-10`):** Automated parsers for Shopify `/products.json` and Google Shopping Atom/RSS XML feeds with batch processing (up to 500 records per batch).
  - **EAN/GTIN Multi-Barcode Registry (`US-11`):** Deterministic barcode matching table (`game_barcodes`).
  - **Merchant SKU Memory Table (`US-12`):** Permanent SKU mapping memory (`merchant_product_mappings`).
  - **4-Tier Waterfall Matching Engine (`US-13`):** Barcode -> SKU Memory -> Tokenized Fuzzy Match -> Staging Queue.
  - **Admin Staging & Moderation Queue (`US-14`):** Interactive queue for medium-confidence matches ($0.70 \dots 0.91$) with suggested game thumbnails, live BGG autocomplete, and one-click approvals.

---

## 🎨 Design Tokens & UI Guidelines

| Purpose | Color Name | Hex Code | Usage |
| :--- | :--- | :--- | :--- |
| Base / Background | Blanco roto | `#F5F0E9` | Page backgrounds, subtle cards |
| Dark UI / Headers | Carbón suave | `#3A3A3A` | Primary typography, footers, dark badges |
| Primary Accent / CTAs | Malva suave | `#8367C7` | Primary buttons, price highlights |
| Secondary Accent / Badges | Turquesa pastel | `#73D8D4` | Language badges, success highlights |
| Price Highlights | Coral deslavado | `#FF9E8A` | Sponsored store badges, CTA accents |

- **Google Sentence Case Governance:** All headings, buttons, and form labels use sentence case.
- **Tactile Switch Standard:** Accessible boolean toggles implement `role="switch"`.

---

## 🏗️ Modern Tech Stack & Web Standards

- **Framework:** Next.js 15+ (App Router, React 19, TypeScript) with React Server Components and Server Actions.
- **Database & Auth:** Supabase (PostgreSQL 15+) with `pg_trgm` fuzzy search, `pgcrypto`, and Row-Level Security (RLS).
- **Styling:** Tailwind CSS v4 configured with official brand tokens.
- **Testing & QA:** Vitest (unit tests), Playwright (E2E browser tests), Chrome DevTools MCP (visual QA).
- **Modern Web Standards:**
  - **View Transitions API:** Morphing box art thumbnails across navigations with zero external animation bloat.
  - **Sub-Second LCP:** `fetchpriority="high"`, AVIF/WebP next-gen formats, native `loading="lazy"`.
  - **Native Overlays:** Zero-dependency HTML `<dialog>` and `popover` API for modals and filter dropdowns.
  - **Adaptive Components:** CSS `@container` queries and `:has()` for responsive 3-part price comparison cards.
  - **Accessible Forms:** Modern `:user-valid` validation states, `inputmode="numeric"`, and accessible switches.

---

## 🚀 Quick Start & Installation

```bash
# 1. Install dependencies (Always use npm registry)
npm install --registry=https://registry.npmjs.org/

# 2. Start development server on http://localhost:3001
npm run dev

# 3. Execute unit and integration test suite
npm run test

# 4. Execute Playwright E2E browser test suite
npm run test:e2e

# 5. Run full verification gate (lint, unit tests, production build)
npm run verify
```

---

## 🗄️ Database DDL & Schema

The complete PostgreSQL DDL migrations are located at:
`supabase/migrations/20260715000000_initial_schema.sql`

Tables include:
- `public.stores`
- `public.shipping_rates`
- `public.catalog_games`
- `public.game_barcodes`
- `public.merchant_product_mappings`
- `public.store_offers`
- `public.clicks`
- `public.feed_item_queue`
- `public.bgg_sync_queue`
- `public.ingestion_jobs`
