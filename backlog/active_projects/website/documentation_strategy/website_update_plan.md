# Vizij Site Structure, Tutorial Rebuild, and Interactive Lab Plan

## Summary

Rebuild the public Vizij site around a concept-first docs and tutorial system authored from scratch in `vizij-ai.github.io`, using the current `/demos` Astro-plus-React route pattern as the implementation model, but not reusing the rushed `vizij-web` demos/tutorials as canonical content.

The core rule is:

- current `vizij-web` apps are reference implementations and source material
- old `docs/tutorials/*` and `vizij-afternoon-workshop/*` are source material
- the public site gets new, higher-quality walkthroughs and docs written for the ideal future-facing Vizij story

The HRI tutorial schedule becomes the coverage checklist for phase 1, but not the naming scheme. Public pages should be titled by the tutorial we want people to learn, not by current app names.

The interactive-tutorial rule is:

- the site should support a small number of purpose-built runnable tutorial micro-labs
- tutorials remain walkthrough-first, not app-first
- `/demos/` remains the heavier experiential/demo surface
- we do not try to make every tutorial page a full runnable application

## Public Routes and Information Architecture

### 1. Site roles

Use these public surfaces:

- `/` = front door with product framing and routing
- `/demos/` = interactive experiential surface
- `/docs/` = stable conceptual/reference hub
- `/tutorials/` = canonical walkthrough hub
- `/software/vizij/` = metadata/detail page with CTA links, not the canonical docs home
- `/events/hri-2026-tutorial/` = event page only

Do not expose the orphaned showcase surface as a primary route in phase 1.

### 2. Homepage structure

Keep `/` compact, but make it do real narrative work.

Home should contain:

- a short statement of what Vizij is
- the motivation for Vizij
- the problem Vizij solves
- the solution framing for Vizij
- primary CTAs to `Docs`, `Tutorials`, and `Demos`
- secondary CTA to GitHub
- optional temporary secondary promotion for the HRI 2026 event while it is still upcoming

Homepage content model:

- Motivation:
  expressive, controllable robot faces matter for HRI, embodied AI, research, demos, education, and deployment
- Problem:
  current workflows for robot face design, rigging, animation, runtime control, and deployment are fragmented, brittle, and too hard to share or teach
- Solution:
  Vizij is an open ecosystem for designing, rigging, animating, integrating, and deploying rendered robot faces through a shared runtime and authoring model

Home should not become the full docs or tutorial experience, but it should clearly answer:
- why this matters
- what Vizij is
- what you can do next

### 3. Docs hub

Add these docs routes:

- `/docs/`
- `/docs/getting-started/`
- `/docs/architecture/`
- `/docs/renderer-data-model/`
- `/docs/rigging-and-control-model/`
- `/docs/animation-model/`
- `/docs/deployment-model/`

Docs are the stable mental-model/reference layer. They explain how Vizij works and link out to deeper repo-local references where needed.

### 4. Tutorial hub

Add these tutorial routes:

- `/tutorials/`
- `/tutorials/hello-face/`
- `/tutorials/renderer-data-model/`
- `/tutorials/authoring/`
- `/tutorials/rigging-and-control/`
- `/tutorials/minimal-player/`
- `/tutorials/animations/`
- `/tutorials/agent-face/`
- `/tutorials/deployment/`

The tutorial hub groups them into families for navigation and progression:

- Foundations: `Hello Face`, `Renderer Data Model`
- Authoring: `Authoring`, `Rigging and Control`
- Runtime: `Minimal Player`, `Animations`, `Agent Face`, `Deployment`

This satisfies the HRI requirement that each major tutorial topic gets its own walkthrough page, while keeping the public system organized around concept-first tutorial families.

### 5. HRI schedule mapping

Map the HRI schedule onto the public tutorial system like this:

- Tutorial Introduction -> `/tutorials/`
- Hello Face -> `/tutorials/hello-face/`
- Renderer Data Model -> `/tutorials/renderer-data-model/`
- Rigging -> `/tutorials/rigging-and-control/`
- Face Design and Control activity framing -> `/tutorials/authoring/`
- Now we are talking -> `/tutorials/agent-face/`
- Animations -> `/tutorials/animations/`
- Deployment -> `/tutorials/deployment/`

Do not create public pages for:

- technical support or exploration windows
- roadmap, research, and strategic-planning breakouts

Those remain event-only material.

## Interactive Tutorial Strategy

### 1. Principle

Interactive tutorial content should exist, but only where the interaction is the lesson.

The site should support runnable tutorial micro-labs, not embedded versions of full demo apps.

### 2. What a micro-lab is

A tutorial micro-lab is a small embedded interactive block that:

- teaches one concept
- uses one focused runtime setup
- has one clear success condition
- can be understood in one short interaction
- is framed as part of a walkthrough, not as a standalone app surface

### 3. What should get micro-labs in phase 1

Best candidates:

- `Hello Face`
- `Renderer Data Model`
- `Rigging and Control`
- `Animations`

These topics directly benefit from short runnable examples.

### 4. What should not get full embedded runnable labs in phase 1

These should remain walkthrough-first, with screenshots, diagrams, short previews, or links out where appropriate:

- `Authoring`
- `Minimal Player` as a complete product surface
- `Agent Face`
- `Deployment`

Those topics are broader, more workflow-heavy, or more integration-heavy, and would produce worse public docs if we tried to fully inline them.

### 5. Public-learning rule

Tutorials are narrative-first.
Micro-labs are supporting teaching instruments.
`/demos/` remains the primary heavier interactive surface.

## Implementation Changes

### 1. Page implementation pattern

Mirror the current `/demos` route architecture for all new docs and tutorial pages:

- one Astro route shell per page under `src/pages/...`
- one React page component per route under `src/react-pages/...`

Examples of the intended pattern:

- `src/pages/docs/index.astro` -> `src/react-pages/docs/DocsHubPage.tsx`
- `src/pages/tutorials/hello-face.astro` -> `src/react-pages/tutorials/HelloFacePage.tsx`

This keeps the site architecture consistent with the current local version and avoids inventing a second public-page pattern.

### 2. Content ownership inside the site repo

Do not put new docs/tutorial content under synced `src/content/`.

Use site-owned content adjacent to the React pages instead, for example:

- route component
- adjacent `copy.ts` or `content.ts` module
- shared guide-section components
- shared tutorial-lab components

This keeps docs/tutorial content safe from content-hub sync and makes the ownership split explicit.

### 3. Shared guide component system

Build a shared local guide-page system for both docs and tutorials.

Tutorial page template must include:

- title and learning outcome
- prerequisites
- what this walkthrough builds or proves
- step-by-step walkthrough
- validation checkpoint
- troubleshooting
- next step in the sequence
- “current reference implementation” note when code examples point to an existing app
- optional `micro-lab` section when the concept merits a runnable example

Docs page template must include:

- short summary
- why the concept matters
- mental model / system framing
- key concepts and contracts
- relationship to the tutorial sequence
- deeper reference link-outs

### 4. Tutorial-lab component system

Build a site-local tutorial-lab layer that is separate from the current showcase/demo page composition.

Implementation rule:

- use the same runtime foundations that already work in the site
- do not directly treat current demo sections as canonical tutorial content
- create new tutorial-specific wrappers with smaller scope and cleaner pedagogy

Likely building blocks:

- a minimal runtime wrapper built on the current `VizijRuntimeProvider` pattern
- a minimal face frame
- a minimal control panel or input control
- a validation/checkpoint UI
- lazy mounting based on section visibility to limit client/runtime cost

### 5. Runtime and asset strategy for labs

Tutorial labs should use:

- the smallest practical asset bundle
- the smallest practical runtime surface
- the fewest possible controls
- no external service dependency in phase 1

Do not build tutorial labs by embedding full authoring, agent, or deployment apps inside pages.

### 6. Content-writing rules

All phase-1 docs and tutorials must be written from scratch.

Allowed inputs:

- `docs/tutorials/robot-face-tutorial/*`
- `vizij-afternoon-workshop/*`
- `vizij-docs/*`
- current `vizij-web` apps and READMEs
- the HRI tutorial schedule and facilitator materials

Writing constraints:

- do not port old tutorial prose verbatim
- do not name public pages after current app names
- do not assume current demos are already good enough to be public walkthroughs
- use current apps only as reference implementations where they help explain the current code reality
- do not write tutorial pages as thin wrappers around existing demos

### 7. Tutorial content model

Each tutorial page should teach the ideal public concept first, then identify the current implementation surface second.

Examples:

- `Authoring` teaches the authoring workflow, while mentioning `vizij-authoring` only as the current implementation surface
- `Minimal Player` teaches the minimal playback/runtime surface, without presenting `demo-vizij-player` as the public product name
- `Agent Face` teaches real-time conversational integration as a public concept, even if current examples still draw from `tutorial-agent-face`

For runnable pages, the same rule applies:
- the lab teaches the public concept
- the current app or package is only the implementation note

### 8. Navigation and cross-linking

Update nav to:

- `Demos`
- `Docs`
- `Tutorials`
- `Events`

Update `/` so the main product-learning paths are `Docs`, `Tutorials`, and `Demos`.

Update `/demos/` so it links back into:

- `/docs/architecture/`
- `/docs/renderer-data-model/`
- relevant tutorial pages by concept, not by app-name branding

Update `/software/vizij/` through content-hub metadata so it points to:

- `documentation: /docs/`
- `demo: /demos/`
- `website: /tutorials/` or `/`

Update the HRI event entry so it points to:

- `/tutorials/`
- the relevant public tutorial pages

but keeps schedule, logistics, and event framing on the event page itself.

## Public Interfaces / Types

No code API changes are required.

Public-site interface changes are:

- new top-level docs and tutorials routes
- new nav structure
- new homepage framing around motivation, problem, and solution
- new canonical public learning contract centered on `/tutorials/`
- a new site-local tutorial-lab system for selected walkthrough pages
- `/software/vizij/` and the HRI event page become routing surfaces into the canonical public docs/tutorial system instead of acting like the docs system themselves

No content-schema changes are part of this plan. Reuse existing content-hub link fields and event body/actions.

## Test Plan

### 1. Route and build validation

Verify:

- all new routes build successfully
- nav dropdowns resolve correctly
- search indexes the new docs/tutorial pages
- no new pages live under synced `src/content/`

### 2. Journey validation

Confirm these journeys are clean:

- `/` -> motivation/problem/solution framing -> `Docs` / `Tutorials` / `Demos`
- `/` -> `/docs/` -> `/docs/getting-started/`
- `/` -> `/tutorials/` -> `/tutorials/hello-face/`
- `/tutorials/hello-face/` -> `/tutorials/renderer-data-model/`
- `/tutorials/authoring/` -> `/tutorials/rigging-and-control/`
- `/tutorials/minimal-player/` -> `/tutorials/animations/` -> `/tutorials/agent-face/` -> `/tutorials/deployment/`
- `/software/vizij/` -> canonical docs/tutorial/demo routes
- `/events/hri-2026-tutorial/` -> canonical tutorial routes

### 3. Interactive-lab validation

For each embedded lab, verify:

- it mounts cleanly as a React island
- it is lazy-activated when appropriate
- it uses the intended small asset/runtime setup
- it teaches one concept with one clear checkpoint
- it does not feel like a degraded copy of a bigger demo
- it degrades gracefully if the runtime or asset fails to load

### 4. Content-quality validation

For each tutorial page, verify:

- it can stand alone as a public walkthrough
- it assumes previous tutorials only where intended
- it is not written as a thin wrapper around a rushed app
- it has a clear checkpoint and next step
- it references current implementation surfaces only as implementation notes

### 5. Sync-safety validation

Confirm that:

- content-hub sync does not overwrite docs/tutorial pages
- event and software metadata still sync cleanly
- site-local docs/tutorial content remains isolated from shared-content sync

## Assumptions and Defaults

- The tutorial system is built from scratch; existing demos/tutorials are source material only.
- The public tutorial spine is organized by concept-first tutorial families, not by current app names.
- Stable concepts like Renderer Data Model get both a tutorial page and a docs reference page.
- Only selected tutorial pages get runnable micro-labs in phase 1.
- `/demos/` remains the primary heavy interactive surface.
- Roadmap and strategic-planning breakout material stays event-only in phase 1.
- Phase 1 does not migrate deep package-level reference docs onto the site.
- The current local `vizij-ai.github.io` architecture is the implementation base; stashed prior site changes are not assumed to be the right direction and should not be reapplied blindly.
