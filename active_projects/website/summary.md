# Vizij Website & Ecosystem Program Summary
<!-- tags: family=project; type=summary; project_status=planning; topics=website,documentation,externalization,showcase -->

> **Last updated:** 2026-03-31

## Goals

Turn the current public site and surrounding tutorial/workshop/docs surfaces into one coherent outward-facing system for external builders.

## Status Note

This summary is the live home for the current website/docs strategy surface.

## Current Verified State

- `vizij-ai.github.io` already exists as an active public-facing Astro/React site.
- The website already has distinct public routes for `demos`, `docs`, and `tutorials`.
- The docs/tutorial projection pipeline from the guidebook in `vizij-docs/current_documentation/guidebook` into the website already exists and should be treated as current infrastructure rather than open strategy work.
- Vizij tutorial and workshop material is currently split across:
  - `vizij-ai.github.io`
  - `vizij-docs`
  - repo-local app/example surfaces in `vizij-web`
  - top-level `/docs`
  - `vizij-afternoon-workshop`
- The current public content taxonomy still needs tightening:
  - `vizij-web` should think in terms of `tools` and `examples`
  - the website should think in terms of `demos`, `tutorials`, and `docs`
  - `vizij-docs` should remain the canonical authored source for reusable docs/tutorial content via the guidebook
- Public examples and walkthroughs depend on stable guidebook source, shareable sample assets, and validated runtime/example flows.
- The current site still behaves more like a discovery/showcase front door than a complete maintained onboarding path.

## Document Families

| Project | Status | Proposal | Plan | Reference |
| --- | --- | --- | --- | --- |
| Documentation Strategy & Content | `planned` | — | [`documentation_strategy-plan.md`](documentation_strategy/documentation_strategy-plan.md) | — |

## Near-Term Priorities

- Make `vizij-ai.github.io` the canonical public front door and home for evergreen core Vizij guides.
- Publish the maintained public learning system explicitly as:
  - website as the landing and routing layer
  - guidebook-authored docs/tutorial content projected from `vizij-docs`
  - repo implementation surfaces understood as `tools` and `examples`
  - the guidebook bucket chain as the only public route framing, with app names kept as anchors inside those buckets
- Lock the public content taxonomy:
  - `demos` = focused website-owned capability showcases
  - `tutorials` = task-oriented "How to..." routes
  - `docs` = the broader structured learning lattice
- Build the complete target inventory of demos, tutorials, and docs before trying to fill the remaining gaps.
- Review guidebook source quality before assuming every authored module is ready for maintained public projection.
- Keep deeper package/reference/generated docs linked out for now instead of pretending the site already hosts everything.
- Reclassify top-level `/docs` and `vizij-afternoon-workshop` as source material to extract from and move toward archive.
- Keep the HRI tutorial page event-specific rather than allowing it to read as the main evergreen onboarding hub.

## Deferred Follow-Up

The next comprehensive roadmap review should decide what additional public guide pages this program needs and how quickly the older tutorial/workshop packs can be archived after extraction.
