# ROS4HRI face — Vizij as a ROS4HRI-compliant robot face renderer

Status: proposal, kickoff 2026-07-24. Linear project: [ROS4HRI Integration](https://linear.app/semio-ai/project/0f74f451-cea7-4bef-be6c-7741cd31c6c8).

## Goal

Replace the stock face renderer of ROS4HRI stacks — PAL's closed-source `expressive_eyes` and IIIA's open `expressive_face` — with Vizij. The Vizij face is driven through the standard ROS4HRI interfaces (notably the `set_expression` and `look_at` skills), integrates with [PAL's interaction simulator](https://docs.pal-robotics.com/25.01/development/interaction-simulator.html) and the [ros4hri tutorials docker](https://ros4hri.github.io/ros4hri-tutorials/interactive-social-robots/) as the end-user test bed, and is testable internally over Zenoh. Along the way, Arora gains a general mechanism for exposing long-running, cancellable behaviors ("task runs") to any bridge, and Vizij gains a systematic way to make an existing GLB face adhere to an external standard.

## Research digest (2026-07-24)

Sources: [REP-155](https://www.ros.org/reps/rep-0155.html), [ros4hri.github.io](https://ros4hri.github.io/) + its interface packages (hri_msgs, hri_actions_msgs, interaction_skills, communication_skills, std_skills), [expressive_face 0.6.0 source](https://gitlab.iiia.csic.es/socialminds/ros4hri/expressive_face), [PAL OS 25.01 docs](https://docs.pal-robotics.com/25.01/development/interaction-simulator.html), [pal-robotics/interaction_sim](https://github.com/pal-robotics/interaction_sim), [rmw_zenoh](https://github.com/ros2/rmw_zenoh).

- **`set_expression` is a topic skill, not an action**: `interaction_skills/msg/SetExpression` (`std_skills/Meta` + `hri_msgs/Expression`) on `/skill/set_expression`, fire-and-forget, latest-wins. `Expression` carries a named expression (25 constants, six-basic-emotions superset) **or** valence/arousal in [−1, 1].
- **`look_at` is the only action**: `interaction_skills/action/LookAt` on `/skill/look_at`. Goal = a policy (`random`, `social`, `glance`, `auto`, `reset`) or a `PointStamped` target to track indefinitely. Preemption via `Meta.priority` (replace-or-reject; >200 reserved); cancelled/preempted goals return errno-style codes (`ROS_EINTR`, `ROS_ECANCELED`, `ROS_ENOTSUP`). Feedback is a generic scalar struct — near-vestigial. No timeout fields exist anywhere in the skills.
- **Visemes are absent from ROS4HRI** (definitive: REP-155, all interface packages, the whole GitHub org). In practice lipsync = a robot-speech text topic (naive text→mouth-shape in the incumbent: 7 shapes, 80 ms/char) + `hri_actions_msgs/ClosedCaption` for subtitles. FACS `FacialActionUnits` (99 AU slots incl. jaw/lip) exists as *perception* vocabulary only — an AU command channel would be an extension.
- **Video-out is an untold hard requirement**: the simulator's rqt shows the face via `/robot_face/image_raw/compressed`, and on robots `robot_head_display` subscribes `/robot_face/image_raw`; PAL docs explicitly sanction third-party publishers replacing `expressive_eyes`.
- **Two ecosystems, two name sets**: PAL (`/robot_face/expression`, `/robot_face/look_at`, `/robot_face/tts`) and IIIA (`/skill/set_expression`, `/expressive_face/look_at`, `/expressive_face/speech`, `/closed_captions`). Overlapping semantics; a replacement should serve both via remap-friendly defaults.
- **The incumbent implements no action server at all**; gaze policies come from PAL's closed `attention_manager`. The `social` policy implies consuming `/humans/faces/tracked` + TF — attention-manager territory, out of renderer scope for the MVP.
- **Incumbent behaviors to reproduce**: idle blinking (~8 s ± 1 s, 0.2 s parabolic), ~200 ms exponential smoothing on all parameters, unknown expression → warn and ignore, captions (8-word chunks, per-speaker colors), subscriber-gated image publishing (`bgr8`, frame `sellion_link`), lifecycle-node launch contract, `pal_configuration`/`launch_pal` parameter overlays, 1 Hz `/diagnostics` heartbeat. Bugs we will not copy: ESC-quits-the-node, expression change resets gaze, `frame_id` silently ignored (we accept the `sellion_link` default but keep TF resolution as a follow-up), fixed-seed blink RNG.
- **Transport**: PAL OS 25.01 ("alum") = ROS 2 Humble on CycloneDDS (no-multicast peer-list config). Our `ros2-client-multi-rmw` 0.10 fork has topics/services/actions green on the DDS backend across Humble→Lyrical, and a complete rmw_zenoh backend. `rmw_zenoh_cpp` is apt-installable on Humble (0.1.9, zenoh 1.x, **no type hashes on Humble** — the permissive case for our placeholder hashes). The tutorial container runs `--net=host`, so a host-side Vizij joins the graph either way. Both DDS-direct (zero container changes) and Zenoh (`apt install ros-humble-rmw-zenoh-cpp` + `RMW_IMPLEMENTATION=rmw_zenoh_cpp` + `rmw_zenohd` on :7447) are viable; Zenoh is the internally-controlled path.

## Decisions

1. **Video-out ships in the MVP** — full drop-in visibility in rqt and on robot head displays.
2. **First-class task runs in Arora now** (not a bridge-level stopgap): long-running, cancellable work as spawned instances re-ticked by the runtime beside the main behavior, reusing the existing `Status::Running` tick-until-terminal + halt semantics.
3. **Behavior fragments register as live modules**: a reusable fragment (parameterized graph) is registered at runtime as a module whose exported functions are synthesized from the fragment's parameter `Io`s. Registration itself can happen on the fly. Native/wasm module functions and graph fragments are thereby spawnable through one convention.
4. **Spawn/cancel ride the existing `Call` plane** — no new `BridgeOp` variants. `spawn(args) → ActionStart { run_id, root_key, cancel_ref }` is an exported function of the fragment module; cancellation is a replied request through the same plane ("handled locally there"), cooperative ROS-style: reply = accepted/unknown/terminal, actual termination observed on the run's status key. Not a store write (needs a reply; write access ≠ cancel authority).
5. **Per-run key subtree** `tasks/<run_id>/…`: `status` written by the runtime each tick, live-drivable inputs auto-bound under `in/<param>` (the `predetermined_key` convention, instanced), outputs wherever the fragment writes. Feedback/status thus ride the store change feed — the transport we already have. Reserved top-level namespace (not under `arora/*`, which bridges filter out); exposure profiles include/exclude it by glob.
6. **[ARORA-62](https://linear.app/semio-ai/issue/ARORA-62/arora-bridge-ros2-expose-bridge-methods-as-ros-2-services-restore) is a prerequisite**: the ROS 2 bridge exposes the method plane (`ListMethods`/`Call`) as services, so external ROS clients can reach spawn/cancel functions generically.
7. **Exposure = named glob profiles, not regex, not hardwired**: a profile (e.g. `ros4hri`) = glob include + prefix rewrites (`standard/ros4hri/** → /**`) for bulk data keys, **plus** typed endpoint bindings for the skill surfaces (a topic like `/skill/set_expression` maps a structured message to several keys; no string rewrite can express that), plus a coverage check against the face's declared standard schema. Regex remains a possible later escape hatch.
8. **Adaptation is layered: the asset-independent math ships with Vizij, the asset-specific math with the face.** The ROS4HRI mapping (expression-name routing, valence/arousal blending, gaze vergence, the idle blink, smoothing, playing a viseme stream) is a built-in graph asset in `vizij-arora-host`. It composes like the animations source and writes only the face standard's `standard/vizij/*` controls. What a control looks like on a given face is the face's own: its `standard-adaptation` graph, shipped in the GLB's `VIZIJ_bundle` from a reviewable sidecar, maps the controls onto its rig. A face implements the standard once, and every external standard reaches it through a mapping; a GLB carrying its own full ROS4HRI binding would make every face reimplement the universal math, N standards × M faces. Exposure profiles are deployment config, adaptations are asset content, mappings are Vizij content. Reference: [vizij-rs `docs/ros4hri.md`](https://github.com/vizij-ai/vizij-rs/blob/main/docs/ros4hri.md).
9. **Asset source-of-truth is text, GLB is a build artifact** (agent-friendly authoring): the `VIZIJ_bundle` payloads (rig graphs, standard inputs, bindings, poses, schema declarations) live as JSON sidecars in the repo; a deterministic `pack` step injects them into the GLB. The authoring UI and coding agents edit the same sidecars.
10. **LookAt MVP scope**: target tracking, `reset`, `glance`, cheap `random` (idle saccades). `social` returns `ROS_ENOTSUP` (attention-manager territory; revisit with ROS4HRI perception support).
11. **`Meta.priority` replace/reject is enforced at the skill endpoint binding** in the bridge (one active gaze goal; higher priority cancels the previous run → `ROS_EINTR`), not in the task layer — the task layer happily runs N concurrent runs.
12. **The face standard is tiered, and a face's compliance is read off what it listens on.** `standard/vizij` holds gaze, lids and the blink; 27 named expressions; the 15 visemes (the Oculus/Meta set: `sil PP FF TH DD kk CH SS nn RR aa E ih oh ou`); 36 muscle controls keyed to FACS action units and ARKit blendshapes; and the conversation state. A face declares nothing: `vizij-bundle validate` derives its level from the paths its graphs read: L0 gaze and lids, L1 the expressions, L2 the visemes, L3 at least half the muscle tier. ARKit names are metadata on the muscle controls rather than a rival vocabulary, so an avatar exported with them maps one to one. Beside the controls, a face reports state (its current viseme and the utterance it speaks) and carries one setting, its lipsync gain. The `vizij-face` profile declares the whole interface as data. Reference: [vizij-rs `docs/face-standard.md`](https://github.com/vizij-ai/vizij-rs/blob/main/docs/face-standard.md).
13. **Key paths are unversioned; versions live in the profile declarations** (`vizij-face` v1, `ros4hri` v1), not in path segments. Versioning every segment taxes every graph edge for a migration that a profile version handles more cheaply; a path-level version remains the last resort for a true semantic break of a key.
14. **The behavior's structure decides who writes a key.** A device composes the face's graphs, then the mappings, then the animations, then the playing program, and runs its task runs after all of them in spawn order, so a skill overrides an animation; within a graph the order is the graph's structure. The last writer in that order wins. A write to a key another branch of the behavior holds is a conflict to surface, not to resolve silently: arora-sdk's [behavior-languages proposal](https://github.com/semio-ai/arora-sdk/blob/main/docs/proposal-behavior-languages.md) reads a behavior's write set off its graph and fails the conflicting write.
15. **Speech is a skill, and the lips belong to the run that plays them.** Two viseme players ship as skills:
    - `say(text, voice)`: a task run hosting the device's speech provider. Providers are sibling modules on one `say` contract, chosen at build time: a cloud provider by default, Piper as a feature.
    - `play_viseme(shape, weight, duration)`: one shape through a lipsync envelope.

    Both drive the face's viseme weights through one lipsync driver whose smoothing state is the face's own weights, so a new run takes the lips over from wherever the last one left them, without a snap. The face reports the current viseme at `standard/vizij/viseme` and the utterance at `standard/vizij/speech`. No graph other than a run writes the viseme weights: a mapping writing them would compete with a run every tick. A remote viseme stream is a player too: the ROS4HRI mapping spawns `play_viseme` for each viseme arriving on `/tts/viseme` or `/tts/visemes`, held for the viseme's duration. The face's adaptation maps the weights onto its poses, scaled by the face's lipsync gain. Reference: [vizij-rs `docs/skills.md`](https://github.com/vizij-ai/vizij-rs/blob/main/docs/skills.md).

## Target ROS surface

| Interface | Type | Dir | Phase |
|---|---|---|---|
| `/skill/set_expression` | `interaction_skills/msg/SetExpression` sub | in | MVP |
| `/robot_face/expression` | `hri_msgs/msg/Expression` sub (PAL alias) | in | MVP |
| `/robot_face/look_at`, `/expressive_face/look_at` | `geometry_msgs/msg/PointStamped` sub | in | MVP |
| `/tts/viseme`, `/tts/visemes` | `hri_msgs/msg/Viseme`, `hri_msgs/msg/Visemes` sub (a viseme stream, decision 15) | in | MVP |
| `/skill/say` | `communication_skills/action/Say` action server, feedback extended with the viseme and its intensity | in | MVP |
| `/robot_face/speech`, `/robot_face/viseme` | `std_msgs/msg/String` pub: the utterance being spoken, the lip shape being spoken | out | MVP |
| `/closed_captions` | `hri_actions_msgs/msg/ClosedCaption` sub | in | MVP |
| `/robot_face/image_raw` (+`/compressed`) | `sensor_msgs/msg/Image` pub, subscriber-gated, `bgr8`, frame `sellion_link` | out | MVP |
| `/diagnostics` | `diagnostic_msgs/msg/DiagnosticArray`, 1 Hz | out | MVP |
| `/skill/look_at` | `interaction_skills/action/LookAt` action server | in | Compliance |
| `/{ns}/methods/*` | method-plane services (ARORA-62) | in | Foundation |
| `/robot_face/overlay` | `hri_actions_msgs/action/FaceOverlay` server | in | Later |
| Skill manifest | `<skill>`/`<implements>` package.xml exports + `ament_archlint` | — | Compliance |

## `standard/ros4hri` key contract

The device-scoped keys the bridge's ros4hri profile and the built-in ROS4HRI mapping meet on, declared as the `ros4hri` profile. The full table, with types, sources and behaviour per channel, is [vizij-rs `docs/ros4hri.md`](https://github.com/vizij-ai/vizij-rs/blob/main/docs/ros4hri.md#the-standardros4hri-key-contract).

- Commands in: `expression/{name,valence,arousal}`, `gaze/{target,frame}`, `au/<code>`, and the streamed viseme, `viseme` (its ROS4HRI code) with `viseme/{time,duration}`.
- Speech state out: `speech/text`, the utterance, and `speech/viseme`, the lip shape, both relayed from the face's own speech state.
- Not yet keyed: captions (B4). A gaze policy travels in the `/skill/look_at` goal, not on a key.

The mapping turns these into `standard/vizij/*` controls with the incumbent's dynamics: ~200 ms smoothing, gaze ±0.78 rad → ±1 normalized, targets at `x ≤ 0.1` dropped.

## Arora task runs (design outline)

Full design note to be written in arora-sdk (first Phase-A deliverable, reviewed before implementation). Shape agreed at kickoff:

- **Fragment = live module.** Registering a fragment synthesizes a module (UUID identity) whose `spawn` export takes the fragment's declared parameters and returns an `ActionStart` record; a `cancel(run_id)` export (or per-run callable — decided in the design note) requests cooperative cancellation. Discovery comes free via `ListMethods`.
- **Run lifecycle**: spawned runs are ticked each step beside the main behavior until terminal; halt semantics from the behavior tree apply to graph-backed runs; function-backed runs get cancellation signaled on their next tick. Terminal status is observable at `tasks/<id>/status`; subtree reaped after result delivery plus a grace TTL (ROS caches results similarly).
- **Open details for the note**: run/subtree reaping policy, write-precedence when runs and the main behavior touch the same key in one step, module unregistration lifecycle, `ActionStart` record type.

## Agent-friendly asset workflow

Working constraint: a coding agent cannot read or diff GLB binaries; UI-only authoring makes standards work unreviewable and unautomatable. Plan:

1. **Sidecar source-of-truth**: `VIZIJ_bundle` payloads as JSON files per face in the repo (rig graph, standard inputs, bindings, poses, `standardInputSchema` declarations). Git-diffable, reviewable, CI-checkable.
2. **`vizij-bundle` CLI** (Node, reusing existing packages): `unpack <glb>` / `pack` (idempotent, deterministic ordering — stable diffs), `inspect <glb>` (animatables, morph targets, node paths as JSON), `validate` (graph paths resolve against animatables; standard-schema coverage report, machine-readable).
3. **Headless golden tests**: load face + adaptation graph in the Rust graph runtime, write `standard/ros4hri/*` keys, assert animatable outputs — iterate without a browser.
4. The authoring UI imports/exports the same sidecars; `pack` is the only writer of GLBs.

`.gltf` text form is useful for occasional debugging but is not the answer: scene JSON is huge and noisy, and editing an embedded extension inside it is worse than editing a dedicated sidecar.

> **Side note — from the seat of the coding agent expected to do this work.** With today's pipeline this work would be miserable for me: I cannot read a GLB, so every inspection or edit becomes a shell round-trip through a packing tool; diffs are opaque blobs, review is impossible, and a merge conflict on a GLB is unresolvable. Moving to `.gltf` only half-helps — the extension JSON I need sits embedded in a scene file dominated by accessor and buffer noise, which is worse to edit than a dedicated file. What actually changes the economics, in order of impact: (1) the sidecar source-of-truth, which turns standards work into ordinary text edits with reviewable diffs; (2) the CLI with machine-parseable `inspect`/`validate` output, which replaces "open the authoring UI to see what the face has" and gives me a tight edit→validate loop; (3) headless golden tests, so iterating on mapping math needs no browser. None of this is agent-specific tooling: the same properties (diffability, review, CI enforcement, one source of truth) are what make the work tractable for humans too.

## Plan

Three tracks; A and B are independent until C.

**Track A — Arora (arora-sdk)**
- A1. Task-runs design note (fragment-as-module, spawn/cancel, `tasks/*` subtree, reaping, precedence). Review gate.
- A2. Implementation: runtime run scheduling + fragment registration as live modules + `ActionStart`/cancel plane.
- A3. [ARORA-62](https://linear.app/semio-ai/issue/ARORA-62/arora-bridge-ros2-expose-bridge-methods-as-ros-2-services-restore): method-plane services in `arora-bridge-ros2` (update ticket: fork is 0.10, services+actions available on both backends).
- A4. Typed message support in `arora-bridge-ros2`: `hri_msgs/Expression`, `SetExpression`, `PointStamped`, `ClosedCaption`, `DiagnosticArray`, `Image`/`CompressedImage`; absolute topic names.
- A5. Exposure profiles: glob include + prefix rewrite + typed endpoint bindings + coverage check; `ros4hri` preset with both PAL and IIIA aliases.
- A6. `/skill/look_at` action server: goal → spawn LookAt fragment; `Meta.priority` replace/reject at the endpoint; `EINTR`/`ECANCELED`/`ENOTSUP` mapping.

**Track B — Vizij (vizij-rs, vizij-web)**

> **Status:** B1–B3, B5 and B6 ship in vizij-rs; B4 (captions) is open. The face standard (`standard/vizij/*`) and the built-in ROS4HRI mapping are described in [vizij-rs's face-standard and ROS4HRI docs](https://github.com/vizij-ai/vizij-rs/blob/main/docs/ros4hri.md); topic ingestion is arora-bridge-ros2's ROS4HRI preset (Track A4/A5).

- B1. ✅ `vizij-bundle` CLI + sidecar extraction for the reference face (quori); deterministic pack.
- B2. ✅ `standard/ros4hri` schema JSON + adaptation graph for quori (expressions → poses, valence/arousal blend, gaze mapping, blink idle already present); headless golden tests.
- B3. ✅ Lipsync: the `say` and `play_viseme` skills drive the face's visemes, and the ROS4HRI viseme stream plays through `play_viseme` (decision 15). Design: [task-runs-and-actions-proposal.md §6](task-runs-and-actions-proposal.md#6-worked-example--say-a-streaming-task-run).
- B4. Captions rendering (8-word chunks, per-speaker colors) as a Vizij overlay.
- B5. ✅ LookAt behavior fragment (track/reset/glance/random) over the gaze channels, spawned by `/skill/look_at`.
- B6. ✅ Video-out: the native `vizij` renders the face, headless included, and publishes it on `/robot_face/image_raw` and `/robot_face/image_raw/compressed` through A4's image endpoints.

**Track C — Integration & deployment**
- C1. `vizij_face_bringup` ROS package: launch + remap sets for both ecosystems, skill manifests (`<skill>`/`<implements>` exports, `ament_archlint`), PAL module YAML for robots (`pal module disable expressive_eyes` + `deployed_ws` registration).
- C2. `interaction_sim` overlay package (no upstream disable flag exists): shadowed launch file minus the `expressive_eyes` include.
- C3. Docker tutorial recipe: host-side Vizij over `--net=host`; DDS-direct first; Zenoh variant (`ros-humble-rmw-zenoh-cpp` + router) as the internally-controlled path.
- C4. E2E acceptance: in the tutorial container — expression topic changes the Vizij face; look_at moves gaze; captions render; rqt displays `/robot_face/image_raw/compressed`; `/skill/look_at` goal lifecycle incl. preemption and cancel.

MVP = A3–A5 + B1–B4 + B6 + C1–C4 (topic parity + video). Compliance milestone adds A1–A2, A6, B5 (`/skill/look_at` action).

## Risks

- Zenoh **outbound** type hashes for non-std types use placeholders (fork ADR-0007) — fine on Humble (no hash matching), blocks Jazzy+ C++ subscribers later; msggen IDL hashing is the known fix.
- Switching the whole PAL container to rmw_zenoh is plausible but untested against PAL's closed binaries; DDS-direct fallback keeps the demo safe. CycloneDDS peer-list config in the container may need a shell override.
- Webview frame-capture throughput (readback + JPEG at 20 Hz) needs early measurement.
- `interaction_sim` overlay must track upstream changes (155-line launch file; low churn).
- ROS4HRI is primarily developed/tested on Jazzy while PAL 25.01 is Humble — we straddle both.

## Upstream extension candidates (after MVP)

Viseme messages: `hri_msgs/Viseme` and `Visemes` as the ROS4HRI TTS nodes in the field publish them (upstream `hri_msgs` has none; arora-msgs-ros2 carries them as a recorded departure). AU command channel reusing `FacialActionUnits` vocabulary, TF-resolved `look_at` frames (the incumbent ignores `frame_id`), `social` policy once ROS4HRI perception is consumable from Arora. Proposals via the ros4hri GitHub org discussions.
