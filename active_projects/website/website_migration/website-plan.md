# Website Migration & Ecosystem Plan
<!-- tags: status=planning; topics=website,migration,cms,documentation -->

> **Related documents:** [Project summary](../summary.md)

## Goal

Prepare for the separation of the website repository (`vizij_website` or external equivalent) while keeping work here aligned with the external owner’s stack and constraints. This plan focuses on the parts we can define now (content, structure, and integration points) without over-specifying the implementation details of the external repo.

## Plan

### 1. Inventory and categorize existing public-facing assets

1.1 Inventory demos and examples:
- [ ] Review apps under `vizij-web/apps` and identify which ones are:
    - Primarily for internal QA/smoke testing.
    - Suitable as public-facing demos/tutorials (e.g., `demo-vizij-player`, `tutorial-*`).

1.2 Inventory documentation sources:
- [ ] List key docs from:
    - `vizij_docs` (architecture, roadmap, active_projects).
    - `vizij-rs` and `vizij-web` READMEs and package-level docs.

Acceptance criteria:
- A short list exists that tags each app/doc as “internal only”, “candidate for website”, or “shared”.

### 2. Define desired website sections and content ownership

2.1 Outline website IA (information architecture):
- [ ] Draft a simple structure (e.g., Home, Learn, Docs, Showcase), mapping:
    - Which existing demos/docs should appear where.
    - Which sections will be primarily maintained in `vizij_docs` vs in the website repo.

2.2 Clarify ownership boundaries:
- [ ] For each section, note:
    - What content is authored in `vizij_docs` vs the external website repo.
    - How updates are expected to flow (e.g., docs exported from `vizij_docs`, links back to internal docs).

Acceptance criteria:
- A one-page outline of website sections and which content comes from where.

### 3. Specify integration points for docs and demos (without implementing them)

3.1 Docs integration:
- [ ] Define, at a high level:
    - Which `vizij_docs` directories or files should be synchronized to the website (e.g., `current_documentation`, selected references).
    - How versioning should be represented (e.g., per-release snapshots or latest-only).

3.2 Demo integration:
- [ ] Identify:
    - Which `vizij-web` demos should be embedded as live players vs linked to as separate apps.
    - What kind of “Vizij Player” component the website will need (inputs/props, API surface), leaving implementation details to the external owner.

Acceptance criteria:
- A short list of integration points (paths and expectations) that can be shared with the external website implementer.

### 4. Coordinate with external website implementation

4.1 Capture external constraints:
- [ ] Once the external website stack/owner is known, document:
    - The chosen framework (e.g., Next.js).
    - Any constraints on how docs/demos must be provided (e.g., MDX, JSON APIs).

4.2 Align this plan with external work:
- [ ] Update this plan’s integration points and IA to reflect the external repo’s real capabilities and preferences.

Acceptance criteria:
- This plan reflects actual external decisions (once made) and clearly shows where Vizij repos plug into the website.

## Acceptance Criteria (Overall)

- We have a clear inventory of which demos and docs should appear on the public site.
- The desired high-level structure of the website and content ownership boundaries are documented.
- Integration points (docs and demos) are specified enough that an external website owner can implement them when ready, without blocking current Vizij development.
