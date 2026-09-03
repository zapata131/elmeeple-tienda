# MeeplePrecios 🇲🇽 - Sprint Handoff Memo

## 📍 Current Status Summary
- **Active Branch:** `main`
- **Specification Audit, Tech Stack & Modern Web Standards Codification:** COMPLETED.
  - **Lean Full-Stack TypeScript Tech Stack Codified:** Unified on Next.js 15+ (App Router, React 19, TypeScript), Supabase (PostgreSQL 15+, `pg_trgm`, RLS), Tailwind CSS v4, Vitest, Playwright, and Chrome DevTools MCP. Eliminates multi-service fragmentation, Docker overhead, and API serialization layers.
  - **Modern Web Guidance Standards Codified:**
    1. *Native View Transitions API:* `document.startViewTransition()` with `view-transition-name: game-hero-art` for cross-page box art morphing without external animation dependencies.
    2. *Sub-Second LCP & Resource Prioritization:* Next.js Image with `fetchpriority="high"`, AVIF/WebP negotiation, and native `loading="lazy"`.
    3. *Native HTML Overlays:* HTML `<dialog>` with `.showModal()` and native `popover` API for zero-dependency modals and filter dropdowns.
    4. *Self-Adaptive Container Queries:* CSS `@container` queries and `:has()` for responsive 3-part price comparison cards.
    5. *Modern Form Standards:* `:user-valid` pseudo-classes, `inputmode="numeric"`, and accessible switches (`role="switch"`).
  - **Schema Divergence Reconciled:** All documentation uniformly defines the canonical 10-table architecture centered on `public.catalog_games` (UUID PK, `slug` UK, optional indexed `bgg_id`) and `public.store_offers`.
  - **3-Party Adversarial Consensus Codified:** Integrated autonomous catalog law, cursor chunking ingestion, non-blocking stale price shield, localized trigram aliases, and zero-friction merchant promo codes.
- **Master Documentation:** 100% SYNCHRONIZED & MONOLITHIC.
  - [`MASTER_SPECIFICATION.md`](file:///Users/joseluiszapata/Documents/GitHub/elmeeple-stores/MASTER_SPECIFICATION.md)
  - [`DESIGN.md`](file:///Users/joseluiszapata/Documents/GitHub/elmeeple-stores/DESIGN.md)
  - [`GROUND_UP_REBUILD_BLUEPRINT.md`](file:///Users/joseluiszapata/Documents/GitHub/elmeeple-stores/GROUND_UP_REBUILD_BLUEPRINT.md)
  - [`COMPLETE_GROUND_UP_SPECIFICATION.md`](file:///Users/joseluiszapata/Documents/GitHub/elmeeple-stores/COMPLETE_GROUND_UP_SPECIFICATION.md)
  - [`README.md`](file:///Users/joseluiszapata/Documents/GitHub/elmeeple-stores/README.md)
- **Active Sprint Task:** Clean Slate Verified & Remote Database Reset Completed.
  - **Remote Database Reset:** Executed [`supabase/migrations/20260715000000_initial_schema.sql`](file:///Users/joseluiszapata/Documents/GitHub/elmeeple-stores/supabase/migrations/20260715000000_initial_schema.sql) remotely, establishing the 10 canonical tables, trigram indexes, and RLS policies on a completely clean database instance.
  - **Local Clean Slate:** Working tree is 100% clean with specifications, agent guidelines, migration DDL, and tracked [`.env.example`](file:///Users/joseluiszapata/Documents/GitHub/elmeeple-stores/.env.example).
- **Testing & Verification Gate:** Documentation verified and cross-referenced; database schemas and contracts aligned 100% with `MASTER_SPECIFICATION.md`.
- **Clear Next Steps:**
  1. Add project credentials into local `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
  2. Initialize Next.js 15+ App Router dependencies in `package.json` (`next`, `react`, `react-dom`, `@supabase/supabase-js`, `tailwindcss`, `vitest`, `@playwright/test`).
  3. Setup `tsconfig.json`, `next.config.mjs`, `postcss.config.mjs`, and Tailwind CSS v4 tokens.
  4. Author initial TDD unit tests for title sanitization and 4-tier waterfall matching engine math.
