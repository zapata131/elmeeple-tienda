# System Architecture and Design Document: MeeplePrecios

This document defines the architectural guidelines, database schemas, visual design system, and technical conventions for **MeeplePrecios**, the board game price comparison engine for the Iberian Peninsula (Spain, Portugal) and Latin America (including Brazil).

---

## 1. Product Core Vision

*   **Project Name:** MeeplePrecios (meepleprecios.com / preciosjuegosdemesa.es)
*   **Concept:** The premier independent price comparison platform for board games and accessories in the Iberian Peninsula (Spain, Portugal) and Latin America (including Brazil).
*   **Value Proposition:** We help tabletop gamers find the best consolidated deals (including shipping and regional tax estimates) and empower independent game stores to capture high-intent referral traffic and drive sales.
*   **Business Model:** Affiliate marketing (cost per referral click and affiliate sale commissions) and premium merchant subscriptions for featured offers.
*   **Automated Skills Governance:** All UI designs, copywriting, and schema updates are governed autonomously by our `.agents/skills/ux_expert` and `.agents/skills/document_sync` protocols.
*   **Offline Fallback Guarantee (US-28 & Issue #38):** When Supabase returns empty data (`null`, `undefined`, or empty arrays `[]` from `.single()` or queries) or is disconnected, `queries.ts` injects rich fallback store offers (`FALLBACK_STORE_OFFERS`) and game specifications (`MOCK_GAMES`) with explicit 3-part breakdowns (`Artículo` + `Envío` = `Summe`) to guarantee seamless local user testing and QA. Furthermore, `fetchGameEditions` strictly checks query returns against empty arrays and filters sibling/child relationships (`parent_bgg_id`) to prevent unrelated games from leaking into version comparisons.
*   **Regional Domestic Toggle (US-27):** By default, game comparison tables activate `Solo tiendas de mi país` (`onlyDomestic = true`) to protect players from foreign customs taxes and expensive shipping, allowing opt-out toggling for international offers.
*   **Iberoamerican & Iberian Exclusive Mock Data (US-29):** All fallback and mock data in `src/utils/mockData.ts` strictly excludes non-regional stores, maintaining 22 authentic online shops across Spain (`ES`), Portugal (`PT`), Mexico (`MX`), Brazil (`BR`), Argentina (`AR`), Colombia (`CO`), Chile (`CL`), and Peru (`PE`), and 12 distinct board games.
*   **Reviewer QA & E2E Replay Architecture (Issue #38):** To ensure deterministic standalone execution in Playwright (`npm run test:e2e`), `playwright.config.ts` passes explicit `NEXTAUTH_SECRET` and `NEXTAUTH_URL` environment variables to its `webServer` build command and NextAuth options. Additionally, all protected server routes (`/merchant/shipping`) render standardized `Acceso Restringido` cards when accessed unauthenticated, and interactive grid checkboxes (`CartOptimizerPanel`) maintain controlled React `onChange` listeners with event propagation stopped against outer container clicks.

---

## 2. Target Audience & User Personas

### 2.1 Players & Buyers
*   **Sofía – The Bargain Hunter**
    *   **Profile:** 28 years old, board game collector in Mexico City.
    *   **Goals:** Find imported or local game boxes at the lowest total price. She wants to know if shipping from a store in Spain or the US is more cost-effective than buying locally in Mexico.
    *   **Pain Points:** Online stores have highly fragmented pricing, and manually comparing shipping rates is time-consuming. She occasionally buys a game only to discover on delivery that the box is in English instead of Spanish.
    *   **How MeeplePrecios helps:** She searches for a game, selects Mexico as the delivery country, and sets MXN as her currency. The table displays the exact box language and the total price (base + shipping) calculated dynamically.

### 2.2 Partners & Merchants
*   **Carlos – E-commerce Manager**
    *   **Profile:** 35 years old, owner of an online tabletop game shop in Madrid.
    *   **Goals:** List his daily stock on a specialized platform that aggregates his core target audience, maximizing high-conversion referral traffic.
    *   **Pain Points:** Manually listing items on price comparison directories is impossible. Inventory updates constantly due to pre-orders and restocks.
    *   **How MeeplePrecios helps:** He registers his store, uploads his shop logo, inputs his flat shipping matrix, and provides his automated XML product feed URL. The platform syncs his inventory in the background daily.

---

## 3. MVP Feature Scope

*   **Unified Smart Autocomplete Search (`US-19`):** A multi-domain header search bar that returns structured results across three categories in real-time (`/api/search`): `games` (with BGG thumbnails), `stores` (with verification badges), and `categories` (tag pills). Features a flattened keyboard indexer enabling seamless Up/Down arrow traversal across section boundaries and instant navigation on Enter.
*   **Game Detail Page (`/game/[slug]`):** SEO-friendly. Renders high-res box art, BGG statistics (complexity weight, recommended players, play duration), description, and the price comparison table.
*   **Multi-Shop Comparison Table & Shipping Filler Helper (`US-23`):** Lists store offers sorted by total price (base price + shipping). Includes a dynamic Free Shipping Threshold Helper (`FreeShippingFillerWidget.tsx` & `/api/cart/fillers`) embedded in multi-game cart splits that calculates gap distances and recommends inexpensive store add-ons (card sleeves, dice, pocket games) when orders are within €15 of waiving delivery costs.
*   **Global Settings Toolbar:** Persistent header component allowing users to set destination country (for shipping calculations), display currency (for real-time conversion), and display language (Spanish/Portuguese).
*   **Price History Chart:** A clean line chart (without emojis) displaying minimum historical price fluctuations for each game.
*   **Wishlist, Price Drop & Restock Alerts Portal (`US-20`, `US-21`, `US-24`):** Registered players can configure price drop targets or subscribe to instant out-of-stock restock notifications (`RestockAlertButton.tsx` & `/api/user/restock-alert`). Features an on-site notification bell in the header toolbar (`Toolbar.tsx`), an interactive management dashboard (`/dashboard/alerts`) showing live inventory replenishment status, and a 1-click BGG Wishlist Importer (`POST /api/user/sync-bgg`).
*   **Merchant Dashboard & Store Profiles (`US-22`):** Self-serve portal for storefronts to register, upload logos, and define shipping matrices. Includes community-driven store profiles (`/store/[id]`) and review panels (`StoreReviewPanel.tsx`) where buyers evaluate shipping box corner protection using 1-5 star ratings and interactive vibe tag badges (*Esquinas Protegidas*, *Caja Doble*, *Envío Rápido*).
*   **Background Sync Job:** Scheduled daily cron job that fetches, parses, and upserts product feeds from verified merchants.

---

## 4. UI/UX and Visual Design System

We strictly adhere to the visual design system of **El Meeple** to ensure a premium, minimalist, and clutter-free experience.

### 4.1 Color Tokens
| Purpose | Color Name | Hex Code |
| :--- | :--- | :--- |
| Base / Main Background | Blanco roto | `#F5F0E9` |
| Main Text / Dark UI | Carbón suave | `#3A3A3A` |
| Primary Accent / CTAs / Buttons | Malva suave | `#8367C7` |
| Secondary Accent / Status Tags | Turquesa pastel | `#73D8D4` |
| Highlights / Prices / Alerts | Coral deslavado | `#FF9E8A` |

### 4.2 Core Design Rules
*   **Strict Emoji Ban:** Raw emojis (e.g., 🎲, ⏰, 👤, 🛒, 📦, ✉️) are prohibited in user-facing UI components (buttons, headers, lists, cards, forms). Replace them with clean typography, premium SVG icons styled in brand colors, or typographic characters (★, ☆). Box language flags must be rendered using vector SVGs.
*   **Highlighted Pricing:** The final total price (game price + shipping) must be visually highlighted using brand Coral `#FF9E8A` or Malva `#8367C7` with bold typography.
*   **Logo Processing:** Merchant logo uploads are processed in the browser via an HTML5 canvas, cropping and resizing the file to a square `150x150px` JPEG stored as a lightweight base64 string (<10 KB).
*   **Premium Dark Mode:** Native class-based dark mode (`.dark` on `html`). Backgrounds adapt to deep charcoal (`#121212`, `#1E1E1E`), and text changes to Blanco Roto (`#F5F0E9`), preventing white flashes during initial loads.
*   **Zero-State Design:** When search results or filters return 0 items, display a brand-aligned zero-state card (`data-testid="zero-state-search"`) featuring recommendations and a CTA to reset active filters.

---

## 5. Technical Architecture (The "ShipFast" Stack)

*   **Framework:** Next.js (App Router) in TypeScript, serving as a monolith for UI pages, Server Actions, and API endpoints.
*   **Database (Supabase / PostgreSQL):**
    *   `profiles`: Centralized profile relation extending Supabase Auth with a `role` enum (`player`, `partner`, `admin`).
    *   `stores`: Merchant metadata (name, unique URL slug, base64 logo, base URL, verified status, Google Shopping XML feed URL, feed status, owner email, `feed_last_processed_count`, `feed_last_matched_count`, `feed_last_unmatched_count`).
    *   `shipping_rates`: Rates configured by merchants. Columns: `store_id`, `destination_country` (ISO-2 code), `flat_rate` (numeric), `free_shipping_threshold` (numeric, nullable).
    *   `bgg_games_cache`: Global cached catalog of board games imported from BGG. Columns: `bgg_id`, `name`, `thumbnail`, `weight` (complexity), `min_players`, `max_players`, `playing_time`, `alternate_names` (text array), `categories` (text array), `ean` (text, barcode), `parent_bgg_id` (integer, nullable, self-referencing foreign key to link alternate language editions), `last_updated_at`.
    *   `store_games`: Intermediate table tracking product offerings. Columns: `store_id`, `bgg_id`, `store_product_url`, `price` (decimal), `stock` (integer/availability), `edition_language` (text, restricted to 'es' | 'pt' | 'en'), `last_updated_at`. Composite unique index on `(store_id, bgg_id)`.
    *   `price_alerts`: User price notification thresholds.
    *   `exchange_rates`: Cached foreign exchange rates relative to base EUR with 24-hour expiration. Columns: `currency` (primary key), `rate` (numeric), `enabled` (boolean), `updated_at` (timestamp). Supports EUR, USD, MXN, BRL, ARS, COP, CLP, PEN.
    *   `price_history`: Log of daily minimum prices. Columns: `bgg_id` (integer references bgg_games_cache), `min_price` (numeric), `recorded_at` (date). Composite primary key on `(bgg_id, recorded_at)`.
    *   `clicks`: Log of affiliate redirects. Columns: `id` (uuid), `store_id` (references stores), `bgg_id` (references bgg_games_cache), `ip_address` (text, optional), `created_at` (timestamp).
    *   `bgg_metadata_queue`: Queue for unmapped merchant catalog items awaiting BGG metadata resolution. Columns: `id`, `store_id`, `ean`, `title`, `store_product_url`, `status`, `created_at`. Unique on `(store_id, store_product_url)`.
*   **Row-Level Security (RLS):** Enabled on all tables.
    *   Public `SELECT` access to `bgg_games_cache`, `stores`, and `store_games`.
    *   `INSERT/UPDATE` restricted to verified owners for their respective relations (matching session emails).
*   **XML Feed Processing:** Outbound background crawlers retrieve merchant feeds, parsing them via `fast-xml-parser`. The parser extracts standard Google Shopping RSS 2.0 elements: `<g:gtin>` (resolving game IDs in `bgg_games_cache` or enqueuing them), `<g:price>` (converted to base currency and written to `store_games.price`), `<g:availability>` (written to `store_games.stock`), and `<link>` (stored as affiliate product URLs).
*   **BGG API Integration:** Secure server actions querying BoardGameGeek XML2 API, managing 202 Accepted polling and rate limits.

### 5.1 Business Model & Referral Link Validation
*   **Affiliate Marketing Model:** The platform operates on Cost-Per-Click (CPC) and Cost-Per-Acquisition (CPA) affiliate referral programs. Outbound referral links direct players to store checkouts.
*   **UTM Suffix Sizing:** Every outbound redirect link appends a standard, immutable URL tracking query:
    `?ref=meepleprecios&utm_source=meepleprecios&utm_medium=affiliate`
*   **Merchant Integration Check:** Store owners can reconcile click tracking by auditing their web logs (Shopify Referrals, WooCommerce metrics, Google Analytics raw click logs) for these variables. MeeplePrecios records every redirect event in the database, displaying hourly clicks on the merchant dashboard.

### 5.2 Settings Cookie Mappings
*   **Cookie Syncing:** Changing the country or currency in the settings toolbar writes key-value configuration cookies directly to the client browser context (`meeple_country` and `meeple_currency`) with a 1-year max age limit.
*   **SSR Reading:** During Server-Side Rendering (SSR) pages (like `/game/[id]`), the values are retrieved using Next.js `cookies()` headers adapter to dynamically fetch country-specific shipping flat rates and trigger currency conversions on the fly.



---

## 6. Testing Strategy (TDD)

*   **Test-Driven Development (TDD):** Program unit and integration tests before writing components or database scripts.
*   **Unit & Integration Tests (Jest + RTL):**
    *   Verify currency utilities, XML parses, and RLS mocks.
    *   Mandatory serial execution (`--runInBand --forceExit`) to optimize JSDOM memory.
*   **E2E Walkthroughs (Playwright):**
    *   Simulate regional conversion flows, shipping additions, and redirect link verifications.
    *   Automatically capture walkthrough screenshots on Desktop (1280x800) and Mobile (390x844) viewports.
