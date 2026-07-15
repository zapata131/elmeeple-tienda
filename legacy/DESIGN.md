# System Design & Architecture Document: MeeplePrecios 🇲🇽

## 1. Executive Summary & Core Purpose 🎲

**MeeplePrecios** is Mexico's dedicated board game price comparison engine. Our primary mission is to solve price and inventory fragmentation across independent Mexican tabletop e-commerce shops.

By standardizing pricing strictly in **Mexican Pesos ($ MXN)** and computing flat shipping fees to any state in Mexico, MeeplePrecios empowers players to find their favorite games in stock at the lowest total delivered cost instantly, while driving qualified organic and affiliate checkout traffic directly to participating store owners.

---

## 2. Target Personas ⭐

### 2.1 Players & Buyers (Compradores)
* **Profile:** Board game enthusiasts and collectors across Mexico (CDMX, Guadalajara, Monterrey, etc.).
* **Goal:** Find specific localized language editions (Spanish `ES` vs English `EN`) in stock at the best total cost ($ MXN base price + shipping).
* **Solution:** A clean homepage discovery portal featuring live BGG Hotness trends and full-width comparison tables ranking verified store offers by total delivered cost.

### 2.2 Partners & Merchants (Socios & Tiendas) 📦
* **Profile:** Independent tabletop store owners in Mexico (e.g., El Duende CDMX, La Caravana Gamelab, Dungeoneers México, Devir México).
* **Goal:** Increase online sales without manual listing maintenance.
* **Solution:** Self-serve onboarding (`/merchant/dashboard`, `/merchant/onboard`, `/merchant/shipping`) where stores register their contact details, flat domestic shipping rates in MXN, and Google Shopping XML product feed URLs for automated daily inventory syncing with self-service SKU mapping tools.

---

## 3. Commercial MVP & Enterprise Precision Feature Scope ⚡

* **Unified Homepage Discovery (`/`):** Streamlined front page featuring predictive smart search (`SearchBar`) and live world board game trends imported from BGG Hotness (`Tendencias BGG`).
* **Full-Width Hero Comparative UI (`/game/[id]`):** Displays high-resolution box art (`<image>`) from BGG, clear typographic game stats, and side-by-side store comparison offers sorted by total cost (`Precio artículo + Envío = Coste total ($ MXN)`).
* **4-Tier Waterfall Ingestion Engine (US-103 to US-105):**
  - **Tier 1 (Deterministic Barcode Registry):** EAN/GTIN barcode lookup in `public.game_barcodes` (100% confidence).
  - **Tier 2 (Historical SKU Memory):** Persistent lookup in `public.merchant_product_mappings` (100% confidence).
  - **Tier 3 (Tokenized Fuzzy Match & Subtitle Isolator):** Weighted similarity metric score ($\ge 0.92$ auto-publish).
  - **Tier 4 (Moderation Queue & Human Override):** Medium-confidence items ($0.70 \dots 0.91$) routed to Admin Staging Queue or Merchant Portal.
* **Admin Staging & Moderation Queue UI (`/admin/queue`) (US-106):** Single-click approval, re-mapping, and rejection panel for medium-confidence feed items.
* **Merchant Self-Service Mapping Portal (`/merchant/dashboard`) (US-107):** Self-service UI for store owners to view unmatched feed items and bind them to canonical BGG IDs.
* **Direct Affiliate Checkout Redirects (`/api/redirect`):** One-click redirect appending standard UTM tracking parameters (`?ref=meepleprecios`) and recording click events for merchant reconciliation.

---

## 4. UI/UX & Visual Design System 🎨

We adhere to a minimalist, premium design aesthetic tailored for high legibility and rapid decision-making:

### 4.1 Color Palette
| Purpose | Color Name | Hex Code |
| :--- | :--- | :--- |
| Base / Background | Blanco roto | `#F5F0E9` |
| Dark UI / Headers | Carbón suave | `#3A3A3A` |
| Primary Accent / CTAs | Malva suave | `#8367C7` |
| Secondary Accent / Badges | Turquesa pastel | `#73D8D4` |
| Price Highlights | Coral deslavado | `#FF9E8A` |

### 4.2 Wise Strategic Emoji Guidance 💡
* **Policy:** We adhere to **Wise Strategic Emoji Usage**. Emojis (e.g., 🇲🇽, 🎲, ⭐, 📦, ⚡) may be used thoughtfully across headings and documentation to add warmth and visual anchors without cluttering functional data tables.
* **Sentence Case Governance:** All headings, buttons, and table headers follow sentence case per Google style guidelines (e.g., *Comparativa de ofertas por tienda*, *★ Tienda recomendada*, *Moderación y estaging de catálogo*).

---

## 5. Technical Stack & Data Schema 🛠️

* **Monolith Framework:** Next.js 16 (App Router) in TypeScript with Tailwind CSS v4.
* **Database:** Supabase (PostgreSQL) with strict Row-Level Security (RLS).
  * `stores`: Merchant details, XML feed URL, feed health metrics, and verification flags.
  * `shipping_rates`: Flat domestic delivery costs and free shipping thresholds in MXN.
  * `bgg_games_cache`: Board game metadata (title, thumbnail, high-res image, description, complexity weight, player counts).
  * `game_barcodes`: Multi-barcode GTIN/EAN registry mapping barcodes to BGG IDs and language editions.
  * `merchant_product_mappings`: Historical merchant SKU and URL mapping memory table.
  * `store_games`: Intermediate inventory table linking stores and games with base price ($ MXN), stock status, edition language, match confidence, and match tier.
  * `bgg_metadata_queue`: Feed staging queue for un-indexed items and medium-confidence matches ($0.70 \dots 0.91$).
  * `clicks`: Outbound affiliate referral click log.

---

## 6. Verification & Automated Testing Gate 🧪

Every feature branch must pass our rigorous verification pipeline before merging into `main`:
1. **Serial Jest Unit Tests:** `npm run test -- --runInBand --forceExit` verifying 4-tier waterfall matching, barcode registries, SKU memory, RLS rules, and sentence-case style compliance.
2. **Playwright E2E Walkthroughs:** `npm run test:e2e` simulating buyer searches, admin staging moderation queue workflows, and merchant self-service mapping portal navigation across desktop and mobile viewports.
