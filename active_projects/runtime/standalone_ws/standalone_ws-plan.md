# Arora Protocol Extraction and Normalization Plan
<!-- tags: family=project; type=plan; project_status=tracking; topics=runtime,websocket,protocol,tauri -->
> **Last updated:** 2026-03-31

> **Related documents:** [Runtime Summary](../summary.md) · [Roadmap](../../../current_documentation/ROADMAP.md)

## Objective & Scope

Track the supporting extraction and hardening work for the Arora protocol layers and their current deployment/control consumers.

## Authority Note

This plan covers the supporting standalone/protocol extraction track behind the deployment branch.

- `vizij-standalone` and browser deployment remain the first-class deployment references in the current roadmap.
- The former `vizij-ws-app` surface should now be treated as historical; it is no longer part of the current app inventory.
- This document exists because the extracted protocol layers are already part of the runtime story summarized elsewhere in `vizij-docs`.

This work is focused on:

1. Maintaining the reusable connection/server layers extracted from earlier app-specific code.
2. Aligning Rust and TypeScript protocol contracts.
3. Hardening request/response, lifecycle, and operator-control behavior for reliable control over WebSocket.

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
5. Current standalone app uses the extracted protocol layers and updated message naming.
6. Hardening fixes landed:
   - `get_slot_values` correlation support (request id mapping rather than single pending sender).
   - start/stop running-state cleanup to avoid stale restart gating.
   - idempotent method registration by path to avoid duplicate `reset` entries after restart.
7. Docs and contract checks updated:
   - Contract test added in `@vizij/arora-types` to pin protocol helper behavior.

### Evidence paths

1. `vizij-web/packages/arora-connection/`
2. `vizij-web/packages/arora-websocket/`
3. `vizij-web/packages/@vizij/arora-types/src/messages.ts`
4. `vizij-web/packages/@vizij/arora-types/src/messages.contract.test.ts`
5. `vizij-web/apps/vizij-standalone/README.md`

## Remaining Landing Steps

1. Keep extracted crates/packages stable on `main` and validate downstream consumers after substantive protocol changes.
2. Decide follow-up for LAN-exposed control endpoint security posture (auth/network policy) before broader rollout.
3. Normalize current docs so protocol/control guidance points at `vizij-standalone` and the extracted packages rather than the removed `vizij-ws-app`.
4. Re-home any still-relevant runtime/control regressions onto the current standalone/control surfaces and discard ws-app-specific leftovers that no longer correspond to real files.

## Validation Notes

From the worktree runs:

1. `pnpm --filter "@vizij/arora-types" run test` passed.
2. `pnpm --filter "@vizij/arora-types" run typecheck` passed.
