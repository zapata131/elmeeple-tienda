# Handoff Sprint Memo: MeeplePrecios (Milestone 10: Affiliate Click & Analytics Dashboard Active)

This memo summarizes the architectural planning and active execution of **Milestone 10 / US-10 (Issue #46): Affiliate Click and Analytics Dashboard for Store Partners** on the board game price comparison platform across the Iberian Peninsula (Spain, Portugal) and Latin America.

---

## 1. Repository & Branch Details
*   **GitHub Repository:** [zapata131/elmeeple-tienda](https://github.com/zapata131/elmeeple-tienda)
*   **Active Branch:** `feature/issue-46-affiliate-analytics-dashboard`
*   **Active Issue:** Issue #46 (`[US-10] Affiliate Click and Analytics Dashboard for Store Partners`)
*   **Queued Issue:** Issue #47 (`[US-37] Complete System-Wide Emoji Eradication across Admin, Merchant, and Catalog UI`)
*   **Planned Files for Modification:**
    *   [src/app/api/redirect/route.ts](file:///Users/joseluiszapata/Documents/GitHub/elmeeple-stores/src/app/api/redirect/route.ts): Update handler to automatically inject `ref=meepleprecios&utm_source=meepleprecios&utm_medium=affiliate` into any target `store_product_url` before executing the 302 redirect.
    *   [src/components/CartOptimizerPanel.tsx](file:///Users/joseluiszapata/Documents/GitHub/elmeeple-stores/src/components/CartOptimizerPanel.tsx): Upgrade store breakdown items to include direct purchase/redirect links (`Ir a comprar`) appending affiliate parameters.
    *   [src/app/merchant/dashboard/page.tsx](file:///Users/joseluiszapata/Documents/GitHub/elmeeple-stores/src/app/merchant/dashboard/page.tsx): Server component updates to aggregate referral clicks by date and by game (`bgg_id`), computing top referred board games and CTR metrics.
    *   `src/components/MerchantAnalyticsCharts.tsx`: New client component rendering responsive daily/weekly click charts and UTM link reconciliation instructions (`?ref=meepleprecios&utm_source=meepleprecios&utm_medium=affiliate`) with zero raw unicode emojis.
    *   [src/__tests__/clicks.test.tsx](file:///Users/joseluiszapata/Documents/GitHub/elmeeple-stores/src/__tests__/clicks.test.tsx), `src/__tests__/merchant_analytics_dashboard.test.tsx`: Comprehensive TDD unit and integration test suites validating automated UTM injection, charts, top game tables, UTM guides, and zero emoji leakage.
    *   `e2e/merchant_analytics.spec.ts`: Playwright E2E walkthrough suite verifying merchant dashboard analytics and redirect tracking across desktop (`1280x800`) and mobile (`375x667`) viewports.

---

## 2. Milestone and Task Progress

### Milestone 1 to Milestone 9: MVP Core Platform & UX/UI Refinements [100% COMPLETED]
*   [x] Predictive autocomplete search (`US-01`, `US-19`), game catalog filters (`US-04`), multi-game cart optimizer (`US-17`, `US-23`), regional shipping matrices (`US-03`, `US-08`), background XML feed sync & diagnostics (`US-09`, `US-12`, `US-14`), BGG metadata resolution (`US-15`, `US-16`), restock alerts (`US-24`), store reviews & vibe badges (`US-22`), foreign exchange rate caching (`US-13`), multi-region mock data seeding (`US-26`), navbar identity (`US-30`), layout SEO targeting (`US-31`), regional domestic tactile switches (`US-32`), edition language badges (`US-33`), system-wide emoji eradication (`US-34`), BGG wishlist sync (`US-35`), and consolidated regional toggles (`US-36`).

### Milestone 10: Merchant Affiliate Analytics & System-Wide Emoji Eradication [IN PROGRESS]
*   [ ] **US-10 (Issue #46) Affiliate Click and Analytics Dashboard & UTM Injection:**
    *   [ ] Update TDD suite `src/__tests__/clicks.test.tsx` and create `src/__tests__/merchant_analytics_dashboard.test.tsx` asserting automated injection of `ref=meepleprecios&utm_source=meepleprecios&utm_medium=affiliate` on 302 redirects and buy buttons.
    *   [ ] Implement dynamic UTM parameter injection in `/api/redirect/route.ts` and buy links in `CartOptimizerPanel.tsx`.
    *   [ ] Implement `MerchantAnalyticsCharts.tsx` and integrate into `/merchant/dashboard`.
    *   [ ] Verify across serial Jest suites and Playwright E2E tests.
*   [ ] **US-37 (Issue #47) Complete System-Wide Emoji Eradication:** Queued sequentially after Issue #46 completion.

---

## 2. Milestone and Task Progress

### Milestone 1 to Milestone 9: MVP Core Platform & UX/UI Refinements [100% COMPLETED]
*   [x] Predictive autocomplete search (`US-01`, `US-19`), game catalog filters (`US-04`), multi-game cart optimizer (`US-17`, `US-23`), regional shipping matrices (`US-03`, `US-08`), background XML feed sync & diagnostics (`US-09`, `US-12`, `US-14`), BGG metadata resolution (`US-15`, `US-16`), restock alerts (`US-24`), store reviews & vibe badges (`US-22`), foreign exchange rate caching (`US-13`), multi-region mock data seeding (`US-26`), navbar identity (`US-30`), layout SEO targeting (`US-31`), regional domestic tactile switches (`US-32`), edition language badges (`US-33`), and system-wide emoji eradication (`US-34`).
*   [x] **US-35 (Issue #42):** BGG Wishlist Synchronization & Discount Alerts Removal (Merged PR #43).
*   [x] **US-36 (Issue #44):** Consolidate Regional Domestic Store Toggles in Catalog and Comparison UI (Merged PR #45).

---

## 3. Four-Tier Test Suite Status
*   **Tier 1 & 2 Unit/Integration Tests (Jest):** 100% green in serial mode (`npm run test -- --runInBand --forceExit`: 35 suites, 115 tests passed).
*   **Tier 3 Live Browser Audits (DevTools for Agents):** Visual layouts, zero emoji compliance, and BGG sync workflows verified on live browser instances.
*   **Tier 4 Automated Replay Scripts (Playwright CLI):** E2E walkthrough suites (`npm run test:e2e`) passing 100% cleanly across desktop and mobile viewports.
*   **Full Verification Gate (`npm run verify`):** 100% clean build, zero TypeScript errors, and zero linting violations.

---

## 4. GitHub Issues Published (https://github.com/zapata131/elmeeple-tienda/issues)
*   `#1` to `#26` [US-01 to US-26: MVP Core Platform & Services] [COMPLETED]
*   `#33` to `#37` [US-30 to US-34: UX & UI Sprint Bundle] [COMPLETED]
*   `#42` [US-35: BGG Wishlist Synchronization & Discount Alerts Removal](https://github.com/zapata131/elmeeple-tienda/issues/42) [COMPLETED]
*   `#44` [US-36: Consolidate Regional Domestic Store Toggles in Catalog and Comparison UI](https://github.com/zapata131/elmeeple-tienda/issues/44) [COMPLETED]
*   `#46` [US-10: Affiliate Click and Analytics Dashboard for Store Partners](https://github.com/zapata131/elmeeple-tienda/issues/46) [IN PROGRESS]
*   `#47` [US-37: Complete System-Wide Emoji Eradication across Admin, Merchant, and Catalog UI](https://github.com/zapata131/elmeeple-tienda/issues/47) [QUEUED]

---

## 5. Next Steps
1.  **UX Expert Gate:** Review copy, typography, and SVG vector layout for `MerchantAnalyticsCharts.tsx` on `/merchant/dashboard`.
2.  **Builder Gate:** Write `src/__tests__/merchant_analytics_dashboard.test.tsx` first (TDD), implement component and query aggregations, verify with `npm run test -- --runInBand --forceExit` and `npm run verify`.
