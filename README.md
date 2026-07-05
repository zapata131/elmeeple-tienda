# MeeplePrecios 🇲🇽

MeeplePrecios is Mexico's premier independent board game price comparison engine, designed to help tabletop gamers find the exact edition of any game at the lowest total cost in Mexican Pesos ($ MXN).

---

## 1. Core Purpose 🎲

Tabletop gaming in Mexico is thriving, but inventory and pricing across local online stores remain fragmented:
* **Players** spend hours searching multiple stores to find games in stock and calculating actual shipping fees to their city.
* **Store Owners** need a streamlined channel to list their catalog and reach high-intent buyers ready to purchase.

**MeeplePrecios bridges this gap.** We provide a unified search engine and transparent price comparison table in **$ MXN**, computing base prices plus flat domestic shipping rates so players can find the best deal instantly.

---

## 2. Key Features ⭐

### For Players (Compradores)
* **Instant Smart Search:** Predictive autocomplete search finding board games by localized Spanish titles or original BGG names.
* **Transparent Price Comparison ($ MXN):** Lists competing Mexican stores side-by-side sorted by total delivered cost (Base Price + Shipping).
* **Direct Merchant Redirect:** One-click affiliate links taking players directly to the verified seller's product page to complete their purchase.
* **Edition Language Badges:** Clear markers distinguishing Spanish (`ES`), English (`EN`), or multilingual box versions.

### For Stores (Socios & Tiendas) 📦
* **Streamlined Onboarding:** Simple self-serve merchant panel (`/merchant/dashboard`) to register store contact info and set flat shipping rates in MXN.
* **Automated XML Feed Sync:** Connect standard Google Shopping product feeds to automatically update store pricing and inventory daily.
* **Referral Tracking:** Transparent click counting proving affiliate traffic and conversions.

---

## 3. Technology Stack ⚡

* **Framework:** Next.js 16 (App Router) in TypeScript with Tailwind CSS v4.
* **Database:** Supabase (PostgreSQL) with Row-Level Security (RLS).
* **Wise Emoji Policy:** Emojis (🇲🇽, 🎲, ⭐, 📦) are used thoughtfully across the interface and documentation to add warmth and scannability without clutter.
* **Automated Testing:** Serial Jest unit tests and Playwright E2E browser walkthroughs ensuring zero-regression reliability.

---

## 4. Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run local server
npm run dev

# 3. Run full verification suite (lint, build, unit tests)
npm run verify

# 4. Run Playwright E2E browser tests
npm run test:e2e
```
