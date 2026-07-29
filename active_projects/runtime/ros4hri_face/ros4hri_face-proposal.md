# ROS4HRI face — Vizij as a ROS4HRI-compliant robot face renderer

Status: proposal, kickoff 2026-07-24, revised 2026-07-29 (adaptation layering, standards, speech — see the [standards & adaptation](standards-and-adaptation.md) companion). Linear project: [ROS4HRI Integration](https://linear.app/semio-ai/project/0f74f451-cea7-4bef-be6c-7741cd31c6c8).

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
8. **Adaptation is layered: dynamic math is built-in, semantic math lives with the asset** (see [standards & adaptation](standards-and-adaptation.md)). The asset-independent part — expression-name routing, valence/arousal blending, gaze vergence, blink idle, viseme clocking, smoothing — ships with Vizij as a data-driven **built-in profile graph** composed like the animations source (in `vizij-arora-host`, not the HAL), writing `standard/vizij/*` semantic controls. The asset-specific part — what "happy" looks like on this face — is authored poses and rig bindings under the standard's reserved control names, made in the pose editor and shipped in the GLB's `VIZIJ_bundle`, versioned via `standardInputSchema`. The rejected alternative (each GLB ships its own full ros4hri binding graph) made every face reimplement the universal math, N standards × M faces; it survives as the per-asset override/opt-out tier. Exposure profiles are deployment config; semantic controls are asset content; the profile graph is Vizij content.
9. **Asset source-of-truth is text, GLB is a build artifact** (agent-friendly authoring): the `VIZIJ_bundle` payloads (rig graphs, standard inputs, bindings, poses, schema declarations) live as JSON sidecars in the repo; a deterministic `pack` step injects them into the GLB. The authoring UI and coding agents edit the same sidecars.
10. **LookAt MVP scope**: target tracking, `reset`, `glance`, cheap `random` (idle saccades). `social` returns `ROS_ENOTSUP` (attention-manager territory; revisit with ROS4HRI perception support).
11. **`Meta.priority` replace/reject is enforced at the skill endpoint binding** in the bridge (one active gaze goal; higher priority cancels the previous run → `ROS_EINTR`), not in the task layer — the task layer happily runs N concurrent runs.
12. **`standard/vizij` grows a semantic layer with progressive compliance**: `expression/<name>`, `viseme/<shape>` (the industry 15-viseme names; the incumbent's 7 embed), optional `au/<code>`, over the existing gaze/lid paths. A face implements what it implements; the coverage checker derives its level (L0 gaze/blink → L3 AUs) and the built-in profile degrades by declared fallback, never silently. ARKit-52 blendshape names are recognized at the morph level (an extra built-in profile lights up for GLBs that carry them) rather than rivaled. Details and levels in [standards & adaptation](standards-and-adaptation.md).
13. **Key paths are unversioned; versions live in schema/profile declarations** (`standardInputSchema`), not in every path segment. Path-level versioning stays the last resort for a true semantic break of a key.
14. **Write contention is detected graph-side and resolved last-writer-wins, loudly**: compose-time writer-set report per path, eval-time same-tick multi-writer flag naming the winner. Arbitration (priority lanes, blending) waits for behavior spawning's conflict policies. Likewise **clips take precedence over live topics** (the animation source composes last, by arora design) until those policies exist.
15. **TTS integration standardizes a data surface, not a component**: the `speech/*` namespace (`text`, `viseme/<shape>`, `speaking`, `audio-position`) is the solution-agnostic meeting point; a TTS solution is a profile (wiring fragment + a `say` behavior variant where a lifecycle exists) over an invariant substrate — one always-composed viseme application graph (smoothing + timeout-decay) and one fallback text→viseme-clip function played on the animation player (no second sequencer). The topic path never spawns; behaviors compose through the data plane, never by parent-child spawning. Every `say` variant also publishes its text (ROS4HRI expects downstream viseme producers). Solution table and doctrine in [standards & adaptation](standards-and-adaptation.md).

## Target ROS surface

| Interface | Type | Dir | Phase |
|---|---|---|---|
| `/skill/set_expression` | `interaction_skills/msg/SetExpression` sub | in | MVP |
| `/robot_face/expression` | `hri_msgs/msg/Expression` sub (PAL alias) | in | MVP |
| `/robot_face/look_at`, `/expressive_face/look_at` | `geometry_msgs/msg/PointStamped` sub | in | MVP |
| `/robot_face/tts`, `/expressive_face/speech` | `std_msgs/msg/String` sub (lipsync) | in | MVP |
| `/closed_captions` | `hri_actions_msgs/msg/ClosedCaption` sub | in | MVP |
| `/robot_face/image_raw` (+`/compressed`) | `sensor_msgs/msg/Image` pub, subscriber-gated, `bgr8`, frame `sellion_link` | out | MVP |
| `/diagnostics` | `diagnostic_msgs/msg/DiagnosticArray`, 1 Hz | out | MVP |
| `/skill/look_at` | `interaction_skills/action/LookAt` action server | in | Compliance |
| `/{ns}/methods/*` | method-plane services (ARORA-62) | in | Foundation |
| `/robot_face/overlay` | `hri_actions_msgs/action/FaceOverlay` server | in | Later |
| Skill manifest | `<skill>`/`<implements>` package.xml exports + `ament_archlint` | — | Compliance |

## `standard/ros4hri` key schema (draft v0)

Rig-facing keys the adaptation graph consumes; the bridge's ros4hri profile binds the typed endpoints onto them.

- `standard/ros4hri/expression/name` (text, the 25 ROS4HRI names), `…/expression/valence`, `…/expression/arousal` (f32, −1..1)
- `standard/ros4hri/gaze/policy` (text enum), `…/gaze/target` (vec3, sellion-frame), `…/gaze/frame` (text, default `sellion_link`)
- `standard/ros4hri/speech/text` (text — lipsync input)
- `standard/ros4hri/caption/text`, `…/caption/speaker` (text)
- Extensions (not in the standard, declared as such): `standard/ros4hri/viseme/<shape>` (f32 weights), `standard/ros4hri/au/<code>` (f32, FACS codes from `FacialActionUnits`)

These keys are the wire mirror. The built-in ros4hri profile graph maps them onto `standard/vizij/*` semantic controls (viseme/emotion poses already exist in the pose system) and forwards speech onto the solution-agnostic `speech/*` namespace; the face's rig graph takes the controls to morphs and bones. Incumbent-matched dynamics: ~200 ms smoothing, gaze mapping ±0.78 rad → ±1 normalized, `x ≤ 0.1` targets dropped. The full channel inventory, contention rules, speech plane, and corner-case catalog live in [standards & adaptation](standards-and-adaptation.md).

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
- B1. `vizij-bundle` CLI + sidecar extraction for the reference face (quori); deterministic pack.
- B2. `standard/ros4hri` schema JSON + the built-in ros4hri profile graph (expressions → `standard/vizij` controls, valence/arousal blend, gaze mapping, blink idle, contention report) + quori's semantic controls at L2 (expression + viseme poses in the pose editor); headless golden tests.
- B3. Lipsync: the speech plane — viseme application graph (smoothing + timeout-decay) + the fallback text→viseme-clip function on the animation player (incumbent-parity 7 shapes / 80 ms per char; richer sources plug in as profiles).
- B4. Captions rendering (8-word chunks, per-speaker colors) as a Vizij overlay.
- B5. LookAt behavior fragment (track/reset/glance/random) over the gaze channels.
- B6. Video-out: frame capture in vizij-standalone (subscriber-gated, ~20 Hz, 800×600, `bgr8` + JPEG) feeding A4's Image publisher.

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

Viseme command channel (the standard has none), AU command channel reusing `FacialActionUnits` vocabulary, TF-resolved `look_at` frames (the incumbent ignores `frame_id`), `social` policy once ROS4HRI perception is consumable from Arora. Proposals via the ros4hri GitHub org discussions.
