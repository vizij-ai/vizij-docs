<!-- tags: family=reference; type=governance; topics=documentation,governance,metadata,authority -->
> **Last updated:** 2026-04-02

# Vizij Docs Repo Governance

This document is the canonical shared-governance reference for `vizij-docs`.

Use it for:

- source-of-truth boundaries
- audience and surface boundaries
- high-level repo structure roles
- metadata family rules
- the role of `current_documentation/`, `active_projects/`, `backlog/`, `workshops/`, and `archive/`

Use [project_documenting_guide.md](../project_documenting_guide.md) for project-doc workflow. Use [README.md](../README.md) for the human repo introduction and [AGENTS.md](../AGENTS.md) for the coding-agent operating guide.

## Source Of Truth Model

Always verify against the current code surface first: workspace manifests, `package.json`, `Cargo.toml`, active README files, and real app/package presence are the primary evidence.

| Surface | Canonical For | Not Canonical For |
| --- | --- | --- |
| `vizij-docs` | Cross-repo architecture, roadmap framing, lifecycle status, decisions, known issues, release-note policy, and project summaries | Repo-specific implementation detail or local operating procedures |
| repo-local docs in `vizij-rs` and `vizij-web` | Implementation contracts, package/app/crate workflows, detailed feature trackers, and local runbooks | Cross-repo strategic truth or public-facing narrative |
| `vizij-ai.github.io` | Curated public docs, tutorials, showcases, and external-facing narrative | Internal planning or detailed execution tracking |
| `vizij-assets` | Binary source of truth for meshes, rigs, and graph assets | Architectural narrative or documentation policy |
| top-level `/docs` and legacy workshop material | Transitional or historical material unless explicitly reactivated | Canonical internal or public documentation |

## Audience Boundaries

- `README.md` is the human developer entry point.
- `AGENTS.md` is the coding-agent operating brief.
- `project_documenting_guide.md` covers how project docs are created and maintained.
- `current_documentation/guidebook/` is learner-facing source material for downstream public docs and tutorial routes.
- repo-local docs remain authoritative when a reader needs low-level implementation detail or local operating steps.

## Repository Structure Roles

- `current_documentation/`
  - canonical maintained references and guidebook source material
- `current_documentation/operations/`
  - operational references such as publishing, automation, and doc-ops guidance that belong in the maintained current-doc shelf
- `active_projects/`
  - active pillar summaries and active project docs
- `backlog/`
  - deferred work organized by topic area
- `workshops/`
  - live workshop creation instructions and templates
- `archive/`
  - historical or superseded material

## Metadata Families

Maintained docs use a family-based metadata model. Every maintained markdown doc should have:

- `family=`
- `type=`
- `topics=`

Every maintained markdown doc should also include a standardized header date line near the top:

`> **Last updated:** YYYY-MM-DD`

This rule applies to all maintained markdown in repo scope. Archive material is historical and is not required to follow the maintained-doc header convention.

Family-specific state fields vary by audience and document role:

| Family | Used For | State Model |
| --- | --- | --- |
| `project` | active and deferred project work | `project_status=` |
| `guidebook` | guidebook modules and guidebook-owned support/projection pages | `editorial_status=` and `publication_status=` |
| `reference` | canonical current docs outside guidebook and workshops | no status field by default |
| `workshop` | workshop creation docs, templates, production material, and evidence | `workshop_kind=` and `workshop_status=` |

Detailed project-doc workflow lives in [project_documenting_guide.md](../project_documenting_guide.md).

## Placement Rules

1. Put canonical current references in `current_documentation/`.
2. Put operational references that support publishing, automation, or doc-ops under `current_documentation/operations/`.
3. Put active project work in `active_projects/`.
4. Put deferred project work in `backlog/`.
5. Put live workshop creation material in `workshops/`.
6. Move historical or superseded material into `archive/`.

## Working Rule

When repo-local docs own the detailed implementation truth for an area, `vizij-docs` should summarize that state and link down to the local detail instead of duplicating the whole tracker.
