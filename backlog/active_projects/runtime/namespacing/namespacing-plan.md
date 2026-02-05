# Namespacing & Multi-Face Control – Plan & Tracking
<!-- tags: status=planning; topics=runtime,architecture,namespacing,multi-actor -->

> **Related documents:** [Proposal](namespacing-proposal.md) · [Runtime Summary](../summary.md)

## Objective & Scope

Introduce a lightweight, prefix-based namespacing mechanism that allows multiple actors/faces to share a single orchestrator/runtime instance. This phase focuses on JavaScript/TypeScript integration (`@vizij/runtime-react`, `@vizij/orchestrator-react`) and config structures, without changing the Rust `TypedPath` grammar.

## Plan

The following steps can be executed in order by a junior developer, with explicit acceptance criteria.

### 1. Document current namespacing helpers and usage

1.1 Review existing helpers in `@vizij/runtime-react`:
- [ ] Inspect `vizij-web/packages/@vizij/runtime-react/src/VizijRuntimeProvider.tsx` for:
    - `namespaceTypedPath`
    - `stripNamespace`
    - `namespaceControllerId`
    - `namespaceSubscriptions`
    - `namespaceGraphSpec`

1.2 Identify current usage patterns:
- [ ] Search for `namespaceTypedPath(`, `stripNamespace(`, and related functions within the file to see where and how they are used.
- [ ] Note which public props or options on `VizijRuntimeProvider` or related APIs influence the namespace (e.g., `namespace` or similar props).

Acceptance criteria:
- A short note (e.g., in this plan or a local comment) summarizing:
  - What namespacing helpers exist.
  - How they are currently invoked (and any gaps).

### 2. Ensure `VizijRuntimeProvider` has a clear namespacing API

2.1 Define or confirm the namespace prop:
- [ ] If not already present, add a `namespace?: string` prop to `VizijRuntimeProviderProps` in `vizij-web/packages/@vizij/runtime-react/src/types.ts`.
- [ ] Ensure `VizijRuntimeProvider` reads this prop and passes it consistently into:
    - Graph registration (via `GraphRegistrationConfig`).
    - Subscriptions (via `namespaceSubscriptions`).
    - Controller IDs (via `namespaceControllerId`).

2.2 Add TypeScript doc comments:
- [ ] Document the `namespace` prop in the type definition, explaining:
    - It is a prefix used to distinguish actors/faces within one orchestrator.
    - It does not change the underlying Rust `TypedPath` grammar.

Acceptance criteria:
- `VizijRuntimeProviderProps` includes an optional `namespace` prop, and `VizijRuntimeProvider` uses it consistently wherever namespacing helpers are applied.

### 3. Add tests for namespace behavior in `@vizij/runtime-react`

3.1 Create unit tests for path namespacing helpers:
- [ ] Under `vizij-web/packages/@vizij/runtime-react/src/__tests__/`, add tests (e.g., `namespacing.test.ts`) that:
    - Verify `namespaceTypedPath` prefixes paths and handles `debug/` prefixes correctly.
    - Verify `stripNamespace` removes the namespace from both regular and `debug/` paths.
    - Verify `namespaceControllerId` adds a `namespace/kind/` prefix appropriately.

3.2 Create an integration-style test for `VizijRuntimeProvider`:
- [ ] Add a test that:
    - Creates two instances of `VizijRuntimeProvider` (or two graphs within one provider) with different `namespace` values.
    - Registers simple graphs or subscriptions that would conflict without namespacing.
    - Asserts that:
        - Inputs/outputs are correctly namespaced (e.g., via logs or exposed state).
        - Controller IDs are distinct across namespaces.

Acceptance criteria:
- New tests compile and pass via `pnpm --filter "@vizij/runtime-react" test`.
- Tests clearly demonstrate that namespaced providers do not collide in their paths or controller IDs.

### 4. Extend orchestrator registration structures to support namespaces

4.1 Update config types:
- [ ] In `@vizij/orchestrator-react` (likely under `vizij-web/packages/@vizij/orchestrator-react/src`):
    - Locate `CreateOrchOptions`, `GraphRegistrationConfig`, and any related configs.
    - Add an optional `namespace?: string` field where appropriate.

4.2 Pass namespace through to graph registration:
- [ ] Ensure that when `VizijRuntimeProvider` (or other high-level APIs) register graphs with the orchestrator, they:
    - Include the namespace value in the config.
    - Ensure any existing calls to `namespaceGraphSpec` and `namespaceSubscriptions` align with this field.

Acceptance criteria:
- Config types in `@vizij/orchestrator-react` support an optional `namespace` field.
- Graph registration calls in `@vizij/runtime-react` correctly populate this field when a namespace is provided.

### 5. Add an example showcasing multi-face/multi-actor namespacing

5.1 Create or update a demo app:
- [ ] Select a minimal demo app (e.g., `apps/minimal-demo-orchestrator` or `apps/demo-vizij-player`) in `vizij-web`.
- [ ] Add a simple example scenario where:
    - Two actors/faces are controlled within the same runtime.
    - Each actor uses a distinct `namespace` when registered.

5.2 Document and verify the behavior:
- [ ] Add a short section to the app’s README or docs explaining how namespacing is configured.
- [ ] Manually verify that controls for one actor do not affect the other (and vice versa).

Acceptance criteria:
- A demo exists where multiple actors/faces share a runtime but are distinguished by namespace.
- The demo can be started locally (`pnpm --filter <app> dev`) and behaves as documented.

### 6. Update documentation and summary

6.1 Update `vizij_docs`:
- [ ] Add a brief description of the namespacing API to the runtime documentation (either in this plan or a dedicated doc under `vizij_docs/current_documentation`).
- [ ] Update `vizij_docs/active_projects/runtime/summary.md` to:
    - Mark the plan as in progress.
    - Ensure links to proposal and plan are correct.

6.2 Capture open questions for Phase 2:
- [ ] Note any design questions that arise related to:
    - How namespaces might eventually map into `TypedPath.namespaces`.
    - How authoring tools should display namespaced vs local paths.

Acceptance criteria:
- Documentation exists that explains how to use namespacing in `@vizij/runtime-react` and `@vizij/orchestrator-react`.
- Any unresolved questions for a future TypedPath-focused phase are recorded.

## Acceptance Criteria (Overall)

- `VizijRuntimeProvider` exposes and uses a `namespace` prop to avoid collisions between multiple actors/faces.
- `@vizij/runtime-react` and `@vizij/orchestrator-react` have tests exercising namespacing behavior.
- At least one demo demonstrates multi-actor namespacing in practice.
- Documentation clearly describes how to configure and reason about namespaces in the runtime.

