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
*   **Frictionless Automated Sync:** Provide a standard XML or CSV product feed URL in your merchant dashboard, and MeeplePrecios will update your prices and stock status daily—no manual entry needed.
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

## 4. Getting Started

### Prerequisites
*   Node.js (v20 or higher)
*   NPM (v10 or higher)

### Installation
1.  Clone the repository:
    ```bash
    git clone https://github.com/zapata131/elmeeple-tienda.git
    cd elmeeple-tienda
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure your environment variables (copy `.env.local.example` to `.env.local` and fill in your Supabase, NextAuth, and Resend credentials).

### Running Locally
*   Start the development server:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the application.

*   Run the test suite (unit and integration tests in serial mode):
    ```bash
    npm run test -- --runInBand --forceExit
    ```

*   Run linting checks and build validation:
    ```bash
    npm run verify
    ```
