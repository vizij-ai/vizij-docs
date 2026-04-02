# Vizij Node Graph Consolidation Plan

_Created: 2024-03-17 00:00 UTC — update timestamps inline as work progresses._

## Working Agreements
- Document every substantive change with an entry under the relevant task that includes the date, UTC time, author initials, and a short status note (e.g., `[2024-03-18 14:32 UTC • CJ] shape validation merged`).
- Keep this plan as the single source of truth for scope discussion; if scope changes, update the corresponding section before implementation begins.
- Link PRs, commits, and issue tickets as they appear.

## Phase 1 — Core Rust Enhancements (vizij-rs)
**Goal:** Align `vizij-graph-core` with the unified Shape/Value/TypedPath architecture.

| Task | Details | Dependencies | Status / Notes |
|------|---------|--------------|----------------|
| 1.1 Output shape enforcement | Update `eval_node`/`PortValue` to honor `NodeSpec.output_shapes`: validate, warn, or error on mismatch; fall back to inference when unspecified. Add unit tests per node category. | — | _In progress_ |
| 1.2 Typed path adoption | Change `NodeParams.path` to `Option<TypedPath>`; update serde to accept strings; validate on load; introduce `WriteBatch` emission directly in `evaluate_all`. | 1.1 | _Completed_ |
| 1.3 Vector semantics | Introduce `ShapeId::Vector` (or metadata flag) differentiating semantic vectors from generic lists; adjust `Value` serialization/inference accordingly. | 1.1 | _Completed_ |
| 1.4 Coercion dedupe | Refactor numeric helpers to reuse `vizij_api_core::coercion`. Ensure parity via tests. | 1.1 | _Completed_ |
| 1.5 Documentation refresh | Update `vizij-graph-core/README.md` with new behavior, examples, TODO adjustments. | 1.1–1.4 | _Completed_ |

- [2024-03-17 18:45 UTC • Codex] Implemented runtime output-shape enforcement (`eval_node` now validates declared shapes and surfaces mismatches) and added coverage tests so graphs fail fast when schema declarations and values diverge. This guards against silent drift while letting undeclared ports continue to use inferred shapes.
- [2024-03-17 19:20 UTC • Codex] Node params now carry strongly-typed `TypedPath` values, and `evaluate_all` emits a `WriteBatch` directly from Output nodes. Core tests cover both the happy path and write emission to ensure hosts (Bevy, wasm) receive validated, structured paths without duplicating path parsing logic.
- [2024-03-17 19:55 UTC • Codex] Added an explicit `ShapeId::Vector` (with length hints) so numeric vectors no longer masquerade as generic lists. Inference, shape validation, and tests were updated to keep vector operations type-safe and to give downstream UIs enough metadata to size controls accurately.
- [2024-03-17 20:10 UTC • Codex] Replaced bespoke `as_float`/`as_bool` conversions with the shared coercion helpers from `vizij_api_core`, eliminating drift between modules and ensuring future coercion fixes automatically flow into node evaluation.
- [2024-03-17 20:25 UTC • Codex] Reworked `vizij-graph-core/README.md` to document shape enforcement, typed-path writes, and the new vector semantics so future contributors have an up-to-date snapshot of the runtime contract and roadmap.

## Phase 2 — Wasm Layer & npm Package (vizij-rs)
**Goal:** Reflect core changes through the wasm/TypeScript boundary.

| Task | Details | Dependencies | Status / Notes |
|------|---------|--------------|----------------|
| 2.1 JSON normalization utilities | Centralize spec/value normalization for reuse (Rust -> exported helper) and ensure non-`value` params (`sizes`, `path`, composites) handle new shape rules. | Phase 1 | _Completed_ |
| 2.2 `eval_all` output contract | Update wasm result structure to include `WriteBatch` output, verify typed path serialization, and extend TypeScript `ShapeJSON` union with vector metadata. | 2.1 | _Completed_ |
| 2.3 Setters coverage | Allow `set_param` to edit `path` and any new params; enforce validation errors. | 2.1 | _Completed_ |
| 2.4 Typed docs & README | Revise `npm/@vizij/node-graph-wasm` README, types, and changelog drafts to capture the new schema. | 2.1–2.3 | _Completed_ |

- [2024-03-17 20:40 UTC • Codex] Extracted `normalize_graph_spec_json` in the wasm layer so both Rust and JS callers share identical spec normalization (including paths and numeric arrays).
- [2024-03-17 20:45 UTC • Codex] `eval_all` now serializes writes straight from the core `WriteBatch`, and TypeScript’s `ShapeJSON` union gained the new `Vector` variant to mirror the Rust schema.
- [2024-03-17 20:50 UTC • Codex] Extended `set_param` to handle typed path updates (with validation) and to coerce numeric arrays via the shared vector helper, keeping runtime edits schema-compliant.
- [2024-03-17 21:25 UTC • Codex] Refreshed the wasm wrapper docs/types to surface the new vector shape and `normalizeGraphSpec` helper so downstream tooling can rely on the unified API.

## Phase 3 — React Provider (vizij-web)
**Goal:** Modernize `@vizij/node-graph-react` to match the updated runtime contract.

| Task | Details | Dependencies | Status / Notes |
|------|---------|--------------|----------------|
| 3.1 Shared normalization hook-up | Replace local normalization with shared helper from wasm package; ensure lazy loading and error surfacing. | Phase 2 | _Completed_ |
| 3.2 Full Value/Shape support | Extend equality/render helpers to handle transforms, quats, records, enums, lists/tuples; leverage `ShapeJSON`. | 3.1 | _Completed_ |
| 3.3 Path editing UX | Expose `params.path` editing in provider API and Inspector UI (including validation feedback). | 3.2 | _Completed_ |
| 3.4 Logging & perf cleanup | Remove console noise, fix hook dependency omissions (`useNodeOutputs`), and benchmark updateHz behavior. | 3.1 | _Completed_ |
| 3.5 Provider documentation | Ensure README, JSDoc, and storybook/example code reflect new capabilities and integration steps. | 3.1–3.4 | _Completed_ |

- [2024-03-17 21:05 UTC • Codex] Simplified the React provider to rely on the wasm crate for spec normalization, removed bespoke logging, and delegated param conversions to the shared runtime.
- [2024-03-17 21:10 UTC • Codex] Expanded React-side value helpers to understand transforms, quaternions, colors, enums, and composites so UI consumers can reason about the richer `ValueJSON` surface without bespoke conversions.
- [2024-03-17 21:20 UTC • Codex] Added editable typed-path support to the Inspector (with validation feedback) so output nodes can bind directly to runtime paths, and cleaned up hook dependencies/logging for smoother updates.
- [2024-03-17 21:22 UTC • Codex] Updated the React wrapper README to document path edits and the expanded value support so consumers know how to drive the new API surface.

## Phase 4 — Demo Application (vizij-web)
**Goal:** Showcase the end-to-end graph with accurate schema alignment.

| Task | Details | Dependencies | Status / Notes |
|------|---------|--------------|----------------|
| 4.1 Schema-driven palette | Replace hardcoded node registries/zod enums with data from `getNodeSchemas()`, including dynamic port labels and categories. | Phase 3 | _Completed_ |
| 4.2 Graph builder updates | Preserve `output_shapes`, `TypedPath` params, and new vector metadata when serializing nodes/edges. | 4.1 | _Completed_ |
| 4.3 Inspector & nodes | Update all node components to render new value types (records, transforms) and path outputs; ensure history charts respect new vector semantics. | 4.1–4.2 | _Completed_ |
| 4.4 Persistence & import/export | Ensure local storage and export flows store the enriched spec (shapes, paths, vector metadata). | 4.2 | _Completed_ |

- [2024-03-17 21:35 UTC • Codex] Node palette now derives its sections from the schema registry, keeping labels/categories in sync with the Rust registry while retaining a fallback set for offline work.
- [2024-03-17 21:40 UTC • Codex] Graph serialization preserves user-provided `output_shapes` and typed paths, with inspector/path UIs updated to surface and edit bindings directly on Output nodes.
- [2024-03-17 21:45 UTC • Codex] Display helpers and node components were expanded to visualize complex values (transforms, enums, composites), and local persistence automatically carries the richer spec data.
- [2024-03-17 22:10 UTC • Codex] Demo UI now uses a single schema-driven node component, restores live output/inspector updates, doubles history retention to 200 samples, and hooks palette/inspector edits directly into the wasm registry metadata.

## Phase 5 — Documentation & Test Harness
**Goal:** Consolidate knowledge and add coverage once functional work stabilizes.

| Task | Details | Dependencies | Status / Notes |
|------|---------|--------------|----------------|
| 5.1 Testing sweep | Add/refresh tests across Rust core, wasm bindings, and React demo based on gaps identified during implementation. | Phases 1–4 | _Completed_ |
| 5.2 Documentation pass | Update READMEs, inline docs, and demo guidance to reflect the new architecture and workflows. | 5.1 | _Completed_ |

- [2024-03-17 21:55 UTC • Codex] Added unit and integration tests across the stack (core, wasm, React provider, demo) using "it should" naming to document behaviour; all suites run cleanly via the documented commands.
- [2024-03-17 21:58 UTC • Codex] Authored comprehensive documentation (`vizij-docs/node-graph.md`, refreshed package/app READMEs) explaining the node graph pipeline, testing strategy, and developer workflows.

## Parking Lot / Future Considerations
- Node clustering and reusable subgraphs: capture requirements and design before implementing (not in current scope).
- Bevy integration follow-up once typed paths/write batches stabilize.
- Potential telemetry hooks for demo usage analytics.
