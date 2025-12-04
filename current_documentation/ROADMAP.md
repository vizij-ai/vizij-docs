# Vizij Roadmap & Active Projects
<!-- tags: status=living; topics=roadmap,strategy,planning -->

## Strategic Pillars

We organize our work into four key strategic pillars. Each pillar has its own detailed tracking document in `vizij_docs/active_projects/`.

### 1. [Website & Ecosystem](../active_projects/website/summary.md)
**Goal**: Build a comprehensive, high-quality web presence (Home, Learn, Docs, Showcase) hosted in a separate repository with CMS-driven content and automated documentation syncing.
- **Key Projects**: Separate Repo & CMS, Automated Docs, Full Site Architecture.
- **Immediate Focus**: Landing page "wow" factor, structured tutorials.

### 2. [Code Quality & Performance](../active_projects/code_quality/summary.md)
**Goal**: Ensure robustness, performance, and maintainability through rigorous testing and optimization.
- **Key Projects**: JSON Cloning Replacement, Node Graph Speed, Expanded Testing, WASM Hardening.
- **Immediate Focus**: Replacing `JSON.parse(JSON.stringify)` with safe deep cloning.

### 3. [Runtime](../active_projects/runtime/summary.md)
**Goal**: Advance core capabilities for rich interactive experiences (Audio/Video, Multi-actor).
- **Key Projects**: Rust Audio/Video, Namespacing, Multi-screen support.
- **Immediate Focus**: Audio/Video processing hooks, Namespacing architecture.

### 4. [Authoring](../active_projects/authoring/summary.md)
**Goal**: Deliver dense, maintainable authoring surfaces and advanced creative tools.
- **Key Projects**: UI/UX Polish (Doug's feedback), Modular Pose Rig, Graph Authoring IR.
- **Immediate Focus**: Function Editor improvements, Scene Visual enhancements, Modularizing Pose Rig state.

---

## High-Level Roadmap

### Near-Term (Next Release Cycle)
- **Website**: Launch updated Home and Learn sections.
- **Runtime**: Ship basic audio/video processing hooks and namespacing design.
- **Authoring**:
  - Implement "Doug's Feedback" (Undo/Redo, Number controls, Show/Hide).
  - Execute [Modular Pose Rig Plan](../active_projects/authoring/modular_pose_rig-plan.md).
- **Code Quality**:
  - [x] Complete [JSON Cloning Replacement](../active_projects/code_quality/json_cloning-plan.md).
  - Ship WASM hardening (tests/ABI checks).

### Medium-Term
- **Website**: Node-Graph Migration (integrate `@vizij/node-graph-react` into marketing site).
- **Runtime**: Multi-face namespacing and multi-screen puppeteering support.
- **Authoring**:
  - Advanced Animation Authoring tools.
  - Behavior Tree design and implementation.
- **Code Quality**: Establish automated performance benchmarks for graphs and rendering.

### Long-Term
- **Ecosystem**: Full integration with new Animation Editor.
- **Runtime**: Worker-based off-main-thread orchestration.
- **Authoring**: Rigging tools further up the chain.

### Backlog & Ideas
- **CI/CD Config Schema**: Implement `ci.config.json` support for shell scripts to allow declarative configuration of skip/extra flags.

---

## Active Projects Directory

- **[Website Summary](../active_projects/website/summary.md)**
- **[Code Quality Summary](../active_projects/code_quality/summary.md)**
- **[Runtime Summary](../active_projects/runtime/summary.md)**
- **[Authoring Summary](../active_projects/authoring/summary.md)**

## Archived Projects

- **[CI/CD Summary](../archive/ci_cd/summary.md)** (Completed/Stabilized)
