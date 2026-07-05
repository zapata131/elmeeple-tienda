# User Stories Backlog & Commercial MVP Scope - MeeplePrecios 🇲🇽

This document details the active product backlog and user stories for **MeeplePrecios**, Mexico's premier independent board game price comparison engine, standardized strictly on **Mexican Pesos ($ MXN)**.

---

## 1. Target User Personas ⭐

* **Player / Buyer (Comprador):** A board game enthusiast in Mexico looking to purchase a specific title or discover trending games at the lowest total delivered cost ($ MXN base price + shipping).
* **Partner / Online Store (Merchant):** An owner or manager of an independent tabletop store in Mexico (e.g., El Duende CDMX, La Caravana Gamelab, Dungeoneers México, Devir México) looking to list their catalog and prices to capture high-intent traffic via affiliate links.
* **Platform Admin:** Technical administrator responsible for verifying store registrations, monitoring XML feed sync queues, and curating BGG metadata.

---

## 2. Active Commercial MVP User Stories 📦

### US-01: Predictive Smart Search & Homepage Discovery
* **Formula:** As a **Player**, I want to **search for any board game on the unified homepage or browse live BGG Hotness world trends**, so that I can **instantly find verified Mexican store offers without navigating through redundant pages**.
* **Acceptance Criteria:**
  1. Autocomplete search bar finding games by localized Spanish titles or original BGG names from 3 characters.
  2. Front page (`/`) renders a live grid of BGG Hotness trending items available in Mexican stores.
  3. Clicking any game suggestion or trending card opens its detail comparison page (`/game/[id]`).
* **Status:** **[COMPLETED & VERIFIED - Issue #71]**

### US-02: Full-Width Hero Cover & Price Comparison Table ($ MXN)
* **Formula:** As a **Player**, I want to **view a full-width Hero Cover Art header and side-by-side store price comparison table in Mexican Pesos**, so that I can **inspect high-resolution box art, verify the edition language (ES vs EN), and see the exact 3-part price breakdown (Precio artículo + Envío = Coste total)**.
* **Acceptance Criteria:**
  1. Full-width Hero header card displaying BGG high-resolution `<image>` box art, Spanish descriptions, and player/duration/complexity stats.
  2. Full-width comparison table sorting verified Mexican stores from lowest to highest total delivered cost.
  3. Clear sentence-case badges (`★ Tienda recomendada`, `ES`) and one-click affiliate redirect links (`Ir a la tienda`).
* **Status:** **[COMPLETED & VERIFIED - Issue #71]**

### US-03: Self-Serve Store Partner Onboarding & Shipping Matrix
* **Formula:** As a **Store Partner**, I want to **register my storefront and configure flat domestic delivery rates in $ MXN**, so that **my catalog automatically lists accurate delivered prices to high-intent buyers**.
* **Acceptance Criteria:**
  1. Self-serve onboarding wizard (`/merchant/onboard`) to register store details and Google Shopping XML product feed URL.
  2. Shipping configuration panel (`/merchant/shipping`) allowing merchants to set flat delivery fees and free shipping thresholds in MXN.
  3. Diagnostics dashboard (`/merchant/diagnostics`) to monitor XML feed sync health.
* **Status:** **[COMPLETED & VERIFIED - Issue #64]**

### US-04: Platform Administration & Feed Verification Console
* **Formula:** As a **Platform Admin**, I want a **centralized control panel**, so that I can **verify newly registered Mexican stores and audit BGG metadata processing queues**.
* **Acceptance Criteria:**
  1. Admin console (`/admin/dashboard`) listing all store profiles with verification toggle actions.
  2. Queue monitor (`/admin/queue`) detailing pending or failed BGG EAN/barcode metadata resolutions.
* **Status:** **[COMPLETED & VERIFIED - Issue #68]**

---

## 3. Pruned Backlog & Deferred Epics (Ambitious Future Roadmap) 🚀

To maintain our lean commercial focus and eliminate UI/backend bloat, the following multi-market/complex features have been pruned from our initial commercial MVP and deferred to future expansion iterations:
* **Multi-Currency Foreign Exchange Engine:** Deferred until international shipping outside Mexico is launched.
* **Multi-Country Destination Selector:** Pruned in favor of static market lock (`México · $ MXN`).
* **Multi-Store Shopping Cart Optimizer:** Pruned in favor of direct item-level affiliate checkout links.
* **Wishlist & Email Price Drop Alerts:** Deferred to post-launch user retention sprints.
