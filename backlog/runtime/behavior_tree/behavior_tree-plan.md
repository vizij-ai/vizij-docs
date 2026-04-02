# Behavior Tree Integration (Discovery & Design) – Plan & Tracking
<!-- tags: family=project; type=plan; project_status=planning; topics=ai,behavior,logic,control,discovery -->
> **Last updated:** 2026-03-31

> **Related documents:** [Proposal](behavior_tree-proposal.md) · [Runtime Summary](../summary.md)

## Objective & Scope

Conduct a focused discovery and design phase for Behavior Trees (BTs) in Vizij. The goal is to understand requirements, design a data model and runtime integration strategy, and produce a clear implementation backlog. This phase does **not** implement a BT runtime.

## Plan

The steps below can be executed in order by a junior developer, with guidance from senior stakeholders where questions are raised. Where the proposal is not yet specific enough, open questions are explicitly called out.

### 1. Gather and document BT use cases within Vizij

1.1 Collect internal scenarios:
- [ ] Interview or asynchronously consult with stakeholders (runtime, authoring, and product) to gather concrete BT use cases, such as:
    - Interactive characters responding to user inputs.
    - Installation logic (e.g., stage sequences, idle behaviors).
    - Multi-face puppeteering where high-level logic coordinates multiple rigs.

1.2 Map existing control flows:
- [ ] Review how similar logic is currently implemented:
    - In Node Graphs (e.g., state-machine-like graphs).
    - In orchestrator controllers or ad-hoc JS.

Acceptance criteria:
- A short document or section in this plan describing at least 3–5 concrete BT use cases and how they are currently handled.

### 2. Survey existing BT implementations and patterns

2.1 Research prior art:
- [ ] Look at common BT implementations in:
    - Game engines (e.g., Unity, Unreal Engine BTs).
    - Open-source BT libraries in Rust or TypeScript.
    - Animation/AI tooling where BTs drive behavior graphs.

2.2 Extract design patterns:
- [ ] Summarize:
    - Common node types (Selector, Sequence, Decorators, Leaf).
    - Typical blackboard designs.
    - Tick/update semantics (how often BTs run, how they interact with frame loops).

Acceptance criteria:
- A concise summary of 2–3 representative BT designs and what aspects might fit Vizij.

### 3. Design a BT data model suitable for Vizij

3.1 Draft a BT schema:
- [ ] Propose a schema (e.g., JSON or IR-like) for representing a BT, including:
    - Node types and their parameters.
    - Tree structure (children relationships).
    - References to Node Graph inputs/outputs or orchestrator blackboard entries.

3.2 Consider integration with existing assets:
- [ ] Define how BT assets would live alongside:
    - Graph specs and IR.
    - Animation clips and bundles.

3.3 Open questions (to be answered with stakeholders):
- [ ] BT crate layout is now decided: core BT runtime lives in its own crate/stack (e.g., `vizij-behavior-core`), with configuration and graph-specific glue living alongside orchestrator and graph assets. Confirm any naming/stack conventions before implementation.
- [ ] Should BT nodes reference Node Graph inputs/outputs by typed path, standard input ID, or another identifier? (This still needs a concrete decision.)

Acceptance criteria:
- A draft BT schema is written down (even if not yet implemented), with open questions clearly listed for review.

### 4. Design interoperability between BTs, Node Graphs, and the Orchestrator

4.1 Define how BTs drive graphs:
- [ ] Specify how a BT node can:
    - Set Node Graph input values (e.g., toggling standard inputs or pose triggers).
    - React to graph outputs or state.

4.2 Define how BTs use the orchestrator blackboard:
- [ ] Propose a convention for:
    - BT-local state vs. shared state on the orchestrator blackboard.
    - Namespacing/keys to avoid collisions with other systems.

4.3 Tick semantics:
- [ ] Outline how often BTs should run relative to:
    - Graph evaluation.
    - Animation updates.
    - External inputs.

Acceptance criteria:
- A written description of:
  - How BTs will read/write data to graphs and the orchestrator.
  - How often they should be evaluated relative to other systems.

### 5. Define a minimal BT runtime API (spec-level, not implementation)

5.1 Sketch core runtime API:
- [ ] Define in pseudo-code or interface form functions such as:
    - `tick(tree, blackboard) -> status`
    - `reset(tree, blackboard)`
    - Initialization functions for loading BT assets.

5.2 Identify required integration points:
- [ ] List where in the orchestrator loop these APIs would be called once implemented.

Acceptance criteria:
- A minimal set of runtime API signatures is documented that could be implemented in a future phase.

### 6. Produce an implementation backlog and summary document

6.1 Break down future work:
- [ ] Based on the design, create a list of concrete implementation tasks, such as:
    - Implement `vizij-behavior-core` crate with core node types.
    - Add WASM bindings for BT tick functions.
    - Integrate BT evaluation into the orchestrator frame loop.
    - Add basic authoring visualization support.

6.2 Summarize design decisions and open questions:
- [ ] Write a short summary document (may live alongside this plan) that:
    - Captures the chosen design direction.
    - Explicitly lists open questions needing senior input before implementation.

Acceptance criteria:
- There is a well-defined backlog of implementation tasks for a future BT runtime.
- Design decisions and unresolved questions are documented for review.

## Acceptance Criteria (Overall)

- The discovery phase produces:
  - A clear set of BT use cases and requirements for Vizij.
  - A draft data model and runtime integration strategy.
  - A minimal runtime API specification.
  - A prioritized list of implementation tasks for a future phase.
- Open questions are explicitly identified so that the design can be finalized collaboratively before coding begins.
