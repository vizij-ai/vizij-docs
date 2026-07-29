# Face standards & adaptation — the layered waist

Companion to the [ROS4HRI face proposal](ros4hri_face-proposal.md): how a Vizij face
implements an external standard, where the adaptation lives, and how speech/lipsync
plugs in. The proposal holds the decisions; this note holds the architecture and the
corner-case catalog that challenges it.

## The problem

"Vizij supports ROS4HRI" must mean: the bridge translates ROS4HRI topics into store
keys, and a compliant face responds — without every GLB author wiring a ROS4HRI
binding graph by hand.

Two facts shape the answer:

- **Today's `standard/vizij` surface is six paths** — `left_eye/pos/{x,y}`,
  `right_eye/pos/{x,y}`, `{left,right}_eye_top_eyelid/pos/y` — plus ad-hoc morph
  names like `mouth/morph/jaw_open`, next to three legacy conventions (`standard/`,
  `propsrig/`, coupled-gaze) that the web runtime detects by prefix. There is no
  expression, viseme, or AU vocabulary. ROS4HRI is the forcing function that makes
  us define the semantic layer of our own standard.
- **Adaptation mixes two kinds of math.** *Semantic* math is asset-specific — what
  "happy" looks like on a given face is an artistic fact no built-in can know.
  *Dynamic* math is universal — smoothing, blink timing, viseme clocking, gaze
  vergence are the same on every face. A design that ships both in the GLB makes
  every face reimplement the universal part; a design that builds both in cannot
  express the artistic part. They belong in different places.

## The layered waist

```
ROS4HRI topics ──bridge──▶ standard/ros4hri/*         wire mirror (bridge contract)
                              │  built-in profile graph(s)   shipped with Vizij, data not code
                              ▼
                        standard/vizij/*              semantic face controls (the waist)
                              │  the GLB's rig graph          authored per face (pose editor)
                              ▼
                        morphs / bones / materials
```

- **`standard/ros4hri/*`** mirrors the wire: what the bridge's ros4hri profile
  writes ([schema in the proposal](ros4hri_face-proposal.md#standardros4hri-key-schema-draft-v0)).
  This namespace is the contract with the bridge work in arora-sdk; everything below
  it is Vizij's concern.
- **The built-in profile graph** does the dynamic math: expression-name routing,
  valence/arousal circumplex blending, gaze mapping with vergence and eyelid-follow,
  blink idle, viseme application, per-channel smoothing. It is asset-independent by
  construction: it only writes `standard/vizij/*` controls.
- **`standard/vizij/*`** is the waist: the semantic controls a face implements once,
  serving every external standard — ROS4HRI today, the next standard for free.
- **The GLB's rig graph** does the semantic math: controls → this face's morphs,
  bones, and materials. Authored in the pose editor, persisted in `VIZIJ_bundle`,
  round-tripped through the existing sidecar workflow.

### Where built-ins live

The home is **graph composition in `vizij-arora-host`**, not the HAL. `RigHal` is
deliberately mechanical — store keys → typed paths → renderer, no semantics — and
stays that way. `Bundle::compose` already appends a host-provided, asset-independent
source (the animations source) last-writer-wins over the GLB's own graphs; a
standard profile is the same shape, composed the same way, shared by the native app
and the web runtime.

The built-in profile is a **data asset** — a JSON graph shipped with the vizij crate
and the npm runtime — not synthesized Rust. Humans open it in the authoring editor,
inspect it, fork it per face. Three override tiers:

1. Nothing declared: the built-in profile composes as-is.
2. The GLB authors a graph writing the same `standard/vizij` keys: compose order
   makes the asset win (with the collision surfaced — see contention below).
3. The bundle metadata opts out of a built-in profile entirely: the asset ships its
   own full adaptation (the escape hatch for faces that want total control).

## `standard/vizij` semantic controls

The waist vocabulary, all f32 weights unless noted:

- **Gaze & lids** (existing): `left_eye/pos/{x,y}`, `right_eye/pos/{x,y}`,
  `{left,right}_eye_top_eyelid/pos/y`.
- **Expressions**: `expression/<name>` — one weight per named expression the face
  implements. Names are the ROS4HRI 25 where applicable; faces may add their own.
  Implemented as authored poses under reserved names — the pose editor is the
  compliance tool, not a graph editor.
- **Visemes**: `viseme/<shape>` — shapes named on the industry 15-viseme set
  (`sil PP FF TH DD kk CH SS nn RR aa E ih oh ou`, the Oculus/Meta convention); the
  incumbent's 7 shapes embed into it, so parity ports cleanly and richer TTS engines
  are not down-sampled by the standard.
- **AUs** (optional tier): `au/<code>` — FACS codes, for faces that rig them.

At the morph level, faces whose GLBs carry **ARKit-52 blendshape names** get an
extra built-in profile for free: AU→ARKit is a documented face-independent matrix,
and the avatar ecosystem (Character Creator, ReadyPlayerMe, VRM-adjacent tooling)
exports those names natively. ARKit is not the waist — stylized faces like quori
have no ARKit topology — but it is the cheapest onboarding path for wild-caught
avatars, so the standard recognizes the names rather than inventing rivals.

### Progressive compliance

A face declares nothing; the coverage checker derives what it supports and the
built-in profile degrades accordingly:

| Level | The face has | What works |
|---|---|---|
| L0 | the six gaze/lid paths | gaze, blink, smoothing — every current face, no GLB change |
| L1 | expression poses under standard names | the 25 names + valence/arousal blending |
| L2 | viseme shapes | lipsync |
| L3 | AU or ARKit morphs | the AU channel, finer expression synthesis |

Unmapped input degrades by declared fallback, never silently: unknown expression
name → nearest circumplex anchor among the poses the face *does* have; no visemes →
`jaw_open` envelope; no AU morphs → projection into expression space, or warn-once
and ignore. `vizij-bundle validate --standard ros4hri` prints the level and the
per-channel fallbacks — the same report CI enforces when an asset claims a level.
The reference faces ship at L2+, so the out-of-the-box claim is demonstrable.

## Channel inventory

What the built-in ros4hri profile maps, and which side of the waist each mapping
sits on:

| Channel | From | To | Asset-specific part |
|---|---|---|---|
| named expression | `expression/name` | `expression/<name>` weight | the pose (L1) |
| valence/arousal | `expression/{valence,arousal}` | blend over anchor poses | the anchors (L1) |
| AUs | `au/<code>` | `au/<code>` or ARKit morphs | the morphs (L3) |
| gaze | `gaze/{target,frame,policy}` | eye pos + vergence + lid-follow, ±0.78 rad → ±1, `x ≤ 0.1` dropped | none |
| lipsync | `speech/*` (below) | `viseme/<shape>` | the shapes (L2) |
| blink idle | — | lid paths, 8 s ± 1 s, 0.2 s parabola | none |
| smoothing | — | ~200 ms exponential per channel | none |
| captions | `caption/*` | render overlay — not rig | none |

## Contention & precedence

**Detection is graph-side.** Writers are statically declared — every output node
carries its path, per composed source — so:

- *Compose-time*: the writer-set per path across sources is a first-class report
  (which sources contend where), not a log line.
- *Eval-time*: static collision is not contention — an inert animation source
  colliding with the expression channel is fine until both write in the same tick.
  The evaluator flags same-tick multi-writers on a path, with the last-writer-wins
  winner named. No store involvement.

**Resolution is last-writer-wins, surfaced loudly.** Arbitration (priority lanes,
additive blending) is a future mechanism, expected to arrive with behavior spawning
and its conflict policies — not solved here.

**Clips take precedence over live topics** — the animation source composes last, by
arora design. A playing performance owns its keys; expression topics reclaim them
when it ends. Revisiting this is likewise deferred to spawn-time conflict policies.

## Speech & TTS

### The speech data plane

TTS integration standardizes a *data surface*, not a component. The reserved
`speech/*` namespace is the solution-agnostic meeting point:

- `speech/text` — the utterance in flight
- `speech/viseme/<shape>` — live viseme weights (15-set names)
- `speech/speaking` — bool
- `speech/audio-position` — playback clock, when a source has one

One always-composed **application graph** consumes `speech/viseme/*`: smoothing plus
timeout-decay (no event for N ms → mouth closes). It is the only owner of "close the
mouth" — no speech source needs a lifecycle just to stop cleanly. A **fallback
synthesis function** (module function: text → viseme clip, incumbent-parity 7
shapes / 80 ms per char) covers text-only sources; its output is an ordinary clip on
the animation player — same timeline engine, same transport, same precedence story
as every other clip, no second sequencer.

`standard/ros4hri/speech/text` and the viseme extension keys are the wire mirror;
the built-in ros4hri profile forwards them onto `speech/*`. Our own TTS writes
`speech/*` directly. Each namespace has one role: wire mirror → speech state → face
controls.

### TTS solutions are profiles

A TTS solution = a wiring fragment (a small graph) plus, when a lifecycle exists, a
`say` behavior variant — over the invariant substrate (schema + application graph +
fallback function):

| Solution | Wiring fragment | `say` variant | Viseme source |
|---|---|---|---|
| platform TTS, text-only (PAL incumbent) | text key → synthesis call → player start | none — topic-reactive | fallback function, as a clip |
| external viseme producer (ROS4HRI separation) | viseme topic → `speech/viseme/*` | none, or a thin goal wrapper | the external node, live |
| vizij-standalone (ours) | `speech/*` written by the TTS itself | full: streams audio, owns the clock | the TTS, closed-loop |
| audio-analysis lipsync (future) | analyzer → `speech/viseme/*` | its own — a genuine second lifecycle | derived from audio we didn't produce |

Doctrine, mirroring `set_expression` ("internal execution ≠ external interface"):

- **The topic path never spawns.** Text on `/robot_face/tts` is fire-and-forget,
  latest-wins; the graph reacts (synthesis call → player start). A chatty publisher
  must not churn task runs.
- **The action path is one behavior per solution** — `say` owns invoking the TTS,
  the audio actuation lifetime, cancellation (halt → stop audio → stop the player
  instance → decay closes the mouth), and the errno result. Inside it: function
  calls and store writes, not sibling spawns. In the closed-loop variant the TTS
  owns the audio clock and therefore writes `speech/viseme/*` at the authoritative
  moments itself — a rich interior, still one lifecycle.
- **Behaviors compose through the data plane.** Concurrent lifecycles (a future
  audio-analysis profile beside a `say`) coordinate by writing the shared schema,
  refereed by contention detection — never by parent-child spawning. An overarching
  behavior exists only where goal semantics must aggregate, i.e. within one variant.

### The ROS4HRI text-separation requirement

ROS4HRI expects produced text served separately so another node may derive visemes
from it. Every `say` variant therefore also *publishes* `speech/text` through the
bridge, whether or not we synthesize locally. Consequences:

- The round-trip topology (we speak → text out → external visemes back in) works
  through the application graph unchanged — it is simply the drifty path.
- Our fallback synthesis and an external producer both writing visemes is a
  contention like any other: detected, highlighted, resolved by deployment profile
  (enable the fallback only where no external producer is declared) — never by
  guessing from subscriber counts.

## Corner-case catalog

The use case declined into the cases that challenge it. Dispositions inline; open
points marked.

**Expression**
1. Name and valence/arousal both set in one message — name wins when non-empty, V/A
   is the fallback. *Open: verify against the incumbent's behavior for parity.*
2. Unknown name — incumbent parity is warn-and-ignore; with circumplex anchors,
   nearest-anchor is the better degradation. *Open: parity or improvement.*
3. `confidence` on a command — *open: intensity modulator, or ignored.*
4. Expression arrives while a clip plays — the clip wins (precedence above),
   reclaimed on clip end.
5. Periodic republication vs the smoother — commands are idempotent set-points, not
   impulses; re-sending `happy` at 10 Hz re-triggers nothing.
6. Boot state — neutral, via the existing neutral-pose staging; empty name ≡
   `NEUTRAL`.
7. Out-of-range or NaN valence/arousal — clamp and warn once; NaN must never reach a
   morph weight (it poisons every downstream lerp).

**AUs**
8. Head codes (51–58) and eye codes (61–69) collide with the gaze channel — the
   gaze channel owns eyes and head; those AU ranges apply only under an explicit
   mode, otherwise warn-once and ignore.
9. Sparse arrays — 99 slots, most zero: `confidence` 0 means *not commanded*, not
   "commanded neutral".
10. `BLINK`/`EYES_CLOSED`/`WINK` vs the idle-blink generator — see 15.
11. Commanded AU the face lacks — coverage-checked at load; warn-once per AU at
    runtime.

**Gaze**
12. Targets behind or grazing the face plane — keep the incumbent `x ≤ 0.1` drop;
    clamp vergence for very near targets (physically-correct cross-eye reads as
    comedy).
13. `frame_id` — the incumbent silently ignores it (a bug we don't copy); Vizij has
    no TF, so: accept `sellion_link`, reject others loudly. TF resolution, if it
    comes, happens bridge-side before the store.
14. Eyelid-follow on vertical gaze — built-in default, per-face override (it is a
    taste parameter).

**Blink & dynamics**
15. Blink inhibition — commanded lid states (`asleep`, `EYES_CLOSED`, a wink, a clip
    animating lids) suppress idle blink; the generator has an inhibit input observing
    lid ownership, it is not an isolated source.
16. Smoothing vs snap — per-channel time constants (a `surprised` snap needs a fast
    lane); clips bypass smoothing entirely, they are already timed.

**Speech**
17. The 80 ms/char fallback is Latin-tuned — CJK, emoji, markup degrade it. Accepted
    for parity; better alignment arrives with viseme-producing sources.
18. New text mid-utterance — latest-wins restart (topic semantics); crossfade via
    the application graph's smoothing, no snap.
19. Mouth contention: viseme vs expression smile vs `JAW_DROP` vs clip — the single
    hardest blend decision. Proposed: visemes *additively modulate* the expression's
    mouth pose rather than replace it. *Open: validate on the reference faces.*
20. Barge-in — one active `say` per endpoint, `Meta.priority` replace-or-reject,
    exactly the LookAt rule.
21. TTS latency — the mouth must not lead the audio; open-loop offset per solution
    profile.
22. Cancel mid-utterance — decay to closed, never snap.

**Lifecycle & composition**
23. Face hot-swap — `standard/ros4hri/*` keys persist in the store; the new face
    adopts the current expression state immediately (parity with a physical robot).
24. Multiple faces — profiles are per-face, under per-device namespaces; nothing is
    global.
25. Built-in profile vs GLB graph writing the same key — LWW with the compose-time
    report naming both; the opt-out flag for full takeovers.
26. Topics arriving before the face loads — store staging makes it safe; asserted by
    test, not assumed.

**Out-channel**
27. `image_raw` subscriber-gating is DDS-observable but only approximate over the
    Zenoh bridge — provide an "always publish at N Hz" mode for that path.
28. `/diagnostics` content is Vizij's to define even though publishing is
    bridge-side: fps, loaded face, compliance level, active contention warnings.

## Versioning

Key paths are **unversioned** (`standard/ros4hri/expression/name`, not
`…/v1/expression/name`); versions live in the schema and profile declarations
(`standardInputSchema`: "this face implements ros4hri v1"). Versioning every path
segment taxes every graph edge for a migration event that schema versioning handles
cheaper; the path-level version remains the tool of last resort for a true semantic
break of a key.
