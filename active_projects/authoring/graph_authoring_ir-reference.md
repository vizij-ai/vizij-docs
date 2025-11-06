# Graph Authoring IR Reference
<!-- tags: status=reference; topics=graph-ir,tooling,runtime,automation-testing -->

> **Related documents:** [Proposal](graph_authoring_ir-proposal.md) · [Plan](graph_authoring_ir-plan.md) · [Project summary](summary.md)

> Draft reference. Sections marked *TBD* will be updated as IR implementation lands. Existing content reflects current metadata pipeline and shared package work derived from `archive/graph_authoring_plan.md` and `archive/stand_up_graph_ir_plan.md`.

## Summary

The Graph Authoring IR initiative introduces a metadata-driven intermediate representation to build node graphs reliably. Metadata now ships from Rust to TypeScript, and the `@vizij/node-graph-authoring` package centralises graph-building utilities. Full IR abstraction and expression-driven authoring are in progress.

## System Overview

### Current State

- **Metadata**: `@vizij/node-graph-wasm` bundles `registry.json` with helper APIs (`getNodeRegistry`, `requireNodeSignature`, `listNodeTypeIds`, etc.) generated from Rust.
- **Authoring Package**: `@vizij/node-graph-authoring` exposes binding utilities (`graphBuilder`, `expressionFunctions`, `state`) that now consume metadata to map functions to node types.
- **Authoring App**: Imports shared package, relying on metadata for expression node selection.

### Target State *(TBD)*

- IR types representing nodes, edges, and graph structure separate from GraphSpec.
- Compiler translating IR graphs to GraphSpec.
- Expression-first bindings generating IR nodes via metadata-driven lookups.
- Snapshot tests guarding parity with existing outputs.

## Key Decisions

- Use Rust pipeline to export node registry, avoiding manual duplication.
- Keep authoring package framework-agnostic so other apps/tooling can reuse IR builders.
- Delay full expression migration until IR foundations are solid.

## Usage Guide *(Current Capabilities)*

- Access node metadata:
  ```ts
  import { getNodeRegistry, requireNodeSignature } from "@vizij/node-graph-wasm/metadata";
  ```
- Leverage metadata-backed expression functions in authoring package:
  ```ts
  import { SCALAR_FUNCTIONS } from "@vizij/node-graph-authoring";
  const addDef = SCALAR_FUNCTIONS.get("add");
  ```
- Build graphs via shared `buildRigGraphSpec` until IR abstraction is ready.

## Maintenance & Extension

- Run `pnpm --filter @vizij/node-graph-wasm build` to regenerate registry when Rust types change.
- Update `expressionFunctions.ts` when adding new scalar functions (metadata ensures signatures stay aligned).
- Once IR types land, update this reference with builder/compilation examples.

## Testing

- Metadata helpers covered by `@vizij/node-graph-wasm/tests/all.test.ts`.
- `@vizij/node-graph-authoring` retains existing GraphSpec-based unit tests; IR parity tests are pending.

## Open TODOs

- Define IR schema and compiler API.
- Add snapshot/parity tests.
- Document migration path for expression-first bindings.

## Further Reading

- Proposal: `graph_authoring_ir-proposal.md`
- Plan & Tracking: `graph_authoring_ir-plan.md`
- Expression concept: `PROPOSAL-remap-expression-pipeline.md`
- Archive: `archive/graph_authoring_plan.md`, `archive/stand_up_graph_ir_plan.md`
