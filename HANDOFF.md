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
- **Active Sprint Task:** Ready for Sprint 1 (Ground-Up Bootstrap & Supabase PostgreSQL Migration DDL).
- **Testing & Verification Gate:** Documentation verified and cross-referenced; zero broken schema dependencies.
- **Clear Next Steps:**
  1. Initialize Next.js 15+ project structure, Tailwind CSS v4, and TypeScript configuration.
  2. Author Supabase SQL migration (`supabase/migrations/20260715000000_initial_schema.sql`) implementing the 10 unified production tables and RLS policies.
  3. Author TDD unit tests for 4-tier similarity scoring and title sanitization.
