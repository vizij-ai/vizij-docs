# @vizij/dev-tools

A shared developer CLI for the vizij ecosystem. Generated 2025-11-07 05:38:26 UTC.

## Commands (initial)
- `vizij run-affected <task>` — run a task across changed workspaces/crates.
- `vizij release graph` — output topological publish order (JSON).
- `vizij release validate-workspace-ranges` — fail if `workspace:` ranges leak.
- `vizij hooks <install|doctor>` — install hooks and verify setup.

> Designed to be called from CI workflows as shown in your pack.
