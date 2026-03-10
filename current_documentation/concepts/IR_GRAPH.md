# Graph IR (Authoring IR) — Canonical Guide

<!-- tags: type=concept; status=living; topics=ir,graphs,authoring,validation,serialization -->

This guide explains Vizij’s **Graph IR** (“authoring IR”) at the same level of clarity as our runtime/React docs.

Use it when you are:

- building authoring features that edit graphs safely
- embedding IR into bundles
- compiling IR to runtime `GraphSpec`
- validating changes (errors vs warnings) and presenting them in UI

## 1) What IR is (and what it is not)

### IR is

- A **higher-level authoring representation** of a graph.
- A place to store:
  - human/tooling metadata (labels, descriptions, annotations)
  - structured validation findings (“issues”)
  - summaries for UI (input/output lists, binding summaries)
- A representation that **compiles to a runtime `GraphSpec`**.

### IR is not

- Not a runtime execution format.
- Not guaranteed to be the smallest or fastest representation.
- Not a replacement for the runtime’s determinism contract.

**Runtime rule of thumb**:

- The runtime executes `GraphSpec`.
- Tooling edits `IR` and produces `GraphSpec` as output.

## 2) Canonical types (source of truth)

The source of truth for IR structure is in `vizij-web`:

- `vizij-web/packages/@vizij/node-graph-authoring/src/ir/types.ts`

The canonical top-level type is `IrGraph`.

### 2.1 `IrGraph` (top-level)

An IR graph contains:

- `id: string`
  - Stable identifier for the graph artifact.
- `faceId: string`
  - The face this graph is intended to target (used in tooling and metadata).
- `nodes: IrNode[]`
- `edges: IrEdge[]`
- `constants: IrConstant[]`
- `issues: IrIssue[]`
  - Validation findings to show in UI.
- `summary: IrGraphSummary`
  - UI-friendly digest of inputs/outputs and binding summaries.
- `metadata: IrGraphMetadata`
  - Provenance/versioning information.
- `legacy?: { spec?: GraphSpec }`
  - Migration scaffold: optionally embeds a legacy runtime graph spec.

## 3) Nodes, edges, constants (structural model)

### 3.1 `IrNode`

IR nodes are the authored “operators”:

- `id: string` — stable node id
- `type: string` — node type key
- Optional UI fields:
  - `category?: string`
  - `label?: string`
  - `description?: string`
- Optional execution fields:
  - `params?: Record<string, unknown>`
  - `inputDefaults?: Record<string, unknown>`
- Optional tooling fields:
  - `metadata?: Record<string, unknown>`

### 3.2 `IrEdge`

Edges connect node outputs to node inputs:

- `from: { nodeId, portId?, component? }`
- `to: { nodeId, portId?, component? }`

In the current compiler, ports are mapped to GraphSpec’s edge format:

- `from.node_id`, `from.output`
- `to.node_id`, `to.input`

### 3.3 `IrConstant`

Constants are scalar numeric constants (with a valueType) that compile into:

- a runtime node of type `constant` with `params.value`.

## 4) Issues (errors vs warnings vs info)

`IrIssue` is the standard way to represent compile/validation findings.

Fields:

- `severity: "error" | "warning" | "info"`
- `message: string`
- `targetId?: string` — node/edge/binding id, depending on context
- `tags?: string[]` — categorization
- `details?: Record<string, unknown>` — machine-readable payload

UI guidance:

- **error**: user cannot “Apply to Runtime”
- **warning**: user can apply, but must explicitly accept risk
- **info**: diagnostics only

## 5) Summary (what UI can rely on)

`IrGraphSummary` exists so the UI does not need to re-derive every view from the raw graph.

It includes:

- `inputs: string[]` and `outputs: string[]`
  - Typically typed paths.
- `bindings: IrBindingSummary[]`
  - A structured summary of binding targets, slot aliases, expressions, node ids, etc.

This is foundational for:

- inspector dependency tracing
- “interface” group detection by key-path prefixes
- coverage validation (“do we emit expected outputs?”)

## 6) Metadata and versioning (what `registryVersion` means)

`IrGraphMetadata` includes:

- `source: string`
  - Provenance: which tool produced it.
- `generatedAt?: string`
- `registryVersion?: string`
  - Intended to encode compatibility with the node registry (node set + behaviors).
- `annotations?: Record<string, unknown>`

### 6.1 Recommendation: treat `registryVersion` as the compatibility key

A practical versioning contract:

- `registryVersion` reflects the node registry that was used when the IR was built.
- If the runtime/tooling node registry changes, then:
  - compiling old IR may still work
  - but issues may be produced (warnings/errors)
  - tooling should surface a “migration needed” banner when registry versions mismatch

## 7) Compilation: IR → GraphSpec

The compiler lives in:

- `vizij-web/packages/@vizij/node-graph-authoring/src/ir/compiler.ts`

### 7.1 Migration fallback (`legacy.spec`)

The compiler supports an incremental migration path:

- If `compileIrGraph(graph, { preferLegacySpec: true })` and `graph.legacy.spec` exists:
  - compiler returns `legacy.spec` without converting nodes/edges

This is designed to allow IR to land as a surface while the dedicated compiler matures.

### 7.2 Normal compile

If not using legacy fallback:

- Convert `IrNode[]` into runtime nodes (`NodeSpec`).
- Convert `IrConstant[]` into runtime `constant` nodes.
- Convert `IrEdge[]` into runtime edges.
- Inline single-use constants.
- Optionally attach GraphSpec metadata:
  - If `metadata.annotations.graphSpecMetadata` exists, it is cloned into `spec.metadata`.

### 7.3 Output contract

`compileIrGraph` returns:

- `{ spec: GraphSpec, issues: IrIssue[] }`

Guidance:

- Treat `issues` as first-class output.
- Do not discard them during compile/apply.

## 8) Serialization: where IR lives on disk

There are two common patterns in the current codebase:

1) **Bundle graph entries** may carry `ir` alongside `spec`.
2) **GraphSpec payloads** may embed `irGraph` in a `metadata.vizij` section during import.

Tooling guidance:

- Prefer storing IR as a sibling payload next to spec in bundle graph entries.
- Treat metadata embedding as an import/migration convenience, not the canonical storage mechanism.

## 9) How authoring should use IR (recommended pipeline)

For any authoring edit that changes runtime behavior:

1) Edit IR (draft)
2) Compile IR → GraphSpec
3) Normalize GraphSpec
4) Validate (structural + semantic)
5) Apply to runtime controllers
6) Persist (IR + compiled spec + issues + metadata)

## 10) Common failure modes & what to do

- **IR compiles but produces warnings**
  - Show warnings; allow apply with explicit confirmation.
- **IR compiles but produces errors**
  - Block apply; show actionable message + highlight target id.
- **IR registryVersion mismatch**
  - Show banner; offer migration or “compile anyway” depending on severity.
- **GraphSpec differs from IR-derived compile**
  - Show diff summary; offer “overwrite spec with IR compile” (bundle audit behavior).
