---
name: github_issue_complete
description: "Automated workflow for validating the codebase via unit and E2E tests, committing, pushing, opening a Pull Request linking the issue, updating handoffs, and merging into main."
---

# GitHub Issue Complete Skill: Verification, PR Creation, and Merging

This skill is automatically loaded to guide the **Builder** and **Reviewer** through the completion phase of a feature or bug fix. It enforces our four-tier testing standards, documentation synchronization, and Pull Request automation.

---

## 1. Trigger
Use this skill whenever:
*   The implementation is complete and ready for QA review.
*   You want to open a Pull Request and merge the branch into `main`.

---

## 2. Step-by-Step Workflow

### Step 2.1: Four-Tier Verification Gate
Before committing any code, you must execute and pass the following quality gates:
1.  **Full Project Verification**: Run our comprehensive verify script (lint, build, unit/integration tests):
    ```bash
    npm run verify
    ```
2.  **System & E2E Walkthroughs (Visual QA)**:
    *   Verify browser flows or execute automated Playwright replay scripts:
        ```bash
        npm run test:e2e
        ```
    *   Verify that the browser console is completely free of runtime errors or unhandled promise rejections.

### Step 2.2: Documentation Synchronization (Mandatory Post-Flight)
You must keep our technical documentation updated in real-time by invoking the `document_sync` protocol:
1.  **HANDOFF.md**: Update the sprint memo with completed files, active branch, test status, and clear next steps.
2.  **DESIGN.md**: Document any architectural changes, schema additions, visual tokens, or technical design decisions.
3.  **AGENTS.md**: Record any new development conventions, AI personas, or engineering learnings.

### Step 2.3: Stage, Commit, and Push
1.  **Stage All Changes**: Include code, tests, and updated documentation:
    ```bash
    git add .
    ```
2.  **Formulate a Conventional Commit Message**:
    *   Use conventional commit syntax (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`).
    *   Include the canonical user story tag (e.g. `us-02`) in the commit scope.
    *   Example commit message:
        ```bash
        git commit -m "feat(us-02): implement 3-part delivered cost table on game detail page"
        ```
3.  **Push to Remote**: Push the branch to the origin repository:
    ```bash
    git push -u origin [current-branch-name]
    ```

### Step 2.4: Pull Request Automation
1.  **Create the Pull Request**: Use the `gh` CLI to open a Pull Request against `main`:
    ```bash
    gh pr create --title "feat: brief title matching style guide" --body "### Descripción
    Resolves #$ISSUE_NUMBER. Briefly describe what this PR changes.

    ### Pruebas realizadas
    * Full verification (npm run verify): 100% green.
    * Unit & Integration tests (Jest): Passed.
    * E2E walkthrough (Playwright / DevTools): Verified."
    ```
2.  **Comment on the GitHub Issue**: Update the issue thread to link the PR and notify stakeholders.

### Step 2.5: Merging into Main
Once the Pull Request is approved by the **Reviewer**:
1.  **Checkout and Pull Main**:
    ```bash
    git checkout main
    git pull origin main
    ```
2.  **Merge the Feature Branch**:
    ```bash
    git merge [feature-branch-name]
    ```
3.  **Push to Remote Main**:
    ```bash
    git push origin main
    ```
4.  **Cleanup Local Branch**:
    ```bash
    git branch -d [feature-branch-name]
    ```
