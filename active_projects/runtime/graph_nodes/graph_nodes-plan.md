# Graph Nodes (Expression & Compound) – Plan & Tracking
<!-- tags: status=planning; topics=graph,nodes,expression,compound,usability,ir -->

> **Related documents:** [Proposal](graph_nodes-proposal.md) · [Runtime Summary](../summary.md)

## Objective & Scope

Implement Expression Nodes and Compound Nodes in the Vizij graph stack, ensuring they integrate cleanly with `vizij-graph-core`, the Graph Spec/IR formats, and existing authoring tooling. The goal is to reduce graph complexity and improve reuse without compromising determinism or performance.

## Plan

The steps below can be followed by a junior developer, with explicit acceptance criteria.

### 1. Review existing graph runtime and IR code

1.1 Inspect `vizij-graph-core`:
- [ ] Read `vizij-rs/crates/node-graph/vizij-graph-core/README.md` to understand current capabilities, including node libraries and evaluation flow.
- [ ] Open core source files (e.g., `src/lib.rs`, node definitions, evaluation code) to see how node kinds are defined and registered.

1.2 Inspect IR and spec tooling:
- [ ] Check the IR compilation pipeline in `vizij-web` (`@vizij/node-graph-authoring`), especially any code related to node kinds and spec generation.

Acceptance criteria:
- A brief note summarizing where:
  - Node types are defined in Rust.
  - IR and Graph Spec transformations are implemented in TypeScript.

### 2. Design Expression Node representation in Rust

2.1 Define the node kind:
- [ ] Decide on a node kind identifier (e.g., `"expression"`).
- [ ] In `vizij-graph-core`, add an enum variant or equivalent representing Expression Node, alongside existing math nodes.

2.2 Sketch the node parameters:
- [ ] Define parameters such as:
    - `expression: String`
    - Metadata describing how input variables map to node input ports (e.g., a list of variable names and their associated ports).

2.3 Keep implementation within `vizij-graph-core`:
- [ ] Implement Expression Node logic as “just another node” in `vizij-graph-core`, using an internal module (e.g., `expression.rs`) if helpful.
- [ ] Avoid introducing a new external crate unless the logic becomes significantly more complex than expected.

Acceptance criteria:
- A Rust type representing an Expression Node exists, with named parameters clearly defined, even if not fully implemented.
- The chosen variable-binding model (how variables map to input ports) and shape behavior are documented in comments or module docs so future work can build on them.

### 3. Implement Expression Node parsing and evaluation

3.1 Add a simple expression parser:
- [ ] Create a small module in `vizij-graph-core` (e.g., `expression.rs`) that:
    - Parses basic expressions (`+ - * /`, parentheses).
    - Builds an internal representation (AST or RPN) suitable for evaluation.

3.2 Hook into evaluation:
- [ ] Extend the graph evaluation logic so that when an Expression Node is encountered:
    - It reads required input values from the runtime.
    - Evaluates the expression using the parsed representation.
    - Outputs the result as a numeric `Value` with appropriate `Shape`.

3.3 Add unit tests:
- [ ] Write tests in `vizij-graph-core` to verify:
    - Parsing and evaluating simple expressions.
    - Handling invalid expressions (produce clear errors).

Acceptance criteria:
- `cargo test -p vizij-graph-core` passes with new Expression Node tests.
- Expression Node can evaluate basic numeric expressions using graph inputs.
- Expression Node covers at least the same basic operations as the most common existing math nodes (e.g., add, multiply, simple trig), as validated by tests.

### 4. Represent Expression Nodes in Graph Spec and IR

4.1 Update Graph Spec schema:
- [ ] Decide how Expression Nodes appear in Graph Spec JSON (e.g., node type identifier, params).
- [ ] Add serialization/deserialization support in `vizij-graph-core` if necessary.

4.2 Update IR schema and compiler:
- [ ] In `@vizij/node-graph-authoring`, extend the IR schema to represent Expression Nodes.
- [ ] Modify `compileIrGraph` so that IR Expression Nodes are converted to Graph Spec nodes compatible with the Rust runtime.

4.3 Add tests for IR round-trip:
- [ ] Create IR fixtures containing Expression Nodes.
- [ ] Write tests ensuring:
    - IR → Graph Spec compilation works.
    - Compiled graphs evaluate as expected via existing test harnesses.

Acceptance criteria:
- Expression Nodes are representable in both IR and Graph Spec.
- IR → Spec → runtime evaluation works for basic cases.

### 5. Design Compound Node representation and schema

5.1 Define sub-graph representation:
- [ ] Decide how sub-graphs are stored in Graph Spec:
    - As a separate list of named sub-graphs.
    - Or as metadata that can be expanded into the main graph.

5.2 Define Compound Node in Rust:
- [ ] Add a node kind representing a Compound Node that references a sub-graph by ID and exposes defined inputs/outputs.

Acceptance criteria:
- A clear Rust representation exists for Compound Nodes and sub-graphs, even if not fully implemented.

### 6. Implement Compound Node compilation and evaluation

6.1 Compile-time flattening or linking:
- [ ] Implement a compiler step (either in Rust or TS) that:
    - Resolves Compound Nodes by inlining or linking sub-graphs into the main graph.
    - Performs cycle detection to avoid recursive references.

6.2 Evaluation behavior:
- [ ] Ensure that when a graph containing Compound Nodes is evaluated:
    - The composed graph behaves as if the sub-graph were expanded inline.
    - Input/output mapping for the compound is correct.

6.3 Tests and fixtures:
- [ ] Add fixtures demonstrating simple Compound Nodes (e.g., reusable math or blending sub-graphs).
- [ ] Write tests to confirm correct evaluation and cycle detection.

Acceptance criteria:
- Graphs using Compound Nodes evaluate correctly and fail gracefully when cycles are present.

### 7. Integrate with authoring tooling

7.1 Surface node kinds in `@vizij/node-graph-authoring`:
- [ ] Ensure Expression and Compound node kinds are exposed in any node registry used by graph authoring tools.

7.2 Basic authoring support:
- [ ] (If authoring UIs exist for nodes) add minimal support for:
    - Editing Expression Node parameters (expression string, input mapping).
    - Creating Compound Nodes from selected sub-graphs (even if manually for now).

Acceptance criteria:
- Authoring tools (where present) can at least display and edit basic parameters for Expression and Compound Nodes.

### 8. Plan for math-node consolidation (follow-up phase)

8.1 Inventory existing math nodes:
- [ ] In `vizij-graph-core` and related registries, list existing math-related node kinds (e.g., Add, Multiply, Sin, Max, etc.).
- [ ] For each, specify the equivalent Expression Node expression (e.g., `A + B`, `A * B`, `sin(A)`).

8.2 Validate parity via tests:
- [ ] For each math node, create a small test graph using the existing node and an equivalent graph using Expression Node.
- [ ] Verify that:
    - Both graphs produce the same outputs for representative inputs.

8.3 Prepare consolidation plan:
- [ ] Mark which math nodes can be:
    - Deprecated in favor of Expression Node.
    - Kept only for backwards compatibility or specialized behavior.
- [ ] Document a migration strategy for fixtures and user graphs (e.g., prefer Expression Node for new graphs; gradually update internal fixtures).

Acceptance criteria:
- A clear mapping exists from common math nodes to Expression Node expressions.
- Tests demonstrate parity for those nodes.
- There is a documented plan for reducing reliance on separate math nodes over time, using Expression Node as the preferred default.

## Acceptance Criteria (Overall)

- Expression Nodes:
  - Have a Rust implementation and evaluation logic in `vizij-graph-core`.
  - Are representable in IR and Graph Spec, and can be used in tests/fixtures.
  - Can express the behavior of most existing math nodes, as validated by parity tests and fixtures.
- Compound Nodes:
  - Have a Rust and schema representation.
  - Can be compiled and evaluated, including cycle detection.
- Authoring tools can work with these node types at a basic level (display/edit parameters), paving the way for richer UI in future work.
