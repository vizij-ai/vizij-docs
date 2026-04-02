# Documentation Strategy & Content - Plan & Tracking
<!-- tags: family=project; type=plan; project_status=planning; topics=documentation,website,externalization -->
> **Last updated:** 2026-03-31

> **Related documents:** [Website & Ecosystem summary](../summary.md) · [Architecture guide](../../../current_documentation/ARCHITECTURE.md) · [Roadmap](../../../current_documentation/ROADMAP.md)

## Objective & Scope

Define how Vizij moves from internal engineering documentation to curated public docs, tutorials, workshop material, and shareable examples.

This plan is about documentation flow, authority boundaries, and public-doc readiness. It is not yet the full project-by-project portfolio reshuffle, but it now assumes one explicit public system rather than parallel tutorial/workshop tracks.

The guidebook-first downstream execution plan for this work now lives in:

- [`guidebook_first_documentation_system-plan.md`](guidebook_first_documentation_system-plan.md)

## Current-State Notes

- `vizij-docs` is the canonical internal cross-repo documentation layer.
- Repo-local docs remain authoritative for implementation detail.
- `vizij-ai.github.io` is already the active public site.
- The guidebook projection pipeline from `vizij-docs/current_documentation/guidebook` into `vizij-ai.github.io` already exists for public docs and tutorials.
- Tutorial/workshop content is currently fragmented across public, internal, repo-local, and transitional surfaces.
- The maintained public learning system should be:
  - website as the landing and routing layer
  - guidebook bucket chain as the only public route framing: `Introduction -> Experience -> Control -> Customize -> Integrate -> Deploy`
  - app names kept as anchors inside the buckets rather than as competing route stages
- Current taxonomy direction:
  - `vizij-web` repo surfaces should be classified as `tools` and `examples`
  - the website should expose `demos`, `tutorials`, and `docs`
  - tutorials should read naturally as "How to..." task routes rather than generic topic pages
- The public route system may need multiple audience-specific spines after the shared orientation and first-proof stages.

## Planned Workstreams

### 1. Authority and audience model

- Confirm which content stays internal, which content becomes public, and which content remains repo-local implementation detail.
- Define the primary audiences for the public docs set:
  - external builders following the maintained public path
  - developers integrating Vizij runtime surfaces
  - people learning authoring and deployment workflows
- Define the public route families by user type instead of assuming one universal linear tutorial path.

### 2. Content inventory and classification

- Inventory the current tutorial, workshop, architecture, and example surfaces across:
  - `vizij-docs`
  - `vizij-ai.github.io`
  - repo-local tools/examples in `vizij-web`
  - top-level `/docs`
  - `vizij-afternoon-workshop`
- Classify each source as:
  - internal canonical
  - public canonical
  - repo-local implementation detail
  - transitional/historical
- Build the complete intended inventory of:
  - website demos
  - website tutorials
  - website docs
- For each intended content item, record:
  - authoritative origin
  - user type / route role
  - current status (`exists`, `partial`, `missing`)
  - dependency blockers such as authoring UI, standalone/operator work, or workflow validation
- Run at least two quality passes on guidebook source modules before treating them as maintained public content:
  - structure/type pass
  - execution/readiness pass

Current default classification:

- `vizij-ai.github.io` = public canonical front door + core guides
- `vizij-docs/current_documentation/guidebook` = canonical reusable docs/tutorial source that projects outward
- repo apps in `vizij-web` = implementation-backed `tools` and `examples`, not the canonical public docs taxonomy
- `vizij-docs` = internal canonical strategy/architecture/roadmap layer
- top-level `/docs` = extract-and-archive source pack
- `vizij-afternoon-workshop` = extract-and-archive event/workshop operations pack

### 3. Curated public-doc pipeline

- Use the existing pipeline from guidebook source to `vizij-ai.github.io` as the base publishing workflow.
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

- Unify the HRI tutorial/workshop direction with website walkthroughs and repo-local tools/examples.
- Decide which materials become:
  - public maintained guides
  - supporting repo examples
  - archived or redirected historical packs

Current policy:

- there is one maintained public learning system, but it may contain multiple role-specific tutorial routes
- workshop materials wrap that spine operationally rather than competing with it
- the HRI page remains event-specific and should point toward evergreen guides rather than becoming the hub itself

### 5. Validation and maintenance

- Define how published examples and walkthroughs get validated before sharing.
- Define how release notes, known issues, and source-of-truth docs feed outward-facing content updates.

## Acceptance Criteria

- The internal/public/repo-local authority split is explicit.
- Current tutorial/workshop surfaces are inventoried and classified.
- The `tools` / `examples` / `demos` / `tutorials` / `docs` taxonomy is explicit.
- There is a clear curated pipeline into `vizij-ai.github.io`.
- The complete intended public inventory is known before content gap-fill is scheduled.
- The maintained public spine is explicit and tied to the real app sequence.
- Old tutorial/workshop packs no longer read like co-equal canonical public destinations.
- The later comprehensive roadmap review can use this plan to decide promotions, migrations, and archival moves without rediscovering the same governance questions.
