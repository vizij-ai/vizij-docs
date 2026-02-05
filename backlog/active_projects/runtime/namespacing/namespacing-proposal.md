# Proposal: Namespacing & Multi-Face Control
<!-- tags: status=draft; topics=runtime,architecture,namespacing,multi-actor -->

> **Related documents:** Plan (pending) · Reference (pending) · [Runtime Summary](../summary.md)

## Context

Current Vizij runtimes are optimized for a single "player" or actor per orchestrator instance. To support complex scenes with multiple characters (e.g., a conversation between two avatars, control panel + character, multi-face puppeteering), we need a lightweight namespacing mechanism that allows **multiple actors to share a single orchestrator/runtime** without spinning up separate WASM instances.

## Goals

- **Multi-Actor Support**: Control multiple independent rigs in the same scene while reusing a single runtime.
- **Conflict Resolution**: Prevent control signal collisions between actors by prefixing graph input/output paths with an actor namespace.
- **Simple Addressability**: Use straightforward string prefixes (namespaces) atop existing `TypedPath` parsing, without changing the `TypedPath` grammar in this phase.

## Proposed Changes (Phase 1 – Prefix-Based Namespacing)

- **Orchestrator Registration**
  - Extend graph registration structures (e.g., `MergedGraphRegistrationConfig` and related configs) to accept an **optional namespace string**.
  - When a namespace is provided, all graph inputs/outputs and controller IDs registered with the orchestrator are automatically prefixed with that namespace.
- **Runtime-React Integration**
  - Formalize and extend the existing `namespaceTypedPath`, `namespaceGraphSpec`, and `namespaceControllerId` helpers in `@vizij/runtime-react`:
    - Ensure that inputs, outputs, and controller IDs are consistently prefixed with the configured namespace.
    - Provide a small API for creating **namespaced runtime instances** that share a single orchestrator.
- **Graph Spec Handling**
  - When registering graphs, apply the namespace prefix to:
    - Input/output paths embedded in node parameters (e.g., `Output` node paths).
    - Subscription paths (inputs/outputs) used for monitoring.
- **Debug & Introspection**
  - Provide utilities to strip namespaces when presenting data in UIs (e.g., inspectors) so authors can see "local" paths where appropriate, while the runtime continues using fully namespaced paths.

## Future Work (Phase 2 – TypedPath Conventions)

This proposal intentionally **does not** change the `TypedPath` grammar. Once prefix-based namespacing is proven in production, a follow-up project can:

- Define recommended conventions for how namespaces map onto `TypedPath.namespaces`.
- Consider Rust-level helpers for constructing and validating namespaced paths.
- Align authoring tools with those conventions for better diagnostics and tooling.

## Risks & Unknowns

- **Complexity of Mixed Namespaces**: Mixing namespaced and non-namespaced graphs in the same orchestrator may cause confusion; clear defaults and documentation are required.
- **Existing Path Assumptions**: Some existing graphs or tools may assume un-namespaced paths; migration helpers and backward-compatible defaults will be important.
- **Debugging**: Namespaces add another layer when debugging issues; tooling must make it easy to see both the fully qualified and stripped paths.
