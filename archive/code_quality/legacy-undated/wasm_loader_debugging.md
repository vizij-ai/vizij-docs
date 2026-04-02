# Vizij wasm-loader Debugging Plan

## Context
We removed the local Vizij wrapper inside `peerbots-controller-web` and now rely on the upstream packages:
- `@vizij/runtime-react`
- `@vizij/orchestrator-react`
- `@vizij/orchestrator-wasm`
- `@vizij/wasm-loader`

The goal is to make these packages work out-of-the-box in a Next.js 14 environment without project-specific shims or webpack tweaks beyond the standard `.wasm` loader rule.

### Current code in the app
- All custom aliases pointing to `lib/vizij/orchestrator-wasm.ts` were removed.
- `next.config.js` only contains the `.wasm` rule (`asyncWebAssembly` + `asset/resource`).
- `pubnub.ts` now exposes `getPubnubApp()` so that PubNub is only instantiated in the browser. Some modules still import `pubnubApp` eagerly; that remains a separate SSR issue.

## wasm-loader status
1. **Original behaviour**: loader imported `node:fs/promises` and `node:url` directly. Webpack threw “Unhandled scheme node:fs/promises”.
2. **Attempted fixes**:
   - `import(/* webpackIgnore */ "node:fs/promises")` → still parsed, same error.
   - Switch to `import(/* webpackIgnore */ "fs/promises")` → no `node:` scheme, but webpack still tried to bundle it into the client and emitted the “critical dependency is an expression” warning. Some builds choked on the dual magic comment `/* webpackIgnore: true, @vite-ignore */`.
3. **Current implementation** (in `vizij-rs/npm/@vizij/wasm-loader/src/index.ts`):
   - `maybeReadFileBytes` returns immediately in the browser (`typeof window !== "undefined"`).
   - On the server, it checks `globalThis?.process?.versions?.node` and uses `const importDynamic = new Function("specifier", "return import(specifier);")` to dynamically import `fs/promises` and `url`.
   - Added shim files (`src/shims-wasm.d.ts`) so TypeScript recognises `../../pkg/...` modules.
   - This avoids hard build failures but webpack still logs “critical dependency” because of the dynamic function. We have not yet validated a production build.

## Known issues
- **SSR crash in peerbots**: `/face` fails because PubNub still executes server-side. This blocks end-to-end validation of the Vizij runtime despite the loader changes. (See TODO below).
- **Webpack warning**: even with the dynamic loader, dev mode prints “critical dependency: the request of a dependency is an expression” for `@vizij/orchestrator-wasm`. Need to confirm whether `next build` tolerates it or whether we must provide separate browser/node entry points to avoid the warning.
- **No published release**: The patched loader only exists locally. Once finalised, we must publish new versions of `@vizij/wasm-loader` and bump all dependent packages (orchestrator/node-graph/animation wasm + their React wrappers) before removing the patched node_modules from peerbots.

## What has been tested
- Next.js dev server (`npm run dev`) starts without the node scheme error after the latest loader patch.
- The face page still fails to render (PubNub SSR crash) so we cannot confirm runtime readiness or orchestrator behaviour yet.
- Production build (`npm run build`) has **not** been executed with the new loader.

## Suggested next steps
1. **Fix the PubNub SSR crash**
   - Ensure every import of `pubnubApp` goes through `getPubnubApp()` inside client components only.
   - If necessary, expose a noop/stub implementation for server modules (e.g., `if (typeof window === "undefined") return { publish: () => Promise.resolve(), ... }`).
   - Only once `/face` renders client-side can we validate the Vizij runtime behaviour.

2. **Run a production build** (`npm run build`) with the new loader in place. Observe: 
   - Does webpack succeed? (No invalid token errors?)
   - Are the “critical dependency” warnings still present? If yes, consider:
     - Emitting a separate browser entry that never references Node modules.
     - Using conditional exports (`"exports": { "./node": ..., "./browser": ... }`) so bundlers pick the right version without runtime detection.

3. **Prepare upstream releases**
   - Once satisfied, rebuild the wasm packages (`pnpm --filter @vizij/*-wasm build`) so dist files include the new loader logic.
   - Publish patched versions of `@vizij/wasm-loader`, `@vizij/orchestrator-wasm`, `@vizij/node-graph-wasm`, `@vizij/animation-wasm`, and the React wrappers.
   - Update `peerbots-controller-web/package.json` to depend on the published versions instead of patched node_modules.

4. **Documentation**
   - Document the loader behaviour (dynamic import guarded to server only) and guidelines for Next.js (async WASM + `asset/resource` rule).
   - Note the PubNub client-guard change for future integrators.

5. **Optional clean-up**
   - Verify there are no remaining console logs or debugging leftovers in `FaceView`, `FaceManager`, etc., once the runtime is stable.

## Outstanding questions for the next engineer
- Can webpack’s “critical dependency” warning be eliminated without adding browser/node entry splits? Does it matter in production?
- Is `new Function("specifier", "return import(specifier)")` acceptable, or should we use a different pattern (e.g., require-ish helper or `import.meta.resolve`)?
- After PubNub fix: do orchestrator warnings persist? If yes, inspect `@vizij/orchestrator-react` to see if the provider loops.

This should provide the full history and give the next engineer a roadmap for finishing the wasm-loader integration.
