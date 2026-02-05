# Vizij Roadmap & Active Projects
<!-- tags: status=living; topics=roadmap,strategy,planning -->

This document outlines the strategic direction for Vizij. It is organized by our four key pillars, detailing the goals and timeline for each.

---

## 1. [Code Quality & Foundation](../active_projects/code_quality/summary.md)
**Goal**: Solidify the codebase, ensuring robustness, performance, and maintainability.

### Near-Term (Stabilization)
-   **WASM Boundary Optimization**: Minimize JS/WASM boundary crossings (serialization overhead) by moving more logic into Rust and reusing shared loader utilities.
-   **Refactoring**: Simplify, modularize, and DRY out code across Rust and web packages, keeping fixtures and APIs coherent.

### Medium-Term (Optimization)
-   **WASM Hardening**: Ensure ABI compatibility and stability across all `@vizij/*-wasm` packages and loaders.

### Long-Term (Advanced)
-   **Automated Performance Regression Testing**: CI pipelines that run the performance baselines and block on regressions once benchmarks are stable.

### Backlog
-   **CI/CD**: `ci.config.json` for declarative shell script configuration.
-   **AI Workflows**: Specialized agents for documentation and testing.

---

## 2. [Runtime Capabilities](../active_projects/runtime/summary.md)
**Goal**: Extend core functionality to support rich, interactive, multi-modal experiences.

### Near-Term (HRI March Priorities)
-   **Multi-Screen Puppeteering**: Enable multi-screen setups for puppeteering and complex displays, backed by a worker-hosted orchestrator and shared state. See [Multi-Screen Plan](../active_projects/runtime/multi_screen/multi_screen-plan.md).
-   **Audio Processing (Visemes)**: Add Rust-based audio processing hooks for viseme extraction and lip-sync, exposed through WASM. See [Audio & Video Proposal](../active_projects/runtime/audio_video/audio_video-proposal.md).

### Medium-Term (Expansion)
-   **Namespacing & Multi-Face Control**: Support multiple independent rigs in a single runtime by prefixing graph inputs/outputs with an actor namespace and updating orchestrator registration accordingly. See [Namespacing Proposal](../backlog/active_projects/runtime/namespacing/namespacing-proposal.md).
-   **Graph Nodes – Expression & Compound**: Introduce Expression and Compound nodes in the Node Graph stack to reduce graph complexity and improve reuse. See [Graph Nodes Proposal](../backlog/active_projects/runtime/graph_nodes/graph_nodes-proposal.md).
-   **Behavior Tree Integration (Discovery & Design)**: Research and design a Behavior Tree system that interoperates cleanly with the Node Graph and Orchestrator, focusing on data model and runtime contracts. See [Behavior Tree Proposal](../backlog/backlog_proposals/behavior_tree-proposal.md).
-   **Bevy Integration**: Implement native Bevy modules (`bevy_vizij_*`) that wrap the animation, graph, and orchestrator stacks.
-   **Worker-Based Orchestration**: Move the Orchestrator into a Web/Shared Worker to offload the main thread and serve multi-screen setups.

### Long-Term (Advanced)
-   **Full Behavior Tree Implementation**: Ship a production Behavior Tree runtime (crates + WASM bindings) and connect it to authoring surfaces once the design phase is complete.

### Backlog
---

## 3. [Authoring Tools](../active_projects/authoring/summary.md)
**Goal**: Deliver dense, maintainable authoring surfaces and advanced creative tools.

### Near-Term (HRI March Priorities)
-   **Animator Feedback**: Implement UI polish, number controls, and context menus for day-to-day authoring. See [Animator Feedback Plan](../active_projects/authoring/animator_feedback/animator_feedback-plan.md).
-   **Organize Rigging & Posing**: Rigging sidebar now has Rigging/Face tabs and a standard-input coverage panel; pose rigs carry `rigKind` + schema metadata and reuse rigging visibility. Next steps: add Rigging↔Posing navigation and pose-surface quick toggles. See [Organize Rigging & Posing Plan](../active_projects/authoring/organize_rigging_posing/organize_rigging_posing-plan.md).

### Medium-Term (Advanced Workflows)
-   **Visual Handles for Scene Posing**: On-screen 3D manipulators to pose characters and adjust scene objects directly in the viewport. See [Visual Handles Proposal](../backlog/backlog_proposals/visual_handles-proposal.md).
-   **Face Editing Workflow**: Dedicated workflow for editing and organizing facial assets (blendshapes, materials, hierarchy), integrated into the Rigging sidebar. See [Face Editing Proposal](../backlog/backlog_proposals/face_editing-proposal.md).
-   **Animation Authoring**: Import, export, and edit animations with a timeline, curve editor, and recording tools. See [Animation Authoring Proposal](../backlog/backlog_proposals/animation_authoring-proposal.md).
-   **Pose Rig Library**: Cross-face pose rig packaging built on standard inputs so poses can be reused across assets. See [Pose Rig Library Proposal](../backlog/backlog_proposals/pose_rig_library-proposal.md).

### Long-Term (Full Suite)
-   **Node Graph Editing**: Visual tools for editing/defining node graphs.
-   **Interaction Authoring**: Visual tools for defining interactive behaviors (create a behavior tree in the editor).

### Backlog
-   **GLB Import Improvements**: Tools for parsing raw animations for poses and to vizij animations, and binding skeletons.

---

## 4. [Website & Ecosystem](../backlog/active_projects/website/summary.md)
**Goal**: Build the public face of Vizij as a central hub for learning and community.

### Near-Term (Foundation)
-   **Repo Setup**: Initialize `vizij_website` (or equivalent) with CMS integration and CI/CD.
-   **Content Strategy & Docs Pipeline**: Define "Zero to Hero" tutorial structure and the pipeline for syncing docs from `vizij-docs`, `vizij-web`, and `vizij-rs`.

### Medium-Term (Content & Launch)
-   **Automated Docs**: Pipelines to generate Rust and TS docs for the site.
-   **Interactive Tutorials**: "Zero to Hero" series with embedded Vizij players.
-   **Migration**: Move minimal demos and examples to the new site.
-   **Community Standards**: Publish standard faces and assets.

### Long-Term (Thriving Ecosystem)
-   **Partner Showcases**: Highlight community and partner projects.

### Backlog
---

## Active Projects Directory

-   **[Code Quality Summary](../active_projects/code_quality/summary.md)**
-   **[Runtime Summary](../active_projects/runtime/summary.md)**
-   **[Authoring Summary](../active_projects/authoring/summary.md)**

## Archived Projects

Projects that have been completed and stabilized are moved to the archive.

-   **[Modular Pose Rig](../archive/authoring/modular_pose_rig-reference.md)** (Completed)
-   **[CI/CD Summary](../archive/ci_cd/summary.md)** (Completed/Stabilized)
-   **[Testing Strategy](../archive/code_quality/testing_strategy/testing_strategy-plan.md)** (Archived for now)
-   **[Performance Baselines](../archive/code_quality/performance_baselines/performance_baselines-plan.md)** (Archived for now)
-   **[Website Migration](../archive/website/website_migration/website-plan.md)** (Archived for now)
