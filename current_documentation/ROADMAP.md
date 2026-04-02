# Vizij Roadmap & Active Programs
<!-- tags: family=reference; type=roadmap; topics=roadmap,strategy,planning -->
> **Last updated:** 2026-04-02

This roadmap defines the current outward-facing Vizij system after the strategy rewrite. It organizes the work around one maintained public story instead of a loose set of repos, tutorial packs, and demos.

## Current Phase Rule

Protect one maintained public learning system:

1. website as the landing and routing layer
2. one maintained public bucket route:
   `Introduction -> Experience -> Control -> Customize -> Integrate -> Deploy`
3. `Introduction` is the public entry bucket before the main build progression.
4. app surfaces such as `Hello Face`, `vizij-authoring`, `demo-vizij-player`, and `vizij-standalone` should appear only as anchors inside the bucket route, not as competing public route stages.

This phase is intentionally **Layer-3-led** in presentation. Public readers should encounter the working product surfaces first, while `vizij-docs` continues to preserve the deeper Layer-1/2 platform architecture underneath them.

## Current Strategic Sequence

1. **External onboarding pipeline**
   - Make the public site, guides, tutorial spine, and examples read like one maintained system.
2. **Creator / build reliability**
   - Make the import -> author -> export -> runtime loop dependable enough for outside builders.
3. **Deployment / operator branch**
   - Carry the same maintained path through browser and standalone deployment references, including operator control.
4. **Supporting near-term programs**
   - Keep secondary creator work and speech/viseme enablement active without letting them displace the main phase.
5. **Later-horizon runtime expressiveness**
   - Keep deeper runtime evolution visible, but do not let it compete with the current golden path.
6. **Hardening / cleanup**
   - Keep quality, contract, and performance work active as a cross-cutting support lane without letting it become the lead story by default.

## 1. External Onboarding Pipeline

### Required outcomes

- `vizij-ai.github.io` is the canonical public front door, showcase surface, and home for core Vizij guides.
- `vizij-docs/current_documentation/guidebook` remains the canonical source of truth for reusable docs and tutorial content that projects publicly onto the site.
- The site clearly separates `demos`, `tutorials`, and `docs`:
  - `demos` are bounded website-owned capability showcases
  - `tutorials` are task-driven "How to..." routes authored canonically in the guidebook
  - `docs` are the broader structured learning lattice authored canonically in the guidebook
- `vizij-web` implementation apps are understood as `tools` and `examples`, not as the canonical public docs taxonomy:
  - `tools` are maintained creation, inspection, or operator-facing surfaces
  - `examples` are customizable or deployable reference applications
- There is one maintained public learning system, but not necessarily one universal linear tutorial path. The shared public entry should branch into audience-appropriate tutorial routes after orientation and first proof.
- The site hosts curated conceptual and getting-started content, while deeper package/reference/generated docs stay linked out for now.
- Top-level `/docs` and `vizij-afternoon-workshop` are treated as extract-and-archive sources rather than co-equal public tutorial homes.
- The HRI tutorial page is event-specific and should not act as the canonical evergreen onboarding hub.

### Near-term work

- **Front door and taxonomy cleanup**: update the public site so it points readers into evergreen Vizij guides instead of event-first learning paths, and make the `demos` / `tutorials` / `docs` split explicit.
- **Repo surface reclassification**: classify `vizij-web` apps as long-term `tools`, long-term `examples`, or transitional/internal surfaces so the implementation map underneath the public site is clear.
- **Audience and route definition**: define the primary public reader types and the maintained route families for each, keeping the guidebook bucket chain as the only public route framing while allowing role-specific tutorial sequences to branch inside that bucket model.
- **Complete content inventory before gap fill**: identify the full intended set of public demos, tutorials, and docs before trying to fill every gap.
- **Guidebook quality and source review**: run at least one structure pass and one execution/readiness pass on guidebook source modules before assuming they are ready to project publicly as maintained learning content.
- **Public doc routing with link-outs**: keep the site as the audience-shaped layer and link outward to repo/package/reference docs until a later migration.
- **Historical hygiene**: reclassify old tutorial/workshop packs as source material to extract from and move toward archive quickly.
- **Example validation**: keep published examples, walkthroughs, and tutorial snippets tied to real maintained apps.

### Current anchors

- [Website & Ecosystem summary](../active_projects/website/summary.md)
- [Documentation Strategy & Content plan](../active_projects/website/documentation_strategy/documentation_strategy-plan.md)
- [Architecture guide](ARCHITECTURE.md)

## 2. Creator / Build Reliability

### Creator-phase success gate

A reader should be able to understand that current creator/build success means:

1. import or start from a supported face
2. author and rig it in the current authoring surface
3. export a bundled GLB
4. run it successfully in the maintained player and deployment path

### Blocking spine for this phase

Only these items should block creator-phase completion:

- **authoring workflow clarity, UI legibility, and regression lock-in for the canonical creator path**
- **`F5.*` import reliability contracts**
- **`V9.*` canonical sample assets and standard-rig validation**
- **`R6.5` dual-face perf and auditability signoff**
- **face-editing correctness for behaviors that look supported in the primary authoring surface**

### Canonical sample set

- The official supported sample set for the maintained creator path is **Quori / Toasty**.
- The currently visible asset inventory does not yet cleanly match that intent, so the roadmap must treat this as a real reconciliation task rather than a documentation typo.

### Primary creator trust work

- `U8.*` workspace clarity, authoring information architecture, and explicit workflow definition should now be treated as part of creator-path trust rather than optional polish.
- Key creator workflows should be made explicit and protected with Playwright acceptance coverage so the maintained path does not regress silently.
- `face editing` should remain a primary lane where visible editing affordances currently imply support; broken editing behavior will read as product failure to first-time users.

### Supporting but non-blocking creator work

- `pose-rig library` remains an active secondary creator program.
- broader UX polish and power-user tooling should not be presented as equivalent in priority to the blocking creator-trust and reliability/assets spine.

### Current anchors

- [Authoring summary](../active_projects/authoring/summary.md)
- [Runtime summary](../active_projects/runtime/summary.md)
- [Standalone WS plan](../active_projects/runtime/standalone_ws/standalone_ws-plan.md)

## 3. Deployment / Operator Branch

### Branch structure

- Browser/runtime deployments and `vizij-standalone` are both first-class references in this phase.
- Split-screen and operator-control work are part of the core deployment story now, not a side experiment.
- Legacy `vizij-ws-app` references should not be centered in the main deployment story.
- The deployment branch should now be read as a coherence and operator-trust problem more than a missing-runtime problem.
- Namespacing and multi-face shared-runtime work remain visible, but as future-facing runtime expressiveness work rather than near-term deployment gates.

### Near-term work

- **Maintained deployment endpoints**: keep browser/runtime deployments and `vizij-standalone` explicit as the canonical near-term endpoints of the public path.
- **Operator model and control discovery**: define the operator workflow clearly, including split-screen, remote control, and runtime-metadata-driven control discovery.
- **Standalone/protocol normalization**: keep the Arora and standalone stack understandable enough for public readers and contributors, with `vizij-standalone` and the extracted `arora-*` surfaces as the current source of truth.
- **Deployment validation and recovery guidance**: make deployment success/failure legible through clear runbooks, checks, and troubleshooting guidance.
- **Deployment-facing speech/viseme and advanced optional layers**: keep conversation, ROS2, and operator-facing runtime extensions visible, but subordinate to the core endpoint/operator path.

### Current anchors

- [Runtime summary](../active_projects/runtime/summary.md)
- [Standalone WS plan](../active_projects/runtime/standalone_ws/standalone_ws-plan.md)
- [Multi-Screen plan](../active_projects/runtime/multi_screen/multi_screen-plan.md)

## 4. Supporting Near-Term Programs

### Role in the current phase

These programs should stay visible because they are likely next useful capabilities after the main onboarding / creator / deployment lanes, but they should not displace the current signoff path.

### Supporting creator programs

- **Pose-rig library**: keep visible as a subordinate but important creator-leverage line focused on reusable standard-input-based pose rig artifacts that can travel between faces and projects.
- **Animation authoring**: keep visible as the richer timeline / recording / curve-editing line beyond the current blocking creator spine, without letting it reframe the near-term creator gate.

### Later creator UX inside this lane

- **Visual handles**: keep visible, but treat as later-horizon UX work rather than a near-term supporting program.

### AV program

- Frame the active AV line as **speech + viseme + conversation enablement**.
- Keep it connected to provider-based runtime integration, live demos, and deployable user-facing behavior.
- Treat it as the highest-priority supporting program in this lane because it strengthens visible deployable behavior in maintained surfaces such as agent-face, showcase, and standalone.
- Do **not** frame the near-term roadmap around a generic broad Rust AV platform.

### Current anchors

- [Authoring summary](../active_projects/authoring/summary.md)
- [Authoring extension summary](../backlog/authoring/summary.md)
- [Runtime summary](../active_projects/runtime/summary.md)

## 5. Later-Horizon Shape

### Runtime expressiveness is the next likely wave

After the current public-system phase, the most likely next major wave is **runtime expressiveness**:

- shared runtime identity and namespacing follow-on
- richer blackboard / orchestration capabilities
- remaining `graph nodes` work and broader graph expressiveness
- `behavior tree` discovery
- deeper runtime evolution beyond the current Layer-3-led story

### Keep visible, but non-competing in this phase

- This lane should stay visible as the next major runtime wave, but it is still less settled than the current onboarding / creator / deployment lanes.
- Namespacing and multi-face shared-runtime work are the clearest bridge from the current deployment/operator branch into this later-horizon work.
- Behavior-tree work should remain explicitly exploratory until the shared-runtime, graph, and blackboard contracts are sharper.
- `visual handles`
- broader creator UX depth beyond the blocking creator spine
- deeper runtime/platform restructuring
- broader WASM/perf/refactor work

## 6. Hardening / Cleanup

### Current-phase role

Hardening, refactoring, testing, and performance work should act as a **cross-cutting trust lane**, not a competing product pillar.

During the current phase, elevate them when they:

- directly block the public golden path
- undermine deployment credibility
- create a concrete contract, workflow-lock-in, release-note, or known-issue risk

### Primary hardening work in this phase

- **Workflow lock-in and acceptance coverage**: protect the canonical public and product-defining paths with explicit validation:
  - first-run tutorials/examples that are treated as maintained
  - canonical authoring workflows
  - deployment and operator flows
- **Contract hardening at repo boundaries**: keep ABI, protocol, bundle, and runtime-interface contracts explicit and failure-readable across Rust, web, and deployment surfaces.
- **Operational hygiene**: keep known issues, release notes, docs/source-of-truth alignment, and example validation current enough that contributors and external readers can trust the published story.
- **Blocker-class performance review**: elevate performance and WASM-boundary work when they directly affect maintained-path credibility, not as an abstract optimization program.

### Subordinate but visible work

- broad refactoring passes that are not tied to a current blocker
- general WASM optimization work that is not yet on the hot path for maintained public flows
- large cleanup campaigns whose main justification is internal neatness rather than user or contributor trust

### Current cross-repo anchors

- [Code Quality summary](../active_projects/code_quality/summary.md)
- [Known issues](KNOWN_ISSUES.md)
- [Release notes index](release_notes/README.md)

## Pillar Index

- [Authoring summary](../active_projects/authoring/summary.md)
- [Runtime summary](../active_projects/runtime/summary.md)
- [Code Quality summary](../active_projects/code_quality/summary.md)
- [Website & Ecosystem summary](../active_projects/website/summary.md)

## Notes on This Rewrite

- The current rewrite is about strategy, information architecture, and program framing; follow-on backlog/archive curation may still refine individual historical folders further.
