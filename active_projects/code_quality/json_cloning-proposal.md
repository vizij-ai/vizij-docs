# Proposal: Replace JSON Cloning with Safe Deep Clone
<!-- tags: status=accepted; topics=code-quality,performance,safety -->

> **Related documents:** [Plan & Tracking](json_cloning-plan.md) · [Reference](json_cloning-reference.md) · [Project summary](summary.md)

## Context
Currently, the codebase relies heavily on `JSON.parse(JSON.stringify(...))` for deep cloning objects. This pattern is brittle and lossy, as it strips out `Map`, `Set`, `Date`, `RegExp`, `TypedArray`, and `ArrayBuffer` instances.

## Problem Statement
- **Data Loss**: Critical data types (Maps, TypedArrays) are corrupted during cloning.
- **Performance**: JSON serialization is often slower than optimized cloning.
- **Type Safety**: Bypasses type checks, leading to runtime errors.

## Current Usage Inventory
| Area | Location(s) | Data Type(s) | Notes |
| --- | --- | --- | --- |
| **Serialization Helper** | `apps/vizij-authoring/src/utils/serialization.ts` | Arbitrary objects | Central helper; downstream usage inherits limitations. |
| **Graph Import/Export** | `graphImport.ts`, `useVizijExport.ts`, `ImportExportWorkbench.tsx` | `GraphSpec`, `IrGraph` | Must retain typed arrays and metadata timestamps. |
| **Graph Runtime** | `graphRuntime.ts` | `RawValue` | Relies on JSON fallback. |
| **Rig Importer** | `rig/importer.ts` | `RigBindingMetadata` | Metadata includes arrays/objects. |
| **Node Graph Authoring** | `@vizij/node-graph-authoring` | Graph specs, IR | Library-level cloning leaks to consumers. |
| **Render Packages** | `@vizij/utils`, `@vizij/render` | Raw values, bundles | Needs safe cloning for TypedArrays/Dates. |

## Proposed Solution
1.  **Core Helper**: `cloneDeepSafe<T>(value: T): T` in `@vizij/utils`.
    - Use `structuredClone` where available.
    - Fallback to deterministic recursive clone for older environments.
2.  **Specialised Helpers**: `cloneGraphSpec`, `cloneVizijBundle`, `cloneRawValue`.
3.  **Migration**: Systematically replace `JSON.parse(JSON.stringify(...))` calls.

## Benefits
- **Correctness**: Preserves all standard JS data types.
- **Safety**: Typed return values.
- **Future-Proofing**: Supports complex data structures.
