# Vizij Roadmap & Active Projects
<!-- tags: status=living; topics=roadmap,strategy,planning -->

This document outlines the strategic direction for Vizij. It is organized by our four key pillars, detailing the goals and timeline for each.

---

## 1. [Code Quality & Foundation](../active_projects/code_quality/summary.md)
**Goal**: Solidify the codebase, ensuring robustness, performance, and maintainability.

### Near-Term (Stabilization)
-   **Testing Strategy & Infrastructure**: Stand up cross-stack testing (Rust, WASM, React) with React Testing Library in `vizij-web` and clear CI integration. See [Testing Strategy Plan](../active_projects/code_quality/testing_strategy/testing_strategy-plan.md).
-   **Performance Baselines**: Define key KPIs (graph evaluation, render loop, memory) and implement initial benchmarks in Rust and the web stack. See [Performance Baselines Proposal](../backlog_proposals/performance_baselines-proposal.md).
-   **WASM Boundary Optimization**: Minimize JS/WASM boundary crossings (serialization overhead) by moving more logic into Rust and reusing shared loader utilities.
-   **Refactoring**: Simplify, modularize, and DRY out code across Rust and web packages, keeping fixtures and APIs coherent.

### Medium-Term (Optimization)
-   **WASM Hardening**: Ensure ABI compatibility and stability across all `@vizij/*-wasm` packages and loaders. See [WASM Hardening Proposal](../backlog_proposals/wasm_hardening-proposal.md).

### Long-Term (Advanced)
-   **Automated Performance Regression Testing**: CI pipelines that run the performance baselines and block on regressions once benchmarks are stable.

### Backlog
-   **CI/CD**: `ci.config.json` for declarative shell script configuration.
-   **AI Workflows**: Specialized agents for documentation and testing.

---

## 2. [Runtime Capabilities](../active_projects/runtime/summary.md)
**Goal**: Extend core functionality to support rich, interactive, multi-modal experiences.

### Near-Term (Core Features)
-   **Namespacing & Multi-Face Control**: Support multiple independent rigs in a single runtime by prefixing graph inputs/outputs with an actor namespace and updating orchestrator registration accordingly. See [Namespacing Proposal](../active_projects/runtime/namespacing/namespacing-proposal.md).
-   **Graph Nodes – Expression & Compound**: Introduce Expression and Compound nodes in the Node Graph stack to reduce graph complexity and improve reuse. See [Graph Nodes Proposal](../active_projects/runtime/graph_nodes/graph_nodes-proposal.md).
-   **Multi-Screen Puppeteering**: Enable multi-screen setups for puppeteering and complex displays, backed by a worker-hosted orchestrator and shared state. See [Multi-Screen Proposal](../active_projects/runtime/multi_screen/multi_screen-proposal.md).
-   **Behavior Tree Integration (Discovery & Design)**: Research and design a Behavior Tree system that interoperates cleanly with the Node Graph and Orchestrator, focusing on data model and runtime contracts. See [Behavior Tree Proposal](../backlog_proposals/behavior_tree-proposal.md).

### Medium-Term (Expansion)
-   **Audio/Video Processing**: Add Rust-based audio and video processing hooks for lip sync and interaction, exposed through WASM. See [Audio & Video Proposal](../active_projects/runtime/audio_video/audio_video-proposal.md).
-   **Bevy Integration**: Implement native Bevy modules (`bevy_vizij_*`) that wrap the animation, graph, and orchestrator stacks.
-   **Worker-Based Orchestration**: Move the Orchestrator into a Web/Shared Worker to offload the main thread and serve multi-screen setups.

### Long-Term (Advanced)
-   **Full Behavior Tree Implementation**: Ship a production Behavior Tree runtime (crates + WASM bindings) and connect it to authoring surfaces once the design phase is complete.

### Backlog
---

## 3. [Authoring Tools](../active_projects/authoring/summary.md)
**Goal**: Deliver dense, maintainable authoring surfaces and advanced creative tools.

### Near-Term (Workflow Focus)
-   **"Doug's Feedback"**: Implement UI polish, number controls, and context menus for day-to-day authoring. See [Doug's Feedback Plan](../active_projects/authoring/dougs_feedback/dougs_feedback-plan.md).
-   **Organize Rigging & Posing**: Clarify and separate the Rigging (setup) and Posing (usage) workflows while keeping them tightly linked in the authoring UI. See [Organize Rigging & Posing Proposal](../active_projects/authoring/organize_rigging_posing/organize_rigging_posing-proposal.md).

### Medium-Term (Advanced Workflows)
-   **Visual Handles for Scene Posing**: On-screen 3D manipulators to pose characters and adjust scene objects directly in the viewport. See [Visual Handles Proposal](../backlog_proposals/visual_handles-proposal.md).
-   **Face Editing Workflow**: Dedicated workflow for editing and organizing facial assets (blendshapes, materials, hierarchy), integrated into the Rigging sidebar. See [Face Editing Proposal](../backlog_proposals/face_editing-proposal.md).
-   **Animation Authoring**: Import, export, and edit animations with a timeline, curve editor, and recording tools. See [Animation Authoring Proposal](../backlog_proposals/animation_authoring-proposal.md).
-   **Pose Rig Library**: Cross-face pose rig packaging built on standard inputs so poses can be reused across assets. See [Pose Rig Library Proposal](../backlog_proposals/pose_rig_library-proposal.md).

### Long-Term (Full Suite)
-   **Node Graph Editing**: Visual tools for editing/defining node graphs.
-   **Interaction Authoring**: Visual tools for defining interactive behaviors (create a behavior tree in the editor).

### Backlog
-   **GLB Import Improvements**: Tools for parsing raw animations for poses and to vizij animations, and binding skeletons.

---

## 4. [Website & Ecosystem](../active_projects/website/summary.md)
**Goal**: Build the public face of Vizij as a central hub for learning and community.

### Near-Term (Foundation)
-   [ ] **Website Migration Plan**: Execute the plan to separate the website repo and align with the external website implementation. See [Website Migration Plan](../active_projects/website/website_migration/website-plan.md).
-   **Repo Setup**: Initialize `vizij_website` (or equivalent) with CMS integration and CI/CD.
-   **Content Strategy & Docs Pipeline**: Define "Zero to Hero" tutorial structure and the pipeline for syncing docs from `vizij_docs`, `vizij-web`, and `vizij-rs`. See [Documentation Strategy Plan](../active_projects/website/documentation_strategy/documentation_strategy-plan.md).

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
-   **[Website Summary](../active_projects/website/summary.md)**

## Archived Projects

Projects that have been completed and stabilized are moved to the archive.

-   **[Modular Pose Rig](../archive/authoring/modular_pose_rig-reference.md)** (Completed)
-   **[CI/CD Summary](../archive/ci_cd/summary.md)** (Completed/Stabilized)
