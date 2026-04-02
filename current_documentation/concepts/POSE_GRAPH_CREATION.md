# Pose Graph Creation — Canonical Guide

<!-- tags: family=reference; type=concept; topics=poses,pose-graph,authoring,graphs,runtime -->
> **Last updated:** 2026-03-31

This guide explains how pose graphs are created in Vizij today, how they map to pose configs, and which current authoring surfaces own that workflow.

## 1) What a pose graph is

A **pose graph** is a graph that:

- consumes **pose weights** and **neutral inputs**
- outputs a consolidated set of **rig inputs**
- blends multiple poses deterministically

In practice it converts:

- *pose definitions* (targets) + *neutral baseline* + *weights*

into:

- typed-path writes that become rig inputs at runtime.

See also:

- [REFERENCE_GUIDE.md](REFERENCE_GUIDE.md) (Poses + Graphs sections)
- [POSE_BLENDING.md](deeper_exploration/POSE_BLENDING.md)

## 2) Canonical implementation (source of truth)

Pose graph creation tooling currently lives in the `vizij-authoring` app code:

- Pose graph builder:
  - `vizij-web/apps/vizij-authoring/src/poseRig/graphBuilder.ts`
- Pose graph parser (import/inspection/validation):
  - `vizij-web/apps/vizij-authoring/src/poseRig/graphParser.ts`
- Pose graph service wrapper:
  - `vizij-web/apps/vizij-authoring/src/poseRig/services/poseGraphService.ts`

This is important: today pose graph creation is **GraphSpec-first** (it directly builds a `GraphSpec`), rather than being authored as IR.

## 3) Inputs and outputs (contract)

### 3.1 Inputs

Pose graphs use:

- per-pose weight inputs (typed paths)
- neutral inputs (stored values per standard input id)
- pose target values (stored values per standard input id)

The builder derives the typed paths for weights via:

- `buildPoseWeightPathMap(...)` and `buildRigInputPath(...)`

### 3.2 Outputs

For each affected standard input, the pose graph outputs:

- a typed-path write to the corresponding rig input path

The builder emits output nodes with paths like:

- `rig/<faceSegment><standardInput.path>`

(where `faceSegment` resolves based on rigKind / faceId).

## 4) How the current builder works (high-level)

File:

- `apps/vizij-authoring/src/poseRig/graphBuilder.ts`

Core steps:

1) Build a constant record per pose containing target values for all standard inputs.
2) Create per-pose weight input nodes (weight typed path per pose).
3) Build a `join` node across weight inputs.
4) Build a neutral record constant (`pose_neutral_record`).
5) For each standard input with non-zero contributions:
   - compute deltas across poses
   - compute masks (pose contributes vs not)
   - compute weighted sum (`weightedsumvector`)
   - blend with neutral using either:
     - additive: `add`
     - average overlay: `blendweightedaverageoverlay`
   - emit an output node targeting the rig input typed path.

It also produces a `PoseRigGraphSummary` describing which poses contribute to which inputs.

## 5) Validation and import

### 5.1 Parser

`parsePoseGraphSpec` parses a GraphSpec back into:

- neutral inputs record
- pose definitions
- warnings (e.g. pose references missing input id)

This supports:

- importing pose graphs from disk
- inspecting graphs
- remapping outputs

### 5.2 Remap wizard

Authoring supports importing pose graphs that might not match the current face’s paths:

- `apps/vizij-authoring/src/hooks/usePoseGraphImport.ts`
- `apps/vizij-authoring/src/components/poseRig/PoseGraphRemapWizard.tsx`

It can:

- remap pose graph inputs to the current face segment
- infer suggested standard paths
- rename output paths
- optionally drop inputs with zero delta contributions

## 6) Current authoring surfaces

Current pose graph creation is surfaced through the `vizij-authoring` app's pose-rig code path rather than a separate cross-repo IR layer:

- state and authoring hooks:
  - `apps/vizij-authoring/src/poseRig/PoseRigProvider.tsx`
  - `apps/vizij-authoring/src/poseRig/usePoseRigAuthoring.ts`
- export panels and workflow UI:
  - `apps/vizij-authoring/src/poseRig/components/PoseRigPanels.tsx`
- import/remap flow:
  - `apps/vizij-authoring/src/hooks/usePoseGraphImport.ts`
  - `apps/vizij-authoring/src/components/poseRig/PoseGraphRemapWizard.tsx`

## 7) Current constraints

- Pose graphs are GraphSpec-first today; they are not authored as a first-class IR format.
- Validation and remap behavior currently live in the authoring app code rather than a shared runtime package.
- Any future IR-backed pose authoring work should preserve the existing import/export and remap guarantees documented above.
