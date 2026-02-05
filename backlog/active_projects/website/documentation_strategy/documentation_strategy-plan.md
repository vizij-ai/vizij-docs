# Documentation Strategy & Content – Plan & Tracking
<!-- tags: status=planning; topics=documentation,website,content-strategy -->

> **Related documents:** [Project summary](../summary.md)

## Objective & Scope

Establish a coherent documentation strategy for Vizij that bridges `vizij-docs`, `vizij-rs`, `vizij-web`, and the external website. This plan focuses on defining what documentation we need, where it lives, and how it will be surfaced to users, without committing to specific website implementation details.

## Plan

### 1. Define documentation audiences and goals

1.1 Identify primary audiences:
- [ ] Enumerate main reader types:
    - Engine/runtime developers.
    - Tooling/authoring developers.
    - End users/animators.
    - External integrators.

1.2 Map goals for each audience:
- [ ] For each audience, write down:
    - What they need to accomplish (e.g., “Integrate Vizij into a React app”).
    - Which repositories and docs they should start from.

### 2. Inventory and classify existing docs

2.1 Collect existing documentation:
- [ ] From `vizij-docs`:
    - `current_documentation` (ARCHITECTURE, ROADMAP, DECISIONS, etc.).
    - `active_projects` proposals/plans/references for key pillars.
- [ ] From `vizij-rs` and `vizij-web`:
    - Top-level READMEs.
    - Package/crate-level READMEs.

2.2 Classify docs:
- [ ] Tag each doc as:
    - Reference (low-level detail, stable).
    - Guide (task-oriented).
    - Conceptual/architecture.

### 3. Define the docs pipeline at a conceptual level

3.1 Decide what flows to the website:
- [ ] Identify which docs should be:
    - Consumed directly from `vizij-docs` (e.g., high-level architecture).
    - Generated from code (`cargo doc`, TypeDoc).
    - Authored primarily in the website repo (e.g., marketing/landing content).

3.2 Sketch pipeline stages:
- [ ] Describe, at a high level:
    - How architectural docs from `vizij-docs` will be exported/linked.
    - Where code-generated API docs will live.
    - How we might link back to internal references when needed.

### 4. Seed key guides for `vizij-web` and `vizij-rs`

4.1 Authoring guides:
- [ ] Create or refine guides in `vizij-docs` for:
    - `vizij-web/apps/vizij-authoring` workflows (empty states, badges, derived inputs, import-only flows).
    - Basic troubleshooting topics outlined in `vizij-web/apps/vizij-authoring/AGENTS.md`.

4.2 Runtime guides:
- [ ] Create or refine guides describing:
    - The Node Graph IR, compiler, and registry.
    - How `vizij-rs` and `vizij-web` interact via `@vizij/*-wasm`.

### 5. Design versioning and release-note practices

5.1 Versioning approach:
- [ ] Propose how documentation should handle:
    - Multiple API/ABI versions.
    - Breaking changes and migration paths.

5.2 Release notes:
- [ ] Define the structure for release notes in `vizij-docs/current_documentation/release_notes` and how they should be summarized on the website.

## Acceptance Criteria (Overall)

- Documentation audiences and goals are clearly defined.
- Existing docs are inventoried and classified.
- A conceptual docs pipeline is described, even if not yet implemented in CI or the website.
- Key guides for Authoring and Runtime exist and can be used as seed content for the external website.
