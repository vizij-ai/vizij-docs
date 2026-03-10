# Vizij Roadmap & Active Programs
<!-- tags: type=roadmap; status=living; topics=roadmap,strategy,planning -->

This roadmap defines the current outward-facing Vizij system after the strategy rewrite. It organizes the work around one maintained public story instead of a loose set of repos, tutorial packs, and demos.

## Current Phase Rule

Protect one maintained golden path:

`website -> Hello Face -> vizij-authoring -> demo-vizij-player -> tutorial-agent-face -> deployment`

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

## 1. External Onboarding Pipeline

### Required outcomes

- `vizij-ai.github.io` is the canonical public front door, showcase surface, and home for core Vizij guides.
- The site hosts curated conceptual and getting-started content, while deeper package/reference/generated docs stay linked out for now.
- There is one maintained tutorial spine, not separate public tutorial and workshop systems.
- Top-level `/docs` and `vizij-afternoon-workshop` are treated as extract-and-archive sources rather than co-equal public tutorial homes.
- The HRI tutorial page is event-specific and should not act as the canonical evergreen onboarding hub.

### Near-term work

- **Front door and core-guide cleanup**: update the public site so it points readers into evergreen Vizij guides instead of event-first learning paths.
- **Canonical tutorial spine**: present the maintained public path explicitly as `Hello Face -> vizij-authoring -> demo-vizij-player -> tutorial-agent-face -> deployment`.
- **Public doc routing with link-outs**: keep the site as the audience-shaped layer and link outward to repo/package/reference docs until a later migration.
- **Historical hygiene**: reclassify old tutorial/workshop packs as source material to extract from and move toward archive quickly.
- **Example validation**: keep published examples, walkthroughs, and tutorial snippets tied to real maintained apps.

### Current anchors

- [Website & Ecosystem summary](../backlog/active_projects/website/summary.md)
- [Documentation Strategy & Content plan](../backlog/active_projects/website/documentation_strategy/documentation_strategy-plan.md)
- [Architecture guide](ARCHITECTURE.md)

## 2. Creator / Build Reliability

### Creator-phase success gate

A reader should be able to understand that current creator/build success means:

1. import or start from a supported face
2. author and rig it in `vizij-authoring`
3. export a bundled GLB
4. run it successfully in the maintained runtime path

### Blocking spine for this phase

Only these items should block creator-phase completion:

- **`F5.*` import reliability contracts**
- **`V9.*` canonical sample assets and standard-rig validation**
- **`R6.5` dual-face perf and auditability signoff**

### Canonical sample set

- The intended near-term sample set is **Quori / Hugo / Toasty**.
- The currently visible asset inventory does not yet cleanly match that intent, so the roadmap must treat this as a real reconciliation task rather than a documentation typo.

### Supporting but non-blocking creator work

- `U8.*` workspace clarity remains active but non-blocking.
- `face editing` and `pose-rig library` are active secondary creator programs.
- broader UX polish and power-user tooling should not be presented as equivalent in priority to the blocking reliability/assets spine.

### Current anchors

- [Authoring summary](../active_projects/authoring/summary.md)
- [Runtime summary](../active_projects/runtime/summary.md)
- [Standalone WS plan](../active_projects/runtime/standalone_ws/standalone_ws-plan.md)

## 3. Deployment / Operator Branch

### Branch structure

- Browser/runtime deployments and `vizij-standalone` are both first-class references in this phase.
- Split-screen and operator-control work are part of the core deployment story now, not a side experiment.
- Transitional `vizij-ws-app` material should not be centered in the main deployment story.
- Namespacing and multi-face shared-runtime work remain visible, but as future-facing runtime expressiveness work rather than near-term deployment gates.

### Near-term work

- **Browser + standalone deployment references**: document both deployment modes as valid maintained endpoints of the public path.
- **Operator-control flow**: treat multi-screen and remote-control workflows as part of core deployment credibility.
- **Standalone/protocol normalization**: keep the Arora and standalone stack understandable enough for public readers and contributors.
- **Deployment-facing speech/viseme and live demo support**: keep conversation and operator-facing runtime surfaces credible in the maintained flow.

### Current anchors

- [Runtime summary](../active_projects/runtime/summary.md)
- [Standalone WS plan](../active_projects/runtime/standalone_ws/standalone_ws-plan.md)
- [Multi-Screen plan](../active_projects/runtime/multi_screen/multi_screen-plan.md)

## 4. Supporting Near-Term Programs

### Secondary creator programs

- **Face editing**: keep visible as a separate subordinate creator program rather than burying it inside generic authoring polish.
- **Pose-rig library**: keep visible as a separate subordinate creator program even though the current docs lag the real work.

### AV program

- Frame the active AV line as **speech + viseme + conversation enablement**.
- Keep it connected to provider-based runtime integration, live demos, and deployable user-facing behavior.
- Do **not** frame the near-term roadmap around a generic broad Rust AV platform.

### Current anchors

- [Authoring summary](../active_projects/authoring/summary.md)
- [Authoring extension summary](../backlog/active_projects/authoring/summary.md)
- [Runtime summary](../active_projects/runtime/summary.md)

## 5. Later-Horizon Shape

### Runtime expressiveness is the next likely wave

After the current public-system phase, the most likely next major wave is **runtime expressiveness**:

- remaining `graph nodes` work
- `behavior tree` discovery
- namespacing follow-on
- deeper runtime evolution beyond the current Layer-3-led story

### Keep visible, but non-competing in this phase

- `visual handles`
- broader creator UX depth beyond the blocking creator spine
- deeper runtime/platform restructuring
- broader WASM/perf/refactor work

## 6. Hardening and Review

### Current-phase role

Hardening, refactoring, and performance work should receive a **later push**, not equal prominence with the onboarding/build/deploy phase.

During the current phase, elevate them when they:

- directly block the public golden path
- undermine deployment credibility
- or create a concrete contract/release-note/known-issue risk

### Current cross-repo anchors

- [Code Quality summary](../active_projects/code_quality/summary.md)
- [Known issues](KNOWN_ISSUES.md)
- [Release notes index](release_notes/README.md)

## Pillar Index

- [Authoring summary](../active_projects/authoring/summary.md)
- [Runtime summary](../active_projects/runtime/summary.md)
- [Code Quality summary](../active_projects/code_quality/summary.md)
- [Website & Ecosystem summary](../backlog/active_projects/website/summary.md)

## Notes on This Rewrite

- Some work still lives in historical `backlog/` paths because the folder-level portfolio reshuffle has not happened yet.
- The current rewrite is about strategy, information architecture, and program framing; it does not yet rewrite every individual project/proposal file into the new hierarchy.
