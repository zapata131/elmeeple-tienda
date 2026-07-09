# User Stories Backlog & Commercial MVP Scope - MeeplePrecios 🇲🇽

This document details the active product backlog and user stories for **MeeplePrecios**, Mexico's premier independent board game price comparison engine, standardized strictly on **Mexican Pesos ($ MXN)**.

---

## 1. Target User Personas ⭐

* **Player / Buyer (Comprador):** A board game enthusiast in Mexico looking to purchase a specific title or discover trending games at the lowest total delivered cost ($ MXN base price + shipping).
* **Partner / Online Store (Merchant):** An owner or manager of an independent tabletop store in Mexico (e.g., El Duende CDMX, La Caravana Gamelab, Dungeoneers México, Devir México) looking to list their catalog and prices to capture high-intent traffic via affiliate links.
* **Platform Admin:** Technical administrator responsible for verifying store registrations, monitoring XML feed sync queues, and curating BGG metadata.

---

## 2. Completed Commercial User Stories & Milestones 📦

### US-01 to US-04: Core Foundation & Initial MVP Scope
* **US-01:** Predictive Smart Search & Homepage Discovery (`[COMPLETED & VERIFIED - Issue #71]`)
* **US-02:** Full-Width Hero Cover & Price Comparison Table ($ MXN) (`[COMPLETED & VERIFIED - Issue #71]`)
* **US-03:** Self-Serve Store Partner Onboarding & Shipping Matrix (`[COMPLETED & VERIFIED - Issue #64]`)
* **US-04:** Platform Administration & Feed Verification Console (`[COMPLETED & VERIFIED - Issue #68]`)

### US-40 to US-75: Design Harmonization, Market Scope & Historical Summary
* **US-40:** Sentence Case Linter Suite & UI Style Harmonization (`[COMPLETED & VERIFIED - Issue #55]`)
* **US-41:** Sponsored Featured Store Placement in Comparison Table (`[COMPLETED & VERIFIED - Issue #58]`)
* **US-44:** Single-Market Commercial Scope & MXN Pricing Standardization (`[COMPLETED & VERIFIED - Issue #62]`)
* **US-49:** Full-Width Hero Cover Box Art & BGG Hotness Integration (`[COMPLETED & VERIFIED - Issue #71]`)
* **US-59:** Seeding Verified Mexican Stores & PostgREST Query Optimization (`[COMPLETED & VERIFIED - Issue #88]`)
* **US-60:** Purging Unofficial Stores & Store Profile Referral Link Tracking (`[COMPLETED & VERIFIED - Issue #90]`)
* **US-74:** Automated Store Offer URL & Product Title Cross-Matching Worker (`[COMPLETED & VERIFIED - Issue #188]`)
* **US-75:** All-Time Lowest Price Badge & Historical Summary Banner (`[COMPLETED & VERIFIED - Issue #199]`)

### US-95 to US-100: Catalog Ingestion Isolation & Merchant Analytics (Milestone 36)
* **US-95:** Strict Sub-Title & Colon-Delimited Expansion Isolation Engine (`[COMPLETED & VERIFIED - Issue #192]`)
* **US-96:** Automated Background BGG Resolution and Image Hydration Worker (`[COMPLETED & VERIFIED - Issue #193]`)
* **US-99:** Interactive Merchant Feed Inspection & Diagnostic Debugger (`[COMPLETED & VERIFIED - Issue #196]`)
* **US-100:** Merchant Outbound Click Analytics and CPC Monthly Billing Generator (`[COMPLETED & VERIFIED - Issue #197]`)

---

## 3. Active Sprint: Milestone 37 - Player Experience & Interactive Visuals 🚀

### US-98: Historical Price Time-Series Logger & Interactive Price Drop Graphs (Issue #195)
* **Formula:** As a **Player**, I want to **view historical price trend graphs on game detail pages (`/game/[id]`)**, so that **I can inspect lowest price trends over the last 90 days and identify genuine price drops**.
* **Acceptance Criteria:**
  1. Render interactive SVG price history chart on `/game/[id]` displaying recorded price points over time.
  2. Highlight the 90-day lowest price point and calculate percentage discount vs initial price.
  3. Provide time-range filter toggles (30 días, 90 días, 1 año).
* **Status:** **[ACTIVE SPRINT - In Progress]**

### US-92: Player Rating Aggregation & Recommended Player Count Stats (Issue #189)
* **Formula:** As a **Player**, I want to **view BGG average ratings, community recommended player counts, and Spanish rulebook PDF links on game detail pages**, so that **I can evaluate game quality and accessibility before buying**.
* **Acceptance Criteria:**
  1. Display BGG rating score pill (e.g. `★ 8.2 / 10`) on hero metadata card.
  2. Display community-voted best player count badge (e.g. `Ideal a 3 jugadores`).
  3. Include a direct download button for community Spanish rulebook PDF.
* **Status:** **[ACTIVE SPRINT - In Progress]**

### US-91: Regional State and Zip-Code Dynamic Shipping Fee Recalculator (Issue #188)
* **Formula:** As a **Player**, I want to **select my destination state or enter my zip code on game comparison tables**, so that **regional shipping costs and total delivered prices are accurately calculated for my location**.
* **Acceptance Criteria:**
  1. Add destination state selector (CDMX, Jalisco, Nuevo León, etc.) in `StoreOffersComparisonTable.tsx`.
  2. Dynamically recalculate shipping costs based on regional carrier zones.
  3. Update total delivered cost (`Precio + Envío = Coste total`) in real-time.
* **Status:** **[ACTIVE SPRINT - In Progress]**

---

## 4. Pruned Backlog & Deferred Epics 🛑

To maintain our lean commercial focus and eliminate UI/backend bloat, the following multi-market/complex features remain pruned from our initial commercial MVP:
* **Multi-Currency Foreign Exchange Engine:** Deferred until international shipping outside Mexico is launched.
* **Multi-Country Destination Selector:** Pruned in favor of static market lock (`México · $ MXN`).
* **Multi-Store Shopping Cart Optimizer:** Pruned in favor of direct item-level affiliate checkout links.
