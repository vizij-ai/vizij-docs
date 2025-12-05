# Graph Authoring IR Reference
<!-- tags: status=reference; topics=graph-ir,tooling,runtime,automation-testing -->

> **Related documents:** [Proposal](graph_authoring_ir-proposal.md) · [Plan](graph_authoring_ir-plan.md) · [Project summary](summary.md)

## Summary

The Graph Authoring IR initiative introduces a metadata-driven intermediate representation that lives inside `@vizij/node-graph-authoring`. Authoring code builds IR graphs from bindings/expressions, then compiles them into the runtime’s canonical `GraphSpec`. IR exists to make expressions, metadata, and diagnostics tractable; the compiled node graph remains the “real” rig.

## System Overview

### Current State

- **Metadata**: `@vizij/node-graph-wasm` bundles `registry.json` with helper APIs (`getNodeRegistry`, `requireNodeSignature`, `listNodeTypeIds`, etc.) generated from Rust.
- **Authoring Package**: `@vizij/node-graph-authoring` exposes binding utilities (`graphBuilder`, `expressionFunctions`, `state`) that now consume metadata to map functions to node types.
- **Authoring App**: Imports shared package, relying on metadata for expression node selection.

### Target State

- IR types (`IrGraph`, `IrNode`, `IrEdge`, `IrConstant`, metadata envelopes) fully defined in `@vizij/node-graph-authoring/src/ir`.
- `buildRigGraphSpec` builds IR first, then compiles to `GraphSpec`. Consumers keep calling the same API; the runtime still loads only the compiled GraphSpec.
- Expression-first bindings leverage metadata-driven function maps, reserved variables, and vector-aware slot types.
- Deterministic parity tests assert that `result.ir?.compile()` matches the stored `GraphSpec` fixtures, giving us confidence before flipping the authoring runtime/export/import flows to IR-first.

## Key Decisions

- Metadata is sourced exclusively from the Rust-generated registry; TypeScript never hardcodes signatures.
- IR is a helper interface layer. The compiled `GraphSpec` remains the canonical runtime asset, so validation focuses on deterministic IR→GraphSpec parity tests.
- `@vizij/node-graph-authoring` exposes both the IR builder and the compiler so other tooling (CLI, authoring UI, diff scripts) can build and inspect graphs consistently.

## November 2025 Updates

- **Slot remap enforcement** – `graphBuilder` now injects a `centered_remap` node whenever a slot reference feeds an expression that does *not* already wrap the alias in `piecewise_remap`/`centered_remap`. This keeps staged slider values aligned with per-slot remap curves even when the author writes `max(A, B)` or `case(...)`, eliminating the mismatch between staged inputs and the compiled graph. (See `packages/@vizij/node-graph-authoring/src/graphBuilder.ts`.)
- **Rig input path invariants** – Standard input paths are re-normalised to stay relative (e.g., `/brow/pos`) and `buildRigInputPath` detects already-qualified strings so we never emit addresses like `rig/robot/rig/robot/brow/pos`. All authoring surfaces benefit from the stricter normaliser in `packages/@vizij/utils/src/rig/standard-inputs.ts`, so pose capture, the orchestrator, and CLI tooling now agree on the same contract.

## Usage Guide

- **Node metadata**:
  ```ts
  import { getNodeRegistry, requireNodeSignature } from "@vizij/node-graph-wasm/metadata";
  ```
- **Expression vocabulary**:
  ```ts
  import { SCALAR_FUNCTIONS } from "@vizij/node-graph-authoring";
  const addDef = SCALAR_FUNCTIONS.get("add");
  ```
- **Build + inspect graphs**:
  ```ts
  import { buildRigGraphSpec } from "@vizij/node-graph-authoring";

  const result = buildRigGraphSpec(options);
  const graphSpec = result.spec;          // Runtime payload
  const irGraph = result.ir?.graph;       // Inspection/debugging
  ```
  Use `result.ir?.compile({ preferLegacy: false })` in tests to assert IR parity.

### Authoring app touchpoints

- **Binding Editor diagnostics** – The Drivers/Animatable panels now surface machine-report data inline: each slot shows its expression variable, CASE metadata, and upstream IR nodes so you can reason about compiled graphs without leaving the UI (`apps/vizij-authoring/src/components/animatable-panel/BindingEditor.tsx`).
- **Drivers panel stats** – The Drivers toolbar renders live IR stats (binding totals, targets with issues, IR nodes, registry version) and links into the IR inspector for download/diff actions. This gives immediate feedback before exporting (`StandardInputsSection.tsx`).
- **IR inspector quick links** – The drawer can download the current IR JSON, dump the machine report, or copy a ready-to-run `vizij-ir-report --diff <current> <baseline>` command. Use this workflow when refreshing fixtures or triaging parity issues.
- **Fixture refresh workflow** – To refresh the parity fixtures, update `irParity.test.ts` snapshots (`pnpm --filter @vizij/node-graph-authoring vitest src/__tests__/irParity.test.ts --run --update`), regenerate `graphSpecParity.ts` via the helper script documented in the package README, then re-run the test + smoke suites. The app README now includes a condensed checklist.

## Maintenance & Extension

- Run `pnpm --filter @vizij/node-graph-wasm build` whenever Rust node definitions change; the build regenerates `registry.json` plus the baked module.
- Add new expression functions by extending `expressionFunctions.ts`. Each entry references metadata signatures, so diagnostics stay consistent.
- When flipping the authoring runtime/export/import flows to IR-first, update config flags in `apps/vizij-authoring` and keep the parity tests passing.

## Testing

- Metadata helpers covered by `@vizij/node-graph-wasm` tests.
- `@vizij/node-graph-authoring` suites include:
  - Deterministic IR→GraphSpec parity tests for scalar/vector/conditional/stateful/time nodes.
  - Expression parser/variable-table tests for reserved aliases, CASE expressions, operator stacks.
  - Regression snapshots for machine-report metadata (CASE annotations, operator params, vector slot info).
- Vizij-authoring smoke tests load saved binding maps, run `buildRigGraphSpec`, and assert the compiled GraphSpec hash so the UI pipeline matches the package tests.

## Open TODOs

- Document the contributor workflow for exporting machine reports, diffing them via the inspector, and filing regressions with the bug-template helper (update this reference plus `apps/vizij-authoring/AGENTS.md` and the package README).
- Add explicit import validation messaging for corrupt/missing machine reports or IR payloads, with guidance on fallback steps.
- Publish the migration checklist/demo script so downstream teams can adopt machine reports with clear QA + rollback guidance.

## Further Reading

- Proposal: `graph_authoring_ir-proposal.md`
- Plan & Tracking: `graph_authoring_ir-plan.md`
- Expression concept: `PROPOSAL-remap-expression-pipeline.md`
- Archive: `archive/graph_authoring_plan.md`, `archive/stand_up_graph_ir_plan.md`
