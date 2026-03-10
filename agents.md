# Vizij Docs Agent Guide

Short note giving coding agents the essentials for `vizij-docs`. This repo is the canonical internal cross-repo documentation layer for Vizij. It summarizes the platform as it really exists today and links to deeper repo-local detail where needed.

## Quick-Start Checklist

- **Verify code first.** Before trusting any repo-local plan or summary, confirm current reality from workspace manifests, `package.json`, `Cargo.toml`, and active README files.
- **Read the governance docs first.**
  - `vizij-docs/project_documenting_guide.md`
  - `vizij-docs/current_documentation/ARCHITECTURE.md`
  - `vizij-docs/current_documentation/ROADMAP.md`
  - `vizij-docs/current_documentation/DECISIONS.md`
- **Remember the authority model.**
  - `vizij-docs` owns cross-repo architecture, roadmap framing, lifecycle status, known issues, and release-note policy.
  - repo-local docs own implementation detail and local operating contracts.
  - `vizij-ai.github.io` owns curated public docs and narrative.
- **Prefer summarizing over duplicating.** If a repo-local tracker is the detailed source, update `vizij-docs` to reflect the verified high-level state and link down to the local detail.
- **Keep summaries synchronized.** Any change to project state should update the relevant `summary.md`.
- **Call out skipped validation.** If you do not check links, structure, or spelling, say so.

## Directory Map

- `current_documentation/` — living canonical references for architecture, roadmap, decisions, known issues, concepts, workshops, and release-note policy.
- `active_projects/` — active pillar summaries and active project docs.
- `backlog/backlog_proposals/` — intake proposals and exploratory concepts.
- `backlog/active_projects/` — approved backlog work that is not yet active.
- `archive/` — historical or superseded docs.
- `project_documenting_guide.md` — canonical workflow, tagging, and authority rules.

## Document System

Project docs use a two-axis model:

- **Document family**: `proposal`, `plan`, `reference`, `summary`
- **Lifecycle status**: `proposed`, `planned`, `in_progress`, `blocked`, `done`, `archived`

Living docs under `current_documentation/` are purpose-specific references and typically use `status=living`.

Tag examples:

```markdown
<!-- tags: type=plan; status=in_progress; topics=runtime,websocket -->
```

```markdown
<!-- tags: type=architecture; status=living; topics=architecture,repo-map -->
```

## Editing Rules

1. Do not treat repo-local planning docs as automatically current; verify against code and current manifests.
2. Use `vizij-docs` to state what is canonical, what is implementation-local, and what is transitional.
3. When a detailed tracker already exists elsewhere, add a short authority note and link to it instead of copying the entire tracker into `vizij-docs`.
4. When updating roadmap or summary docs during this refresh phase, do not silently perform the full project-by-project reprioritization pass. Call out that follow-up explicitly instead.
5. If a touched doc still points to missing files or stale archive paths, fix that immediately.

## Common Contribution Types

- **Cross-repo accuracy refresh** — update architecture, roadmap framing, and pillar summaries to match the actual current repos.
- **Authority cleanup** — clarify which surface is canonical and which surface is implementation detail or public-facing output.
- **Operational scaffolding** — maintain `KNOWN_ISSUES.md`, `release_notes/`, and `DECISIONS.md`.
- **Project summary update** — reflect verified state changes in a pillar summary and link to any deeper local tracker.
- **Archive cleanup** — redirect broken links and make historical docs clearly historical without doing a full content migration unless asked.

## Quality Bar

- Keep prose direct and explicit.
- Prefer exact dates.
- Prefer concise summaries with evidence links over narrative speculation.
- When in doubt, use the code surface as truth and describe planning docs as supporting evidence.
