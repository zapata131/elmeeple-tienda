# User Stories Backlog & Requirement Validation - MeeplePrecios

This document details the product planning for **MeeplePrecios**, the board game price comparison platform for the Iberian Peninsula (Spain, Portugal) and Latin America (including Brazil), implemented on top of the **El Meeple** tech stack.

---

## 1. Target User Personas

*   **Player / Buyer:** A modern board game enthusiast or collector in the Iberian Peninsula (Spain, Portugal) or Latin America (including Brazil) looking to purchase a specific title at the lowest possible total cost, considering shipping rates to their country, immediate stock availability, and the box language version (Spanish, Portuguese, English, etc.).
*   **Partner / Online Store (Merchant):** An owner or manager of a tabletop game e-commerce store in the Iberian Peninsula or Latin American markets (either brick-and-mortar stores with online sales or 100% online operations) looking to list their catalog and prices to capture high-intent traffic and increase sales via affiliate links.
*   **Platform Admin:** A moderator and technical administrator of the system responsible for auditing store feeds, resolving game title mapping issues, approving new merchant registrations, and maintaining currency conversion rates.

---

## 2. User Stories: Player (Discovery & Price Comparison)

### US-01: Predictive Smart Search
*   **Formula:** As a **Player**, I want to **type a board game name into a predictive search bar**, so that I can **auto-complete and quickly find the game detail page whether I search by its Spanish/Portuguese translated title or its original BoardGameGeek (BGG) title**.
*   **Acceptance Criteria:**
    1. The search bar must display autocomplete suggestions starting from 3 characters.
    2. Searches must be case-insensitive and diacritic-insensitive, matching against the primary game name and alternate BGG titles (including localized names in Spanish and Portuguese).
    3. Selecting a game suggestion redirects the user directly to its detail page `/game/[slug]`.
*   **Status:** **[PLANNED]**

### US-02: Deal and Price Comparison Table
*   **Formula:** As a **Player**, I want to **see a detailed table comparing different online stores selling the game**, so that I can **compare the base price, shipping costs, and final total price transparently**.
*   **Acceptance Criteria:**
    1. The comparison table must list store offers sorted by total price (base price + shipping) from lowest to highest by default.
    2. Each row must display: Store logo/name, store rating, box language/edition (represented with SVG flags, e.g., 🇪🇸 for Spanish, 🇵🇹 for Portuguese, 🇧🇷 for Brazilian Portuguese, 🇬🇧 for English), availability status (In Stock, Pre-order, Out of Stock), base price, shipping cost to the selected location, and total calculated price.
    3. Clicking the "Go to store" CTA must open the product page in a new browser tab using an affiliate tracking redirect.
*   **Status:** **[PLANNED]**

### US-03: Global Shipping and Currency Settings (Toolbar)
*   **Formula:** As a **Player**, I want to **select my delivery country and preferred currency in the global header toolbar**, so that I can **view real shipping rates and price conversions in my local currency**.
*   **Acceptance Criteria:**
    1. The toolbar must allow selecting destination countries (Spain, Portugal, Mexico, Brazil, Argentina, Colombia, Chile, Peru, etc.).
    2. The toolbar must support major currencies (EUR, MXN, BRL, ARS, COP, CLP, PEN, USD).
    3. Changing the destination country must immediately recalculate shipping costs in the comparison table based on each store's shipping matrix.
    4. Changing the currency must instantly convert all prices using the cached exchange rates in the database and update currency symbols across the site. The toolbar must allow toggling the interface language, restricting the available languages to exactly English, Spanish, and Portuguese.
*   **Status:** **[PLANNED]**

### US-04: Catalog Search Filters and Navigation
*   **Formula:** As a **Player**, I want to **filter the global game catalog by category, mechanics, price range, and availability**, so that I can **discover new deals matching my preferences and budget**.
*   **Acceptance Criteria:**
    1. Users can filter to only show games that are currently "In Stock" in at least one store.
    2. Supports filtering via category and mechanics chips imported from BGG (e.g., *Strategy*, *Cooperative*, *Worker Placement*).
    3. Includes a responsive price range slider filter.
*   **Status:** **[PLANNED]**

### US-05: Historical Price Evolution Graph
*   **Formula:** As a **Player**, I want to **see an interactive chart tracking the game's minimum market price over the past months**, so that I can **decide whether the current deal is genuinely good or if I should wait**.
*   **Acceptance Criteria:**
    1. The game detail page must render a clean, interactive line chart (using a lightweight library, free of emojis).
    2. The chart must plot daily minimum prices and allow filtering history by 30 days, 90 days, or 1 year.
*   **Status:** **[PLANNED]**

### US-06: Wishlist and Price Drop Alerts
*   **Formula:** As a **Registered Player**, I want to **add games to my wishlist and set a target price alert**, so that I can **receive an automatic email notification when the price drops below my threshold**.
*   **Acceptance Criteria:**
    1. Users can add any game to their wishlist with an "Add to Wishlist" button.
    2. When setting a price alert, the user inputs their target price in their active currency.
    3. A scheduled cron job runs daily to check minimum prices, firing notifications via Resend to users whose target thresholds are met.
*   **Status:** **[PLANNED]**

### US-16: Language Editions Switcher (Other Versions)
*   **Formula:** As a **Player**, I want to **see a list of other language editions for the same game**, so that I can **easily switch to the comparison table for my preferred language version (English, Spanish, or Portuguese)**.
*   **Acceptance Criteria:**
    1. The game detail page must check if there are other entries in the database representing alternative language editions linked to this game.
    2. If other versions exist, render an "Other Versions" sidebar list displaying each edition's thumbnail, title, and a language flag SVG (restricting flags to Spain, Portugal/Brazil, and UK/US).
    3. Clicking another version redirects the user directly to the detail page for that edition.
*   **Status:** **[PLANNED]**

---

## 3. User Stories: Partner / Online Store (Merchant)

### US-07: Sequential Store Onboarding Funnel
*   **Formula:** As a **Store Owner**, I want to **register my e-commerce storefront through a sequential multi-step wizard**, so that I can **easily get my store listed on the platform**.
*   **Acceptance Criteria:**
    1. Step 1 pre-fills the owner's name and email based on their active NextAuth session.
    2. Step 2 collects storefront details: Store name, e-commerce URL, country of origin, and logo upload (which gets client-side canvas-cropped to `150x150px` JPEG).
    3. Step 3 collects fiscal/verification details (e.g., RFC/NIF/tax identifier) for safety auditing.
*   **Status:** **[PLANNED]**

### US-08: Shipping Cost Matrix Configuration
*   **Formula:** As a **Store Owner**, I want to **configure my shipping rates and free-shipping thresholds by destination country in my dashboard**, so that **buyers see accurate shipping rates**.
*   **Acceptance Criteria:**
    1. Merchants can define flat shipping rates for different destination countries.
    2. Merchants can specify a free shipping threshold per country (e.g., *Free shipping to Spain above 50 EUR*, or *Free shipping to Mexico above 1500 MXN*).
    3. If a country is not supported, it is marked as "Shipping unavailable to [Country]".
*   **Status:** **[PLANNED]**

### US-09: Automated Catalog Sync via XML/CSV Feeds
*   **Formula:** As a **Store Owner**, I want to **provide my store's XML or CSV product feed URL in my dashboard**, so that **my product prices, inventory, and purchase links update daily without manual data entry**.
*   **Acceptance Criteria:**
    1. The merchant dashboard must allow saving and validating a feed URL.
    2. The feed structure must comply with the platform's standard schema (EAN/UPC, game title, product URL, image URL, base price, numerical stock).
    3. The system validates the feed structure on save, showing a real-time status badge (Synced, Formatting Error, Offline).
*   **Status:** **[PLANNED]**

### US-10: Affiliate Click and Analytics Dashboard
*   **Formula:** As a **Store Owner**, I want to **view referral click statistics on my merchant panel**, so that I can **measure the conversion rates and high-value traffic redirected to my store**.
*   **Acceptance Criteria:**
    1. The dashboard displays a bar chart of weekly/daily referral clicks.
    2. Renders a list of the top games generating referral traffic to the merchant's site.
    3. Includes an information section detailing the merchant's unique UTM tracking suffix (`?ref=meepleprecios&utm_source=meepleprecios&utm_medium=affiliate`) so they can verify and reconcile clicks in their Shopify, WooCommerce, or Google Analytics dashboards.
*   **Status:** **[PLANNED]**

---

## 4. User Stories: Platform Admin

### US-11: Merchant Auditing and Verification Dashboard
*   **Formula:** As a **Platform Admin**, I want to **review and approve new merchant applications**, so that I can **prevent fraudulent storefronts from listing on the site**.
*   **Acceptance Criteria:**
    1. Renders a secure page at `/admin` displaying pending registration cards.
    2. An audit details modal showcases the store's registration details, tax ID, and website link.
    3. Approving a storefront sets `verified: true`, rendering the shop active on search results and enqueuing its feed for the next synchronization cycle.
    4. Rejecting a storefront requires entering a rationale reason, which is automatically emailed to the merchant owner.
*   **Status:** **[PLANNED]**

### US-12: Feed Diagnostics and Monitoring Hub
*   **Formula:** As a **Platform Admin**, I want to **monitor the sync health of all active store feeds in real-time**, so that I can **quickly identify formatting errors or offline merchant servers**.
*   **Acceptance Criteria:**
    1. Displays a table showing store name, last successful sync timestamp, count of successfully mapped games, mapping failure counts (e.g., missing valid EAN), and feed status.
    2. Allows triggering a manual sync process for any individual merchant feed.
*   **Status:** **[PLANNED]**

### US-13: Currency and Foreign Exchange Rate Manager
*   **Formula:** As a **Platform Admin**, I want to **manage currency settings and update exchange rates**, so that I can **guarantee precise price conversions for regional buyers**.
*   **Acceptance Criteria:**
    1. Allows enabling or disabling specific target currencies.
    2. Displays exchange rates relative to the base currency (EUR) and enables manual overrides or daily automated FX fetches from an external exchange rates API.
*   **Status:** **[PLANNED]**

---

## 5. Technical & Automation Backlog (Backend Stories)

### US-14: Scheduled Store Feed Parser (Cron Job)
*   **Formula:** As the **System**, I want to **run a scheduled background cron job daily**, so that I can **fetch, parse, and update prices from all approved merchant XML/CSV feeds**.
*   **Acceptance Criteria:**
    1. Sequential iteration over valid feeds, parsing data using `fast-xml-parser`.
    2. Idempotent bulk upsert to the `store_games` relation, modifying price, stock, and links.
    3. Unmapped games (not present in the global BGG metadata cache) are queued for metadata fetching.
*   **Status:** **[PLANNED]**

### US-15: BGG API Metadata Queue and Cache Manager
*   **Formula:** As the **System**, I want to **resolve and cache game metadata from BoardGameGeek**, so that I can **minimize redundant queries to the BGG API and boost detail page speeds**.
*   **Acceptance Criteria:**
    1. Checks the `bgg_games_cache` by `bgg_id` or barcode (EAN/UPC) during catalog processing.
    2. If not found, fetches from BGG `/thing` API, mapping name, thumbnail, description, weight complexity, player counts, and alternate names to the local cache.
    3. Handles BGG XML API2 202 Accepted queues and HTTP 429 rate limit statuses gracefully.
*   **Status:** **[PLANNED]**
