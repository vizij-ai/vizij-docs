# Vizij Docs Agent Guide

Short note giving coding agents the essentials for `vizij_docs`. Keep using `project_documenting_guide.md`, subfolder READMEs, and project-specific docs as the deeper source of truth; this file only orients you quickly.

## Quick-Start Checklist
- **Context First**: Before starting any task, read:
    - `vizij_docs/project_documenting_guide.md` (Structure & Standards)
    - `vizij_docs/current_documentation/ARCHITECTURE.md` (System Context)
    - `vizij_docs/current_documentation/ROADMAP.md` (Strategic Alignment)
- **Real-Time Updates**:
    - **During Work**: Mark tasks as completed in the project's `*-plan.md` *as you finish them*.
    - **End of Work**: Update the plan with the correct next steps and update the pillar's `summary.md` with the new status.
- Re-read `project_documenting_guide.md` each rotation to stay aligned with the proposal/plan/reference contract.
- When editing or adding docs, mirror the status-tag + related-docs header pattern from a nearby file.
- Keep every project `summary.md` synchronized with its proposal/plan/reference set before closing a task.
- Use `rg -n "<term>" vizij_docs` to find prior art instead of recreating sections.
- If you skip validation (spell-check, link-check, preview), state that in your hand-off.

## Directory Map
- `current_documentation/` – Canonical cross-team references (`ARCHITECTURE.md`, `DECISIONS.md`, `ROADMAP.md`, `KNOWN_ISSUES.md`). Changes here often need a Slack announcement.
- `current_documentation/release_notes/` – One Markdown file per tagged release. Append; never rewrite history.
- `active_projects/` – Houses pillar folders (e.g., `authoring/`), each containing a `summary.md` and project subfolders (e.g., `authoring/modular_pose_rig/`). Each project subfolder contains the proposal/plan/reference triplet.
- `archive/` – Frozen history. Note where any borrowed text now lives.
- `project_documenting_guide.md` – Playbook for naming, tags, and maintenance. Link it whenever you teach others to contribute.

## Document Families & Status Tags
Each active pillar maintains three sibling docs plus a summary entry:
- **Proposal (`status=proposal`)** – Problem, goals, strawman architecture. Freeze after approval and log the decision.
- **Plan & Tracking (`status=tracking` → `status=reference` when wrapped)** – Day-to-day execution view with owners, workstreams, and next steps.
- **Reference (`status=reference`)** – Final description of the shipped system with usage and maintenance notes.
- **Summary (`summary.md`)** – Folder index with status, latest updates, open risks, and links to every pillar doc.

Implementation notes:
- Place the HTML tag comment immediately after `# Title`, e.g., `<!-- tags: status=proposal; topics=graph-ir,authoring -->`.
- Keep the related-docs blockquote (`> **Related documents:** ...`) so readers can jump between files.
- When deprecating a document, switch the tag to `status=completed-archival`, explain the replacement, and update the summary entry.

## Editing Workflow
1. **Clarify scope** – Decide whether the change belongs in `current_documentation`, an existing project folder, or a new pillar; default to the active plan when unsure.
2. **Sync summaries** – Touch `summary.md` before shipping proposal/plan/reference updates so chips and links stay aligned.
3. **Track decisions** – Capture irreversible calls in `current_documentation/DECISIONS.md` (or link an ADR) and cross-link from the affected doc.
4. **Note follow-ups** – Use TODO/TBD sparingly and always point to the issue tracker, PR, or owner.
5. **Archive responsibly** – After a project ships, copy durable knowledge into the reference doc, flip the plan’s status tag, and move stale planning files into `archive/`.

## Common Contribution Types
- **New Project** – Create a new folder `active_projects/<pillar>/<project>/`, add `<project>-(proposal|plan|reference).md`, seed the pillar's `summary.md` entry, and drop TODO placeholders.
- **Status refresh** – Update progress tables, badges, and risks inside plan docs; reflect the same status in the pillar's `summary.md`.
- **Reference drift fix** – When implementation changes land in `vizij-rs` or `vizij-web`, mirror the API/ABI updates here (architecture doc + relevant references).
- **Release prep** – Append the latest shipped items to `current_documentation/release_notes/<version>.md` and link the related proposal/plan.
- **Backfilling history** – When migrating notes from `archive/`, keep the provenance (e.g., `> Moved from archive/FRAMEWORK.md on 2025-05-12`) for audits.

## Quality Bar & Tools
- Keep prose tight and action-oriented; prefer explicit dates (e.g., `2025-11-07`) over “today/yesterday.”
- Use fenced code blocks for commands (`bash`/`pnpm`/`cargo`) and tables for multi-column comparisons.
- Run `markdownlint` or editor spell-check when you can; if not, call that out.
- Confirm cross-repo references (`vizij-rs/`, `vizij-web/`) so readers know what to inspect next.
- PR descriptions should list which docs changed, why, and any follow-ups (summary edits, link-checks, screenshot refreshes).

Keeping to this guide ensures `vizij_docs` stays trustworthy and other repositories can rely on it as the shared source of truth.
