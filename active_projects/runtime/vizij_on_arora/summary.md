# Vizij on Arora
<!-- tags: family=project; type=summary; project_status=tracking; topics=runtime,arora,wasm -->

> **Last updated:** 2026-10-29

Each Vizij face runs as an Arora device. This page summarizes what runs today,
the compromises the runtime currently carries, and the tickets that retire
them.

## What runs today

- `@vizij/runtime-react`'s provider loads **one Arora device per face** from
  [`@vizij/runtime`](https://www.npmjs.com/package/@vizij/runtime): one wasm
  module per page holding the Bevy view and each face's device, built from the
  `vizij-rs` `vizij` crate's `web` module on the published `arora-web` crate.
  The native `vizij` binary runs the same composition natively.
- The device's behavior is the **composed graph**: the face's rig, pose-driver,
  pose and standard-adaptation graphs united into one node graph, with
  store-path identity as the routing fabric (see the
  [multi-writer composition reference](../../../current_documentation/concepts/deeper_exploration/MERGE_STRATEGIES.md)).
  Programs and skills run beside it as runs of the device's interpreter.
- The composed graph runs on **Arora's behavior tree** (`arora-behavior-tree`):
  each node is a call of a function of arora-sdk's `arora-dataflow-nodes`, and
  a step runs the nodes the graph's outputs read whose inputs changed. The
  graph JSON format stays Vizij's ([vizij-rs#259](https://github.com/vizij-ai/vizij-rs/pull/259)).
- Vizij and Arora share **one runtime value type**; values cross the store and
  the JS boundary without translation (`@vizij/value-json` vocabulary).
- A face's animations play in its device through Arora's animation module
  (`@arora/animation`, from `arora-animation-module`), called by name.
- The decision records live in
  [DECISIONS.md](../../../current_documentation/DECISIONS.md) (the 2026-07-10,
  2026-10-23 and 2026-10-27 entries); the crate/package map lives in
  [ARCHITECTURE.md](../../../current_documentation/ARCHITECTURE.md).

## Known compromises and their tickets

Each of these is deliberate, shipped behavior with a ticket that retires it:

| Compromise | Ticket |
| --- | --- |
| Output-path collisions resolve last-writer-wins; the explicit combiner node and honored merge options are unbuilt because current bundles do not collide. | [VIZ-58](https://linear.app/semio-ai/issue/VIZ-58) |
| The runtime's built-in keys (`arora/dt`, `arora/time` — the frame clock) ride the change feed and every consumer filters them. | [ARORA-58](https://linear.app/semio-ai/issue/ARORA-58) |

## Where the seams live

| Piece | Repo and path |
| --- | --- |
| The view and the device on every target (the browser module is its `web` module) | `vizij-rs/crates/vizij` |
| Store / HAL / behavior adapters | `vizij-rs/crates/interop/vizij-arora-{store,hal,behavior}` |
| The graph format and its import onto the behavior tree | `vizij-rs/crates/node-graph/vizij-graph-core` |
| The node vocabulary, geometry types and colour | `arora-sdk/crates/arora-{dataflow-nodes,geometry,graphics-types}` |
| The composition shared by native and browser | `vizij-rs/crates/interop/vizij-arora-host` |
| npm wrapper | `vizij-rs/npm/@vizij/runtime` |
| Runtime provider (face lifecycle, step loop, change fan-out) | `vizij-web/packages/@vizij/runtime-react` (`VizijRuntimeProvider.tsx`) |
