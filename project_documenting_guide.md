# Project Documentation Guide

> This guide defines how we structure project documentation inside the Authoring workspace. Every major architecture pillar should own a trio of documents – a proposal, a plan & tracking log, and a reference summary – so contributors can see where we are, what’s left, and how to use the finished work.

## 1. Document Families

For each architecture element (e.g., Authoring Control Stack, Derived Input Hierarchy, Graph Authoring IR, Import/Export Pipeline, Robot Rig Mapping) create three documents. Maintain a single **project summary** (see Section 2) that indexes all pillars.

| Type | Purpose | Status Tag Defaults | When to Author |
| --- | --- | --- | --- |
| **Proposal** | Capture the problem, goals, high-level architecture, and rough execution plan before work starts. | `status=proposal` | During discovery/alignment. Update until the plan is accepted, then freeze (mark approvals/decision dates). |
| **Plan & Tracking** | Provide the detailed work breakdown, ownership, sequencing, status, and immediate next steps while the effort is active. | `status=tracking` while in flight, `status=completed-with-follow-ups` or `status=reference` after closure | At kickoff (seed from approved proposal). Keep current during execution. Archive once the work becomes routine. |
| **Reference** | Describe the delivered solution for future readers: goals, design, trade-offs, usage instructions, and maintenance notes. | `status=reference` (or `status=completed-archival` when superseded) | As work ships. Start with a skeleton so contributors can add notes during implementation. |
- **Project summary:** maintain one project-wide index (e.g., `summary.md`) that links to every pillar’s proposal/plan/reference, highlights current status, and notes recent updates/risks.

## 2. Naming & Metadata

- **File naming:** `<pillar>-(proposal|plan|reference).md`. Examples:
  - `graph_authoring_ir-proposal.md`
  - `graph_authoring_ir-plan.md`
  - `graph_authoring_ir-reference.md`
- **Tag header:** the first non-blank line after the `# Title` must include a comment with status/topic tags, e.g.
  ```markdown
  <!-- tags: status=proposal; topics=graph-ir,architecture,workflow -->
  ```
- **Cross-links:** immediately after the tag header, add a blockquote that links to the sibling documents and project summary, e.g. `> **Related documents:** [Plan](pillar-plan.md) · [Reference](pillar-reference.md) · [Project summary](summary.md)`.
- **Project summary maintenance:** update the single project `summary.md` whenever new pillar docs are created or statuses change. The summary should list each pillar and link to its proposal/plan/reference documents.

## 3. Proposal Template

Recommended outline (feel free to adapt per pillar):

1. **Title** – `<Pillar Name> Proposal`
2. **Tag header** – `status=proposal` plus relevant topics (e.g., `architecture`, `graph-ir`, `ui-ux`).
3. **Context & Problem Statement**
   - What currently exists?
   - Why must it change (pain points, risks, opportunities)?
4. **Goals & Non-goals**
   - Bullet the outcomes we expect.
   - Note explicit exclusions to limit scope.
5. **Architectural Design**
   - System overview diagrams or textual walkthrough.
   - How the proposal integrates with adjacent systems.
   - Data model updates / APIs / contracts to touch.
6. **Risks & Trade-offs**
   - Performance, complexity, migration considerations.
7. **Approval & Decision Log**
   - Stakeholders, decision dates, blockers.
8. **High-level Execution Plan**
   - Coarse workstreams or stages.
   - Dependencies or sequencing notes.

## 4. Plan & Tracking Template

Seed from the proposal, then expand into a living tracker.

1. **Title** – `<Pillar Name> – Plan & Tracking`
2. **Tag header** – start with `status=tracking`. Append topics (e.g., `tooling`, `automation-testing`).
3. **Objective & Scope Recap** – distilled from the proposal.
4. **Workstreams / Deliverables**
   - Break into subsections with status emojis or badges (✅, ⚠️, ☐, etc.).
   - Each task should include: description, owner (optional), links to PRs/issues, and status notes.
5. **Timeline / Stages**
   - Stage definitions and completion status.
6. **Immediate Next Steps**
   - Short list of the next 2–4 actions with owners/due dates if known.
7. **Risks & Mitigations**
   - Keep current as work progresses.
8. **Decision & Change Log**
   - Reference major pivots, scope changes, approvals.
9. **Validation / QA Checklist**
   - Tests, sign-off steps, release gates.
10. **Appendices (optional)**
    - Links to dashboards, spreadsheets, external trackers.

When the effort winds down, freeze the plan (update status tag to `completed-with-follow-ups` or `reference`) and point readers to the reference doc.

### Status Emoji Legend

Use consistent icons in tables or bullet lists so readers can scan progress quickly. Suggested set:

- ✅ **Complete** – Work is finished and verified.
- 🚧 **In Progress** – Work actively underway; blockers (if any) should be noted.
- 📝 **Planned** – Scoped and scheduled but not yet started.
- ⏳ **Waiting** – Blocked or dependent on an external action (note the dependency).
- ⚠️ **Risk / Attention** – Needs escalation, decision, or carries a significant issue.
- ☐ **Backlog** – Known item without timeline commitment (optional if a backlog section already exists).

Feel free to adapt the legend per project, but keep meanings documented near the first usage.

## 5. Reference Template

Use the reference doc to teach future readers how the system works and why.

1. **Title** – `<Pillar Name> Reference`
2. **Tag header** – `status=reference` plus relevant topics.
3. **Summary**
   - Goals achieved, current status.
4. **System Overview**
   - Architecture diagrams, key components, data flow.
5. **Key Decisions & Trade-offs**
   - What we considered, why we chose the current design.
6. **Usage Guide**
   - How to operate the system (API snippets, CLI commands, UI walkthroughs).
7. **Maintenance & Extension**
   - How to add nodes/features, regenerate assets, update configs.
8. **Testing & Validation**
   - Regression suites, manual QA checklists, monitoring dashboards.
9. **Glossary / Terminology** (optional)
10. **Further Reading**
    - Links to proposal, plan, PRs, ADRs, related docs.

For pillars still in flight, create the reference doc with section headings and mark TBDs. Update as features ship.

## 6. Working With Old Documents

As we migrate to this structure:

- **Harvest content** from existing docs (e.g., `stabilise_core_inputs_plan.md`, `stand_up_graph_ir_plan.md`, `hierarchical_graph.md`) and slot into the new templates.
- **Archive or trim** legacy documents once their content is rehomed. Update their tag to `status=completed-archival` and link to the replacement files.
- **Summary updates:** ensure `summary.md` points to the new proposal/plan/reference triads and calls out archived docs when relevant.

## 7. Maintenance Checklist

1. Create proposal → secure approvals → freeze.
2. Spawn plan & tracking doc from the proposal once execution starts.
3. Keep plan current (statuses, next steps, risk log).
4. As work concludes, draft the reference doc.
5. Update tags and `summary.md` entries to match the new state.
6. Retire or simplify older docs to avoid divergence.

Following this pattern keeps the Authoring project documentation coherent, makes it obvious where to look for strategy vs. execution vs. reference, and helps new contributors ramp quickly.
