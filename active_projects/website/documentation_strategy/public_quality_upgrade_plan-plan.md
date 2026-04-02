<!-- tags: family=project; type=plan; project_status=proposal; topics=website,documentation,writing,design,quality -->

> **Related documents:** [Website & Ecosystem summary](../summary.md) · [Documentation Strategy & Content - Plan & Tracking](documentation_strategy-plan.md) · [Public Quality and Design Audit](public_quality_and_design_audit-reference.md) · [Public Teaching Gap Audit](public_teaching_gap_audit-reference.md) · [Public Page Teaching Sourcebook](public_page_content_brief-reference.md)
>
> **Last updated:** 2026-03-31
> **Scope:** Another order-of-magnitude improvement pass for `vizij-ai.github.io` public docs, tutorials, and demos

# Public Quality Upgrade Plan

## 1. Goal

Move the Vizij public site from:

> good, code-grounded documentation with some strong standout pages

to:

> a distinctive, deeply legible public documentation system where the user can understand the platform, choose the right path, build confidently, and visually parse complex ideas without feeling either under-taught or over-instructed.

This plan assumes the current content model is directionally correct but not yet sufficient.

The next jump should come from improving:

1. documentation architecture,
2. writing discipline,
3. visual explanation design,
4. demo pedagogy,
5. content operations and maintenance.

## 2. Design Principles for the Next Pass

These are the working rules derived from Diátaxis, GitHub Docs, Google, Microsoft, GOV.UK, and Carbon.

### 2.1 One page, one job

Every route should primarily do one of the following:

1. orient,
2. explain,
3. help the user do something,
4. provide reference,
5. help the user inspect a live behavior.

If a page does more than one, the page should visibly privilege one of them.

### 2.2 The first screen should answer the reader's decision question

The opening of each page should tell the user:

1. whether this is the right page,
2. what artifact or decision they will leave with,
3. what they need before they begin.

### 2.3 Visuals must reduce cognitive load

Diagrams, screenshots, and callouts should not merely make the page feel finished. They must remove inference.

If a visual does not make the page easier to understand or use, it should not be there.

### 2.4 Text and visuals should have parity

The essential meaning should never live only in a screenshot, diagram, or live demo. Every visual needs:

1. a caption,
2. context,
3. matching text explanation.

### 2.5 Use concrete artifacts as the unit of explanation

Whenever possible, explain the system through:

1. a bundled GLB,
2. a control message,
3. a path family,
4. a clip,
5. a runtime provider,
6. a deployed operator flow.

Readers retain artifacts better than abstractions.

### 2.6 Design for comparison, not just sequence

Many Vizij concepts become clear only when two things are compared:

1. standard vs `/propsrig`,
2. clip vs tween,
3. browser vs standalone,
4. authored preview vs runtime validation,
5. demo surface vs tutorial surface.

The site needs more comparison structures and fewer isolated paragraphs.

### 2.7 Make the happy path and failure path equally legible

A page is not complete when the reader can do the thing once. It is complete when they can tell what failed and where to look next.

## 3. Target Quality Bar by Page Type

### 3.1 Hub Pages

Each hub page should:

1. branch the user by goal,
2. explain the difference between nearby page types,
3. show the maintained path at a glance,
4. preview the artifacts produced by the routes underneath it.

### 3.2 Explanation Pages

Each explanation page should include:

1. one core system diagram,
2. one canonical example,
3. one comparison structure,
4. one “how to think about this” model,
5. links to the exact workflow page that operationalizes the concept.

### 3.3 Workflow Pages

Each workflow page should include:

1. prerequisites,
2. a concrete end artifact,
3. ordered steps,
4. runnable code or commands,
5. verification,
6. troubleshooting,
7. screenshots when the user is interacting with a UI,
8. a clear next route.

### 3.4 Demo Pages

Each demo section should include:

1. what the user is seeing,
2. what state or path changes drive it,
3. what package or app it maps to,
4. where to go to reproduce it.

## 4. Workstreams

### 4.1 Workstream A: Tighten the Information Architecture

### Objective

Make the site's page types feel unmistakable.

### Deliverables

1. A documented page-type contract for:
   - hub,
   - explanation,
   - workflow,
   - demo,
   - reference-heavy hybrid pages if any remain
2. A top-level golden-path diagram reused across hub pages
3. A route-role chip or badge system that tells the user whether a page is:
   - concept,
   - workflow,
   - live demo,
   - implementation reference

### Why this matters

This is the structural precondition for every other improvement.

### 4.2 Workstream B: Build a Stronger Visual Explanation System

### Objective

Upgrade the site from “clean panels” to “purpose-built explanatory graphics.”

### Deliverables

1. Diagram patterns:
   - lifecycle diagram,
   - layer stack,
   - control hierarchy,
   - deployment split,
   - integration pipeline,
   - decision tree
2. Screenshot patterns:
   - full UI screenshot with caption,
   - annotated screenshot with numbered callouts,
   - before/after state pair,
   - failure-state screenshot where relevant
3. Comparison components:
   - two-column tradeoff table,
   - “use this when / use that when” split,
   - “what changes / what stays stable” table
4. Timeline component for animation and agent-state flows

### Priority pages

1. `/docs/renderer-data-model/`
2. `/docs/rigging-and-control-model/`
3. `/docs/animation-model/`
4. `/docs/deployment-model/`
5. `/tutorials/agent-face/`
6. `/tutorials/deployment/`

### Why this matters

This is the fastest path to a step-change in perceived and actual documentation quality.

### 4.3 Workstream C: Raise Weaker Workflow Pages to the Authoring/Animations Bar

### Objective

Make every workflow page feel as operationally complete as the current strongest pages.

### Deliverables by route

1. `/tutorials/rigging-and-control/`
   - add one authored example face and show portable vs face-specific controls side by side
   - include one annotated control mapping visual
   - include one runtime validation loop
2. `/tutorials/minimal-player/`
   - add one healthy runtime screenshot
   - add one app anatomy diagram
   - add one “do not add this yet” comparison card
3. `/tutorials/agent-face/`
   - add a live integration diagram for speech, visemes, gaze, emotion, and transcript state
   - document disconnected, missing-key, and no-mic states explicitly
   - add a stepwise runbook from env setup to first connected session
4. `/tutorials/deployment/`
   - split build, launch, connect, and recover into clearly separate stages
   - add operator screenshots or a flow diagram
   - compare browser and standalone deployment modes directly

### Why this matters

These pages are now the main drag on overall route consistency.

### 4.4 Workstream D: Turn Demos into Inspectable Technical Surfaces

### Objective

Keep the demos delightful, but make them legible enough that advanced users can inspect what they are observing.

### Deliverables

1. A compact “What is happening here” module under each demo section
2. Optional overlays or companion cards showing:
   - canonical path families,
   - runtime hooks,
   - relevant app or package,
   - dependencies
3. A stronger route bridge:
   - observe,
   - inspect,
   - reproduce
4. Better distinction between:
   - passive showcase,
   - inspectable behavior,
   - production pattern

### Why this matters

The demos page is a powerful entry surface. It should not stop at persuasion.

### 4.5 Workstream E: Strengthen the Writing System

### Objective

Make the site's prose consistently direct, confident, and reader-centered.

### Deliverables

1. A local Vizij writing guide derived from the external standards
2. Rewrite rules for:
   - removing throat-clearing,
   - front-loading the user's decision,
   - collapsing repetitive “this page covers” language,
   - improving section headings so they say what the user gets
3. A terminology sheet for:
   - bundle,
   - face,
   - provider,
   - standard paths,
   - `/propsrig`,
   - clip,
   - pose weight,
   - standalone,
   - operator flow

### Why this matters

The site will feel much more professional once the writing system is explicit instead of implicit.

### 4.6 Workstream F: Improve the Website Content Model and Components

### Objective

Give the content team better primitives so every improvement does not require custom layout work.

### Likely component additions

1. Comparison table component
2. Annotated screenshot component
3. Decision tree component
4. Timeline component
5. “Healthy state / failure state” dual card
6. Artifact checklist card
7. Dependency badge strip
8. Reproduction bridge component for demos

### Likely content-model additions

1. `comparisons`
2. `timelines`
3. `annotatedImages`
4. `statePairs`
5. `decisionTrees`
6. `artifactChecks`

### Relevant implementation surfaces

1. `vizij-ai.github.io/src/site-content/vizij/teaching.ts`
2. `vizij-ai.github.io/src/components/guides/GuidePage.tsx`
3. `vizij-ai.github.io/src/components/guides/HubPage.tsx`
4. demo-specific page components and lab wrappers

### 4.7 Workstream G: Add Documentation Operations and Quality Gates

### Objective

Keep the content aligned with the codebase and the visuals current.

### Deliverables

1. Screenshot refresh process for authoring and other UI-heavy pages
2. Diagram source-of-truth convention
3. A lightweight docs QA checklist for every major route:
   - is the page type correct?
   - is the first command still valid?
   - does the artifact still match the implementation?
   - do visuals still match the UI?
4. Resolve or work around the current `astro check` memory problem so the site has a viable quality gate beyond build success

## 5. Suggested Execution Order

### Phase 1: System and visuals

1. Define page-type contracts
2. Add the next wave of visual components
3. Create a site-wide visual explanation kit

### Phase 2: Highest-impact content upgrades

1. `/docs/renderer-data-model/`
2. `/docs/deployment-model/`
3. `/tutorials/rigging-and-control/`
4. `/tutorials/agent-face/`
5. `/tutorials/deployment/`

### Phase 3: Demos and hub polish

1. Rework the demos page into a more inspectable experience
2. Upgrade the hubs to support better branching and stronger route previews

### Phase 4: Operations

1. Add screenshot and diagram maintenance practices
2. Add docs QA checks
3. Fix the site validation gap around `astro check`

## 6. Success Criteria

The next pass should be considered successful when:

1. every architecture or architecture-adjacent page includes a useful diagram,
2. every UI-heavy workflow page includes screenshots or annotated screenshots,
3. every workflow page has a visible end artifact and verification loop,
4. demos can be inspected and mapped back to code and routes,
5. weaker pages rise to the current `Authoring` and `Animations` quality bar,
6. the site reads consistently as independent documentation for capable users,
7. the visual system feels intentional, distinctive, and explanatory rather than merely tidy.

## 7. Concrete Next Conversation

When reviewing this plan, the next decision should be:

1. whether to lead with component-system work or content work,
2. which five routes form the first high-intensity upgrade cluster,
3. how ambitious the visual explanation system should be in the next implementation pass,
4. whether the demos page should become more inspectable before or after the weaker workflow pages are upgraded.

My recommendation is:

1. do a small component-system expansion first,
2. then upgrade `renderer-data-model`, `deployment-model`, `rigging-and-control`, `agent-face`, and `deployment`,
3. then rework demos once the route bridges underneath it are even stronger.
