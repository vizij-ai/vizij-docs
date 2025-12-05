# Behavior Tree Integration Proposal
<!-- tags: status=proposal; topics=ai,behavior,logic,control,discovery -->

> **Related documents:** Plan (pending) · Reference (pending) · [Runtime Summary](../active_projects/runtime/summary.md)

## 1. Summary

This project proposes a **discovery and design phase** for integrating Behavior Trees (BTs) into the Vizij runtime. BTs will eventually provide a structured, hierarchical way to model high-level character logic and interactivity, complementing the lower-level Node Graph (which handles continuous signal processing). The focus of this proposal is on research, requirements gathering, and data model design rather than immediate implementation.

## 2. Problem Statement

The current Node Graph is excellent for continuous data flow (animation blending, IK), but it is cumbersome for stateful, decision-making logic (e.g., "If player is close, wave; else, idle"). Implementing this logic in a flow graph leads to complex, brittle "state machine" structures. A dedicated BT system is the industry standard for this type of AI/logic, but there are many possible design choices (tick rates, blackboard semantics, composition patterns) which must be carefully evaluated for Vizij’s use cases.

## 3. Goals (Discovery Phase)

- **Requirements Gathering**: Document concrete use cases for BTs in Vizij (interactive characters, installation logic, multi-face puppeteering).
- **Interoperability Design**: Specify how BTs will drive Node Graph inputs and read outputs, and how they will interact with the Orchestrator blackboard.
- **Data Model & Schema**: Design a BT data format that can be stored alongside graph/animation assets and that can support future visual BT editing.
- **Evaluation of Prior Art**: Survey existing BT implementations and patterns (in games, animation tools, robotics) and map them to Vizij’s architecture.

## 4. Long-Term Direction (Out of Scope for This Phase)

The following are **future implementation goals** that this discovery work should enable but not deliver immediately:

1. **Core Crate** – A `vizij-behavior-core` crate implementing standard BT nodes (Selector, Sequence, Decorator, Leaf) with deterministic stepping.
2. **Runtime Integration** – Registration of the BT system as a Controller in the Orchestrator, including scheduling, tick rates, and error handling.
3. **Blackboard Usage** – Clear conventions for using the existing Orchestrator blackboard for BT state storage and communication with other systems.
4. **WASM Exposure** – WASM bindings that expose the BT stepper to web runtimes.
5. **Authoring Surfaces** – A data model that can underpin future BT editors in Vizij Authoring and related tools.

## 5. Risks & Unknowns

- **State Management**: BTs are inherently stateful. Managing this state across the WASM boundary while preserving determinism requires careful design.
- **Scheduling & Performance**: Choosing appropriate tick rates and integration points with the Orchestrator and Graph evaluation loops is non-trivial.
- **UI Complexity**: Building a good BT editor is a significant UI undertaking; the data model must support this without over-constraining UX.
- **Scope Creep**: Without a clear discovery boundary, the project could slip into implementation prematurely.

## 6. Success Metrics (for Discovery Phase)

- **Design Artifacts**: A clear BT architecture document covering data model, interoperability with graphs/orchestrator, and scheduling strategy.
- **Use Case Coverage**: Demonstrated mapping between target use cases and the proposed BT design (with examples).
- **Implementation Readiness**: A backlog of well-scoped implementation tasks (crates, APIs, integration points) that can seed future execution work.
