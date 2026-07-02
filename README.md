# MeeplePrecios (elmeeple-tienda)

MeeplePrecios is a high-performance tabletop board game price comparison aggregator designed specifically for the Spanish-speaking community (Spain and Latin America). 

Cloned from the core architectural principles of the German price portal [Brettspielpreise](https://brettspielpreise.de/), MeeplePrecios connects board game enthusiasts with independent e-commerce shops across the Spanish-speaking world, offering transparent calculations on total purchase costs.

---

## 1. What the Project is For (The Core Purpose)

Tabletop board gaming has experienced an exponential boom, but the market in Spanish-speaking regions is highly fragmented:
*   **Players** have to search through dozens of local and international online shops (in Spain, Mexico, Chile, Argentina, etc.) to find a game in stock.
*   **Pricing is volatile and opaque**, as base prices, local currencies, conversion rates, and international shipping fees (including customs and import taxes) make it tedious to calculate the actual total cost of a game box.
*   **Language versions** (Spanish vs. English or German editions) are critical but often mislabeled on generic storefronts.

**MeeplePrecios solves this fragmentation.** It provides players with a single, unified search engine to find the exact edition of a board game, compare real-time prices, choose their delivery country, convert prices into local currency, and view calculated shipping rates—all in one place.

---

## 2. Value Proposition

### For Board Game Players (Demand)
*   **Transparent Total Cost Calculation:** Select your delivery country and preferred currency. MeeplePrecios automatically calculates shipping costs and displays the exact total price.
*   **Language Verification:** Clear indicators (e.g., SVG flag badges) show whether a store's listing is in Spanish, English, or another language, preventing accidental wrong-language imports.
*   **Price Drop Alerts & Wishlists:** Add games to a personal wishlist and get notified via email when a game falls below your target price.
*   **Price Tracking History:** Interactive charts display the historical price trends of any game to help you make informed purchase decisions.

### For Independent Board Game Retailers (Supply)
*   **Targeted Organic Traffic:** Get your e-commerce shop listed in front of high-intent board gamers, driving qualified traffic directly to your checkout.
*   **Frictionless Automated Sync:** Provide a standard XML or CSV product feed URL in your merchant dashboard, and MeeplePrecios will update your prices and stock status daily—no manual entry needed.
*   **Performance Metrics:** Monitor click-through rates and referral analytics directly from your merchant dashboard.

---

## 3. Technology Stack (The "ShipFast" Stack)

MeeplePrecios is built using a modern, scalable, and high-performance stack designed for fast page loads and rapid iteration:

*   **Frontend & Backend Monolith:** [Next.js](https://nextjs.org/) (App Router) in TypeScript, optimized for Server-Side Rendering (SSR) and SEO.
*   **Styling & Design System:** [Tailwind CSS (v4)](https://tailwindcss.com/) with a minimalist, premium layout based on the brand's custom color palette (Blanco Roto, Carbón, Malva, Turquesa, Coral). No raw emojis are used; icons are clean vector SVGs.
*   **Database & Backend Services:** [Supabase](https://supabase.com/) (PostgreSQL) with strict Row-Level Security (RLS) policies.
*   **Authentication:** [NextAuth.js](https://next-auth.js.org/) managing secure role-based access control (RBAC) for Players, Partners, and Admins.
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
