# Vizij Renderer — No‑Rig Control Cookbook

**Goal:** load a GLTF face into the Vizij renderer and control *every* animatable element directly—no rigs, no poses. This is the foundation for later wiring animations and graphs.

---

## 0) Mental model: "no‑rig" rendering

* **Asset → World → Store → Canvas**

  1. Load a GLTF/GLB. Vizij traverses it into a **World** of renderables and a table of **animatables** (IDs for translation/rotation/scale, colors/opacity, morph targets).
  2. These are inserted into a **Zustand store** keyed by **namespace** (so multiple instances can coexist).
  3. The `<Vizij>` component renders the **World** via React Three Fiber and **subscribes** to store values.
  4. **You** control the face by calling `setValue({ namespace, animId, value })`—that’s it. No rig is required.

### What you can control without rigs

* **Transforms**: position (vec3), rotation (Euler/quat mapped to axes), scale (vec3 or uniform scalar).
* **Materials**: base color, opacity (and any other exposed channels).
* **Morph targets**: each blendshape is a scalar **animatable** (0..1 or asset‑defined range).

> If the asset is authored with `RobotData`, animatables are named predictably. If not, use “aggressive import” to synthesize them (still fully controllable).

---

## 1) Minimal load & render (no rig)

```tsx
// FaceViewer.tsx
import { Vizij } from "@vizij/render"; // top-level canvas+renderer
import { useModelLoader } from "@vizij/rig"; // works fine without rigs

export function FaceViewer({ url, namespace = "default" }: { url: string; namespace?: string }) {
  const { rootId, ready, error } = useModelLoader({ url, namespace, aggressive: true });
  if (error) return <div>Load error: {String(error)}</div>;
  if (!ready || !rootId) return <div>Loading…</div>;
  return <Vizij rootId={rootId} namespace={namespace} />;
}
```

* `useModelLoader` → loads GLTF, traverses scene, inserts **World + animatables** into the store, returns `rootId`.
* `<Vizij>` → mounts R3F `<Canvas>`, frames camera using root bounds, renders the world.

---

## 2) Discovering animatables at runtime

You’ll want to list “everything controllable.” Read them from the Vizij store (namespace‑aware):

```ts
// pseudo-types for clarity
interface Animatable { id: string; name: string; type: "scalar"|"vec3"|"quat"|"color"|...; min?: number; max?: number; def?: any; }

// select from store (Zustand), e.g. useVizijStore(state => state.animatables)
// Result is a dictionary: { [animId]: Animatable }
```

Common patterns you’ll see by **name**:

* `SomeShape translation` (vec3)
* `SomeShape rotation.z` / `.x` / `.y` (scalar axis channels)
* `SomeShape scale` (vec3 or scalar)
* `SomeShape opacity` (scalar)
* `SomeShape Key 1` (morph target), etc.

> Tip: Keep the **namespace** with each row so you can control multiple faces independently.

---

## 3) Setting values directly (the only API you need)

```ts
// set a morph weight to 0.8
setValue({ namespace: "default", animId: "Mouth Key 1", value: 0.8 });

// move left eye up 0.02 in model units
setValue({ namespace: "default", animId: "L_Eye translation", value: { x: 0, y: 0.02, z: 0 } });

// rotate an eyelid around Z (degrees or radians per asset mapping)
setValue({ namespace: "default", animId: "L_Eyelid rotation.z", value: 10 });
```

* Values must match the animatable **type** (scalar vs vector vs color).
* Respect `min`/`max` from the animatable descriptor where provided.

---

## 4) Build a universal control panel (UI inspector)

Render sliders/inputs for every animatable by **type**, grouped by source mesh/feature name.

```tsx
// AnimatableInspector.tsx
import { useMemo } from "react";
import { useVizijStore } from "@vizij/render/store"; // selector access

export function AnimatableInspector({ namespace = "default" }) {
  const animatables = useVizijStore(s => s.animatables);
  const values = useVizijStore(s => s.values); // current runtime values
  const setValue = useVizijStore(s => s.setValue);

  const rows = useMemo(() => Object.values(animatables), [animatables]);

  return (
    <div className="grid gap-2">
      {rows.map(a => (
        <AnimRow key={a.id} a={a} v={values.get(`${namespace}:${a.id}`)} onChange={(val) => setValue({ namespace, animId: a.id, value: val })} />
      ))}
    </div>
  );
}

function AnimRow({ a, v, onChange }: { a: any; v: any; onChange: (val: any) => void }) {
  switch (a.type) {
    case "scalar":
      return (
        <label>
          {a.name}
          <input type="range" min={a.min ?? 0} max={a.max ?? 1} step={0.01} value={v ?? a.def ?? 0} onChange={e => onChange(parseFloat(e.target.value))} />
        </label>
      );
    case "vec3":
      return (
        <fieldset>
          <legend>{a.name}</legend>
          {(["x","y","z"] as const).map(k => (
            <input key={k} type="number" step={0.001} value={(v?.[k] ?? a.def?.[k] ?? 0)} onChange={e => onChange({ ...(v ?? a.def ?? {x:0,y:0,z:0}), [k]: parseFloat(e.target.value) })} />
          ))}
        </fieldset>
      );
    case "color":
      return (
        <label>
          {a.name}
          <input type="color" value={toCssColor(v ?? a.def)} onChange={e => onChange(fromCssColor(e.target.value))} />
        </label>
      );
    default:
      return <div>{a.name} (unsupported type: {a.type})</div>;
  }
}
```

> Start here for your “show all controllable elements” app: `FaceViewer` + `AnimatableInspector`.

---

## 5) Time‑based animation without rigs (quick patterns)

### 5.1 RAF tweens

```ts
let raf = 0;
function wiggle(namespace: string, id: string) {
  const start = performance.now();
  const tick = (t: number) => {
    const s = (t - start) / 1000;
    const w = 0.5 + 0.5 * Math.sin(2 * Math.PI * 2 * s); // 2 Hz
    setValue({ namespace, animId: id, value: w });
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
}
```


Use for an eyelid rotation without any rig.

---

## 6) Namespaces, multiple faces, and persistence

* **Namespace** is part of the lookup key. Always pass it to `useModelLoader` and to `setValue`.
* You can mount multiple `<Vizij>` instances with different namespaces to drive several faces at once.
* Save/restore a **snapshot** of current values by serializing `values` for a namespace and reapplying with `setValue` on load.

```ts
// snapshot
const snapshot = Array.from(values.entries())
  .filter(([k]) => k.startsWith(`${ns}:`))
  .map(([k, v]) => ({ animId: k.split(":")[1], value: v }));
// restore
snapshot.forEach(({animId, value}) => setValue({ namespace: ns, animId, value }));
```

---

## 7) Asset hygiene for no‑rig control

* Ensure a **root group with bounds** so the camera frames correctly.
* Prefer embedding `RobotData` (names, defaults, limits). If missing, enable **aggressive import**.
* Keep **morph names deterministic** (e.g., `Key 1`, `Key 2`, or explicit viseme labels).
* Use **units and ranges** consistently; expose `min/max` for UI sliders.

---

## 8) Troubleshooting

* **Nothing moves** when setting a value: verify `namespace`, `animId` spelling, and that the animatable type matches the value you pass.
* **Face off‑screen**: missing/incorrect `rootBounds`—fix in asset or supply when importing aggressively.
* **Shared materials desync**: if colors don’t update together, ensure material deduping occurred (shared material names) or drive all intended animIds.
* **Jitter with numeric inputs**: throttle UI writes; batch changes with `requestAnimationFrame`.

---

## 9) Next steps

* Wrap direct `setValue` calls in small helpers (e.g., `setMorph(ns, name, w)`), then swap those helpers’ internals later to call rigs/poses.
* Layer a **graph** or **animation player** on top; the renderer path stays the same—only the *producer* of values changes.

**TL;DR**: Load with `useModelLoader → <Vizij>`, enumerate `animatables`, and drive them via `setValue`. That’s the whole no‑rig story. Everything else (rigs, poses, graphs) can be added later without changing the renderer surface.
