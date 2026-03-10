# Documentation Strategy & Content - Plan & Tracking
<!-- tags: type=plan; status=planned; topics=documentation,website,externalization -->

> **Related documents:** [Website & Ecosystem summary](../summary.md) · [Architecture guide](../../../../current_documentation/ARCHITECTURE.md) · [Roadmap](../../../../current_documentation/ROADMAP.md)

## Objective & Scope

Define how Vizij moves from internal engineering documentation to curated public docs, tutorials, workshop material, and shareable examples.

This plan is about documentation flow, authority boundaries, and public-doc readiness. It is not yet the full project-by-project portfolio reshuffle, but it now assumes one explicit public system rather than parallel tutorial/workshop tracks.

## Current-State Notes

- `vizij-docs` is the canonical internal cross-repo documentation layer.
- Repo-local docs remain authoritative for implementation detail.
- `vizij-ai.github.io` is already the active public site.
- Tutorial/workshop content is currently fragmented across public, internal, repo-local, and transitional surfaces.
- The maintained public path should be:
  - `website -> Hello Face -> vizij-authoring -> demo-vizij-player -> tutorial-agent-face -> deployment`

## Planned Workstreams

### 1. Authority and audience model

- Confirm which content stays internal, which content becomes public, and which content remains repo-local implementation detail.
- Define the primary audiences for the public docs set:
  - external builders following the maintained public path
  - developers integrating Vizij runtime surfaces
  - people learning authoring and deployment workflows

### 2. Content inventory and classification

- Inventory the current tutorial, workshop, architecture, and example surfaces across:
  - `vizij-docs`
  - `vizij-ai.github.io`
  - repo-local tutorials in `vizij-web`
  - top-level `/docs`
  - `vizij-afternoon-workshop`
- Classify each source as:
  - internal canonical
  - public canonical
  - repo-local implementation detail
  - transitional/historical

Current default classification:

- `vizij-ai.github.io` = public canonical front door + core guides
- repo tutorial apps in `vizij-web` = implementation-backed hands-on steps in the public spine
- `vizij-docs` = internal canonical strategy/architecture/roadmap layer
- top-level `/docs` = extract-and-archive source pack
- `vizij-afternoon-workshop` = extract-and-archive event/workshop operations pack

### 3. Curated public-doc pipeline

- Define the pipeline from internal sources to `vizij-ai.github.io`.
- Keep public docs curated rather than mirrored verbatim from internal docs.
- Identify which internal docs should become:
  - public conceptual guides
  - public tutorials/walkthroughs
  - generated reference docs
  - internal-only documents

Current target public-guide outputs on the site:

- evergreen getting-started guide for the maintained Vizij path
- evergreen architecture guide that explains both the golden-path view and the deeper platform view
- links out to repo/package/reference docs until a later migration

### 4. Tutorial and workshop convergence

- Unify the HRI tutorial/workshop direction with website walkthroughs and repo-local tutorial examples.
- Decide which materials become:
  - public maintained guides
  - supporting repo examples
  - archived or redirected historical packs

Current policy:

- there is one maintained tutorial spine
- workshop materials wrap that spine operationally rather than competing with it
- the HRI page remains event-specific and should point toward evergreen guides rather than becoming the hub itself

### 5. Validation and maintenance

- Define how published examples and walkthroughs get validated before sharing.
- Define how release notes, known issues, and source-of-truth docs feed outward-facing content updates.

## Acceptance Criteria

- The internal/public/repo-local authority split is explicit.
- Current tutorial/workshop surfaces are inventoried and classified.
- There is a clear curated pipeline into `vizij-ai.github.io`.
- The maintained public spine is explicit and tied to the real app sequence.
- Old tutorial/workshop packs no longer read like co-equal canonical public destinations.
- The later comprehensive roadmap review can use this plan to decide promotions, migrations, and archival moves without rediscovering the same governance questions.
