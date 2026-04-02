<!-- tags: family=reference; type=agent-guide; topics=documentation,agents,governance -->
> **Last updated:** 2026-04-02

# Vizij Docs Agent Guide

This file is the operating brief for coding agents working in `vizij-docs`.

For the full repo governance model, source-of-truth boundaries, and metadata family rules, see [current_documentation/REPO_GOVERNANCE.md](current_documentation/REPO_GOVERNANCE.md).

## Read First

1. [Repo Governance](current_documentation/REPO_GOVERNANCE.md)
2. [Architecture](current_documentation/ARCHITECTURE.md)
3. [Roadmap](current_documentation/ROADMAP.md)
4. [Decisions](current_documentation/DECISIONS.md)
5. [Project Documentation Guide](project_documenting_guide.md) when touching project docs

## Operating Rules

1. Verify the current code and repo state before trusting older plans or summaries.
2. Treat repo-local docs as the detailed implementation source when they are more current than `vizij-docs`.
3. Update the relevant `summary.md` whenever project state changes.
4. Update `ARCHITECTURE.md`, `ROADMAP.md`, `DECISIONS.md`, `KNOWN_ISSUES.md`, or `release_notes/` when the change is cross-repo, strategic, or sticky.
5. Do not duplicate repo-local execution trackers here when a short authority note and link will do.
6. Fix broken maintained-doc links in any file you touch.

## Pre-Edit Checklist

1. Read [current_documentation/REPO_GOVERNANCE.md](current_documentation/REPO_GOVERNANCE.md) first for placement, authority, and anti-drift rules.
2. Do not create a second maintained source for a concept, terminology set, quick-reference list, or example family that already has a canonical home.
3. When changing reused terminology, examples, or policy statements, grep maintained docs and normalize dependent surfaces in the same change.
4. Keep summaries as summaries: verified state, dependencies, and tracker pointers rather than local copies of roadmap framing or repo-local trackers.
5. Run the maintained-doc validators after structural, terminology, or link-bearing edits.

## Common Edit Targets

- `current_documentation/` for canonical current references and guidebook-owned source material
- `active_projects/` for active project docs and active pillar summaries
- `backlog/` for deferred work and deferred proposals
- `workshops/` for live workshop creation material
- `archive/` for historical or superseded docs

## Validation

Run these after structural, terminology, or link-bearing doc changes:

- `node scripts/validate_doc_tags.mjs`
- `node scripts/validate_markdown_links.mjs`
- `node scripts/validate_standard_path_examples.mjs`

If you skip validation, say so explicitly.
