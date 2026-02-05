# Vizij Architecture & Repo Guide
<!-- tags: status=living; topics=architecture,repo-map,developer-guide -->

> **Status**: Living Document
> **Audience**: Developers and maintainers
> **Last Updated**: 2026-02-04

## 1. Purpose & Audience

This document is a developer‑first guide to Vizij’s architecture and repo boundaries. It’s written for new engineers, maintainers, and the core team so we can orient quickly when returning to a subsystem.

The intent is to capture **what exists and why it’s organized this way**. It complements the explainer material in `current_documentation/concepts/`, which focuses on conceptual mental models and user‑facing explanations. For step‑by‑step setup, build, and publishing instructions, defer to the README files in each repo—those are the authoritative “how‑to” sources.

Think of this document as the map: it explains the major repos, how they relate, and the design choices that keep the system coherent. Keep it current as the roadmap evolves and as repo responsibilities shift.

## 2. Repo Map (At a Glance)

| Repo | Primary Purpose | Best Entry Points |
| --- | --- | --- |
| `vizij-rs` | Rust runtime cores, WASM bindings, and npm wrappers that define deterministic runtime behavior. | `vizij-rs/README.md`, `vizij-rs/crates/`, `vizij-rs/npm/@vizij/`, `vizij-rs/fixtures/` |
| `vizij-web` | TypeScript/React packages and apps for tooling, authoring, demos, and integrations that consume the WASM artifacts. | `vizij-web/README.md`, `vizij-web/packages/@vizij/`, `vizij-web/apps/`, `vizij-web/apps/vizij-authoring/` |
| `vizij-ai.github.io` | Public website (Astro) for community content; will become the home for docs/tutorials/cookbooks. | `vizij-ai.github.io/README.md`, `vizij-ai.github.io/src/content/`, `vizij-ai.github.io/src/pages/`, `vizij-ai.github.io/public/admin/` |
| `vizij-docs` | Architecture, roadmap, decisions, and long-form documentation for the platform. | `vizij-docs/current_documentation/`, `vizij-docs/active_projects/`, `vizij-docs/backlog/`, `vizij-docs/archive/` |

## 3. System Overview

Vizij is organized as a core repo system with a clean separation of concerns:

- **`vizij-rs` (Rust runtime core)** — The deterministic “engine” that defines runtime semantics (Value/Shape/TypedPath), evaluates graphs, samples animations, and coordinates controllers via the orchestrator. It ships both native crates and WASM bindings.
- **`vizij-web` (TypeScript + React tooling and apps)** — The primary developer and authoring surface. It consumes the `@vizij/*-wasm` packages from `vizij-rs`, exposes reusable JS/TS and React packages, and hosts apps for authoring, demos, and tutorials.
- **`vizij-ai.github.io` (public website)** — The outward‑facing site. It will evolve into the canonical home for docs, tutorials, walkthroughs, and cookbooks, alongside broader communication and community content.

The architectural split is intentional: the Rust core is the single source of truth for runtime behavior, while the web ecosystem focuses on tooling, authoring, and demos that exercise the engine. WASM packages are the bridge between these worlds, allowing web apps to consume the core without compiling Rust locally.

React is a delivery mechanism, not a requirement. The React packages are meant to be published and used by teams who want them, but they are not the only way to build Vizij integrations. The render stack (`@vizij/render`) and authoring utilities (`@vizij/node-graph-authoring`) are core utilities, and the rest of the packages are structured to be useful even if the consumer chooses a different framework.

Not all apps are product surfaces. Many apps in `vizij-web` are demos or tutorials that act as proofs of concept; those may later migrate to the public website (direction still open). The **authoring app** and the **public website repo** are the exceptions: they are ongoing tools that the team relies on beyond demonstration value.

Longer‑term, the Rust side is expected to deepen its native integration (including Bevy/ECS). For now, Bevy adapters exist largely as stubs while the core runtime remains engine‑agnostic. This keeps the system focused on deterministic runtime logic, with optional integrations layered on top.

## 4. vizij-rs Architecture

`vizij-rs` is the source of truth for Vizij’s runtime semantics. It houses the deterministic engines for animation, node graphs, and orchestration, and it produces the WASM bindings that the web stack consumes.

At a high level:

- **Core runtime crates** live under `vizij-rs/crates/` and implement the real‑time engines.
- **WASM bindings** expose those cores to JavaScript and are re‑packaged as npm modules under `vizij-rs/npm/@vizij/*-wasm`.
- **Fixtures** under `vizij-rs/fixtures/` (and the `vizij-test-fixtures` crate) provide shared assets used by both Rust tests and web tooling to keep parity across stacks.

The runtime is organized into domain stacks that mirror the conceptual layers described in the concepts docs:

- **Animation stack** — deterministic sampling and blending of time‑based tracks.
- **Node graph stack** — typed, deterministic data‑flow graphs for rig logic and control.
- **Orchestrator stack** — the blackboard and scheduling layer that merges controller outputs into a single coherent frame.

The web stack consumes these cores as pre‑built WASM packages: `vizij-web` treats the Rust output as a dependency, not as a build step. This keeps front‑end workflows fast and decoupled, while still grounding all runtime behavior in the Rust engine.

For domain‑specific details (crate layout, build workflows, and publish steps), start with `vizij-rs/README.md` and then drill into the crate‑level READMEs inside `vizij-rs/crates/`.

## 5. vizij-web Architecture

`vizij-web` is the TypeScript/React monorepo that turns the Rust runtime into practical tools and experiences. It is split into **packages** (reusable libraries) and **apps** (authoring surfaces, demos, and tutorials).

Key points:

- **Packages** under `vizij-web/packages/@vizij/` wrap WASM runtimes and provide JS/TS utilities. The most foundational are **`@vizij/render`** (renderer + controllers) and **`@vizij/node-graph-authoring`** (graph IR tooling). These are core utilities, not just demo helpers.
- **React packages** (`@vizij/*-react`) provide providers, hooks, and runtime bindings. They are intended for real usage but remain optional—teams can build integrations in other frameworks if desired.
- **Apps** under `vizij-web/apps/` range from proof‑of‑concept demos to production‑quality tooling. The primary product‑like surface is **`vizij-authoring`**, which is used for rigging, binding, and export workflows. The rest of the apps are mostly demos/tutorials used for testing and showcasing capabilities, and may later migrate into the public website (direction still open).

When working in this repo, the README is the canonical source for setup, build, validation, and local WASM linking workflows. Use it as the entry point, then dive into package‑level READMEs for deeper details.

## 6. Website (vizij-ai.github.io) Role

`vizij-ai.github.io` is the public‑facing Vizij website. It is intentionally decoupled from the runtime/tooling repos and focuses on communication, documentation, and learning content.

Key points for developers:

- It is built with Astro, MDX, and a CMS workflow geared toward content publishing.
- This site will become the canonical home for Vizij docs, tutorials, walkthroughs, and cookbooks.
- It has its own build/deploy pipeline and does not ship runtime code; it is a content surface, not a product runtime.

If you are working on product capabilities, you will likely be in `vizij-rs` or `vizij-web`. If you are documenting those capabilities for external readers, this repo is where that material will live.

## 7. Cross-Repo Integration & Data Contracts

Vizij’s cross‑repo integration is deliberately narrow and contract‑driven. The Rust core defines the canonical data model, and the web stack consumes it via published WASM packages and shared helpers.

Key integration points:

- **Core contracts**: `Value`, `Shape`, and `TypedPath` are defined in Rust (`vizij-api-core`) and mirrored in TypeScript via `@vizij/value-json`. These contracts keep graphs, animations, and rendering interoperable across stacks.
- **WASM boundary**: `vizij-rs` publishes `@vizij/*-wasm` npm packages. `vizij-web` consumes those packages as dependencies rather than compiling Rust locally.
- **ABI safety**: WASM packages expose an `abi_version()` and the loaders verify compatibility at runtime to avoid silent mismatches.
- **Shared fixtures**: `vizij-test-fixtures` provides a common set of JSON fixtures used by both Rust tests and web tooling to keep behavior aligned.
- **Glue utilities**: `@vizij/wasm-loader` standardizes WASM initialization and caching across apps; `@vizij/value-json` keeps JSON coercion behavior consistent.

Local linking and watch workflows exist for deep integration work, but the default assumption is to consume published packages so the web stack stays decoupled from the Rust toolchain.

## 8. How the Pieces Work Together (End-to-End Flow)

A typical Vizij workflow starts in the authoring stack: in `vizij-authoring`, a developer or animator builds a rig, defines pose behavior, and configures graph logic. The resulting bundle is exported as a **GLB with embedded Vizij metadata**, including rig graphs, pose graphs/config, and optional animations. At runtime, a web app loads that GLB, registers the embedded graphs and animations with the orchestrator via the WASM bindings, and begins the update loop. Live inputs are staged onto the blackboard, graphs and animations evaluate and emit `WriteBatch` updates, the orchestrator merges those updates deterministically, and the renderer applies the resulting values to animatables in the scene. This same flow is mirrored across stacks: the Rust engine remains the source of truth, and the web layer simply hosts the loop and applies outputs.

## 9. Roadmap Alignment & Where to Look Next

This document is the architectural map; the roadmap and supporting docs capture the shifting priorities and deeper rationale:

- **Roadmap**: `vizij-docs/current_documentation/ROADMAP.md` for current priorities and sequencing.
- **Concepts explainer**: `vizij-docs/current_documentation/concepts/` for user‑facing mental models and terminology.
- **Decisions**: `vizij-docs/current_documentation/DECISIONS.md` for architectural trade‑offs.
- **Repo READMEs**: `vizij-rs/README.md`, `vizij-web/README.md`, and `vizij-ai.github.io/README.md` for setup/build/publish workflows.

When repo boundaries or responsibilities change, update this architecture guide alongside the roadmap so new engineers always land in the right place.
