# Modular Pose Rig · Reference
<!-- tags: status=reference; topics=authoring,state-management -->

> **Related documents:** [Proposal](modular_pose_rig-proposal.md) · [Plan](modular_pose_rig-plan.md) · [Project summary](summary.md)

## Summary
The Modular Pose Rig architecture separates state management (Zustand store) from UI logic (React components) and business logic (Services).

## System Overview
*(To be populated after implementation)*

### Key Components
- **Store**: `apps/vizij-authoring/src/poseRig/store.ts`
- **Services**: `apps/vizij-authoring/src/poseRig/services/`
- **Hooks**: `usePoseRigStore`

## Usage Guide
### Selecting State
```typescript
const poses = usePoseRigStore(state => state.poses);
```

### Dispatching Actions
```typescript
const createPose = usePoseRigStore(state => state.createPose);
```
