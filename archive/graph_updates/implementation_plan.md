# Vizij Node Graph Editor Upgrade Plan

## Goals
- Update the web node-graph editor so it authoritatively reflects the latest `GraphSpec` contract implemented in `vizij-graph-core` (explicit `links`, selector segments, input defaults, output shape metadata, and variadic ports).
- Ensure the editor, React runtime, and wasm bindings stay in lockstep with the new schema/fixture assets so authored graphs run unchanged in native, wasm, and orchestrator hosts.
- Improve day-to-day authoring by exposing schema documentation inside the inspector, visualising input defaults, and supporting dynamic (variadic) ports while keeping the UI modern (dark theme, collapsible panels, less visual clutter).
- Preserve a fast feedback loop: edits in the editor must round-trip through `@vizij/node-graph-wasm.normalizeGraphSpec` and evaluate via `@vizij/node-graph-react` without manual glue.

## Current State Snapshot

### Runtime & Schema (`vizij-rs`)
- `GraphSpec` now models nodes plus explicit `links`, with `LinkSpec.selector` expressed as an ordered list of `{ field | index }` segments and optional per-input fallbacks via `node.input_defaults` (`vizij-rs/crates/node-graph/vizij-graph-core/src/types.rs:43`).
- Evaluation walks a canonical topo order and enforces declared `output_shapes` while staging defaults/backfilled values (`src/eval/eval_node.rs`), meaning authored specs must supply correct shape metadata where needed.
- The `registry()` export includes rich node/port/param docs *and* variadic descriptors; consumers can surface these strings directly in tooling (`vizij-rs/crates/node-graph/vizij-graph-core/src/schema.rs:1`).

### Wasm & npm bridge
- `vizij-graph-wasm` exposes `normalize_graph_spec_json`, `get_node_schemas_json`, and runtime APIs (`load_graph`, `stage_input`, `eval_all`) that are already wired through the npm package.
- `@vizij/node-graph-wasm` re-exports async helpers (`normalizeGraphSpec`, `getNodeSchemas`, `listNodeGraphFixtures`, `graphSamples`, etc.) so browser tooling can stay canonical (`vizij-rs/npm/@vizij/node-graph-wasm/src/index.ts:258`).
- Fixtures baked into the npm package cover the new explicit-links format and showcase selectors, staged defaults, and sinks (`vizij-rs/npm/@vizij/node-graph-wasm/src/samples.ts:1`).

### React runtime (`vizij-web/packages/@vizij/node-graph-react`)
- `GraphProvider` already initialises wasm, normalises inbound specs, and exposes `getNodeSchemas` via context, but schema data is currently typed as `any` and cached outside of React state (`vizij-web/packages/@vizij/node-graph-react/src/GraphProvider.tsx:1`).
- Hooks allow staging inputs, reading outputs, and controlling playback; however, nothing in the package yet wraps node-schema docs or variadic helpers for editor consumption.

### Node graph editor app (`vizij-web/apps/node-graph-editor`)
- Uses React Flow with a cached node renderer that only supports fixed inputs/outputs; variadic ports from the registry are ignored, so users cannot add/remove connections dynamically (`EditorCanvas.tsx` nodeTypes cache).
- `useEditorStore` converts between React Flow nodes/edges and `GraphSpec`, but the conversion is best-effort, relies on stringifying to detect change, and stores selector text ad-hoc; variadic edges, defaults, and shapes require manual maintenance (`store/useEditorStore.ts`).
- `InspectorPanel` has deep editing tools for params, selectors, and input defaults, yet it does not surface node/port documentation, and value defaults are not visualised on the canvas (`components/InspectorPanel.tsx`).
- UI remains light-themed with fixed sidebars; panels cannot collapse, and dark mode styling is inconsistent (`src/styles.css`).

## Desired Outcomes
- **Spec fidelity**: authored graphs mirror the latest `GraphSpec` contract, including variadic port groups, selector JSON, declared output shapes, and inline input defaults.
- **Schema-aware UX**: palette, inspector, and connection validation all leverage the registry docs (names, descriptions, param constraints). Variadic ports are add/remove-able from both inspector and canvas.
- **Visual feedback**: nodes render input defaults and active selectors at a glance; the inspector displays registry docs and live runtime snapshots in a dark-themed, collapsible layout.
- **Fixture parity**: the editor can load/save bundled fixtures (`graphSamples`, `listNodeGraphFixtures`) and normalises specs before persistence or runtime reloads.
- **Modern shell**: the app defaults to dark mode, panels collapse/expand responsively, and developers can focus on the canvas without sacrificing access to persistence or transport controls.

## Implementation Strategy

### 1. Align data models & type safety
- Refine `useEditorStore` to use the exported TypeScript types from `@vizij/node-graph-wasm` rather than local `any` shapes, ensuring selectors, defaults, and shapes serialise back to the canonical format.
- Replace JSON string equality checks with structural comparisons (e.g., `fast-deep-equal`) or stable hashes to avoid needless graph reloads while keeping spec updates deterministic.
- Normalise all imports/exports through `normalizeGraphSpec` to catch drift immediately (especially when loading legacy graphs or fixtures).

**Why**: Strong typing plus canonical normalisation prevents silent schema drift and guarantees authored specs evaluate identically in wasm/native runtimes.

### 2. Schema & documentation integration
- Extend `RegistryProvider` to cache the typed registry (`Registry`) and expose memoised helpers that include docs, variadic descriptors, and category metadata.
- Surface node and port documentation in both the palette (tooltips/quick view) and inspector (section headers and inline help text). Use registry parameter metadata (default JSON, min/max) to seed param editors.
- Update connection validation (`connectionUtils`) to rely on the registry’s typed port info and expand suggestions using documented converter nodes.

**Why**: Every authoring decision should have inline guidance from the canonical schema so new node types are immediately usable and consistent.

### 3. Variadic port experience
- Rebuild the React Flow node renderer so it reads per-node data (including current variadic mappings) instead of global caches. Implement “ghost” handles or plus-buttons that add/remove entries for variadic port groups while respecting min/max constraints.
- Ensure inspector and canvas stay in sync: when the user adds a variadic input in the inspector, a corresponding handle appears on the node, and vice versa.
- Persist variadic connections using a stable naming convention (`groupId[index]`) so round-tripping through `nodesToSpec/specToNodes` retains order.

**Why**: Variadic ports are central to the new graph spec (e.g., blend operands). The editor must let users manage these visually without falling back to manual JSON edits.

### 4. Defaults, selectors, and shapes visibility
- Display badges or subtle annotations next to node inputs showing default values and selectors (e.g., `layers[0].gain`) so authors can verify wiring at a glance.
- In the inspector, pair each input with its resolved default (including shape) and provide quick actions to stage the default into the runtime via `useGraphRuntime`.
- Add runtime-driven validation that highlights missing required inputs, mismatched selectors, or shape conflicts using evaluation errors surfaced by `evalAll`.

**Why**: The new spec leans on input defaults and selectors; surfacing them reduces debugging friction and helps authors keep complex graphs maintainable.

### 5. Fixture integration & persistence
- Wire `PersistencePanel` (and an optional quick-load menu) to `listNodeGraphFixtures` / `graphSamples`, allowing users to bootstrap from canonical examples.
- During export/import/localStorage flows, normalise specs and preserve layout metadata separately (`{ graph, layout }`). Validate imports against the schema registry before applying to the store.
- Add smoke tests that load each bundled fixture into the editor store, run `normalizeGraphSpec`, and assert the round-trip produces identical specs.

**Why**: Guaranteeing fixture parity keeps authoring aligned with shared assets and provides regression coverage for serialisation logic.

### 6. UI & ergonomics
- Implement a dark theme (CSS variables) with optional light-mode toggle and ensure high contrast for React Flow, inspector, and palette elements.
- Make palette, inspector, and connections assistant collapsible/resizable; remember panel state in localStorage for convenience.
- Tidy the transport bar into a compact header/footer widget with runtime status, and provide a dedicated area for error toasts (evaluation failures, normalisation issues).

**Why**: A modern, focused UI reduces cognitive load, especially when juggling large graphs with many auxiliary panels.

### 7. Testing, tooling, and documentation
- Add unit tests for store converters (variadic edges, selectors, defaults), registry helpers, and connection validation logic.
- Create integration tests (Vitest + RTL-driven UI smoke tests) that ensure adding/removing variadic handles updates the spec correctly and that schema docs render in the inspector.
- Update package READMEs documenting the new capabilities, dark mode toggle, fixture loader, and normalisation workflow. Include troubleshooting tips for wasm initialisation issues surfaced during GraphProvider setup.
- Add regression coverage that loads weighted blend/variadic fixtures and asserts React Flow renders canonical handle IDs (`group::index`) while inspector/export data stays aligned.

## Progress Update (2025-10-15)
- `RegistryProvider` now emits typed signatures and memoised helpers, enabling palette/inspector documentation and schema-aware connection validation.
- Palette cards preview node docs per category, while the inspector highlights optional inputs, defaults, selectors, and variadic slots with contextual badges.
- Input panel auto-discovers `input` nodes, presents sliders/toggles for typed paths, and stages values through the wasm runtime for real-time feedback.
- React Flow nodes render with dark-mode styling, default/selector indicators, and variadic handles derived from schema metadata.
- Persistence tools gained fixture loading, wasm-backed normalisation, and refreshed controls; the app shell/transport bar support collapsible panels within a dark theme.

## Progress Update (2025-10-16)
- Iterated on variadic handle canonicalisation (legacy `foo_2` → `foo::2`), updated inspector/canvas to consume `basePortId`, and added Input Panel for staging `input` nodes.
- Current blocker: React Flow still refuses to create edges for imported variadic handles (e.g., `weight::2`), so loaded graphs render without connections. Need a simplified, tested approach to reconcile spec inputs → store → canvas without diverging handle IDs.

## Risks & Mitigations
- **Schema drift across packages**: Mitigate by typing against `@vizij/node-graph-wasm` exports and running `normalizeGraphSpec` in CI for any saved spec.
- **React Flow custom node performance**: Ensure the new node renderer memoises per-node props to prevent unnecessary re-renders when staging runtime data.
- **Variadic ordering bugs**: Use deterministic IDs (`${groupId}_${zeroBasedIndex}`) and cover with store conversion tests.
- **Dark-theme accessibility**: Audit contrast ratios and provide a light-theme toggle until the new palette is proven across monitors.

## Follow-Ups / Nice-to-haves
- Live diff view comparing runtime outputs before/after the last edit to aid regression detection.
- Graph validation command that runs the wasm evaluator against bundled fixtures and reports shape/type issues inline.
- Collaborative editing hooks (shared cursor, spec diffing) once the single-user experience stabilises.

## Validation Checklist
- [ ] All bundled fixtures load, normalise, and evaluate without runtime warnings in the editor.
- [ ] Variadic ports can be added/removed from both canvas and inspector, and the resulting spec passes `normalizeGraphSpec`.
- [ ] Inspector shows node/port/param docs pulled from the registry, with live defaults + selectors surfaced.
- [ ] Exported graphs re-import cleanly, retaining layout metadata and default annotations.
- [ ] Dark mode renders legibly across palette, canvas, inspector, and transport controls; panels remember collapse state.
