# Workspace Agent Rules & Guidelines: MeeplePrecios 🇲🇽

## MANDATORY AGENT PRIMITIVES & CONSTRAINTS

> [!CAUTION]
> **STRICT LEGACY DIRECTORY & DEPRECATED GITHUB ISSUE ISOLATION MANDATE:**
> 1. AI agents MUST NOT inspect, read, search (`grep`, `view_file`, `list_dir`), copy, import, or peek into the `legacy/` directory under ANY circumstances. The `legacy/` folder is strictly quarantined and off-limits.
> 2. All previous GitHub issue numbers (e.g. Issues #1 through #209) are DEPRECATED and MUST NOT be referenced, reused, or cited. Features MUST be referenced exclusively by the canonical User Story index (`US-01` through `US-14`) defined in `MASTER_SPECIFICATION.md`.

---

## 1. Ground-Up Execution Rules
1. **Single Source of Truth:** `MASTER_SPECIFICATION.md` is the sole specification for all features, schemas, and UI design rules.
2. **Canonical User Story Branch Naming:** Create feature branches using canonical User Story tags (`feature/us-01-homepage-search`, `feature/us-02-hero-comparative-ui`, etc.).
3. **Implementation Autonomy:** Agents have complete freedom to choose framework abstractions, file structures, and component modularity when building from scratch.
4. **Google Sentence Case Governance:** All user-facing titles, headings (`h1`, `h2`, `h3`), table labels, and action buttons MUST strictly use sentence case.
5. **Test-Driven Verification:** Always run unit tests (`npm run test`) and full verification gates (`npm run verify`) before submitting changes.

---

## 2. Workspace Skills Invocation Directives (`.agents/skills/`)

When performing specialized tasks, agents MUST check and follow the instructions in the corresponding `SKILL.md` file using `view_file`:

### 1. `backlog_auditor` (`.agents/skills/backlog_auditor/SKILL.md`)
- **When to trigger:** Automatically when reviewing user requirements, planning sprint backlogs, or creating user stories.
- **Directives:** Enforce the Atomic User Story Mandate (Single Persona, Single Feature, Testable Acceptance Criteria) and the Three-Point Compliance Filter against `MASTER_SPECIFICATION.md` (US-01 through US-14).

### 2. `github_issue_solve` (`.agents/skills/github_issue_solve/SKILL.md`)
- **When to trigger:** When starting work on a new feature.
- **Directives:** Analyze the canonical user story, create an isolated feature branch (`feature/us-<num>-<title>`), and draft a step-by-step TDD plan before writing code.

### 3. `ux_expert` (`.agents/skills/ux_expert/SKILL.md`)
- **When to trigger:** When creating, editing, or auditing user interface components, pages, or styling.
- **Directives:** Audit layouts against cognitive psychology laws, enforce Google sentence case, verify tactile switch components (`role="switch"`), and strictly apply MeeplePrecios brand visual tokens (`Blanco roto #F5F0E9`, `Carbón #3A3A3A`, `Malva #8367C7`, `Turquesa #73D8D4`, `Coral #FF9E8A`).

### 4. `github_issue_complete` (`.agents/skills/github_issue_complete/SKILL.md`)
- **When to trigger:** When finishing work on a feature or preparing a pull request.
- **Directives:** Execute the verification gate (`npm run verify`), commit with conventional commits, push to GitHub, open a PR linking the canonical user story, update handoffs, and merge into `main`.

### 5. `document_sync` (`.agents/skills/document_sync/SKILL.md`)
- **When to trigger:** After merging features or refactoring codebase architecture.
- **Directives:** Synchronize all living documentation (`HANDOFF.md`, `DESIGN.md`, `AGENTS.md`, and `MASTER_SPECIFICATION.md`) to ensure technical schemas and sprint progress never go stale.

---

## 3. Subagent Personas & Operating Roles

When delegating tasks or operating in subagent mode, adhere strictly to the following 4 personas:

1. **The Architect:** Drafts TDD execution plans and feature breakdowns against `MASTER_SPECIFICATION.md`. Does NOT write production code directly.
2. **The UX Expert:** Audits layouts, typography, Google sentence case, and tactile switch accessibility using `.agents/skills/ux_expert/SKILL.md`.
3. **The Builder:** Writes tests first (TDD), implements minimal production code on isolated feature branches (`feature/us-<num>-<title>`).
4. **The Reviewer:** Runs `npm run verify` and Playwright E2E suites, opens PRs (`gh pr create`), and merges into `main` (`gh pr merge`).

---

## 4. Critical Engineering Directives

1. **Test-Driven Development (TDD):** Write unit tests in `src/__tests__/` BEFORE writing production implementation code. Never write production code without a failing test first.
2. **Database Write Sequence Integrity:** Always flush new parent game entries to `bgg_games_cache` *before* inserting dependent child rows into `store_games` to avoid foreign key violations.
3. **Buffered Batch Upserts:** Execute database write operations in memory buffers of up to 500 records rather than individual SQL queries in large loops.
4. **Offline & Rate-Limit Fallbacks:** Ensure queries and parsers fall back gracefully to local disk cache or mock catalog when third-party API fetches fail or return status 429 rate limits.

---

## 5. DevTools for Agents Testing Directives (`chrome-devtools`)

1. **Live Browser Testing:** Use `browser_subagent` or `chrome-devtools` MCP tools (`navigate_page`, `click`, `type_text`, `take_screenshot`, `list_console_messages`, `list_network_requests`) to visually and interactively audit all user journeys on `http://localhost:3001`.
2. **NPM Registry Policy:** Always use `https://registry.npmjs.org/` for all npm operations to avoid HTTP 403 errors with `chrome-devtools-mcp`.
3. **Visual & Console Audit Gate:** Before completing features, capture page screenshots, verify responsive layout rendering, and inspect `list_console_messages` to guarantee zero uncaught React hydration warnings or JS console errors.
