# Project Documentation Guide

> This guide defines how documentation is organized inside `vizij-docs` and how it relates to repo-local docs, the public website, assets, and transitional workspace notes.

## 1. Source of Truth Model

Always verify against the current code surface first: workspace manifests, `package.json`, `Cargo.toml`, active README files, and real app/package presence are the primary evidence. Repo-local planning docs are useful, but they can drift.

| Surface | Canonical For | Not Canonical For |
| --- | --- | --- |
| `vizij-docs` | Cross-repo architecture, roadmap framing, lifecycle status, decisions, known issues, release-note policy, pillar summaries | Repo-specific implementation detail or local operating procedures |
| `vizij-rs` / `vizij-web` repo-local docs | Implementation contracts, package/app/crate workflows, detailed feature trackers, operator runbooks | Cross-repo strategic truth or public-facing narrative |
| `vizij-ai.github.io` | Curated public docs, tutorials, showcases, external-facing narrative | Internal planning or detailed execution tracking |
| `vizij-assets` | Binary source of truth for meshes, rigs, and graph assets | Architectural narrative or provenance explanations |
| top-level `/docs` and `vizij-afternoon-workshop` | Transitional or historical material unless explicitly reactivated | Canonical internal or public documentation |

### Cross-repo rule

If a repo-local doc owns the implementation detail for an area, `vizij-docs` should summarize it and link down to it rather than duplicate the whole tracker.

There is one important exception for learner-facing guidebook modules:

- guidebook tutorials, walkthroughs, and operational pages must be self-sufficient enough that a reader can complete the route without being forced back into repo-local docs for every execution step
- that means `vizij-docs/current_documentation/guidebook` may restate the exact commands, file touchpoints, runtime states, validation checks, and small code excerpts needed to teach the maintained path clearly
- the repo-local docs still remain authoritative for low-level implementation truth, detailed package contracts, and fast-moving local workflow notes
- when guidebook pages restate implementation detail, they should do it to teach the route end to end, not to recreate repo-local trackers wholesale

Current example:

- `vizij-web/apps/vizij-authoring/docs` is authoritative for detailed authoring execution tracking.
- `vizij-docs/active_projects/authoring/summary.md` is authoritative for the cross-repo summary, strategic framing, and links to related work.

## 2. Document System

The lifecycle system in `vizij-docs` has two axes:

1. **Document family** describes what kind of project doc it is.
2. **Lifecycle status** describes where that work is in its lifecycle.

This applies to project docs under `active_projects/`, `backlog/`, and `archive/`. Living docs under `current_documentation/` are handled separately.

### Document Families

| Family | Purpose | Typical file name |
| --- | --- | --- |
| `proposal` | Problem statement, goals, scope, and high-level direction before work starts | `<project>-proposal.md` |
| `plan` | Sequencing, work breakdown, status notes, and immediate next steps once work is scoped | `<project>-plan.md` |
| `reference` | Stable explanation of the delivered or accepted system for future readers | `<project>-reference.md` |
| `summary` | Pillar or program-level index that links related work and gives the current cross-repo view | `summary.md` |

### Lifecycle Statuses

Use these statuses consistently in tags, headings, and summary tables:

| Status | Meaning |
| --- | --- |
| `proposed` | Discovery or intake stage; not yet accepted into scheduled work |
| `planned` | Approved/scoped, but not yet actively underway |
| `in_progress` | Active work or active summary of ongoing work |
| `blocked` | Work exists but cannot currently move without another decision/dependency |
| `done` | Completed and stable enough to summarize without active execution tracking |
| `archived` | Historical, superseded, or intentionally retired |

Legacy tags such as `tracking`, `draft`, `planning`, and `backlog` still exist in older docs. Do not normalize the whole repo at once during unrelated work, but any touched docs should move to the current system.

### Tag Header Pattern

For project docs, use both family and lifecycle state in the tag comment:

```markdown
<!-- tags: type=plan; status=in_progress; topics=authoring,workflow -->
```

For living docs in `current_documentation/`, use a purpose-specific `type` and `status=living`:

```markdown
<!-- tags: type=architecture; status=living; topics=architecture,repo-map -->
```

Immediately below the tag comment, keep a short related-docs block when sibling docs exist.

## 3. Directory Structure and Transition Rules

| Path | Meaning |
| --- | --- |
| `current_documentation/` | Canonical living references: architecture, roadmap, decisions, known issues, release-note policy, workshops, and concepts |
| `active_projects/<pillar>/` | Work that is currently active or currently summarized as active |
| `backlog/backlog_proposals/` | Intake proposals and exploratory concepts not yet accepted into execution |
| `backlog/active_projects/<pillar>/` | Approved/scoped backlog work that is not yet active |
| `archive/` | Historical or superseded material |

### Transition Rules

1. New work starts in `backlog/backlog_proposals/` unless it is already accepted and scoped.
2. Approved but not-yet-active work lives in `backlog/active_projects/<pillar>/`.
3. Once work is truly active, move or summarize it under `active_projects/<pillar>/`.
4. When a project becomes stable or historical, move it to `archive/` and update any summaries that point to it.
5. The later comprehensive roadmap review is where broad promotion/demotion/backlog reshuffling should happen. A normal docs refresh should not silently perform that whole portfolio move unless explicitly asked.

## 4. Working With Repo-Local Docs

Repo-local docs can be more detailed and more current than `vizij-docs` for local execution. When that happens:

1. verify the code surface first
2. treat the repo-local docs as implementation-detail evidence
3. update `vizij-docs` with the cross-repo summary and authority note
4. link to the detailed local docs instead of copying their whole tracker

### Guidebook-first teaching rule

When the guidebook is the intended reader-facing learning route, do not hide critical teaching detail behind repo-local links.

For guidebook tutorial-class pages, include:

1. exact starting state and working directory
2. exact commands to run
3. exact app, file, or UI surface being touched
4. expected runtime or UI state after each meaningful step
5. a compact code or config excerpt when implementation shape matters
6. a concrete success check
7. the next route step and the implementation anchors for deeper truth

Use repo-local docs to support that teaching flow, not to replace it.

Examples:

- `vizij-web/apps/vizij-authoring/docs/*` for detailed authoring execution tracking
- crate/package/app READMEs in `vizij-rs` and `vizij-web` for implementation workflows

## 5. Living Documentation in `current_documentation/`

These docs are not project triads. They are living program references and should stay concise and stable:

- `ARCHITECTURE.md` — internal repo map and system boundaries
- `ROADMAP.md` — current strategic ordering and high-level priorities
- `DECISIONS.md` — irreversible or sticky decisions
- `KNOWN_ISSUES.md` — cross-repo issue register
- `release_notes/` — outward-facing change summaries and release-note policy

Public-facing documentation is curated from these sources into `vizij-ai.github.io`; it is not mirrored automatically.

## 6. Minimal Templates

### Proposal

1. Summary
2. Context / problem
3. Goals and non-goals
4. Proposed direction
5. Risks / unknowns
6. Acceptance or success criteria

### Plan

1. Objective and scope
2. Current state
3. Planned phases or workstreams
4. Current blockers / risks
5. Acceptance criteria

### Reference

1. Summary
2. How the system works
3. Key decisions and trade-offs
4. Usage / maintenance guidance
5. Related docs

### Summary

1. Goals
2. Authority note
3. Linked project docs
4. Current verified state
5. Near-term focus
6. Deferred or later review notes when relevant

## 7. Maintenance Checklist

1. Verify current code and workspace reality before editing strategic docs.
2. Update the relevant pillar `summary.md` whenever project state changes.
3. Update `ARCHITECTURE.md`, `ROADMAP.md`, `DECISIONS.md`, or `KNOWN_ISSUES.md` when the change is cross-repo or irreversible.
4. Keep public-docs implications in mind, but only move content into `vizij-ai.github.io` when it is ready for curated external use.
5. If you touch transitional surfaces (`/docs`, workshop packs, one-off plans), either classify them clearly or point readers to the canonical location.
