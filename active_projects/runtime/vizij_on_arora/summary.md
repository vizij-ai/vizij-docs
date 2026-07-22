# Vizij on Arora

> **Last updated:** 2026-07-22

Vizij's web runtime is an Arora device. This page summarizes what runs today,
the compromises the runtime currently carries, and the tickets that retire
them.

## What runs today

- `@vizij/runtime-react` boots **one Arora device per provider** from
  [`@vizij/runtime`](https://www.npmjs.com/package/@vizij/runtime)
  — an Arora runtime compiled to WebAssembly (crate `vizij-arora-web` in
  `vizij-rs`, built on the published `arora-web` crate).
- The device's behavior is the **composed graph**: rig, pose, and playing
  program graphs united into one node graph, with store-path identity as the
  routing fabric (see the
  [multi-writer composition reference](../../../current_documentation/concepts/deeper_exploration/MERGE_STRATEGIES.md)).
- Vizij and Arora share **one runtime value type**; values cross the store and
  the JS boundary without translation (`@vizij/value-json` vocabulary).
- Animation clips play through the runtime's JS clip pipeline, writing inputs
  like any other caller.
- The decision records live in
  [DECISIONS.md](../../../current_documentation/DECISIONS.md) (2026-07-10
  entries); the crate/package map lives in
  [ARCHITECTURE.md](../../../current_documentation/ARCHITECTURE.md).

## Known compromises and their tickets

Each of these is deliberate, shipped behavior with a ticket that retires it:

| Compromise | Ticket |
| --- | --- |
| Changing the composed graph restarts the device (store carried across, minus the runtime's `arora/*` clock keys). An in-place behavior load through the interpreter module replaces the restart. | [VIZ-57](https://linear.app/semio-ai/issue/VIZ-57) |
| Output-path collisions resolve last-writer-wins with a console warning; the explicit combiner node and honored merge options are unbuilt because current bundles do not collide. | [VIZ-58](https://linear.app/semio-ai/issue/VIZ-58) |
| A JS bridge restages pose-driver outputs into rig inputs; store-path feedback makes it redundant once verified equivalent. | [VIZ-59](https://linear.app/semio-ai/issue/VIZ-59) |
| The runtime's clock keys (`arora/dt`, `arora/time`) ride the change feed and every consumer filters them. | [ARORA-58](https://linear.app/semio-ai/issue/ARORA-58) |
| Clearing an input writes `{float: 0}` instead of the constraint's neutral value. | [VIZ-60](https://linear.app/semio-ai/issue/VIZ-60) |
| The authoring motiongraph tooling has migrated to the node graph and `@vizij/orchestrator-react` is retired, but `vizij-orchestrator-core` still has an internal consumer in `vizij-arora-behavior`, so the orchestrator crates stay in `vizij-rs` pending removal. | [VIZ-62](https://linear.app/semio-ai/issue/VIZ-62) |

## Where the seams live

| Piece | Repo and path |
| --- | --- |
| Browser device (wasm cdylib) | `vizij-rs/crates/interop/vizij-arora-web` |
| Store / HAL / behavior adapters | `vizij-rs/crates/interop/vizij-arora-{store,hal,behavior}` |
| Animation engine as an Arora module | `vizij-rs/crates/interop/vizij-animation-module` |
| npm wrapper | `vizij-rs/npm/@vizij/runtime` |
| Runtime provider (device lifecycle, composition, step loop) | `vizij-web/packages/@vizij/runtime-react` (`engine/aroraEngine.ts`, `utils/composeGraph.ts`) |
