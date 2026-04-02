# Replace JSON Cloning · Plan & Tracking
<!-- tags: status=tracking; topics=code-quality,performance -->

> **Related documents:** [Proposal](json_cloning-proposal.md) · [Reference](json_cloning-reference.md) · [Project summary](../summary.md)

## Objective & Scope
Replace all instances of `JSON.parse(JSON.stringify(...))` with a robust `cloneDeepSafe` utility to ensure data integrity and improve performance.

## Workstreams / Deliverables

### 1. Core Implementation
- [x] Implement `cloneDeepSafe` in `@vizij/utils` (with `structuredClone` + fallback)
- [x] Add unit tests (Maps, Sets, TypedArrays, Circular refs)
- [x] Implement specialized helpers (`cloneGraphSpec`, `cloneVizijBundle`)

### 2. Migration Phase 1: Libraries
- [x] Migrate `@vizij/node-graph-authoring`
- [x] Migrate `@vizij/utils` and `@vizij/render`
- [x] Verify no regressions in library tests

### 3. Migration Phase 2: Applications
- [x] Replace `cloneSerializable` in `vizij-authoring`
- [x] Migrate `graphImport.ts` and `useVizijExport.ts`
- [x] Migrate `graphRuntime.ts`
- [x] Migrate Demo Apps

### 4. Guardrails
- [x] Add ESLint rule to forbid `JSON.parse(JSON.stringify(...))`

## Timeline / Stages
- **Stage 1: Core**: Implement utility and tests. (Target: Immediate)
- **Stage 2: Libraries**: Update shared packages.
- **Stage 3: Apps**: Update authoring and demos.

## Immediate Next Steps
1. Close this project.

## Risks & Mitigations
- **Behavior Change**: `structuredClone` might behave differently than JSON for edge cases (e.g. `undefined`). **Mitigation**: Comprehensive test suite comparing behaviors.
