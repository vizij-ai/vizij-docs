# Vizij Runtime Program Summary
<!-- tags: family=project; type=summary; project_status=tracking; topics=runtime,wasm,standalone,protocol -->

> **Last updated:** 2026-03-31

## Goals

Keep Vizij's runtime layer deterministic, portable, and understandable enough to support one maintained public system from tutorial onboarding through browser and standalone deployment.

## Authority Note

This file is the canonical cross-repo summary for runtime status and priorities.

Detailed implementation truth still lives in:

- `vizij-rs/README.md` and crate README files
- `vizij-rs/ROADMAP.md` for repo-local engineering backlog notes
- [`standalone_ws-plan.md`](standalone_ws/standalone_ws-plan.md) for the current standalone/protocol extraction track

## Document Families

| Project | Status | Proposal | Plan | Reference |
| --- | --- | --- | --- | --- |
| Vizij on Arora (web runtime = Arora device) | `shipped, hardening` | — | — | [`summary.md`](vizij_on_arora/summary.md) |
| Speech + Viseme + Conversation Enablement | `planned` | [`audio_video-proposal.md`](audio_video/audio_video-proposal.md) | — | — |
| Multi-Screen and Operator Control | `planned` | [`multi_screen-proposal.md`](multi_screen/multi_screen-proposal.md) | [`multi_screen-plan.md`](multi_screen/multi_screen-plan.md) | — |
| Standalone / Arora Deployment Branch | `in_progress` | — | [`standalone_ws-plan.md`](standalone_ws/standalone_ws-plan.md) | — |

## Current Verified State

- `vizij-rs` currently contains real workspace stacks for API, animation, node graph, orchestrator, and shared fixtures.
- Bevy adapters exist today for API, animation, and node graph; there is no orchestrator Bevy crate in the current Rust workspace.
- `vizij-web` currently contains real runtime surfaces including `@vizij/runtime-react`, `demo-vizij-player`, `tutorial-fullscreen-face`, `tutorial-agent-face`, `vizij-showcase`, and `vizij-standalone`.
- Browser/runtime deployments and `vizij-standalone` are both first-class references in the current phase.
- Split-screen and operator-control work are part of the core deployment branch, not a side experiment.
- Standalone/protocol work is currently spread across:
  - `@vizij/arora-types`
  - the published arora-sdk bridge crates (`arora-bridge-ws`, `arora-bridge-ros2`); the former in-repo `arora-connection` / `arora-websocket` crates were retired in the multi-bridge migration
  - `vizij-standalone` (now a multi-bridge host)
- Older docs may still mention a former `vizij-ws-app` surface; treat that as historical rather than current runtime inventory.
- The main remaining runtime/deployment problem is now coherence and operator trust rather than absence of real deployment surfaces.
- Namespacing remains important, but it is a later follow-on for runtime expressiveness rather than a near-term deployment gate.

## Near-Term Focus

- Keep the deployment branch parallel to the creator/build branch instead of deferring it.
- Keep the maintained endpoint story explicit:
  - browser/runtime deployments
  - `vizij-standalone`
- Clarify the operator model:
  - local control
  - remote control
  - split-screen and multi-screen workflows
  - control discovery from runtime metadata rather than hard-coded assumptions
- Normalize the standalone/protocol story enough that contributors and public readers can understand what is current.
- Strengthen deployment validation, runbooks, and recovery guidance so success/failure is legible to operators and contributors.
- Frame ROS2 as an advanced optional deployment surface.
- Keep the AV line around speech playback, viseme driving, conversation demos, and provider-based runtime integration rather than a generic broad AV platform, and treat that line as the highest-priority supporting program adjacent to the current deployment branch.
- Maintain a clean contract between Rust runtime truth and the higher-level web runtime surfaces used by tutorials, demos, showcase, and standalone applications.

## Cross-Repo Relevance

- Runtime status directly affects what can be documented publicly in the maintained onboarding path and the deployment branch.
- Protocol and standalone documentation must be kept in sync with the actual package/crate/app surfaces rather than branch-specific historical notes alone.

## Deferred Follow-Up

The later comprehensive roadmap review should decide how the next-wave runtime lines should be promoted after the current onboarding/build/deploy phase, with likely order:

- shared runtime identity and namespacing
- richer blackboard / orchestration capabilities
- graph-node expansion and broader graph expressiveness
- behavior logic / behavior-tree exploration
