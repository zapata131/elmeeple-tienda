---
name: backlog_auditor
description: "Automatically triggers when reviewing open GitHub issues, planning sprint backlogs, or decomposing user requirements. Enforces the Atomic User Story Mandate and Three-Point Compliance Filter."
---

# Skill: Backlog Auditor & Hygiene Gatekeeper

When invoked or triggered during issue creation and triage, execute this workflow:
1. **Fetch & Parse:** Dump all active backlog items via `gh issue list --state open --json number,title,body,labels` or parse local tracking documents.
2. **Filter & Evaluate:** Check each item against:
   - *Persona Atomicity:* Does it serve exactly one role?
   - *Scope Atomicity:* Is it a single, independently testable feature?
   - *Syntax Compliance:* Does it strictly follow `As a [Role], I want [Action], so that [Benefit]`?
3. **Remediate:** Automatically split compound issues, decompose omnibus features into single-component tasks, and transform engineering chores into developer stories.
