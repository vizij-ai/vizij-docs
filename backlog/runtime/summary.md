# Later-Horizon Runtime Expressiveness Backlog Summary
<!-- tags: family=project; type=summary; project_status=planning; topics=runtime,expressiveness,namespacing,graph,behavior -->

> **Last updated:** 2026-03-31

## Goals

Keep the later-horizon runtime work visible without letting it compete with the current onboarding / creator / deployment phase.

## Status Note

This file is the deferred runtime-expressiveness summary under `backlog/runtime/`. It is not the canonical current runtime summary for the active phase.

Current deployment/runtime truth now lives in:

- [`../../active_projects/runtime/summary.md`](../../active_projects/runtime/summary.md)
- [`../../current_documentation/ROADMAP.md`](../../current_documentation/ROADMAP.md)

This backlog summary is now for the next-wave runtime expressiveness lines that remain visible after the current public-system phase.

## Backlog Lines

### Shared runtime identity and namespacing

- **Namespacing**: support multi-face and multi-actor control through clearer runtime identity and path isolation. See [Namespacing Proposal](namespacing/namespacing-proposal.md).

### Broader graph expressiveness

- **Graph Nodes**: expand node coverage such as expression and compound nodes to deepen graph authoring and runtime expressiveness. See [Graph Nodes Proposal](graph_nodes/graph_nodes-proposal.md).

### Behavior logic exploration

- **Behavior Tree Proposal**: keep behavior-tree work explicitly exploratory until the surrounding shared-runtime, graph, and orchestration contracts are sharper. See [Behavior Tree Proposal](behavior_tree/behavior_tree-proposal.md).

### Additional deferred initiatives

- **Bevy Integration**: remains a later runtime/platform initiative rather than a current public-path driver.
- **Worker-Based Orchestration**: remains visible as a possible runtime evolution path, not part of the current active deployment branch.

## Current-Framing Rule

Treat these items as the likely next wave after the current public-system phase, with likely promotion order:

1. shared runtime identity and namespacing
2. richer orchestration and blackboard capabilities
3. broader graph expressiveness
4. behavior logic exploration
