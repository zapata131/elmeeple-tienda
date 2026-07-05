# System Design & Architecture Document: MeeplePrecios 🇲🇽

## 1. Executive Summary & Core Purpose 🎲

**MeeplePrecios** is Mexico's dedicated board game price comparison engine. Our primary mission is to solve price and inventory fragmentation across independent Mexican tabletop e-commerce shops.

By standardizing pricing strictly in **Mexican Pesos ($ MXN)** and computing flat shipping fees to any state in Mexico, MeeplePrecios empowers players to find their favorite games in stock at the lowest total delivered cost instantly, while driving qualified organic and affiliate checkout traffic directly to participating store owners.

---

## 2. Target Personas ⭐

### 2.1 Players & Buyers (Compradores)
* **Profile:** Board game enthusiasts and collectors across Mexico (CDMX, Guadalajara, Monterrey, etc.).
* **Goal:** Find specific localized language editions (Spanish `ES` vs English `EN`) in stock at the best total cost ($ MXN base price + shipping).
* **Solution:** A clean search engine and side-by-side comparison table ranking store offers by total cost.

### 2.2 Partners & Merchants (Socios & Tiendas) 📦
* **Profile:** Independent tabletop store owners in Mexico.
* **Goal:** Increase online sales without manual listing maintenance.
* **Solution:** Self-serve onboarding (`/merchant/dashboard`) where stores register their contact details, flat domestic shipping rates, and Google Shopping XML product feed URL for automated daily inventory syncing.

---

## 3. Commercial MVP Feature Scope ⚡

* **Predictive Smart Search (`/api/search`):** Autocomplete search bar finding games by title or barcode (EAN/UPC) with instant keyboard navigation.
* **Game Comparison Table (`StoreOffersComparisonTable.tsx`):** Displays store offers sorted by total cost (Base Price + Shipping in $ MXN). Renders distinct edition language badges (`ES`, `EN`) and clear out-of-stock indicators.
* **Direct Affiliate Checkout Redirects (`/api/redirect`):** One-click redirect appending standard UTM tracking parameters (`?ref=meepleprecios&utm_source=meepleprecios&utm_medium=affiliate`) and recording click events for merchant reconciliation.
* **Self-Serve Merchant Portal (`/merchant/dashboard`, `/merchant/onboard`, `/merchant/shipping`):** Portal for store partners to register storefronts, configure flat shipping fees in MXN, monitor XML feed health, and view referral click logs.
* **Platform Admin Control Panel (`/admin/dashboard`, `/admin/queue`):** Centralized administration portal for store verification, feed diagnostics, and BGG metadata curation.

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
* **Policy:** We lift previous bans on emojis in favor of **Wise Strategic Emoji Usage**. Emojis (e.g., 🇲🇽, 🎲, ⭐, 📦, ⚡) may be used thoughtfully across headings, badges, and documentation to add warmth, visual anchors, and conversational clarity without cluttering functional data tables.
* **Sentence Case Governance:** All headings, buttons, and table headers follow sentence case per Google style guidelines (e.g., *Comparativa de ofertas por tienda*, *★ Mejor precio actual*).

---

## 5. Technical Stack & Data Schema 🛠️

* **Monolith Framework:** Next.js 16 (App Router) in TypeScript with Tailwind CSS v4.
* **Database:** Supabase (PostgreSQL) with strict Row-Level Security (RLS).
  * `stores`: Merchant details, XML feed URL, feed health metrics, and verification flags.
  * `shipping_rates`: Flat domestic delivery costs and free shipping thresholds in MXN.
  * `bgg_games_cache`: Board game metadata (title, thumbnail, complexity weight, player counts, EAN barcode).
  * `store_games`: Intermediate inventory table linking stores and games with base price ($ MXN), stock status, and edition language.
  * `clicks`: Outbound affiliate referral click log.

---

## 6. Verification & Automated Testing Gate 🧪

Every feature branch must pass our rigorous verification pipeline before merging into `main`:
1. **Serial Jest Unit Tests:** `npm run test -- --runInBand --forceExit` verifying calculation helpers, RLS rules, and sentence-case style compliance.
2. **Playwright E2E Walkthroughs:** `npm run test:e2e` simulating live buyer searches, catalog browsing, and merchant portal navigation across desktop and mobile viewports.
