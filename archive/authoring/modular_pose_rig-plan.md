# Modular Pose Rig · Plan & Tracking
<!-- tags: status=tracking; topics=authoring,state-management,refactor -->

> **Related documents:** [Proposal](modular_pose_rig-proposal.md) · [Reference](modular_pose_rig-reference.md) · [Project summary](summary.md)

## Objective & Scope
Refactor the monolithic `usePoseRigAuthoring` hook into a testable, Zustand-based store (`poseRig/store.ts`) with a dedicated service layer for IO and math operations. This will improve maintainability, performance, and testability of the pose rig authoring tools.

## Workstreams / Deliverables

### 1. Foundation (Store & Services)
- [x] Create `poseRig/services/poseConfigService.ts` (Implement `normalize`, `serialize`, `diff`)
- [x] Create `poseRig/services/poseGraphService.ts` (Implement `buildSpec`, `generateSummary`, `validate`)
- [x] Create `poseRig/services/poseSnapshotService.ts` (Implement `capture`, `apply`)
- [x] Implement `poseRig/store.ts`
    - [x] Define `PoseRigState` interface
    - [x] Implement `createPoseRigStore` with initial state
    - [x] Implement actions: `setNeutral`, `updateValues`, `createPose`, `deletePose`
    - [x] Implement actions: `importConfig`, `importGraph`, `reset`
- [x] Add unit tests for Store and Services
- [x] Create `usePoseRigStore` hooks/selectors
- [x] Refactor `usePoseRigAuthoring` to wrap the new store (Bridge phase)
    - [x] Map store state to hook return values
    - [x] Map store actions to hook functions
- [x] Migrate `PoseRigWorkbench` to use selectors
- [x] Migrate `ImportExportWorkbench` to use selectors
- [x] Migrate `useVizijExport` to use selectors

### 3. Cleanup & Polish
- [x] Remove legacy `usePoseRigAuthoring` hook
- [x] Remove redundant JSON clone helpers (post-store migration)
- [x] Update `AGENTS.md` with new store patterns

## Timeline / Stages
- **Stage 1: Foundation**: Implement store and services. (Completed)
- **Stage 2: Migration**: Move components to new selectors. (Completed)
- **Stage 3: Cleanup**: Delete legacy code. (Completed)

## Immediate Next Steps
1. All tasks completed.

## Risks & Mitigations
- **Regression Risk**: Pose rig is complex. **Mitigation**: Kept the old hook as a wrapper initially to ensure existing consumers work without changes.

## Validation / QA Checklist
- [x] **Unit Tests**: Store actions (CRUD) pass.
- [x] **Unit Tests**: Service normalization and serialization pass.
- [x] **Integration**: `PoseRigWorkbench` loads and displays poses correctly.
- [x] **Integration**: "Capture Pose" updates the store and UI.
- [x] **Integration**: "Apply Pose" updates the rig values.
- [x] **Integration**: Import/Export works with existing JSON files.
