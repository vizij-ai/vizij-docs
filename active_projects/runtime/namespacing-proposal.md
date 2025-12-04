# Proposal: Namespacing & Multi-Face Control
<!-- tags: status=draft; topics=runtime,architecture,namespacing -->

## Context
Current Vizij runtimes assume a single "player" or actor. To support complex scenes with multiple characters (e.g., a conversation between two avatars), we need a robust namespacing system.

## Goals
- **Multi-Actor Support**: Control multiple independent rigs in the same scene.
- **Conflict Resolution**: Prevent control signal collisions between actors.
- **Addressability**: Clear, typed paths for targeting specific actors and their properties.

## Proposed Changes
- **`TypedPath` Update**: Enforce a namespace segment (e.g., `anim/player/<namespace>/...`).
- **Orchestrator**: Update `MergedGraphRegistrationConfig` to accept namespace prefixes.
- **React Provider**: `OrchestratorProvider` should support scoped contexts or multi-root configurations.
