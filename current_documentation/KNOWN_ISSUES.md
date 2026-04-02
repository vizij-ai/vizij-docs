# Known Issues
<!-- tags: family=reference; type=issue-register; topics=known-issues,governance,quality -->

> **Last updated:** 2026-03-31

This file tracks cross-repo issues that materially affect contributors or shared platform usage. It is not a replacement for repo-local bug trackers or detailed execution plans.

## Current Register

| Issue | Affects | Current state | Canonical detail |
| --- | --- | --- | --- |
| Documentation authority drift across repos and workspace notes | Contributor onboarding, roadmap reading, public-docs planning | Being addressed through the March 2026 docs refreshes and roadmap rewrite. `vizij-docs` is the internal source of truth, while repo-local docs remain authoritative for implementation detail. Some older backlog summaries and guide pages still need periodic drift cleanup as the new roadmap framing propagates. | `project_documenting_guide.md`, `ARCHITECTURE.md`, repo `AGENTS.md` files |
| Some repo-local planning and overview docs lag the current code surface | Engineering contributors and externalization work | Still present. Always verify app/package/crate presence from manifests and README files before trusting local plan docs. | Repo manifests, repo READMEs, repo `AGENTS.md` files |
| Standalone/protocol surfaces are split across multiple implementation locations | Runtime, standalone app work, public explanation of the protocol stack | Current code spans `vizij-standalone`, `@vizij/arora-types`, and Rust crates under `vizij-web/packages/arora-*`. Some older docs still mention the former `vizij-ws-app` surface, but that should now be treated as historical. Docs are being normalized, and the surface is still not fully unified. | `vizij-docs/active_projects/runtime/summary.md`, `standalone_ws-plan.md`, `vizij-web` manifests |
| Authoring workflow signoff is not fully complete | Shareable authoring flows, tutorial/workshop readiness | Repo-local authoring tracking still reports open follow-up work around dual-face perf/audit signoff and import reliability contracts. `vizij-docs` summarizes this, but detailed issue-level tracking remains local. | `vizij-web/apps/vizij-authoring/docs/plans/TRACKER.md`, `BACKLOG.md` |
| Tutorial and workshop content is split across internal, public, repo-local, and historical surfaces | Externalization, website docs, HRI tutorial/workshop materials | The chosen direction is to converge toward one curated public pipeline, but the content is not unified yet. Treat top-level `/docs` and `vizij-afternoon-workshop` as transitional for now. | `vizij-docs/current_documentation/ROADMAP.md`, website docs-strategy plan |
| Workflow lock-in and acceptance coverage are still incomplete across the maintained public path | Public tutorials/examples, authoring confidence, deployment/operator trust | The roadmap now treats workflow lock-in as a cross-cutting hardening lane. Playwright and related validation should protect the maintained authoring and deployment flows, plus public examples/tutorials that are presented as canonical. Coverage is still partial and should be prioritized where drift would be visible to first-time users or operators. | `vizij-docs/current_documentation/ROADMAP.md`, `active_projects/code_quality/summary.md`, repo-local test plans |

## Usage Notes

- Add an entry here only when the issue matters across repos or affects shared understanding.
- Keep repo-specific bug detail in the repo that owns the implementation.
- Remove or archive entries once the issue is resolved and no longer affects shared contributors.
