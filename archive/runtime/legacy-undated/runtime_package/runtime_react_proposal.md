# Vizij Runtime React Proposal

This document proposes a `@vizij/runtime-react` package that unifies Vizij’s renderer state, orchestrator integration, and deployment utilities into a single, consumer-friendly bundle. It reflects the current workflows in the fullscreen-face tutorial and related demos while codifying best practices and providing an API surface that keeps host applications in control of assets, orchestration parameters, and input wiring.

## Goals
- Offer a turnkey provider that pairs Vizij’s renderer store with the orchestrator runtime so React applications can mount an animated face with minimal boilerplate.
- Accept a single asset bundle per provider instance (GLB + rig graphs + optional pose metadata) and resolve it into renderer state and orchestrator controllers.
- Keep asset fetching, caching, and lifecycle management in the host’s domain; the package only consumes already-accessible URLs, blobs, or in-memory data.
- Expose hooks and utilities that mirror everything a Vizij face can do—reading outputs, staging inputs, animating values—without forcing consumers to re-implement runtimes from sample code.
- Provide intelligent defaults for orchestrator scheduling, graph merging, and value conversion while allowing full override via props or callbacks.
- Surface runtime state (ready flags, errors, namespaces, root IDs) through context; log recoverable issues and expose them for UI display.

## Non-goals
- Authoring workflows (graph editing, rig authoring, animation creation) remain outside this package.
- Multi-face orchestration within a single provider is out of scope for v1; consumers spin up additional providers for each independent bundle.
- Shipping fixtures, mocks, networking utilities, CLI scaffolds, or code mods is not planned; tests live in the repo but not in the published package.
- Built-in profiling dashboards are not included; consumers collect and visualise runtime metrics in their own applications.

## High-Level Architecture

### Composition
- `<VizijRuntimeProvider>` wraps `VizijContext.Provider` with a custom store created via `createVizijStore` and nests `OrchestratorProvider` from `@vizij/orchestrator-react`.
- Internally, it manages a state machine for asset loading, orchestrator readiness, graph registration, error aggregation, and animate-value transitions.
- Consumers can opt into automatic orchestrator creation/stepping or supply manual controls that align with existing `OrchestratorProvider` props.

### Asset Flow
1. Host supplies an `assetBundle` describing the face GLB source, rig graph(s), optional pose rig graph/config, and namespace metadata.
2. The provider loads the GLB via `loadGLTF`/`loadGLTFFromBlob`, derives the Vizij root ID, and injects world + animatables into the shared store. Assets are assumed to be local or already fetched; the runtime does not fetch remote URLs beyond the provided references.
3. On success, the provider caches the namespace/root ID in context state for downstream components and hooks.
4. Errors during load are caught, logged via `console.warn`, and published through context (`status.error`, `status.asset`) without throwing.

#### Asset Bundle Definition
The bundle is a declarative manifest that the host assembles up front. Each asset type remains a separate file, but the manifest tells the runtime how to stitch them together on mount. No fetching occurs inside the package; every entry points to a URL, Blob, or already-parsed data supplied by the host.

```ts
type VizijAssetBundle = {
  namespace?: string;
  faceId?: string;
  glb: VizijGlbAsset;
  rig: VizijGraphAsset;
  pose?: {
    graph?: VizijGraphAsset;
    config?: PoseRigConfig;
  };
  animations?: VizijAnimationAsset[];
  initialInputs?: Record<string, ValueJSON>;
  metadata?: Record<string, unknown>;
};

type VizijGlbAsset =
  | { kind: "url"; src: string; aggressiveImport?: boolean; rootBounds?: RootBounds }
  | { kind: "blob"; blob: Blob; aggressiveImport?: boolean; rootBounds?: RootBounds }
  | { kind: "gltf"; scene: THREE.Group; animatables?: Record<string, AnimatableValue> };

type VizijGraphAsset = {
  id: string;
  spec: GraphSpec | Record<string, unknown>;
  subscriptions?: Partial<GraphSubscriptions>;
};

type VizijAnimationAsset = {
  id: string;
  clip: StoredAnimation | Record<string, unknown>;
  weight?: number;
};
```

Example bundle assembled from static imports:

```ts
import faceGlb from "./assets/face.glb";
import rigGraph from "./assets/rig.graph.json";
import poseGraph from "./assets/pose-rig.graph.json";
import poseConfig from "./assets/pose-rig.config.json";
import idleClip from "./assets/idle.anim.json";

export const fullscreenBundle: VizijAssetBundle = {
  namespace: "fullscreen-face",
  faceId: "face",
  glb: { kind: "url", src: faceGlb, aggressiveImport: true },
  rig: { id: "rig:face", spec: rigGraph },
  pose: {
    graph: { id: "pose:face", spec: poseGraph },
    config: poseConfig,
  },
  animations: [{ id: "idle", clip: idleClip, weight: 1 }],
  initialInputs: {
    "rig/face/eyes/blink": { float: 0 },
  },
};
```

### Orchestrator Integration
- The provider delegates WASM lifecycle to `OrchestratorProvider` but automatically invokes `createOrchestrator` (unless `autoCreate={false}`) with configurable `schedule`, `initInput`, and other options.
- Rig and pose graphs are normalized (if the WASM build exposes `normalizeGraphSpec`) and registered through `registerMergedGraph`. Default merge strategy mirrors fullscreen-face (`outputs: "add"`, `intermediate: "add"`), but consumers can supply a strategy override or supply `customRegister` callbacks to replace registration entirely.
- The provider tracks staged neutral state via pose configuration but exposes `runtime.stagePoseNeutral(force?: boolean)` so hosts decide when to apply defaults (e.g., on user interaction or preset swaps).
- Animation clips declared in the bundle are registered as orchestrator animation controllers. The runtime exposes `runtime.playAnimation(id, options)` to trigger one-shot playback (with optional weight, speed, and blending overrides) and `runtime.stopAnimation(id)` for early termination.
- Merged orchestrator writes are converted to Vizij store `RawValue` using a shared converter and piped into `setValue`, eliminating the need for app-specific bridge components.

### Renderer Integration
- A new `<VizijFace />` component consumes runtime context to render the `<Vizij>` canvas once assets are ready. It handles loading and error displays and forwards props like `className`, `style`, and `showSafeArea`.
- Hooks expose raw access to the underlying store when advanced manipulation is required (`useVizijStore`, `useVizijStoreSetter`, `useVizijStoreGetter` are re-exported).

```tsx
export function FacePanel() {
  const { loading, error } = useVizijRuntime();

  if (loading) return <Status message="Loading face…" />;
  if (error) return <Status tone="error" message={error.message} />;

  return <VizijFace className="viewer" showSafeArea />;
}
```

### Runtime State and Lifecycle
- Context exposes `ready`, `loading`, `error`, `namespace`, `rootId`, `outputs`, `controllers`, and `timing` metadata so host UIs can reflect orchestrator and renderer status.
- Lifecycle events are represented as boolean flags and timestamped state in context rather than callbacks; hosts subscribe via hooks (e.g., `useVizijRuntime()`) to react to state transitions.

```tsx
function RuntimeDebug() {
  const { ready, controllers, outputs } = useVizijRuntime();

  return (
    <aside>
      <p>Ready: {ready ? "yes" : "no"}</p>
      <p>Graphs: {controllers.graphs.length}</p>
      <p>Outputs tracked: {outputs.length}</p>
    </aside>
  );
}
```

## Package Surface

### Components
- **`<VizijRuntimeProvider>`**
  - Props:  
    - `assetBundle: VizijAssetBundle` – required.  
    - `namespace?: string` – defaults to bundle namespace or `"default"`.  
    - `autoCreate?: boolean` and `createOptions?: CreateOrchOptions` – forwarded to `OrchestratorProvider`.  
    - `autostart?: boolean | { mode: "raf" | "interval"; rate?: number }` – orchestrator stepping control.  
    - `mergeStrategy?: MergeStrategyOptions` – overrides default graph merge behaviour.  
    - `onRegisterControllers?: (ctx) => void` – optional hook to inspect/augment graph registration.  
    - `onStatusChange?: (status) => void` – optional callback when runtime state transitions occur (elaboration of “lifecycle hooks” question).  
  - Maintains runtime state, orchestrator reference, animate scheduler, and error aggregation.
- **`<VizijFace>`**
  - Props: `className`, `style`, `showSafeArea`, `fallback` (rendered while loading/error).  
  - Reads runtime context to render `<Vizij>` only when `rootId` is ready.

```tsx
export function App() {
  return (
    <VizijRuntimeProvider assetBundle={fullscreenBundle} autostart>
      <FaceView />
      <RuntimeDebug />
    </VizijRuntimeProvider>
  );
}

function FaceView() {
  const { loading, error } = useVizijRuntime();

  if (loading) return <Status message="Loading face…" />;
  if (error) return <Status tone="error" message={error.message} />;

  return <VizijFace className="viewer" showSafeArea />;
}
```

### Hooks
- **`useVizijRuntime()`** – primary context accessor returning `{ ready, loading, error, namespace, rootId, outputs, controllers, setInput, setValue, stagePoseNeutral, animateValue, registerInputDriver, playAnimation, stopAnimation }`.
- **`useVizijOutputs(paths: string[])`** – subscribes to a set of orchestrator outputs (normalised paths) and returns their latest values plus helper metadata.
- **`useRigInput(path: string)`** – convenience alias for reading/writing a single rig channel (uses `setInput` under the hood).
- Existing store hooks (`useVizijStore`, `useVizijStoreSetter`, etc.) are re-exported for granular control.

```tsx
function GazeMeter() {
  const [value = 0] = useRigInput("rig/face/standard/left_eye/pos/x");
  return <meter min={-1} max={1} value={value} />;
}

function PoseInspector() {
  const poseValues = useVizijOutputs([
    "rig/face/poses/happy.weight",
    "rig/face/poses/surprised.weight",
  ]);
  return <pre>{JSON.stringify(poseValues, null, 2)}</pre>;
}

function TriggerButtons() {
  const { playAnimation } = useVizijRuntime();
  return (
    <div className="pose-triggers">
      <button onClick={() => playAnimation("idle")}>Play idle</button>
      <button onClick={() => playAnimation("smile", { weight: 1 })}>Smile</button>
    </div>
  );
}
```

### Utilities
- **`animateValue(path, target, options)`**
  - Options: `{ duration?: number; easing?: EasingFunction | "linear" | "easeInOut"; namespace?: string; coordinate?: "input" | "renderer" }`.
  - Single-shot transitions: calculates deltas based on current renderer/blackboard value, interpolates over the specified duration, stages intermediate values via orchestrator inputs each frame, and resolves when complete.
  - Cancels/replaces any in-flight animation on the same path; exposes `runtime.cancelAnimation(path)` for manual control.
- **`playAnimation(id, options)` / `stopAnimation(id)`**
  - `playAnimation` starts or retriggers a registered animation controller. Options include `{ weight?: number; speed?: number; reset?: boolean }`. Clips are assumed to play once unless the host restarts them. `stopAnimation` halts playback and releases the controller weight.
- **`registerInputDriver(id, driver)`**
  - `driver` receives `{ setInput, setValue, namespace, faceId }` and returns `{ start, stop, dispose }`.  
  - The package stores drivers and ensures they are cleaned up on unmount. Hosts wire events (keyboard, pointer, ROS, websocket) to the driver’s `start`/`stop`; the runtime offers the binding surface without imposing an opinionated implementation.

```tsx
function PoseHotkeys() {
  const { animateValue, registerInputDriver, playAnimation } = useVizijRuntime();

  useEffect(() => {
    animateValue("rig/face/eyes/blink", { float: 1 }, { duration: 0.4 })
      .then(() =>
        animateValue("rig/face/eyes/blink", { float: 0 }, { duration: 0.3 }),
      );
  }, [animateValue]);

  useEffect(() => {
    const driver = registerInputDriver("keyboard-poses", ({ setInput, faceId }) => {
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.code === "Digit1") {
          setInput(`rig/${faceId}/poses/grin.weight`, { float: 1 });
          playAnimation("smile", { weight: 1 });
        }
      };
      const onKeyUp = (event: KeyboardEvent) => {
        if (event.code === "Digit1") {
          setInput(`rig/${faceId}/poses/grin.weight`, { float: 0 });
        }
      };
      return {
        start() {
          window.addEventListener("keydown", onKeyDown);
          window.addEventListener("keyup", onKeyUp);
        },
        stop() {
          window.removeEventListener("keydown", onKeyDown);
          window.removeEventListener("keyup", onKeyUp);
        },
        dispose() {
          window.removeEventListener("keydown", onKeyDown);
          window.removeEventListener("keyup", onKeyUp);
        },
      };
    });
    driver.start();
    return () => driver.dispose();
  }, [playAnimation, registerInputDriver]);

  return null;
}
```

### Types
- `VizijAssetBundle` – union covering URL strings, blobs, or pre-parsed GLTF scenes, plus rig graphs and optional pose config.
- `RuntimeStatus` – shape of context state for runtime lifecycle.
- `AnimateValueOptions`, `InputDriver`, `MergeStrategyOptions` – exported for TypeScript consumers.

## Runtime Flow
1. Provider initialises the Vizij store and orchestrator context.
2. When `assetBundle` changes, it begins loading:  
   - GLB is parsed, `world` and `animatables` populated, root group identified.  
   - Context updates `loading=true`, `error=null`.
3. Once the orchestrator is ready (either auto-created or after host calls `createOrchestrator`), the provider registers graphs using the configured merge strategy.
4. The provider starts the orchestrator stepper if `autostart` is enabled. Manual stepping uses `runtime.step(dt)` which proxies to `useOrchestrator().step`.
5. Each frame, merged writes are converted and written into the Vizij store. Registered drivers and animate transitions use the same clock, ensuring consistent updates.
6. Errors at any stage are logged and reflected in `RuntimeStatus`; the provider continues running when possible so hosts can display recovery UI.

```tsx
function ManualLoopDemo() {
  const { step, ready, stagePoseNeutral } = useVizijRuntime();

  useEffect(() => {
    if (!ready) return;
    stagePoseNeutral();
    let raf: number | null = null;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      step(dt);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [ready, stagePoseNeutral, step]);

  return <VizijFace className="manual-loop" />;
}
```

## Error Handling
- All recoverable errors (GLB load failures, graph registration issues, animation cancellations) are caught and logged with `console.warn("[vizij-runtime]", …)`.
- The context exposes `status.errors` (array of recent issues) and `status.error` (latest critical message) so host UIs can render inline notifications.
- Fatal errors (e.g., missing orchestrator WASM) rethrow after logging, as downstream components cannot function without the runtime.

```tsx
function ErrorBanner() {
  const { errors } = useVizijRuntime();
  if (!errors.length) return null;
  return (
    <div className="runtime-errors">
      {errors.map((entry, index) => (
        <p key={index}>{entry.message}</p>
      ))}
    </div>
  );
}
```

## Animate Value Strategy
- `animateValue` targets orchestrator inputs by default, ensuring graphs and animations share the same value source. Optionally, consumers can specify `coordinate: "renderer"` to animate direct renderer values (useful for static visuals not driven by the rig).
- The scheduler stores `startTime`, `duration`, `fromValue`, `toValue`, and easing metadata per path. On each step, it advances progress, computes the eased value, and calls `setInput`.
- For multi-axis values (vec2/vec3/quat), interpolation is component-wise linear by default; future versions can plug in specialised easing (e.g., quaternions).
- Transitions resolve promises so callers can `await animateValue()` for sequencing or chain the returned cleanup handle for manual cancellation.

## Input Driver Bindings
- `registerInputDriver` enables pattern sharing without shipping strongly opinionated bindings. Example drivers (documented, not bundled):  
  - Mouse gaze: takes DOM element + clamp parameters, emits setInput calls.  
  - Keyboard pose triggers: maps key codes to weight staging.  
  - WebSocket adapter: listens to external events and stages values.
- Docs will include patterns mirroring fullscreen-face, but implementation lives in userland, satisfying the requirement of exposing callbacks without owning event wiring.

## Remaining Questions / Follow-ups
1. **SSR / Non-DOM** – Current implementation assumes a browser environment (Three.js canvas, WASM init). Document this limitation and revisit if SSR support becomes necessary.
2. **Multiple Namespaces** – v1 operates on a single namespace/root per provider; future expansions may allow multiple renderer namespaces or face overlays.

## Next Steps
1. Build a prototype provider wrapping the fullscreen-face assets to validate root ID detection, orchestrator registration, and animateValue scheduling.
2. Replace the bespoke `RenderBridge` and `useRigBootstrap` in the tutorial app with the runtime package to ensure API coverage.
3. Draft documentation mirroring the wishful-thinking flow with concrete code samples for asset bundles, provider setup, animateValue usage, and input driver registration.
4. Plan migration guidance for demos (`demo-vizij-player`, `fullscreen-face`) to adopt the new package, collecting feedback on missing hooks or overrides.
5. Add targeted unit/integration tests within the repo to cover asset loading, orchestrator registration, animateValue behaviour, and error handling paths.

With these pieces in place, `@vizij/runtime-react` can offer a cohesive, opinionated integration path that supports existing Vizij capabilities while reducing the amount of boilerplate and duplication seen across current tutorials and demos.
