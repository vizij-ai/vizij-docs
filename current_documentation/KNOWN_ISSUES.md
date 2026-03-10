# Known Issues
<!-- tags: type=issue-register; status=living; topics=known-issues,governance,quality -->

Last updated: 2026-03-10

This file tracks cross-repo issues that materially affect contributors or shared platform usage. It is not a replacement for repo-local bug trackers or detailed execution plans.

## Current Register

| Issue | Affects | Current state | Canonical detail |
| --- | --- | --- | --- |
| Documentation authority drift across repos and workspace notes | Contributor onboarding, roadmap reading, public-docs planning | Being addressed by the March 10 docs refresh. `vizij-docs` is being made explicit as the internal source of truth, while repo-local docs remain authoritative for implementation detail. | `project_documenting_guide.md`, `ARCHITECTURE.md`, repo `AGENTS.md` files |
| Some repo-local planning and overview docs lag the current code surface | Engineering contributors and externalization work | Still present. Always verify app/package/crate presence from manifests and README files before trusting local plan docs. | Repo manifests, repo READMEs, repo `AGENTS.md` files |
| Standalone/protocol surfaces are split across multiple implementation locations | Runtime, standalone app work, public explanation of the protocol stack | Current code spans `vizij-standalone`, `@vizij/arora-types`, Rust crates under `vizij-web/packages/arora-*`, and an additional `apps/vizij-ws-app` directory that is not part of the primary pnpm app map. Docs are being normalized, but the surface is still not fully unified. | `vizij-docs/active_projects/runtime/summary.md`, `standalone_ws-plan.md`, `vizij-web` manifests |
| Authoring workflow signoff is not fully complete | Shareable authoring flows, tutorial/workshop readiness | Repo-local authoring tracking still reports open follow-up work around dual-face perf/audit signoff and import reliability contracts. `vizij-docs` summarizes this, but detailed issue-level tracking remains local. | `vizij-web/apps/vizij-authoring/docs/plans/TRACKER.md`, `BACKLOG.md` |
| Tutorial and workshop content is split across internal, public, repo-local, and historical surfaces | Externalization, website docs, HRI tutorial/workshop materials | The chosen direction is to converge toward one curated public pipeline, but the content is not unified yet. Treat top-level `/docs` and `vizij-afternoon-workshop` as transitional for now. | `vizij-docs/current_documentation/ROADMAP.md`, website docs-strategy plan |

## Usage Notes

- Add an entry here only when the issue matters across repos or affects shared understanding.
- Keep repo-specific bug detail in the repo that owns the implementation.
- Remove or archive entries once the issue is resolved and no longer affects shared contributors.
