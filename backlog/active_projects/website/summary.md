# Vizij Website & Ecosystem Program Summary
<!-- tags: type=summary; status=planned; topics=website,documentation,externalization,showcase -->

Last updated: 2026-03-10

## Goals

Turn the current public site and surrounding tutorial/workshop/docs surfaces into one coherent outward-facing system for external builders.

## Status Note

This summary still lives under a `backlog/` path because the broader portfolio reshuffle has not happened yet. That folder placement is historical; the current roadmap now treats externalization and sharing as the lead strategic theme.

## Current Verified State

- `vizij-ai.github.io` already exists as an active public-facing Astro/React site.
- Vizij tutorial and workshop material is currently split across:
  - `vizij-ai.github.io`
  - `vizij-docs`
  - repo-local tutorial apps in `vizij-web`
  - top-level `/docs`
  - `vizij-afternoon-workshop`
- Public examples and walkthroughs depend on stable internal docs, shareable sample assets, and validated runtime/example flows.
- The current site still behaves more like a discovery/showcase front door than a complete maintained onboarding path.

## Document Families

| Project | Status | Proposal | Plan | Reference |
| --- | --- | --- | --- | --- |
| Documentation Strategy & Content | `planned` | — | [`documentation_strategy-plan.md`](documentation_strategy/documentation_strategy-plan.md) | — |

## Near-Term Priorities

- Make `vizij-ai.github.io` the canonical public front door and home for evergreen core Vizij guides.
- Publish the maintained public spine explicitly as:
  - `website -> Hello Face -> vizij-authoring -> demo-vizij-player -> tutorial-agent-face -> deployment`
- Keep deeper package/reference/generated docs linked out for now instead of pretending the site already hosts everything.
- Reclassify top-level `/docs` and `vizij-afternoon-workshop` as source material to extract from and move toward archive.
- Keep the HRI tutorial page event-specific rather than allowing it to read as the main evergreen onboarding hub.

## Deferred Follow-Up

The next comprehensive roadmap review should decide whether this program moves out of `backlog/`, what additional public guide pages it needs, and how quickly the older tutorial/workshop packs can be archived after extraction.
