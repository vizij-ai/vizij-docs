<!-- tags: family=guidebook; type=reference; editorial_status=completed; publication_status=planned; topics=guidebook,migration,npm,package-rename,runtime -->

> **Last updated:** 2026-10-23
> **Purpose:** give a consumer the exact npm package renames — and the one runtime API rename — so an upgrade is a mechanical find-and-replace

# Package Rename Migration

## Guidebook Context

1. **Bucket:** [Guidebook Reference](README.md)
2. **Depth role:** cross-cutting reusable reference layer
3. **Module type:** reference bridge
4. **Bucket overview:** [Guidebook Reference](README.md)
5. **Useful previous module:** [Runtime Quickstart](runtime-quickstart-reference.md)
6. **Useful next module:** [Runtime Quickstart](runtime-quickstart-reference.md)

## Reader Outcome

After this page you can move a project off the old `@vizij/*-wasm` package names — and off the `@vizij/runtime` "device" API — in one pass, knowing which names changed, which stayed, and what stayed behaviorally identical.

## Use This Reference When

Open this page when an install resolves a **deprecated** `@vizij/*` package, or when you are moving a project onto the current package line and want the full rename map in one place.

## The Renames

The npm packages are now named for what they are to a JavaScript consumer — a bare `@vizij/<domain>` — dropping the `-wasm` suffix, which only ever described the Rust crate the package was built from. The engines and their behavior are unchanged; only the package names (and, for the runtime, the exported symbol names) differ.

| Old name | New name | Latest | Change |
| --- | --- | --- | --- |
| `@vizij/animation-wasm` | `@vizij/animation` | 0.4.1 | Package rename only |
| `@vizij/node-graph-wasm` | `@vizij/node-graph` | 0.7.1 | Package rename only |
| `@vizij/arora-web-wasm` | `@vizij/runtime` | 2.0.0 | Package rename **plus** the API rename below |

Every old name is **deprecated** on npm, and its deprecation notice points at the new one. Nothing is removed — a pinned install keeps working — but new installs should move to the new names.

Packages that **did not** change keep their names: `@vizij/runtime-react`, `@vizij/node-graph-react`, `@vizij/node-graph-authoring`, `@vizij/value-json`, and `@vizij/wasm-loader`. A meaningful suffix names a real variant; `-wasm` did not.

## Retired Packages

These packages have no successor package: their source is removed and they get no further release. A pinned install keeps working, but a project moves to what replaces each:

| Package | What replaces it |
| --- | --- |
| `@vizij/animation`, `@vizij/animation-module` | A face's animations play in its own device, through Arora's animation module (`@arora/animation`, from `arora-animation-module`), whose functions a page calls by name on `@vizij/runtime`'s `Runtime`: `runtime.invoke("play", …)`, `"seek"`, `"set_weight"` ([vizij-rs#261](https://github.com/vizij-ai/vizij-rs/pull/261)). |
| `@vizij/animation-react` | The same calls from React, on the `Runtime` that `@vizij/runtime-react`'s provider hands out ([vizij-web#206](https://github.com/vizij-ai/vizij-web/pull/206)). |
| `@vizij/speech-react` | The face's own skills: `runtime.invoke("say", { text })` speaks a line with its visemes, `runtime.invoke("play_viseme", { shape, weight })` plays one viseme ([vizij-web#206](https://github.com/vizij-ai/vizij-web/pull/206)). |

## Upgrading Animation and Node Graph

Pure package renames — same exports, same behavior. Update the dependency and the import specifier:

```diff
- import { init /* … */ } from "@vizij/animation-wasm";
+ import { init /* … */ } from "@vizij/animation";

- import { /* … */ } from "@vizij/node-graph-wasm";
+ import { /* … */ } from "@vizij/node-graph";
```

`@vizij/animation@^0.4.1`, `@vizij/node-graph@^0.7.1`. No code changes beyond the specifier. `@vizij/animation` is retired (see [Retired Packages](#retired-packages)): a project on it moves to the face's animation module.

## Upgrading the Runtime

`@vizij/arora-web-wasm` is now `@vizij/runtime`, and at 2.0.0 its client-facing API drops the "device"/"Arora" vocabulary for "runtime". The behavior is identical; the names changed:

| Old symbol | New symbol |
| --- | --- |
| `startDevice()` | `startRuntime()` |
| `AroraDevice` (class) | `Runtime` |
| `DeviceModule` | `RuntimeModule` |
| `DeviceCall` | `RuntimeCall` |
| `DeviceCallResult` | `RuntimeCallResult` |

```diff
- import { init, startDevice, AroraDevice } from "@vizij/arora-web-wasm";
+ import { init, startRuntime, Runtime } from "@vizij/runtime";

- const device = await startDevice(graph);
+ const runtime = await startRuntime(graph);
```

The store surface (`setValue`/`writeValues`, `readValues`/`snapshot`/`drainChanges`), `step`/`run`, and `loadGraph` are unchanged. If you reach the runtime through `@vizij/runtime-react`, its hooks are unchanged — bump the package's `@vizij/runtime` dependency and you are done.

## Why

npm names are read from the JavaScript side, where `-wasm` and `-core` are Rust-crate distinctions with no meaning. The Rust crates keep their names (`vizij-graph-wasm`, for one); only the npm face changed. "Device"/"Arora" is arora-internal vocabulary — the browser runtime is, to its consumer, a runtime, so that is what the package and its API are now called.
