# Import/Export Pipeline Proposal
<!-- tags: status=proposal; topics=import-export,persistence,workflow,automation-testing -->

> **Related documents:** [Plan](import_export_pipeline-plan.md) · [Reference](import_export_pipeline-reference.md) · [Project summary](summary.md)

## Context & Problem Statement

Authoring exports currently rely on a summary artifact plus GLB and graph files. The goal is to rehydrate authoring state (bindings, inputs, expressions, overrides) using only the GLB and rig graph. Missing metadata, identifier drift, and expression lossiness make round-tripping brittle.

## Goals

1. **Full reconstruction** of authoring state from GLB + graph without summary artifacts.
2. **Canonical identifiers** across renderables, standard inputs, and bindings to survive export/import cycles.
3. **Expression fidelity** when rebuilding bindings from compute nodes.
4. **Robust validation** that diffs reconstructed graph against source to catch drift.
5. **Progressive migrations** so legacy exports import safely with actionable messaging.

### Non-goals

- Replacing export format beyond what is necessary for reconstruction.
- Managing robot rig graphs (handled separately).

## Architectural Design

1. **Load GLB**: Import robot hierarchy, baked defaults, and feature label overrides. Normalise identifiers at load time.
2. **Parse Rig Graph**: Walk nodes/edges to restore standard input descriptors, bindings, slot remaps, and expressions (reconstructed from arithmetic subgraphs).
3. **Initialise Authoring Store**: Seed controller state (bindings, input bindings, standard inputs, input values, selections) with reconstructed data and regenerate derived metadata (auto-input grouping, feature catalogue).
4. **Validation Loop**: Rebuild GraphSpec from hydrated store and diff against imported graph. Surface discrepancies before editing resumes.
5. **Persist Upgrades**: Embed any new metadata (renamed labels, custom inputs) on export so the next import remains lossless.

## Risks & Trade-offs

- **Expression Reconstruction**: Rebuilding expressions from compute graphs is lossy; need canonical infix normalisation.
- **Identifier Normalisation**: Sanitising IDs may break references if not coordinated; must alert authors with remediation steps.
- **Graph Drift**: Even small ordering differences may produce diffs; need tolerant diffing strategy.

## High-level Execution Plan

1. **Identifier Strategy** – Normalise IDs at creation time, audit legacy data, surface acceptance prompts.
2. **Graph Parser** – Build traversal that recognises remap/constant/expression patterns and regenerates binding structures.
3. **Store Hydration** – Map parsed data to controller state with minimal transformations.
4. **Validation Tools** – Diff original vs. regenerated GraphSpec, provide CLI/utilities if necessary.
5. **Automation & Docs** – Write regression tests, document import-only workflow, record known limitations.

## Approval & Decision Log

- Pending stakeholder review for removing summary artifact reliance.
