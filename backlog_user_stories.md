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

### US-40 to US-60: Design Harmonization, Market Scope & Feed Ingestion
* **US-40:** Sentence Case Linter Suite & UI Style Harmonization (`[COMPLETED & VERIFIED - Issue #55]`)
* **US-41:** Sponsored Featured Store Placement in Comparison Table (`[COMPLETED & VERIFIED - Issue #58]`)
* **US-44:** Single-Market Commercial Scope & MXN Pricing Standardization (`[COMPLETED & VERIFIED - Issue #62]`)
* **US-49:** Full-Width Hero Cover Box Art & BGG Hotness Integration (`[COMPLETED & VERIFIED - Issue #71]`)
* **US-59:** Seeding Verified Mexican Stores & PostgREST Query Optimization (`[COMPLETED & VERIFIED - Issue #88]`)
* **US-60:** Purging Unofficial Stores & Store Profile Referral Link Tracking (`[COMPLETED & VERIFIED - Issue #90]`)

### US-61 to US-74: Catalog Matching, Search Enhancement & URL Audit Worker
* **US-61:** Exact Product Matching & Accessory/Organizer Exclusion Safeguards (`[COMPLETED & VERIFIED - Issue #167]`)
* **US-64:** Multi-Edition Store Offer Listing (Spanish and English Variants) (`[COMPLETED & VERIFIED - Issue #173]`)
* **US-66:** Collection-Level Atom Feed Ingestion & Category Product Filtering (`[COMPLETED & VERIFIED - Issue #177]`)
* **US-67:** Predictive Search Bar on Game Detail Comparison Pages (`[COMPLETED & VERIFIED - Issue #179]`)
* **US-68:** Carcassonne Catalog Matching & Expansion Exclusions (`[COMPLETED & VERIFIED - Issue #181]`)
* **US-69:** Concordia Base Game Indexing & Bundaba Edition Grouping (`[COMPLETED & VERIFIED - Issue #183]`)
* **US-74:** Automated Store Offer URL & Product Title Cross-Matching Worker (`[COMPLETED & VERIFIED - Issue #188]`)

---

## 3. Active Backlog & Upcoming Sprint User Stories 🚀

### US-75: All-Time Lowest Price Badge & Historical Price Trend Summary
* **Formula:** As a **Player**, I want to **view an all-time lowest price badge and historical price trend summary on game detail pages**, so that **I can quickly identify whether a store offer is at an all-time low price or currently discounted**.
* **Acceptance Criteria:**
  1. Detect when the current lowest store offer for a game matches or beats its historical lowest price recorded in the database or price history.
  2. Render a sentence-case highlight badge (`★ Mejor precio histórico`) using brand turquoise (`#73D8D4`/15) on game detail pages.
  3. Include historical price metrics (e.g. lowest recorded price and date) in the comparison summary.
* **Status:** **[READY FOR SPRINT - Next Issue]**

### US-76: Store Partner XML Feed Health Digest & Error Alerting
* **Formula:** As a **Store Partner**, I want to **receive automated diagnostics and error summaries for my XML feed sync**, so that **I can fix missing product prices, broken image links, or unmapped EAN barcodes in my storefront catalog**.
* **Acceptance Criteria:**
  1. Display feed sync health status (success, warnings, failed items count) on `/merchant/diagnostics`.
  2. Provide downloadable feed diagnostic reports listing items excluded due to missing prices or non-boardgame categories.
* **Status:** **[PLANNED - Future Sprint]**

### US-77: Platform Admin Automated Barcode & Title Duplicate Merger
* **Formula:** As a **Platform Admin**, I want an **automated duplicate game merger tool in the admin console**, so that **I can combine duplicate database game entries created by minor store title variations under a single canonical BGG ID**.
* **Acceptance Criteria:**
  1. Admin dashboard tool to scan for potential duplicate games based on title similarity and barcode matching.
  2. One-click merge action to re-assign all store offers from a duplicate entry to the target canonical game and remove the orphan record.
* **Status:** **[PLANNED - Future Sprint]**

---

## 4. Pruned Backlog & Deferred Epics 🛑

To maintain our lean commercial focus and eliminate UI/backend bloat, the following multi-market/complex features remain pruned from our initial commercial MVP and deferred to future expansion iterations:
* **Multi-Currency Foreign Exchange Engine:** Deferred until international shipping outside Mexico is launched.
* **Multi-Country Destination Selector:** Pruned in favor of static market lock (`México · $ MXN`).
* **Multi-Store Shopping Cart Optimizer:** Pruned in favor of direct item-level affiliate checkout links.
* **Wishlist & Email Price Drop Alerts:** Deferred to post-launch user retention sprints.
