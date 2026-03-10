# Standalone WS App and Arora Protocol Extraction Plan
<!-- tags: type=plan; status=in_progress; topics=runtime,websocket,protocol,tauri -->

> **Related documents:** [Runtime Summary](../summary.md) · [Roadmap](../../../current_documentation/ROADMAP.md)

## Objective & Scope

Track the supporting extraction and hardening work for the standalone WebSocket control app (`vizij-web/apps/vizij-ws-app`) and its reusable protocol crates/packages.

## Authority Note

This plan covers the supporting standalone/protocol extraction track behind the deployment branch.

- `vizij-standalone` and browser deployment remain the first-class deployment references in the current roadmap.
- `vizij-ws-app` is still a transitional implementation surface and should not be presented as the primary public deployment path.
- This document exists because the extracted protocol layers are already part of the runtime story summarized elsewhere in `vizij-docs`.

This work is focused on:

1. Extracting reusable connection/server layers from app-specific code.
2. Aligning Rust and TypeScript protocol contracts.
3. Hardening request/response and lifecycle behavior for reliable control over WebSocket.

## Verified Extraction Snapshot (2026-02-13 evidence)

The following extraction and hardening work is reflected in the referenced implementation surfaces:

1. Reusable Rust protocol abstraction extracted:
   - Added `packages/arora-connection` with shared slot/method metadata and connection traits.
2. Reusable Rust WebSocket server extracted:
   - Added `packages/arora-websocket` for protocol parsing, registry, and server lifecycle.
3. TypeScript protocol package introduced:
   - Added `packages/@vizij/arora-types` with message/value types and constructors.
4. Protocol naming aligned to canonical slot contract:
   - Canonical names now use `set_slot_values`, `get_slot_values`, `list_slots`.
   - Compatibility aliases retained in TS helpers for older client callsites.
5. Standalone app bridge updated:
   - `vizij-ws-app` Tauri bridge now uses extracted packages and updated message naming.
6. Hardening fixes landed:
   - `get_slot_values` correlation support (request id mapping rather than single pending sender).
   - start/stop running-state cleanup to avoid stale restart gating.
   - idempotent method registration by path to avoid duplicate `reset` entries after restart.
7. Docs and contract checks updated:
   - `vizij-ws-app` README protocol examples aligned to canonical names.
   - Contract test added in `@vizij/arora-types` to pin protocol helper behavior.

### Evidence paths

1. `vizij-web/packages/arora-connection/`
2. `vizij-web/packages/arora-websocket/`
3. `vizij-web/packages/@vizij/arora-types/src/messages.ts`
4. `vizij-web/packages/@vizij/arora-types/src/messages.contract.test.ts`
5. `vizij-web/apps/vizij-ws-app/src-tauri/src/lib.rs`
6. `vizij-web/apps/vizij-ws-app/src-tauri/src/ws_server.rs`
7. `vizij-web/apps/vizij-ws-app/README.md`

## Remaining Landing Steps

1. Merge and stabilize extracted crates/packages on `main`.
2. Run full cross-workspace validation after merge (`prep:push`) to confirm no downstream regressions.
3. Decide follow-up for LAN-exposed control endpoint security posture (auth/network policy) before broader rollout.
4. Carry forward three runtime/control regressions into the next stabilization pass:
   - Normalize slot cache lookups consistently in `apps/vizij-ws-app/src/hooks/useWebSocketSync.ts` (path canonicalization currently differs between `orchestrator`, local cache, and constraints lookups).
   - Reinitialize input caches when `inputConstraints` changes (model reload path) so old defaults/values are cleared before new slot graph seeding.
   - Replace blocking `rx.recv_timeout(...)` in `apps/vizij-ws-app/src-tauri/src/ws_server.rs` with async wait/await to avoid stalling the websocket message loop.

## Validation Notes

From the worktree runs:

1. `pnpm --filter "@vizij/arora-types" run test` passed.
2. `pnpm --filter "@vizij/arora-types" run typecheck` passed.
3. `pnpm --filter "vizij-ws-app" run build` passed.
