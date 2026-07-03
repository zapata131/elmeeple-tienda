# Handoff Sprint Memo: MeeplePrecios (Phase 1: Planning & User Stories)

This memo summarizes the current progress of the initial planning sprint for the board game price comparison platform for the Iberian Peninsula (Spain, Portugal) and Latin America (including Brazil).

---

## 1. Repository & Branch Details
*   **GitHub Repository:** [zapata131/elmeeple-tienda](https://github.com/zapata131/elmeeple-tienda)
*   **Active Branch:** `feature/issue-27-regional-store-toggle`
*   **Created Files:**
    *   [backlog_user_stories.md](file:///Users/joseluiszapata/Documents/GitHub/elmeeple-stores/backlog_user_stories.md): Requirements and user stories backlog for Players, Partners, and Admins.
    *   [DESIGN.md](file:///Users/joseluiszapata/Documents/GitHub/elmeeple-stores/DESIGN.md): Technical architecture specification, Supabase schemas, and color tokens.
    *   [AGENTS.md](file:///Users/joseluiszapata/Documents/GitHub/elmeeple-stores/AGENTS.md): AI agent roles, checklist, feed sync rules, and testing standards.
    *   [src/components/StoreOffersComparisonTable.tsx](file:///Users/joseluiszapata/Documents/GitHub/elmeeple-stores/src/components/StoreOffersComparisonTable.tsx): Interactive comparison table with regional domestic store toggle (activated by default).
    *   [src/__tests__/regional_store_toggle.test.tsx](file:///Users/joseluiszapata/Documents/GitHub/elmeeple-stores/src/__tests__/regional_store_toggle.test.tsx): TDD verification for US-27 regional store filter toggle.
    *   [src/__tests__/price_breakdown_fallback.test.tsx](file:///Users/joseluiszapata/Documents/GitHub/elmeeple-stores/src/__tests__/price_breakdown_fallback.test.tsx): TDD verification for US-28 3-part price breakdown and offline fallback offers.
    *   [jest.config.js](file:///Users/joseluiszapata/Documents/GitHub/elmeeple-stores/jest.config.js): Jest test framework configuration.
    *   [jest.setup.js](file:///Users/joseluiszapata/Documents/GitHub/elmeeple-stores/jest.setup.js): Polyfills and global mocks for Jest environment.

---

## 2. Milestone and Task Progress

### Milestone 1: Product Planning [100% COMPLETED]
*   [x] In-depth analysis of board game price comparison engines (header navigation, country/currency settings, price tables, language flags, and store feeds).
*   [x] Drafted the backlog of user stories using the classic Agile framework.
*   [x] Codified agent rules and technical system design in `DESIGN.md` and `AGENTS.md`.
*   [x] Set up the remote repository on GitHub and published the 24 issues (US-01 to US-24) corresponding to the backlog stories.
*   [x] Translated all system documentation, user stories, and GitHub issues to English.

### Milestone 2: Initial Setup & Environment [100% COMPLETED]
*   [x] Initialize the Next.js 16 project boilerplate with TypeScript and script definitions (`dev`, `build`, `test`, `verify`).
*   [x] Install core dependencies (`@supabase/supabase-js`, `@supabase/ssr`, `fast-xml-parser`, `next-auth`, `tailwindcss` v4).
*   [x] Configure testing environment (Jest, JSDOM, and polyfills for jose/NextAuth compatibility).
*   [x] Verify environment build and test runners via dummy testing.

### Milestone 3: Database & Core Authentication [100% COMPLETED]
*   [x] Database migrations tables defined (profiles, stores, shipping rates, cached games, listings, price alerts, currency rates) in `supabase/migrations/20260702000000_init.sql`.
*   [x] Supabase SDK clients configured for browser/server context.
*   [x] NextAuth configurations and credentials provider mapping established in `src/app/api/auth/[...nextauth]/route.ts`.

### Milestone 4: Core Search & Comparisons (MVP) [100% COMPLETED]
*   [x] Autocomplete Search bar component and API search route implemented (US-01).
*   [x] Game detail page showing catalog specifications and store offers list sorted by total price with free shipping thresholds (US-02).
*   [x] Global settings toolbar storing country and currency configurations in client cookies (US-03).
*   [x] Self-referential BGG alternate language switcher rendering linked box versions (US-16).

### Milestone 5: Advanced Discovery & Price History [100% COMPLETED]
*   [x] Catalog results grid page (`/catalog`) and client filter panel (in-stock toggles, category chips, max price slider) (US-04).
*   [x] price_history table schema definition in migration SQL logs (US-05).
*   [x] Pure SVG PriceChart line graphs and 30d/90d/1y time selectors (US-05).
*   [x] PriceHistory API query route (`/api/price-history`).

### Milestone 6: User Engagement & Alerts [100% COMPLETED]
*   [x] Price alert subscription form client component (`PriceAlertForm.tsx`) with negative price input validations (US-06).
*   [x] Secured POST API route endpoint (`/api/price-alerts`) validating authorization credentials and profile links.
*   [x] Target price check constraint database definitions updated in init migrations SQL.

### Milestone 7: Merchant Services [100% COMPLETED]
*   [x] Multi-step onboarding wizard layout (`OnboardingWizard.tsx`) validating store info, branding, default shipping flat rates, and feed links (US-07).
*   [x] Merchant onboarding POST endpoint (`/api/merchant/onboard`) inserting store entries and upgrading user profile credentials.
*   [x] Shipping matrix rates configuration dashboard grid (`ShippingMatrix.tsx`) pre-loaded with defaults for Spain, Portugal, Mexico, Brazil, Argentina, Colombia, Chile, and Peru (US-08).
*   [x] Shipping matrix POST API route handler (`/api/merchant/shipping`) verifying ownership credentials and executing bulk upserts.
*   [x] Google Shopping RSS/XML regex feed parser (`feed_parser.ts`) resolving EAN barcode matching priority and title containment fallbacks (US-09).
*   [x] Feed catalog update sync loader batching rows in segments of 500 items maximum to protect database transaction overheads.
*   [x] Automated Sync Feeds API routing trigger (`/api/cron/sync-feeds`).
*   [x] Secured redirect click logger endpoint (`/api/redirect`) tracking client IPs and 302 redirecting user queries to target store product pages (US-10).
*   [x] Partner analytics dashboard page (`/merchant/dashboard`) displaying total outbound clicks counts, estimated CTR ratios, sync status badges, and clicks logs tables.
*   [x] Administration verification POST endpoint (`/api/admin/verify-store`) toggling verified boolean states (US-11).
*   [x] Global administration dashboard page portal (`/admin/dashboard`) displaying all registered store entries and verification/suspension controls.
*   [x] Feed diagnostics statistics widgets (`FeedDiagnosticsPanel.tsx`) counting parsed catalog lines, database matched targets, and unmatched warning items (US-12).
*   [x] Force sync triggers POST API endpoint (`/api/merchant/sync-feed`) allowing partners to manually refresh catalog listings.
*   [x] Currency conversion helper (`convertPrice`) and 24-hour expiration rule check (`isRatesCacheStale`) in `currency.ts` (US-13).
*   [x] Automated cron FX synchronizer (`/api/cron/sync-fx`) batch upserting live exchange rates relative to EUR base.
*   [x] Admin currency manager endpoint (`/api/admin/fx-rates`) and interactive management panel (`CurrencyManager.tsx`) at `/admin/currency`.
*   [x] Unmapped feed items queue table (`bgg_metadata_queue`) and batch queueing in `syncStoreCatalog` with 500-record batch protection (`AGENTS.md 4.1`) (US-14).
*   [x] Admin feed queue inspection and purging endpoint (`/api/admin/feed-queue`) and interactive monitoring panel (`AdminQueueMonitor.tsx`) at `/admin/queue`.
*   [x] BGG XML API2 worker utility (`bgg_worker.ts`) parsing `/thing` metadata and handling HTTP 202/429 status retries (`AGENTS.md 4.3`) (US-15).
*   [x] Automated BGG queue resolution route (`/api/cron/process-bgg-queue`) and manual trigger button in `AdminQueueMonitor.tsx`.
*   [x] Multi-game wishlist cart optimizer algorithm (`cart_optimizer.ts`) computing bundle splits and applying free shipping thresholds (US-17).
*   [x] Cart optimizer POST API route (`/api/cart/optimize`) returning top 3 lowest-cost bundle combinations.
*   [x] Interactive shopping list optimizer interface (`CartOptimizerPanel.tsx`) and page `/optimizer` linked from header and toolbar.
*   [x] Page routing links (`/merchant/onboard`, `/merchant/shipping`, `/merchant/dashboard`, `/merchant/diagnostics`, `/admin/dashboard`, `/admin/currency`, `/admin/queue`, and `/optimizer`).
*   [x] Dedicated port 3001 configuration (`package.json`, `playwright.config.ts`, `README.md`) preventing local port clashes.
*   [x] Default Spanish language selector (`es`, `pt`, `en`) and Role Switcher (`Comprador`, `Tienda`, `Admin`) in `Toolbar.tsx` with role-based navigation links (`US-25`).
*   [x] Domestic-Only Store checkbox toggle restricting offers to matching shipping country (`US-18`).
*   [x] Rich Mock Data Engine (`seed_mock_data.ts` and `/api/admin/seed-data`) populating 22 board games with BGG cover images and 12 regional stores (`US-26`).
*   [x] Clean SVG vector icons for navbar buttons and brand identity (`MeeplePrecios`) across subpages.
*   [x] Unified Smart Autocomplete Dropdown overlay (`SearchBar.tsx` and `/api/search`) surfacing games, verified stores, and category tags simultaneously with keyboard arrow navigation (`US-19`).
*   [x] Price Alerts In-App Management Portal (`/dashboard/alerts` and `/api/user/alerts`) comparing active targets against live best prices, with header notification bell badge (`US-20`).
*   [x] Automated BGG Wishlist Sync (`/api/user/sync-bgg` and `UserAlertsDashboard.tsx`) querying Geekdo XML collections and creating price drop alerts at -15% target thresholds (`US-21`).
*   [x] Store Profiles & Packaging Vibe Tags (`/store/[id]` and `/api/store/reviews`) allowing community evaluations of box corner protection and delivery speed (`US-22`).
*   [x] Free Shipping Threshold Filler Helper (`FreeShippingFillerWidget.tsx` and `/api/cart/fillers`) surfacing optimal low-cost add-ons inside cart optimizer splits (`US-23`).
*   [x] Automated Restock Subscriptions (`RestockAlertButton.tsx` and `/api/user/restock-alert`) notifying players immediately when out-of-stock inventory is replenished (`US-24`).

---

## 3. Four-Tier Test Suite Status
*   **Tier 1 & 2 Unit/Integration Tests (Jest):** 100% configured and passing (26 test suites, 83 total tests via `npm run test`).
*   **Tier 3 Live Browser Audits (DevTools for Agents):** Visual layouts and interactive user flows validated on live server using Chrome DevTools MCP tools (`click`, `fill`, `navigate_page`, `take_screenshot`).
*   **Tier 4 Automated Replay Scripts (DevTools / Playwright CLI):** Standalone browser automation scripts built in `e2e/home_and_optimizer.spec.ts` and `e2e/merchant_and_admin.spec.ts` (`playwright.config.ts`), runnable deterministically from the terminal via `npm run test:e2e` without going through an agent.

---

## 4. GitHub Issues Published (https://github.com/zapata131/elmeeple-tienda/issues)
*   `#1` [US-01: Predictive Smart Search](https://github.com/zapata131/elmeeple-tienda/issues/1) [COMPLETED]
*   `#2` [US-02: Deal and Price Comparison Table](https://github.com/zapata131/elmeeple-tienda/issues/2) [COMPLETED]
*   `#3` [US-03: Global Shipping and Currency Settings (Toolbar)](https://github.com/zapata131/elmeeple-tienda/issues/3) [COMPLETED]
*   `#4` [US-04: Catalog Search Filters and Navigation](https://github.com/zapata131/elmeeple-tienda/issues/4) [COMPLETED]
*   `#5` [US-05: Historical Price Evolution Graph](https://github.com/zapata131/elmeeple-tienda/issues/5) [COMPLETED]
*   `#6` [US-06: Wishlist and Price Drop Alerts](https://github.com/zapata131/elmeeple-tienda/issues/6) [COMPLETED]
*   `#7` [US-07: Sequential Store Onboarding Funnel](https://github.com/zapata131/elmeeple-tienda/issues/7) [COMPLETED]
*   `#8` [US-08: Shipping Cost Matrix Configuration](https://github.com/zapata131/elmeeple-tienda/issues/8) [COMPLETED]
*   `#9` [US-09: Automated Catalog Sync via XML/CSV Feeds](https://github.com/zapata131/elmeeple-tienda/issues/9) [COMPLETED]
*   `#10` [US-10: Affiliate Click and Analytics Dashboard](https://github.com/zapata131/elmeeple-tienda/issues/10) [COMPLETED]
*   `#11` [US-11: Merchant Auditing and Verification Dashboard](https://github.com/zapata131/elmeeple-tienda/issues/11) [COMPLETED]
*   `#12` [US-12: Feed Diagnostics and Monitoring Hub](https://github.com/zapata131/elmeeple-tienda/issues/12) [COMPLETED]
*   `#13` [US-13: Currency and Foreign Exchange Rate Manager](https://github.com/zapata131/elmeeple-tienda/issues/13) [COMPLETED]
*   `#14` [US-14: Scheduled Store Feed Parser (Cron Job)](https://github.com/zapata131/elmeeple-tienda/issues/14) [COMPLETED]
*   `#15` [US-15: BGG API Metadata Queue and Cache Manager](https://github.com/zapata131/elmeeple-tienda/issues/15) [COMPLETED]
*   `#16` [US-16: Language Editions Switcher (Other Versions)](https://github.com/zapata131/elmeeple-tienda/issues/16) [COMPLETED]
*   `#17` [US-17: Consolidated Multi-Game Cart Optimizer](https://github.com/zapata131/elmeeple-tienda/issues/17) [COMPLETED]
*   `#18` [US-18: Domestic-Only Store Toggle](https://github.com/zapata131/elmeeple-tienda/issues/18) [COMPLETED]
*   `#19` [US-19: Unified Smart Autocomplete Dropdown](https://github.com/zapata131/elmeeple-tienda/issues/19) [COMPLETED]
*   `#20` [US-20: Price Alerts In-App Dashboard & Header Notification](https://github.com/zapata131/elmeeple-tienda/issues/20) [COMPLETED]
*   `#21` [US-21: Player BGG Wishlist Sync](https://github.com/zapata131/elmeeple-tienda/issues/21) [COMPLETED]
*   `#22` [US-22: Store Packaging Vibe Tags & Reviews](https://github.com/zapata131/elmeeple-tienda/issues/22) [COMPLETED]
*   `#23` [US-23: Free Shipping Filler Helper](https://github.com/zapata131/elmeeple-tienda/issues/23) [COMPLETED]
*   `#24` [US-24: Restock Alert Notification](https://github.com/zapata131/elmeeple-tienda/issues/24) [COMPLETED]
*   `#25` [US-25: Interface & Catalog Language Selector & Role-Based Navigation](https://github.com/zapata131/elmeeple-tienda/issues/25) [COMPLETED]
*   `#26` [US-26: Rich Multi-Region Mock Data Seed & Automated BGG Cover Image Resolver](https://github.com/zapata131/elmeeple-tienda/issues/26) [COMPLETED]

---

## 5. Next Steps
1.  **MVP Milestone Complete:** All 26 user stories (`US-01` through `US-26`) spanning predictive search, deal comparison, cart optimization, merchant portals, admin auditing, and community packaging reviews are 100% implemented, tested, verified, and merged.
2.  **Continuous Integration & Deployment:** Run deterministic automated e2e replay scripts (`npm run test:e2e`) before deploying to production hosting (Vercel/Supabase).
