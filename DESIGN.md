# MeeplePrecios 🇲🇽 - Technical Design Document

## 🎨 Visual Design Tokens & UI Architecture
- **Base Background:** `Blanco roto` (`#F5F0E9`)
- **Headers / Dark UI:** `Carbón suave` (`#3A3A3A`)
- **Primary Accent / CTAs:** `Malva suave` (`#8367C7`)
- **Secondary Accent:** `Turquesa pastel` (`#73D8D4`)
- **Highlights:** `Coral deslavado` (`#FF9E8A`)

### UX & Accessibility Rules
1. **Google Sentence Case Governance:** All user-facing headings (`h1`, `h2`, `h3`), form labels, and buttons strictly use sentence case.
2. **Tactile Switch Standard:** All boolean toggles implement `role="switch"` and `aria-checked`.
3. **Explicit Edition Badges:** Offers clearly display `Español (ES)`, `Inglés (EN)`, and `Multilingüe (MULTI)`.
4. **3-Part Delivered Price Calculation:** $\text{Base Price} + \text{Shipping} = \text{Total Cost (\$ MXN)}$.

---

## 🗄️ Database Tables & Schemas
1. `public.stores`
2. `public.shipping_rates`
3. `public.bgg_games_cache` (Legacy cache layer)
4. `public.internal_games` (Master internal game catalog - BGG independent, stores media/box art directly from XML feeds) [US-15]
5. `public.game_barcodes`
6. `public.merchant_product_mappings`
7. `public.store_games`
8. `public.clicks`
9. `public.feed_item_queue` (Multi-candidate staging queue with store/admin RLS isolation) [US-18, US-19]

---

## ⚙️ 4-Tier Matching Engine Math, Classifiers & Staging Thresholds
- **Automated Non-Game Classifier (US-16):** Filters out sleeves (`fundas`), playmats, dice, and TCG booster packs prior to matching.
- **Base Game vs. Expansion Classifier (US-17):** Categorizes valid feed items into `boardgame` or `expansion` and binds expansions to `parent_game_id`.
- **Tier 1:** GTIN/EAN Barcode Matcher ($1.00$ confidence)
- **Tier 2:** Merchant SKU Memory Matcher ($1.00$ confidence)
- **Tier 3:** Tokenized Fuzzy Matcher:
  - Composite Score Math: $(0.5 \times \text{JaroWinkler}) + (0.3 \times \text{TokenOverlap}) + (0.2 \times \text{Levenshtein})$
  - Auto-publish threshold: $\text{score} \ge 0.92$
  - Staging queue routing: $\text{score} < 0.92$ (Generates top 5 candidate suggestions in `suggested_candidates`)
- **Tier 4:** Multi-Tenant Staging Queue Authorization (US-19):
  - Stores access strictly their own queue items (`WHERE store_id = auth.jwt() -> store_id`).
  - Admins access cross-store queue items (`WHERE role = 'admin'`).
