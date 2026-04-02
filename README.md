<!-- tags: family=reference; type=repo-overview; topics=documentation,governance,repo-map -->
> **Last updated:** 2026-04-02

# Vizij Docs

`vizij-docs` is the canonical internal cross-repo documentation layer for the Vizij workspace.

Use this repo for:

- cross-repo architecture and roadmap framing
- canonical current references such as decisions, known issues, and release-note policy
- active and deferred project summaries
- workshop creation material and archived historical docs

For the shared governance model, source-of-truth boundaries, and metadata family rules, see [REPO_GOVERNANCE.md](current_documentation/REPO_GOVERNANCE.md).

## Start Here

- [Repo Governance](current_documentation/REPO_GOVERNANCE.md)
- [Architecture](current_documentation/ARCHITECTURE.md)
- [Roadmap](current_documentation/ROADMAP.md)
- [Project Documentation Guide](project_documenting_guide.md)
- [Agent Guide](AGENTS.md)

## Directory Overview

- `current_documentation/` — canonical maintained references and guidebook source material
- `active_projects/` — active pillar summaries and active project docs
- `backlog/` — deferred work by topic area
- `workshops/` — live workshop creation instructions and templates
- `archive/` — historical or superseded material

## For Human Contributors

- Start with the governance, architecture, and roadmap docs before editing summaries or strategy pages.
- Update the relevant `summary.md` when project state changes in a meaningful way.
- Prefer short cross-repo summaries here and link down to repo-local implementation docs when they are the detailed source of truth.
- Treat delivered workshop packages as archive material, not live canonical docs.
