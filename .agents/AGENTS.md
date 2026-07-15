# Workspace Agent Rules & Guidelines: MeeplePrecios 🇲🇽

## MANDATORY AGENT PRIMITIVES & CONSTRAINTS

> [!CAUTION]
> **STRICT LEGACY DIRECTORY ISOLATION MANDATE:**
> AI agents MUST NOT inspect, read, search (`grep`, `view_file`, `list_dir`), copy, import, or peek into the `legacy/` directory under ANY circumstances. The `legacy/` folder is strictly quarantined and off-limits. All functional requirements, database DDL scripts, RLS policies, algorithms, API contracts, design system tokens, and acceptance criteria MUST be derived exclusively from `MASTER_SPECIFICATION.md` at the root of the workspace.

---

## 1. Ground-Up Execution Rules
1. **Single Source of Truth:** `MASTER_SPECIFICATION.md` is the sole specification for all features, schemas, and UI design rules.
2. **Implementation Autonomy:** Agents have complete freedom to choose framework abstractions, file structures, and component modularity when building from scratch.
3. **Google Sentence Case Governance:** All user-facing titles, headings (`h1`, `h2`, `h3`), table labels, and action buttons MUST strictly use sentence case.
4. **Test-Driven Verification:** Always run unit tests (`npm run test`) and full verification gates (`npm run verify`) before submitting changes.
