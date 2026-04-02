<!-- tags: family=reference; type=guide; topics=projects,workflow,metadata,governance -->
> **Last updated:** 2026-04-02

# Project Documentation Guide

This guide defines how to create, place, and maintain project-family docs in `vizij-docs`.

It is for:

- proposals
- plans
- project references
- project summaries

It is not the full repo-governance document. For source-of-truth boundaries, repo structure roles, and the family-wide metadata model, see [current_documentation/REPO_GOVERNANCE.md](current_documentation/REPO_GOVERNANCE.md).

## 1. Project Doc Set

Project work is typically represented through some combination of:

- `proposal`
- `plan`
- `reference`
- `summary`

Not every project needs every file immediately, but the relationship between the existing files should be explicit.

Use a related-docs block directly below the tag comment when sibling docs or a parent summary exist.

Example:

```markdown
<!-- tags: family=project; type=plan; project_status=tracking; topics=authoring,workflow -->
> **Related documents:** Proposal (`feature-proposal.md`) · Reference (not yet written) · Authoring Summary (`../summary.md`)
```

If a sibling doc does not exist yet, say so plainly instead of linking to a missing file.

## 2. Metadata For Project Docs

Project docs use:

- `family=project`
- a role-specific `type=`
- `project_status=`
- `topics=`

Allowed `project_status=` values:

| Status | Meaning |
| --- | --- |
| `proposal` | discovery or intake stage before scoped execution |
| `planning` | accepted work that is being shaped or queued |
| `tracking` | active work or active summary of ongoing work |
| `blocked` | real work exists but cannot currently progress |
| `completed` | delivered and stable enough to summarize as complete |
| `archived` | historical, superseded, or intentionally retired |

Example:

```markdown
<!-- tags: family=project; type=proposal; project_status=proposal; topics=runtime,operator -->
```

## 3. Placement And Transitions

Use these locations for project-family docs:

- `backlog/<topic>/proposals/`
  - deferred intake and exploratory proposals
- `backlog/<topic>/`
  - accepted but not-yet-active deferred initiatives
- `active_projects/<pillar>/`
  - active work and active pillar summaries
- `archive/`
  - historical or superseded project material

Transition rules:

1. New deferred ideas usually start in `backlog/<topic>/proposals/`.
2. Accepted but still deferred work moves into the owning `backlog/<topic>/` area.
3. Once work is truly active, move or summarize it under `active_projects/<pillar>/`.
4. When a project becomes historical or is intentionally retired, move it to `archive/` and update any active summaries that point to it.

## 4. Summaries

Each active or deferred topic should have a `summary.md` that does three jobs:

1. state the goals of the area,
2. summarize verified current state,
3. link to the relevant project docs.

Summaries should stay brief. If a repo-local tracker is the detailed source of truth, summarize it here and link down instead of copying the full tracker.


## 5. Working With Non-Project Families

This guide does not define the full rules for `guidebook`, `reference`, or `workshop` families.

The only project-facing rule you usually need is:

- project docs may link to canonical references, guidebook material, workshop templates, or archive content when those surfaces provide context or downstream outputs

For the broader family model and placement rules, use [current_documentation/REPO_GOVERNANCE.md](current_documentation/REPO_GOVERNANCE.md).


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

1. Verify current code and repo reality before editing strategic project docs.
2. Update the relevant `summary.md` whenever project state changes.
3. Fix broken related-doc blocks or stale maintained-doc links in any file you touch.
4. Prefer concise cross-repo summaries and authority notes over duplicated local trackers.
