# Graph Nodes (Expression & Compound) Proposal
<!-- tags: status=proposal; topics=graph,nodes,expression,compound,usability,ir -->

> **Related documents:** Plan (pending) · Reference (pending) · [Runtime Summary](../summary.md)

## 1. Summary

This project aims to significantly improve the authoring experience and runtime performance of the Node Graph stack by introducing two key node types: **Expression Nodes** (for parsing math strings) and **Compound Nodes** (for encapsulating sub-graphs). Both features should compile cleanly through the existing Graph Spec and IR pipelines, reducing graph complexity without sacrificing determinism.

## 2. Problem Statement

Currently, simple mathematical operations (e.g., `A + B * C`) require chaining multiple primitive nodes (Add, Multiply), leading to "spaghetti graphs" that are hard to read and slower to evaluate. Additionally, there is no native mechanism to reuse groups of nodes, forcing authors to copy-paste logic, which violates DRY principles and makes maintenance difficult.

These limitations make graphs harder to maintain in both Rust fixtures (`vizij-graph-core` tests) and tooling (graph inspectors and authoring UIs).

## 3. Goals

- **Expression Node**: Allow authors to write a single math expression string that is parsed and evaluated efficiently, with clear error messages when expressions are invalid.
- **Compound Nodes**: Allow authors to group a set of nodes into a reusable "Compound" with defined inputs and outputs, suitable for both authoring and fixtures.
- **IR Alignment**: Ensure both features integrate cleanly with the IR-first workflow and `compileIrGraph`, avoiding ad-hoc encoding in GraphSpec.
- **Performance**: Ensure these abstractions compile down to efficient runtime structures with predictable evaluation cost.

## 4. Proposed Solution

### 4.1 Expression Node

1. **Parser & Representation**
   - Integrate a lightweight math parser (e.g., a small custom parser or an embedded library) into `vizij-graph-core` or a sibling crate.
   - Represent expressions as an AST or bytecode that can be cached across frames.
2. **Node Design**
   - Add a new node type to the Graph Spec/registry with:
     - A string parameter (the expression).
     - A dynamic set of named input ports (e.g., `A`, `B`, `C`).
   - Surface parse/validation errors:
     - At graph load/compile time when possible.
     - As deterministic runtime errors otherwise, with clear messages.
3. **IR & Graph Spec Integration**
   - Extend the IR schema to describe expression nodes explicitly (node kind + expression + input aliases).
   - Update `compileIrGraph` so that both IR and legacy GraphSpec paths produce the same runtime node representation.

### 4.2 Compound Nodes

1. **Sub-Graph Schema**
   - Extend the Graph Spec/IR to support:
     - Named sub-graphs with defined inputs/outputs.
     - A "Compound" node that references a sub-graph by ID.
2. **Compilation Strategy**
   - Implement compiler/normalizer logic that:
     - Flattens sub-graphs into the main graph when appropriate, or
     - Treats compounds as reusable units with clear boundaries.
   - Enforce cycle detection to prevent recursive compounds (e.g., a compound referencing itself).
3. **Authoring Hooks**
   - Provide clear hooks for future node-graph authoring tools to:
     - Create, edit, and reuse compounds.
     - Display compounds as collapsible groups within a graph editor.

## 5. Risks & Unknowns

- **Parser Performance**: Parsing expressions at runtime can be slow; expressions must be parsed once and cached, with invalid expressions detected early.
- **Error Reporting**: Poor error messages for expression syntax or compound wiring could make authoring harder instead of easier.
- **Recursion & Cycles**: Compound nodes introduce the risk of infinite recursion (cycles). Robust cycle detection and clear diagnostics are critical.

## 6. Success Metrics

- **Graph Size**: Reduction in node count for standard math-heavy rigs and fixtures compared to equivalent graphs without Expression/Compound nodes.
- **Authoring Speed**: Reduced time for authors to implement common logic patterns (e.g., math expressions, reusable subgraphs).
- **IR Compatibility**: IR-first flows can round-trip Expression and Compound nodes without lossy transforms or special cases.
