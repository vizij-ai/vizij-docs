# Multi-Screen Support – Plan & Tracking
<!-- tags: status=planning; topics=runtime,puppeteering,display -->

> **Related documents:** [Proposal](multi_screen-proposal.md) · [Runtime Summary](../summary.md)

## Objective & Scope

Enable a single Vizij runtime (orchestrator + graphs + animations) to drive multiple views (canvases/windows) for advanced puppeteering and installation use cases. This phase focuses on worker-hosted orchestration and a simple, reliable messaging model between the worker and multiple clients.

## Plan

The steps below can be executed by a junior developer in order, with explicit acceptance criteria.

### 1. Understand current orchestrator usage in web demos

1.1 Identify relevant demo apps:
- [ ] Inspect `vizij-web/apps` and pick at least one orchestrator-focused app, such as:
    - `apps/minimal-demo-orchestrator`
    - `apps/demo-vizij-player`

1.2 Map current orchestration flow:
- [ ] For the chosen app:
    - Identify where `@vizij/orchestrator-react` and `@vizij/runtime-react` are used.
    - Understand how the orchestrator is currently created (on the main thread) and how frames are advanced.

Acceptance criteria:
- A short note describing:
  - Which app will be used as the initial target for worker-based orchestration.
  - How the orchestrator is currently created and driven in that app.

### 2. Prototype a worker-hosted orchestrator

2.1 Create a worker module:
- [ ] In `vizij-web` (e.g., under `apps/minimal-demo-orchestrator/src/worker/`), create a `runtimeWorker.ts` that:
    - Imports the necessary orchestrator/runtime setup code.
    - Listens for messages from the main thread (e.g., `postMessage`).

2.2 Move orchestrator creation into the worker:
- [ ] Inside `runtimeWorker.ts`:
    - Create the orchestrator and any required runtime structures upon an initialization message.
    - Handle messages to:
        - Register graphs.
        - Update inputs.
        - Advance frames.

Acceptance criteria:
- The worker can be started from the main thread and responds to simple messages (e.g., “ping”, “init orchestrator”) without errors.

### 3. Implement a basic messaging protocol between worker and main thread

3.1 Define message types:
- [ ] Create a small TypeScript enum or union type representing messages such as:
    - `InitRuntime`
    - `RegisterGraph`
    - `SetInput`
    - `AdvanceFrame`
    - `FrameState` (worker → main) containing snapshot data for rendering.

3.2 Implement handling in worker:
- [ ] In `runtimeWorker.ts`, implement a `self.onmessage` handler that:
    - Switches on message `type`.
    - Applies inputs or advances the orchestrator as requested.
    - Posts back `FrameState` messages after advancing frames.

3.3 Implement handling in main thread:
- [ ] In the chosen app:
    - Create a worker instance.
    - Set up `onmessage` to receive `FrameState` and update the React state/world accordingly.

Acceptance criteria:
- The app can:
  - Initialize the worker.
  - Send `AdvanceFrame` messages.
  - Receive `FrameState` updates and render them.

### 4. Extend to multiple views/clients

4.1 Support multiple view subscriptions:
- [ ] Adjust the worker protocol so that:
    - Multiple clients (e.g., multiple components or windows) can subscribe to `FrameState` updates.
    - Optionally include a `viewId` in messages to distinguish different views if needed.

4.2 Implement a second view:
- [ ] In the chosen app or a new demo:
    - Add a second canvas or UI section that also listens for `FrameState`.
    - Demonstrate that both views are driven by the same worker-hosted runtime.

Acceptance criteria:
- Two views within the same app show consistent state coming from the single worker-hosted runtime.

### 5. Integrate with Namespacing for multi-actor scenarios

5.1 Namespaced actors:
- [ ] Use the `namespace` support from the Namespacing project to:
    - Register multiple actors/faces with distinct namespaces in the worker-hosted orchestrator.

5.2 View-specific focus:
- [ ] Demonstrate that:
    - One view can focus on one actor while another view focuses on another, using namespaced paths to filter or route data.

Acceptance criteria:
- Multi-screen demo shows at least two actors driven by a single runtime, with clear separation via namespaces.

### 6. Document usage and limitations

6.1 Add documentation to the app:
- [ ] Update the demo app’s README or documentation to explain:
    - How the worker is started.
    - What message types are supported.
    - How to add additional views.

6.2 Note open questions:
- [ ] Capture outstanding design questions, such as:
    - How to persist or replay worker messages.
    - How to handle error reporting and debugging in a worker context.

Acceptance criteria:
- Documentation exists that a junior developer can follow to add worker-based orchestration and multi-view support to another app.

## Acceptance Criteria (Overall)

- A demo app runs with the orchestrator hosted in a Web Worker and renders based on worker-sent state.
- The same worker-hosted runtime can drive at least two views in the app.
- Namespacing is usable in the multi-screen scenario to distinguish actors.
- The messaging model and limitations are documented for future expansion.

