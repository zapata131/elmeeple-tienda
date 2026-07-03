# MeeplePrecios (elmeeple-tienda)

MeeplePrecios is a high-performance tabletop board game price comparison aggregator designed specifically for the Iberian Peninsula (Spain and Portugal) and Latin America (including Brazil). 

MeeplePrecios connects board game enthusiasts with independent e-commerce shops across the Iberian and Latin American markets, offering transparent calculations on total purchase costs.

---

## 1. What the Project is For (The Core Purpose)

Tabletop board gaming has experienced an exponential boom, but the market in the Iberian Peninsula and Latin America is highly fragmented:
*   **Players** have to search through dozens of local and international online shops (in Spain, Portugal, Mexico, Brazil, Chile, Argentina, etc.) to find a game in stock.
*   **Pricing is volatile and opaque**, as base prices, local currencies, conversion rates, and international shipping fees (including customs and import taxes) make it tedious to calculate the actual total cost of a game box.
*   **Language versions** (Spanish, Portuguese vs. English or German editions) are critical but often mislabeled on generic storefronts.

**MeeplePrecios solves this fragmentation.** It provides players with a single, unified search engine to find the exact edition of a board game, compare real-time prices, choose their delivery country, convert prices into local currency, and view calculated shipping rates—all in one place.

---

## 2. Value Proposition

### For Board Game Players (Demand)
*   **Transparent Total Cost Calculation:** Select your delivery country and preferred currency. MeeplePrecios automatically calculates shipping costs and displays the exact total price.
*   **Language Edition Switcher:** Matches localized versions of the game (Spanish, Portuguese, and English) and displays links to alternative box editions (e.g., switching between Spanish and English editions of *Catan*) under a dedicated "Other Versions" menu with vector flag SVGs.
*   **Language Verification:** Clear indicators show whether a store's listing is in Spanish (`🇪🇸`), Portuguese (`🇵🇹`/`🇧🇷`), or English (`🇬🇧`/`🇺🇸`), preventing wrong-language purchases.
*   **Price Drop Alerts & Wishlists:** Add games to a personal wishlist and get notified via email when a game falls below your target price.
*   **Price Tracking History:** Interactive charts display the historical price trends of any game to help you make informed purchase decisions.

### For Independent Board Game Retailers (Supply)
*   **Targeted Organic Traffic:** Get your e-commerce shop listed in front of high-intent board gamers, driving qualified traffic directly to your checkout.
*   **Frictionless Automated Sync:** Provide your standard Google Shopping XML (RSS 2.0) product feed URL in your merchant dashboard, and MeeplePrecios will update your prices and stock status daily—no manual entry needed.
*   **Performance Metrics:** Monitor click-through rates and referral analytics directly from your merchant dashboard.
*   **Referral Validation Suffix:** Every outbound traffic link automatically appends tracking coordinates:
    `?ref=meepleprecios&utm_source=meepleprecios&utm_medium=affiliate`
    This allows merchants to easily reconcile click logs inside their Google Analytics or Shopify referrer metrics.

---

## 2.1 The Business Model (How it Works)

MeeplePrecios operates as an independent price-comparison search engine under a hybrid affiliate and listing model:
1.  **Cost-Per-Click (CPC) & Cost-Per-Acquisition (CPA):** When a user compares prices and clicks "Go to store" to make a purchase, MeeplePrecios redirects them with a unique tracking code. The affiliate network pays a conversion commission (typically 2% to 7% of the total cart checkout) or a flat fee per referral click.
2.  **Merchant Premium Listing (SaaS Subscriptions):** Verified e-commerce shops can pay a monthly subscription fee to highlight their storefront or rank higher on the comparison table (e.g., showing their listings as "Featured Deals" even if they aren't the absolute lowest price).
3.  **Sponsored Display Placements:** Placements for banner ads on search results, category indexes, or game detail pages for local stores, events, or publishers.

---

## 3. Technology Stack (The "ShipFast" Stack)

MeeplePrecios is built using a modern, scalable, and high-performance stack designed for fast page loads and rapid iteration:

*   **Frontend & Backend Monolith:** [Next.js](https://nextjs.org/) (App Router) in TypeScript, optimized for Server-Side Rendering (SSR) and SEO.
*   **Styling & Design System:** [Tailwind CSS (v4)](https://tailwindcss.com/) with a minimalist, premium layout based on the brand's custom color palette (Blanco Roto, Carbón, Malva, Turquesa, Coral). No raw emojis are used; icons are clean vector SVGs.
*   **Database & Backend Services:** [Supabase](https://supabase.com/) (PostgreSQL) with strict Row-Level Security (RLS) policies.
*   **Authentication:** [NextAuth.js](https://next-auth.js.org/) managing secure role-based access control (RBAC) for Players, Partners, and Admins. Supports toggling the interface between the three supported languages: Spanish, Portuguese, and English.
*   **Data Aggregation:** Background cron jobs parsing store feeds securely on the server using `fast-xml-parser` and caching board game metadata from the BoardGameGeek (BGG) XML2 API.
*   **Emails:** Transactional notifications and price drop alerts powered by [Resend](https://resend.com/).
*   **Testing:** [Jest](https://jestjs.io/) and React Testing Library for serial unit/integration tests, and [Playwright](https://playwright.dev/) for high-fidelity End-to-End (E2E) browser walkthroughs.

---

## 4. Getting started and local testing

### Prerequisites
*   Node.js (v20 or higher)
*   NPM (v10 or higher)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/zapata131/elmeeple-tienda.git
   cd elmeeple-tienda
   ```
2. Install project dependencies:
   ```bash
   npm install
   ```
3. Configure your environment variables by copying `file:.env.local.example` to `file:.env.local` and filling in your Supabase, NextAuth, and Resend credentials:
   ```bash
   cp .env.local.example .env.local
   ```

### Running the servers and testing manually

To test MeeplePrecios locally in your browser, run the application server and seed the test database using the following steps:

1. **Start the local development server:** Launch the Next.js development server on port 3001:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3001` in your web browser to access the live application.

2. **Seed the local test database:** Populate the local database or memory cache with our Iberian and Latin American test catalog (22 verified online stores across Spain, Portugal, Mexico, Brazil, Argentina, Colombia, Chile, and Peru, along with 12 acclaimed board games). Run the seed endpoint in your terminal:
   ```bash
   curl -X POST http://localhost:3001/api/admin/seed-data
   ```
   Alternatively, navigate to the global **Navbar** in the browser and click the **Cargar Datos** action when logged in under the **Admin** role profile.

3. **Perform manual browser walkthroughs:** Once the development server and seed catalog are active, manually verify the core regional workflows:
   *   **Regional domestic filtering:** On any game comparison page (such as `http://localhost:3001/game/23`), verify that the **Solo tiendas de mi país** toggle switch is activated by default. Toggle the switch off to include foreign store listings.
   *   **Destination and currency synchronization:** In the top **Navbar**, change your delivery country (for example, from `ES - España` to `MX - México`) and currency (to `MXN ($)`). Verify that store listings immediately filter to domestic Mexican merchants and prices convert dynamically.
   *   **Box edition language badges:** Inspect the store offers table to verify that localized box editions display vector badges (`ES`, `PT`, `EN`, `DE`, `MULTI`).
   *   **Multi-game cart optimization:** Click **Comparador Multi-Juego** in the header, select multiple games, and verify that the optimizer computes split shipments and free shipping thresholds.

### Running automated verification suites

Before submitting code changes, run the automated test pipelines:

*   **Serial unit and integration tests:** Run Jest test suites in serial execution mode to prevent JSDOM memory limits:
    ```bash
    npm run test -- --runInBand --forceExit
    ```

*   **Automated browser replay (E2E):** Execute standalone Playwright browser walkthroughs across desktop (`1280x800`) and mobile (`390x844`) viewports:
    ```bash
    npm run test:e2e
    ```

*   **Full verification quality gate:** Execute lint checks, TypeScript compiler builds, and serial unit suites:
    ```bash
    npm run verify
    ```

---

## 5. Autonomous AI Agent Skills & Workflow

MeeplePrecios equips autonomous AI agents (such as Antigravity / Cursor / Claude) with modular workspace skills located in `.agents/skills/` to enforce agile development, UX excellence, and zero-regression deployments:

*   **[`backlog_auditor`](file:///Users/joseluiszapata/Documents/GitHub/elmeeple-stores/.agents/skills/backlog_auditor/SKILL.md):** Pre-flight gatekeeper that audits GitHub issues against the Three-Point Compliance Filter (Persona Atomicity, Scope Atomicity, Agile Syntax) and automatically decomposes multi-persona epics.
*   **[`github_issue_solve`](file:///Users/joseluiszapata/Documents/GitHub/elmeeple-stores/.agents/skills/github_issue_solve/SKILL.md):** Guides the **Architect** and **Builder** through issue assignment, dedicated feature branching (`feature/issue-<num>-<slug>`), codebase research, and publishing TDD execution plans on GitHub.
*   **[`ux_expert`](file:///Users/joseluiszapata/Documents/GitHub/elmeeple-stores/.agents/skills/ux_expert/SKILL.md):** Enforces cognitive psychology laws (Fitts's, Hick's, Jakob's, Miller's), strict WCAG accessibility, conversational copywriting (Google style), and premium visual design tokens (Blanco Roto, Carbón, Malva, Coral, Turquesa, no emojis).
*   **[`document_sync`](file:///Users/joseluiszapata/Documents/GitHub/elmeeple-stores/.agents/skills/document_sync/SKILL.md):** Post-flight quality gate ensuring `HANDOFF.md`, `DESIGN.md`, and `AGENTS.md` remain in real-time synchronization with active code and database schemas.
*   **[`github_issue_complete`](file:///Users/joseluiszapata/Documents/GitHub/elmeeple-stores/.agents/skills/github_issue_complete/SKILL.md):** Enforces our four-tier verification gate (`npm run verify`, E2E tests), stages changes, formats conventional commits, and automates PR creation and merging into `main`.
