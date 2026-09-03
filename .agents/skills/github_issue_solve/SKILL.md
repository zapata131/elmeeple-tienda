---
name: github_issue_solve
description: "Automated workflow for analyzing a GitHub issue, assigning the assignee, setting up the feature branch, planning the TDD execution, and commenting the plan on the issue."
---

# GitHub Issue Solve Skill: Backlog Initialization and Branching

This skill is automatically loaded to guide the **Architect** and **Builder** through the initialization phase of resolving a GitHub issue. It enforces backlog hygiene, automated branch isolation, and TDD planning.

---

## 1. Trigger
Use this skill whenever the user requests to:
*   "Work on US-XX" or "solve US-XX" (referencing canonical user stories `US-01` through `US-26` from `MASTER_SPECIFICATION.md`)
*   "Create a new feature for Y" or "fix bug Z" (mapping it to the canonical User Story index)

---

## 2. Step-by-Step Workflow

### Step 2.1: Canonical User Story Identification and Analysis
1.  **Identify the Canonical User Story ID (`$US_ID`)**:
    *   Locate the canonical story index (`US-01` through `US-26`) in `MASTER_SPECIFICATION.md`.
    *   Assign it to `$US_ID` (e.g., `us-02`).
2.  **Validate the Agile User Story & Single-Persona Mandate**:
    *   Trigger the `backlog_auditor` check: verify that the user story serves a single persona using the syntax: `As a [Role], I want [Feature], so that [Benefit]`.
3.  **Backlog / GitHub Issue Linkage**:
    *   If syncing with GitHub issues, always tag the canonical User Story in the title:
        ```bash
        gh issue create --title "feat(us-02): hero comparative price table" --body "Canonical User Story: US-02 in MASTER_SPECIFICATION.md" --label "enhancement"
        ```

### Step 2.2: Branch Isolation
1.  **Sync Workspace with Remote Main**:
    *   `git checkout main`
    *   `git pull origin main`
2.  **Formulate the Canonical Branch Name**:
    *   Branch format: `feature/us-$NUM-$SHORT_TITLE` (for features) or `fix/us-$NUM-$SHORT_TITLE` (for fixes).
    *   Example: `feature/us-02-hero-comparative-ui`.
3.  **Checkout the Feature Branch**:
    *   Verify if the branch already exists locally: `git branch --list "*us-$NUM*"`
    *   If it exists, check it out: `git checkout [branch-name]`
    *   If not, create and switch to it: `git checkout -b feature/us-$NUM-$SHORT_TITLE`

### Step 2.3: TDD Planning and Task Documentation
1.  **Research the Codebase**: Map the affected files and dependencies using codebase tools.
2.  **Formulate a Step-by-Step Plan**: Outline a plan that prioritizes **strict Test-Driven Development (TDD)**:
    *   Define the exact Vitest or Playwright tests that will be written *first*.
    *   Specify the implementation files to create or modify.
    *   Include post-flight documentation updates (`HANDOFF.md`, `DESIGN.md`).
3.  **Publish the Plan**: Document the plan before writing production code:
    ```markdown
    ### 🚀 Plan de ejecución (TDD)
    * **Historia de Usuario:** US-XX
    * **Rama:** `feature/us-$NUM-$SHORT_TITLE`
    * **Pruebas (TDD):** [Lista de pruebas a escribir primero]
    * **Implementación:** [Lista de archivos a modificar]
    ```
