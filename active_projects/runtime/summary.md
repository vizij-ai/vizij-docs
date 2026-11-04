# Vizij Runtime Program Summary
<!-- tags: family=project; type=summary; project_status=tracking; topics=runtime,wasm,standalone,protocol -->

> **Last updated:** 2026-11-04

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
| Bevy view everywhere / retiring vizij-standalone | `in_progress` | — | [`bevy_everywhere-plan.md`](bevy_everywhere/bevy_everywhere-plan.md) | sub-studies in [`bevy_everywhere/studies/`](bevy_everywhere/studies/) |

## Current Verified State

- **The Bevy view draws every Vizij face in vizij-web and in the desktop `vizij` binary.** `@vizij/runtime` 8 is one wasm module per page holding the vizij-rs `vizij` crate's view and each face's Arora device; `@vizij/render` 2.0.0 and `@vizij/runtime-react` 1.0.0 put every face app and the authoring app on it ([vizij-web#206](https://github.com/vizij-ai/vizij-web/pull/206), released by [vizij-web#207](https://github.com/vizij-ai/vizij-web/pull/207)). three.js draws no face; `three` remains only in `@vizij/render`'s GLB loader and exporter. The desktop binary ships per OS from vizij-rs's `vizij-v<version>` releases. The Android app is on vizij-rs main, its APK smoke-tested on the emulator in CI. The open lines are in the [Bevy plan](bevy_everywhere/bevy_everywhere-plan.md)'s status: Android's signing and tablet gate, retiring Semio Studio's `apps/vizij-app`, and deleting the Tauri standalone.
- Each face is its own Arora device, with its keys under its rig prefix, `rig/<faceId>/`; a page shows any number of faces on its one canvas.
- `vizij-rs` contains the `vizij` crate (the view, the face composition, the host modules, the native device and the browser module), the API and node-graph stacks, the Arora interop crates, the bundle tools and shared fixtures. A face's animations play through Arora's animation module (`@arora/animation`, from `arora-animation-module`), which vizij-rs links as a host module ([vizij-rs#261](https://github.com/vizij-ai/vizij-rs/pull/261)); vizij-rs has no animation engine of its own, and vizij-web's packages are `@vizij/render`, `@vizij/runtime-react`, `@vizij/utils`, `@vizij/node-graph-authoring`, `@vizij/node-graph-react` and `@vizij/minimal-demo-ui`.
- `vizij-web` contains the face apps `demo-vizij-player`, `tutorial-fullscreen-face`, `tutorial-agent-face`, `vizij-showcase`, `vizij-authoring` and `vizij-standalone`, and the graph demos `demo-graph-studio` and `minimal-demo-graph`.
- Browser/runtime deployments and `vizij-standalone` are both first-class references in the current phase.
- Split-screen and operator-control work are part of the core deployment branch, not a side experiment.
- Bridges are the published arora-sdk crates (`arora-bridge-ws`, `arora-bridge-ros2`) and the Semio Studio bridge client (`arora-studio-bridge-client`), composed into the desktop `vizij` binary, whose face they reach, and into `vizij-standalone`'s Tauri shell, whose device no face shows ([Known issues](../../current_documentation/KNOWN_ISSUES.md)). A face in a browser page has no bridge. `@vizij/value-json` carries value serde across JS boundaries.
- Older docs may still mention a former `vizij-ws-app` surface; treat that as historical rather than current runtime inventory.
- The main remaining runtime/deployment problem is now coherence and operator trust rather than absence of real deployment surfaces.

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

- a face composed into a robot's own device, beside its hardware
- richer blackboard / orchestration capabilities
- graph-node expansion and broader graph expressiveness
- behavior logic / behavior-tree exploration
