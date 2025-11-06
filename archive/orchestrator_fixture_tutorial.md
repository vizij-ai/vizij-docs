# Orchestrator Fixtures Deep Dive

This note explains **what** orchestrator fixtures are, **why** we ship them, and **how** they are consumed across the Rust + npm stacks. It also highlights the recent updates that introduced multi-controller support and richer metadata in the shared descriptors.

---

## 1. First Principles

### 1.1 What the orchestrator does

`vizij-orchestrator-core` combines multiple controllers (graph runtimes and animation engines) against a shared blackboard. Each frame:

1. Host inputs are staged on the blackboard.
2. Graph controllers evaluate their `GraphSpec`s and emit writes.
3. Animation controllers advance stored animations and publish events/writes.
4. The orchestrator merges the writes deterministically and reports conflicts.

### 1.2 Why fixtures exist

Fixtures are **canonical JSON samples** that exercise the orchestrator end-to-end. Every stack consumes the same data so smoke tests, tutorials, and demos stay aligned:

- `fixtures/` — source of truth checked into git.
- `crates/test-fixtures/vizij-test-fixtures` — Rust helper library that loads fixtures from the manifest.
- `npm/@vizij/test-fixtures` — TypeScript helpers that mirror the Rust APIs.
- `npm/@vizij/orchestrator-wasm` — embeds the same files into the wasm package so JS tests can load bundles without touching the filesystem.

### 1.3 Fixture lifecycle

```
fixtures/*.json ───▶ fixtures/manifest.json
        │                │
        │                └─ include_str! in vizij-test-fixtures (Rust)
        │
        └── scripts/embed-fixtures.mjs ─► npm packages (generated bundle)
```

Any change to the manifest or the underlying files should be followed by

```bash
node scripts/embed-fixtures.mjs orchestrator-wasm node-graph-wasm animation-wasm
pnpm --filter @vizij/test-fixtures run build
pnpm --filter @vizij/orchestrator-wasm test
cargo test -p vizij-orchestrator-core
```

---

## 2. Anatomy of an Orchestrator Fixture

Every orchestration fixture is a JSON descriptor stored under `fixtures/orchestrations/*.json` and referenced from `fixtures/manifest.json`. A descriptor now looks like this:

```json
{
  "description": "Chain ramp animation drives a sign graph feeding a slew graph",
  "schedule": "SinglePass",
  "animations": [
    {
      "fixture": "chain-ramp",
      "id": "chain-animation",
      "player": { "name": "chain-player", "loop_mode": "once" }
    }
  ],
  "graphs": [
    { "fixture": "sign-graph", "id": "sign" },
    { "fixture": "slew-graph", "id": "slew" }
  ],
  "initial_inputs": [
    { "path": "demo/graph/gain", "value": 1.5 }
  ],
  "steps": [
    { "delta": 0.0, "expect": { "chain/sign.value": -1 } },
    { "delta": 1.0, "expect": { "chain/sign.value": 0 } }
  ]
}
```

Key fields:

| Field | Purpose |
| ----- | ------- |
| `schedule` | Optional hint (`SinglePass`, `TwoPass`, ...) for tests/demos. |
| `animations[]` | Ordered list of animation controllers referencing shared animation fixtures. Each entry can override the default player/instance setup or provide a controller id. |
| `graphs[]` | Ordered list of graph controllers referencing shared node-graph fixtures. Each entry can override subscriptions (`subs`) or provide a controller id. |
| `initial_inputs` | Host writes staged on the blackboard before the first frame. |
| `steps` | Sequence of `{ delta, expect }` describing the frame advance and expected merged writes. |

> Legacy shortcuts `animation` and `graph` still exist in descriptors for backwards compatibility. During normalization they are promoted to single-element `animations[]` / `graphs[]`.

---

## 3. Loading Fixtures in Rust (`vizij-test-fixtures`)

`crates/test-fixtures/vizij-test-fixtures/src/lib.rs` exposes helper modules (`animations`, `node_graphs`, `orchestrations`) that read from the `fixtures/manifest.json` include. The orchestrator crate builds on top of these helpers inside `crates/orchestrator/vizij-orchestrator-core/src/fixtures/mod.rs`.

### 3.1 `DemoFixture`

`DemoFixture` is the high-level struct returned by `vizij_orchestrator::fixtures::demo_single_pass()` and `blend_pose_pipeline()`. The recent updates expanded it with:

- `schedule` — direct access to the descriptor hint.
- `graph` / `animation` — the first controller for compatibility.
- `graphs` / `animations` — the **full** binding lists so test code can register every controller without guessing.
- `GraphFixture::key` / `AnimationFixture::key` — identify which shared fixture was used.
- Optional controller ids and subscription overrides.

### 3.2 Why it matters

Previously a fixture implied exactly one graph and one animation. That was enough for the scalar ramp demo but broke down as soon as we wanted orchestrations that chained multiple graphs. The enriched struct lets integration tests iterate over every controller while reusing the same JSON descriptors.

---

## 4. Loading Fixtures in JavaScript (wasm packages)

The TypeScript side mirrors the Rust API via `@vizij/test-fixtures` and the orchestrator wasm wrapper.

### 4.1 Test fixtures (`npm/@vizij/test-fixtures/src/orchestrations.ts`)

`loadOrchestrationBundle(name)` now returns a shape aligned with the Rust `DemoFixture`:

```ts
{
  descriptor,                                    // raw JSON descriptor
  animations: Array<{ key, id?, animation, setup }>,
  graphs: Array<{ key, id?, config, mirrorWrites, stage }>,
  mergedGraphs: Array<{ id, graphs, strategy }>,
  initialInputs: Array<{ path: string; value: unknown; shape?: unknown }>,
}
```

Clients register every controller via the arrays and stage any default payloads using `initialInputs` (which already includes per-graph `stage` entries in addition to descriptor-level `initial_inputs`).

### 4.2 Orchestrator wasm fixtures (`npm/@vizij/orchestrator-wasm/src/fixtures.ts`)

The wasm wrapper builds higher-level bindings on top of the shared helper:

- Normalises graph/animation seeds (string shorthand or detailed objects).
- Clones configs so callers can mutate controller ids without affecting the shared cache.
- Enforces that at least one animation + graph is present, matching the Rust expectations.

JS tests (`npm/@vizij/orchestrator-wasm/tests/all.test.ts`) were updated accordingly:

```ts
const bundle = await loadOrchestrationBundle("scalar-ramp-pipeline");
const orch = await createOrchestrator({ schedule: bundle.descriptor.schedule ?? "SinglePass" });

for (const binding of bundle.graphs) {
  const config = { ...binding.config };
  if (binding.id) config.id = binding.id;
  orch.registerGraph(config);
}

for (const merged of bundle.mergedGraphs) {
  const mergedConfig = {
    id: merged.id,
    strategy: merged.strategy,
    graphs: merged.graphs.map((binding) => ({ ...binding.config, id: binding.id })),
  };
  orch.registerMergedGraph(mergedConfig);
}

const primaryAnimation = bundle.animations[0];
orch.registerAnimation({ id: primaryAnimation?.id, setup: primaryAnimation.setup });

for (const input of bundle.initialInputs) {
  orch.setInput(input.path, toValueJSON(input.value as ValueInput), input.shape);
}
```

---

## 5. What the Fixtures Cover Today

The current descriptor format is enough to drive many real-world scenarios:

- **Multiple controllers** – List as many graphs/animations (and `mergedGraphs`) as needed. Registration order follows the array order; controllers exchange data by reading/writing shared typed paths.
- **Serial chains & fan-out** – Whether you queue four graphs in series or drive three in parallel from an animation, the orchestrator resolves bindings implicitly through shared paths. No extra wiring is required beyond matching `subs.inputs` / `subs.outputs`.
- **Merge strategies** – `mergedGraphs[].strategy` lets fixtures pick per-merge conflict policies (`error`, `namespace`, `blend`).
- **Mirroring** – Every graph entry can set `mirrorWrites` (default `false`), so fixtures avoid accidental feedback while still opting in where required.
- **Staging** – Per-graph `stage[]` entries are folded into `initialInputs`, making it easy to give controllers default blackboard values.
- **Schedule selection** – Descriptors can set `"schedule": "SinglePass"` or `"schedule": "TwoPass"`. When omitted, helpers default to `SinglePass`. Future schedules (rate-decoupled, custom passes) would need additional support.
- **Expected frame behaviour** – `steps[]` let fixtures assert merged writes over time, catching regressions in graph/animation interplay.

In short, as long as the fixtures’ graph specs publish/consume the right paths, the orchestrator handles serial/parallel flows without extra hints. The descriptors merely provide the controller list, optional ids, and the schedule.

## 6. Gaps & Possible Extensions

There are still capabilities the fixtures cannot express:

| Orchestrator feature | Current support | Notes |
| -------------------- | --------------- | ----- |
| **Animation prebinding / resolver hooks** | ❌ | The JS wrapper exposes `prebind`, but fixtures cannot describe resolver wiring or asset mounts. |
| **Custom timing** (e.g., per-controller `dt` overrides) | ❌ | Fixtures assume a single `dt` per step. |
| **Per-fixture conflict assertions** | ⚠️ | `steps[]` validate merged writes, but there is no built-in way to assert conflict logs or event payloads yet. |
| **Advanced schedule semantics** | ⚠️ | Only `SinglePass` and `TwoPass` are selectable today. Future schedules (rate decoupling, custom pass ordering) would require additional schema. |

Possible future extensions to unlock the remaining scenarios:

- Extend descriptors with conflict-log expectations so fixtures can assert on `frame.conflicts`.
- Provide animation resolver metadata (e.g., virtual filesystem roots) and player hooks.
- Support multi-schedule stories (per-controller pass assignment, rate decoupling once implemented).

## 7. Putting Fixtures to Work

### 7.1 Adding a new orchestration fixture

1. Create `fixtures/orchestrations/<name>.json` (follow the schema shown above).
2. Add the entry to `fixtures/manifest.json`.
3. Re-run the embed script to refresh npm bundles:
   ```bash
   node scripts/embed-fixtures.mjs orchestrator-wasm node-graph-wasm animation-wasm
   pnpm --filter @vizij/test-fixtures run build
   ```
4. Run tests:
   ```bash
   cargo test -p vizij-orchestrator-core
   pnpm --filter @vizij/orchestrator-wasm test
   ```
5. Update docs/examples if the new fixture should appear in tutorials.

### 7.2 Consuming in Rust examples

```rust
use vizij_orchestrator_core::{Orchestrator, Schedule, controllers::AnimationControllerConfig};
use vizij_orchestrator_core::fixtures::demo_single_pass;

let fixture = demo_single_pass();
let schedule = fixture.schedule().unwrap_or("SinglePass");
let mut orch = match schedule {
    "TwoPass" => Orchestrator::new(Schedule::TwoPass),
    _ => Orchestrator::new(Schedule::SinglePass),
};

for graph in fixture.graphs() {
    let cfg = /* convert graph.spec + graph.subs into GraphControllerConfig */;
    orch = orch.with_graph(cfg);
}

for anim in fixture.animations() {
    let cfg = AnimationControllerConfig { id: anim.id.clone().unwrap_or_default(), setup: anim.setup.clone() };
    orch = orch.with_animation(cfg);
}
```

### 7.3 Consuming in JavaScript

```ts
import { createOrchestrator, loadOrchestrationBundle } from "@vizij/orchestrator-wasm";
import { toValueJSON, type ValueInput } from "@vizij/value-json";

const bundle = await loadOrchestrationBundle("chain-sign-slew-pipeline");
const schedule = bundle.descriptor.schedule ?? "SinglePass";
const orchestrator = await createOrchestrator({ schedule });

for (const binding of bundle.graphs) {
  const config = { ...binding.config };
  if (binding.id) config.id = binding.id;
  orchestrator.registerGraph(config);
}

for (const merged of bundle.mergedGraphs) {
  orchestrator.registerMergedGraph({
    id: merged.id,
    strategy: merged.strategy,
    graphs: merged.graphs.map((binding) => ({ ...binding.config, id: binding.id ?? undefined })),
  });
}

const primaryAnimation = bundle.animations[0];
if (primaryAnimation) {
  orchestrator.registerAnimation({ id: primaryAnimation.id, setup: primaryAnimation.setup });
}

for (const input of bundle.initialInputs) {
  orchestrator.setInput(
    input.path,
    toValueJSON(input.value as ValueInput),
    input.shape,
  );
}
```

---

## 8. What Changed in This Update

- **Multi-controller descriptors** — fixtures declare graphs, animations, and merged graphs explicitly, instead of relying on implicit singletons.
- **Mirror & staging controls** — per-graph `mirrorWrites` now defaults to `false`, and `stage[]` entries are folded into `initialInputs` for one-shot blackboard seeding.
- **Schedule metadata** — descriptors expose the intended orchestrator schedule, enabling tests to mirror production execution order.
- **Enhanced Rust fixtures** — `GraphFixture::controller_config()` and `MergedGraphFixture::controller_config()` make it trivial to derive `GraphControllerConfig` instances for integration tests.
- **Updated JS bundle API** — `loadOrchestrationBundle` surfaces `animations`, `graphs`, `mergedGraphs`, and `initialInputs` so consumers can wire controllers without relying on legacy aliases.
- **New samples** — alongside the existing pipelines, `chain-sign-slew-pipeline` and `merged-blend-pipeline` demonstrate chained and merged-controller scenarios.
- **Refreshed docs/tests** — README usage samples now show the richer bundle shape, and the Rust/JS integration tests drive the new fixtures.

These changes align the orchestrator fixtures with how teams actually compose controllers in production: multi-graph pipelines, explicit schedules, and reusable sample data for both Rust and JavaScript environments.
