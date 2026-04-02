# Vizij Docs Markdown Audit

Date: 2026-03-31

## Scope

This audit focused on the current documentation surfaces in `vizij-docs`:

- repo root governance docs
- `current_documentation/`
- `active_projects/`
- `backlog/`

I also scanned the wider markdown inventory to catch repo-level structural problems that still affect the current docs, especially in `archive/`.

## Method

I used a mix of manual review and structural checks:

- full markdown inventory scan across `vizij-docs`
- tag/status/header consistency scan
- relative-link resolution check
- content-similarity check to spot likely duplicates
- manual reading of the canonical docs, guidebook, concepts, workshop kit, project summaries, and representative backlog/project files

## Inventory Snapshot

- Total markdown files scanned in `vizij-docs`: `243`
- `current_documentation/`: `108`
- `active_projects/`: `10`
- `backlog/`: `27`
- `archive/`: `95`

Non-archive structural findings:

- Docs missing a top-level tag comment in the reviewed non-archive scope: `34`
- Workshop docs among those missing-tag files: `28`
- Non-archive docs still using legacy lifecycle statuses (`tracking`, `planning`, `draft`, `proposal`): `22`
- Broken relative markdown links in the reviewed non-archive scope: `11`

## Executive Summary

The repo has a clear documentation governance model, but the docs do not yet consistently follow it. The highest-signal problems are:

1. the repo now has more than one lifecycle/tagging system in active use
2. control-path terminology is not stable across concept, guidebook, deployment, and workshop docs
3. workshop handouts duplicate guidebook reference pages and have already started to drift
4. `current_documentation/` mixes canonical references with temporary execution artifacts
5. the concepts layer has overlapping onboarding/reference docs with unclear ownership and one empty placeholder file
6. governance scaffolding and guidebook structure are restated in too many places
7. some current summaries and roadmap language repeat each other so closely that they invite drift

Those issues create most of the current inconsistency, ambiguity, and redundancy.

## Findings

### 1. Repo-wide lifecycle metadata is inconsistent

Category: inconsistency
Severity: high

Evidence:

- [project_documenting_guide.md](../project_documenting_guide.md#L55) defines the current lifecycle statuses as `proposed`, `planned`, `in_progress`, `blocked`, `done`, and `archived`.
- [project_documenting_guide.md](../project_documenting_guide.md#L74) says living docs under `current_documentation/` should use `status=living`.
- [guidebook/README.md](../current_documentation/guidebook/README.md#L1) uses `status=written`, not `status=living`.
- [guidebook/module_inventory-reference.md](../current_documentation/guidebook/module_inventory-reference.md#L8) introduces a second status system: `seeded`, `mapped`, `planned`, `drafted`, `written`.
- [CONCEPTUAL_OVERVIEW.md](concepts/2026-03-31-retired-concepts-entrypoints/CONCEPTUAL_OVERVIEW.md#L3) and [ARCHITECTURE_PRIMER.md](concepts/2026-03-31-retired-concepts-entrypoints/ARCHITECTURE_PRIMER.md#L3) omit `type=` entirely, while [REFERENCE_GUIDE.md](../current_documentation/concepts/REFERENCE_GUIDE.md#L3) uses `type=reference-guide` and [GLOSSARY.md](../current_documentation/concepts/GLOSSARY.md#L3) uses `type=glossary`.
- [active_projects/authoring/animator_feedback/animator_feedback-plan.md](../active_projects/authoring/animator_feedback/animator_feedback-plan.md#L2) still uses `status=tracking`.
- [backlog/active_projects/runtime/behavior_tree/behavior_tree-plan.md](../backlog/active_projects/runtime/behavior_tree/behavior_tree-plan.md#L2) still uses `status=planning`.
- [current_documentation/performance_tracking/perf_baselines.md](../current_documentation/performance_tracking/perf_baselines.md#L2) still uses `status=tracking`.

Why this matters:

- A reader cannot reliably infer whether a doc is canonical, current, in progress, or historical from metadata alone.
- The guidebook has effectively created a second status system inside the canonical docs tree.
- The repo’s stated governance and its actual metadata now disagree.

Recommended plan:

1. Decide whether guidebook teaching-status words such as `written` remain first-class metadata or become guidebook-internal editorial notes.
2. Keep exactly one repo-wide lifecycle vocabulary for markdown tags.
3. Define a consistent `type=` vocabulary for concept/reference docs and apply it uniformly.
4. Convert all `current_documentation/` docs to `status=living` or move them out of that tree.
5. Normalize active/backlog project docs to the documented `type=` plus lifecycle model.
6. Add a lightweight lint rule that rejects legacy statuses in touched docs.

### 2. Control-path and slot terminology is not stable

Category: inconsistency, ambiguity
Severity: high

Evidence:

- [concepts/deeper_exploration/STANDARD_INPUTS.md](../current_documentation/concepts/deeper_exploration/STANDARD_INPUTS.md#L13) says standard inputs live under `/standard/...`, with shape `/standard/<namespace>/<channel>/<track>/<attribute>`.
- The same file then uses examples that omit the namespace segment entirely at [STANDARD_INPUTS.md](../current_documentation/concepts/deeper_exploration/STANDARD_INPUTS.md#L20).
- [CONCEPTUAL_OVERVIEW.md](concepts/2026-03-31-retired-concepts-entrypoints/CONCEPTUAL_OVERVIEW.md#L47) also teaches `/standard/left_eye/pos/x`.
- [Q&A.md](../current_documentation/concepts/Q&A.md#L21) repeats `/standard/left_eye/pos/x`.
- [guidebook/control/paths-and-standard-controls.md](../current_documentation/guidebook/control/paths-and-standard-controls.md#L71) teaches runtime paths as `rig/{face}/standard/...` and deployment slot names as `standard/vizij/...`.
- The same guidebook page shows a different deployment-slot pattern in its Mermaid diagram at [paths-and-standard-controls.md](../current_documentation/guidebook/control/paths-and-standard-controls.md#L215): `standard/{channel}/{track}/{attribute}`.
- [guidebook/reference/animation-integration-and-deployment-reference.md](../current_documentation/guidebook/reference/animation-integration-and-deployment-reference.md#L76) uses `standard/vizij/...` for client writes.
- The workshop handout version switches the WebSocket example to `rig/robot/standard/...` at [workshops/.../handouts/animation-integration-deployment-reference.md](../archive/workshops/2026-03-vizij-afternoon-workshop/handouts/animation-integration-deployment-reference.md#L54).

Why this matters:

- This is the most reader-visible ambiguity in the repo.
- The docs currently use at least three competing path surfaces for similar examples:
  - `/standard/...`
  - `rig/{face}/standard/...`
  - `standard/vizij/...`
- One page can teach a deployment slot as a short alias while a handout implies the client should send a full runtime path.

Recommended plan:

1. Write one canonical path taxonomy doc with exactly these terms:
   - runtime path
   - deployment slot name
   - namespaced observer key
   - internal pose-control path
2. Pick one canonical example string for each category and reuse it everywhere.
3. Make concept docs explicitly say whether they are teaching abstract standard-input conventions or real runtime/deployment strings.
4. Sweep guidebook, concepts, workshop, and backlog docs for path-example normalization.
5. Add one simple test or grep-based doc check for known-bad example variants after normalization.

### 3. Workshop handouts duplicate guidebook reference modules and are already drifting

Category: redundancy, inconsistency
Severity: high

Evidence:

- [guidebook/reference/renderer-and-rigging-reference.md](../current_documentation/guidebook/reference/renderer-and-rigging-reference.md#L29) and [workshops/.../handouts/renderer-rigging-reference.md](../archive/workshops/2026-03-vizij-afternoon-workshop/handouts/renderer-rigging-reference.md#L5) cover the same material almost verbatim.
- [guidebook/reference/runtime-quickstart-reference.md](../current_documentation/guidebook/reference/runtime-quickstart-reference.md#L31) and [workshops/.../handouts/vizij-runtime-quickstart.md](../archive/workshops/2026-03-vizij-afternoon-workshop/handouts/vizij-runtime-quickstart.md#L5) are near duplicates.
- [guidebook/reference/animation-integration-and-deployment-reference.md](../current_documentation/guidebook/reference/animation-integration-and-deployment-reference.md#L70) and [workshops/.../handouts/animation-integration-deployment-reference.md](../archive/workshops/2026-03-vizij-afternoon-workshop/handouts/animation-integration-deployment-reference.md#L52) duplicate the same deployment/control reference but now disagree on the message format.
- The guidebook quality criteria explicitly say reused support/reference modules should stay authoritative rather than drift into copied fragments.

Why this matters:

- The repo now has two sources for the same compact references.
- The handouts are older (`2026-03-09`) than the guidebook references (`2026-03-13`) and already disagree on important details.
- Repeated “compact reference” copies increase maintenance cost fast.

Recommended plan:

1. Choose one canonical source for each reference module.
2. Convert handouts into one of these patterns:
   - generated derivative output from the guidebook source
   - thin wrappers that point to the guidebook reference
   - workshop-only summaries with no duplicated technical examples
3. Remove full duplicated bodies once derivation/wrapper behavior exists.
4. Add a note in the workshop kit explaining which reference material is canonical.

### 4. `current_documentation/` mixes canonical references with temporary execution artifacts

Category: ambiguity, structural inconsistency
Severity: high

Evidence:

- [project_documenting_guide.md](../project_documenting_guide.md#L86) defines `current_documentation/` as canonical living references.
- [workshops/vizij-afternoon-workshop/README.md](../archive/workshops/2026-03-vizij-afternoon-workshop/README.md#L47) explicitly includes `planning/` execution docs as workshop deliverables.
- [workshops/vizij-afternoon-workshop/planning/PROGRESS.md](../archive/workshops/2026-03-vizij-afternoon-workshop/planning/PROGRESS.md#L1) is a progress log with in-progress packaging tasks.
- Most of the workshop planning/checklist/facilitator docs in this tree do not have top-level tag headers at all.

Why this matters:

- The canonical tree now contains both “living reference” material and temporary event production artifacts.
- A reader cannot tell whether a workshop planning doc is meant to be stable reference, active execution tracker, or archival evidence.
- This undermines the directory contract in the project guide.

Recommended plan:

1. Split workshop material into:
   - published/reader-facing kit
   - production/planning assets
   - validation/archive evidence
2. Keep only the maintained reusable workshop surface under `current_documentation/`.
3. Move execution logs and one-off production notes to `archive/` or an explicit active-project/workshop production area.
4. Add tag headers to any workshop docs that remain in the canonical tree.

### 5. The concepts layer has overlapping entry points with unclear ownership

Category: redundancy, ambiguity
Severity: high

Evidence:

- [CONCEPTUAL_OVERVIEW.md](concepts/2026-03-31-retired-concepts-entrypoints/CONCEPTUAL_OVERVIEW.md#L5) provides a broad platform introduction.
- [CONCEPTUAL_WALKTHROUGH.md](concepts/2026-03-31-retired-concepts-entrypoints/CONCEPTUAL_WALKTHROUGH.md#L5) provides another broad mental-model walkthrough.
- [ARCHITECTURE_PRIMER.md](concepts/2026-03-31-retired-concepts-entrypoints/ARCHITECTURE_PRIMER.md#L5) provides yet another runtime/system introduction.
- [Q&A.md](../current_documentation/concepts/Q&A.md#L3) restates many of the same introductory concepts as FAQ form.
- [REFERENCE_GUIDE.md](../current_documentation/concepts/REFERENCE_GUIDE.md#L5) defines the same core nouns again.
- [DocumentationNotes.md](../current_documentation/concepts/DocumentationNotes.md) is an empty file.
- Structural scan result: `13` of the `17` concept docs contain no markdown links, and the folder has no `README.md` entry point.

Why this matters:

- The concepts area currently behaves like a pile of valid notes rather than an intentionally routed knowledge surface.
- Multiple docs answer “what is Vizij?” and “how does the system work?” without clarifying which one a newcomer should open first.
- The guidebook now overlaps with this area heavily, which makes the authority boundary blurry.

Recommended plan:

1. Add `current_documentation/concepts/README.md` that explains the purpose of the concepts layer and how it differs from the guidebook.
2. Assign a single role to each concept doc:
   - overview
   - walkthrough
   - glossary
   - FAQ
   - deep technical reference
3. Merge or archive concept docs that only rephrase another concept doc without a distinct audience or use case.
4. Delete or intentionally populate `DocumentationNotes.md`.
5. Add related-doc blocks and cross-links so the concepts folder is navigable as a system.

### 6. Public-route language is not fully aligned across roadmap and guidebook

Category: ambiguity
Severity: medium

Evidence:

- [ROADMAP.md](../current_documentation/ROADMAP.md#L8) says there is “one mandatory builder spine”: `Hello Face -> Authoring -> Player -> Deployment`.
- The same roadmap then says there is one maintained learning system but “not necessarily one universal linear tutorial path” at [ROADMAP.md](../current_documentation/ROADMAP.md#L45).
- [guidebook/introduction/how-to-use-this-guidebook.md](../current_documentation/guidebook/introduction/how-to-use-this-guidebook.md#L94) teaches the fast route as `Introduction -> Experience -> Control -> Integrate -> Deploy`.
- The customization route is a different label set again at [how-to-use-this-guidebook.md](../current_documentation/guidebook/introduction/how-to-use-this-guidebook.md#L109).

Why this matters:

- The strategic spine, guidebook bucket chain, and app-anchor language are related, but not explicitly mapped.
- A contributor can understand each document in isolation and still be unsure how the labels correspond.
- This makes it harder to build the public docs taxonomy cleanly.

Recommended plan:

1. Add one canonical route-mapping table that aligns:
   - strategic spine labels
   - guidebook buckets
   - primary app anchors
   - website taxonomy labels
2. Reuse that table in roadmap, guidebook introduction, and website planning docs.
3. Decide which phrase is external-reader-facing and which is contributor-facing.

### 7. Cross-links and related-doc blocks are unreliable in multiple places

Category: inconsistency
Severity: medium

Evidence:

- Broken-link scan found `11` broken relative markdown links in the reviewed non-archive scope.
- [animator_feedback-plan.md](../active_projects/authoring/animator_feedback/animator_feedback-plan.md#L4) links to proposal/reference files that do not exist.
- [behavior_tree-plan.md](../backlog/active_projects/runtime/behavior_tree/behavior_tree-plan.md#L4) links to a proposal path using an incorrect relative route.
- [animation_authoring-proposal.md](../backlog/backlog_proposals/animation_authoring-proposal.md#L4) links to an authoring summary using the wrong relative path.
- [easiest-standalone-deployment.md](../current_documentation/guidebook/deploy/easiest-standalone-deployment.md#L97) links to `vizij-web/apps/vizij-standalone/README.md#cli` as if it were relative to the current file.

Why this matters:

- Broken related-doc blocks actively reduce trust because they appear in the most navigational parts of the docs.
- Missing sibling proposal/reference files make some project triads look more complete than they are.

Recommended plan:

1. Run a repo-wide markdown link validation pass and fix every broken relative link.
2. Stop linking to missing sibling docs from “Related documents” blocks unless the absence is explicit and intentional.
3. Add CI or a local script that validates relative markdown links in touched docs.

### 8. Performance tracking docs read as historical lab notebooks but live in the canonical tree

Category: ambiguity, redundancy
Severity: medium

Evidence:

- [perf_baselines.md](../current_documentation/performance_tracking/perf_baselines.md#L4) says legacy native rows remain for historical reference.
- [perf_baselines.md](../current_documentation/performance_tracking/perf_baselines.md#L6) begins with a legacy section and append-only benchmark tables.
- [perf_baselines.md](../current_documentation/performance_tracking/perf_baselines.md#L2) still uses the legacy `status=tracking` tag.
- There is also archived performance-baseline material under `archive/code_quality/legacy-undated/performance_baselines/`.

Why this matters:

- The current canonical tree is carrying raw historical benchmark logs that look more archival than “living reference”.
- There is no clear distinction between current baseline policy, current benchmark summary, and raw run history.

Recommended plan:

1. Decide whether performance tracking belongs in:
   - `current_documentation/` as a summarized current baseline reference
   - `active_projects/` as active tracking
   - `archive/` as raw historical evidence
2. Keep one concise current summary in the canonical tree.
3. Move raw append-only benchmark logs to archive or repo-local performance docs.
4. Link the summary to the raw evidence instead of embedding all rows inline.

### 9. Folder placement still contradicts current strategic importance in a few live surfaces

Category: inconsistency
Severity: medium

Evidence:

- [ROADMAP.md](../current_documentation/ROADMAP.md#L19) makes the external onboarding pipeline the first strategic sequence item.
- [backlog/active_projects/website/summary.md](../backlog/active_projects/website/summary.md#L10) says the website summary still lives under `backlog/` even though the roadmap treats it as the lead strategic theme.
- The roadmap still uses that backlog summary as a current anchor at [ROADMAP.md](../current_documentation/ROADMAP.md#L61).

Why this matters:

- The docs explicitly acknowledge placement drift, but the drift is still visible in the main navigation layer.
- Readers have to mentally override the folder structure instead of trusting it.

Recommended plan:

1. Either promote the website/economy program summary into `active_projects/` or add a stronger alias/redirect note in the roadmap and summary layer.
2. Do the same audit for any other backlog docs currently acting as live anchors.
3. Once the promotion decision is made, clean up surrounding related-doc links so the folder structure matches the narrative.

### 10. Archive structure itself has redundant nesting

Category: redundancy
Severity: low

Evidence:

- The repo contains `vizij-docs/archive/archive/`.
- That nested area contains historical copies of core governance/program docs such as:
  - `archive/archive/project_documenting_guide.md`
  - `archive/archive/summary.md`

Why this matters:

- The nested `archive/archive` path is structurally noisy and easy to misread.
- It increases the chance that old governance text is mistaken for the current one during search-driven reading.

Recommended plan:

1. Flatten `archive/archive/` into a dated snapshot folder or a clearer thematic folder.
2. Add one small README in `archive/` that explains archive conventions and historical snapshot folders.

### 11. Governance scaffolding is repeated across root docs

Category: redundancy
Severity: medium

Evidence:

- [README.md](../README.md#L5) restates the source-of-truth model.
- [AGENTS.md](../AGENTS.md#L15) restates the authority model again in slightly different wording.
- [README.md](../README.md#L11) and [AGENTS.md](../AGENTS.md#L23) both contain directory maps, but the AGENTS version is more detailed.
- [project_documenting_guide.md](../project_documenting_guide.md#L5) is already the most complete authority/system description.

Why this matters:

- These are foundational navigation docs, so drift here is especially expensive.
- A contributor can encounter slightly different versions of the same repo contract before even entering the canonical docs tree.

Recommended plan:

1. Treat `project_documenting_guide.md` as the full canonical governance statement.
2. Reduce `README.md` and `AGENTS.md` to concise summaries plus links into the guide.
3. Keep the directory map in one place and link to it from the others.

### 12. The guidebook model is duplicated between `README.md` and `learning-model.md`

Category: redundancy
Severity: medium

Evidence:

- [guidebook/README.md](../current_documentation/guidebook/README.md#L29) defines the six conceptual buckets and three depth levels.
- [guidebook/README.md](../current_documentation/guidebook/README.md#L91) defines the common routes and the five navigation directions.
- [guidebook/learning-model.md](../current_documentation/guidebook/learning-model.md#L8) defines the same core principle, bucket system, depth system, route model, and navigation contract in fuller form.

Why this matters:

- The README and the learning-model doc currently both behave like primary definitions.
- This creates a second “same idea in two places” problem inside the guidebook itself.

Recommended plan:

1. Keep the full guidebook model in `learning-model.md`.
2. Shorten the guidebook README to a compact summary and a strong link to the learning model.
3. Let the README focus on purpose, publishing flow, and navigation into buckets rather than re-defining the model in full.

### 13. "Bucket" is overloaded across guidebook and roadmap language

Category: ambiguity
Severity: medium

Evidence:

- [guidebook/README.md](../current_documentation/guidebook/README.md#L31) uses `bucket` for the reader-facing teaching taxonomy.
- [guidebook/learning-model.md](../current_documentation/guidebook/learning-model.md#L10) reinforces that same guidebook taxonomy.
- [ROADMAP.md](../current_documentation/ROADMAP.md#L145) refers to a roadmap grouping as "this bucket."
- [active_projects/code_quality/summary.md](../active_projects/code_quality/summary.md#L42) uses "Current Bucket Framing" for a program framing section.

Why this matters:

- The same word now refers to at least two different classification systems:
  - guidebook teaching buckets
  - roadmap/program framing buckets
- That makes cross-doc reading harder, especially when the roadmap and guidebook already need explicit alignment.

Recommended plan:

1. Reserve `bucket` for the guidebook teaching taxonomy.
2. Rename roadmap/program groupings to `track`, `lane`, `phase`, or a similar term.
3. Sweep current docs for ambiguous `bucket` usage after that decision.

### 14. Some concept/reference material repeats specific lists instead of linking to a canonical version

Category: redundancy
Severity: medium

Evidence:

- [Q&A.md](../current_documentation/concepts/Q&A.md#L30) includes a file-format quick reference.
- [REFERENCE_GUIDE.md](../current_documentation/concepts/REFERENCE_GUIDE.md#L436) includes a near-identical file-format quick reference.
- The broader concept layer also repeats many core noun definitions across [CONCEPTUAL_OVERVIEW.md](concepts/2026-03-31-retired-concepts-entrypoints/CONCEPTUAL_OVERVIEW.md#L33), [CONCEPTUAL_WALKTHROUGH.md](concepts/2026-03-31-retired-concepts-entrypoints/CONCEPTUAL_WALKTHROUGH.md#L5), [ARCHITECTURE_PRIMER.md](concepts/2026-03-31-retired-concepts-entrypoints/ARCHITECTURE_PRIMER.md#L5), [REFERENCE_GUIDE.md](../current_documentation/concepts/REFERENCE_GUIDE.md#L5), and [GLOSSARY.md](../current_documentation/concepts/GLOSSARY.md#L5).

Why this matters:

- Repeated lists and definitions create more maintenance surfaces than the concepts layer currently needs.
- Small factual updates, like file-format names or canonical example descriptions, will drift unless one source clearly owns them.

Recommended plan:

1. Pick one canonical home for compact file-format reference material.
2. Link to that source from FAQ-style or overview docs rather than restating the list.
3. Make each concept doc justify its overlap with an explicit audience/use-case note.

### 15. Some summary and priority language is duplicated across roadmap and pillar summaries

Category: redundancy
Severity: medium

Evidence:

- [ROADMAP.md](../current_documentation/ROADMAP.md#L69) describes the creator-phase success gate and blocking creator spine.
- [active_projects/authoring/summary.md](../active_projects/authoring/summary.md#L48) restates the same blocking spine in very similar language.
- [active_projects/code_quality/summary.md](../active_projects/code_quality/summary.md#L34) repeats adjacent priority language around workflow lock-in, operator flows, and public-path trust.

Why this matters:

- Some repetition is intentional in a summary-up model, but these sections are close enough to read like duplicated text rather than distinct summary layers.
- The more verbatim they become, the harder it is to change strategic emphasis without updating multiple current-doc surfaces at once.

Recommended plan:

1. Keep the roadmap version strategic and cross-program.
2. Make pillar summaries more explicitly "current state plus next actions" rather than "roadmap text restated locally."
3. When wording must match exactly, extract the canonical phrasing into one linked section rather than rephrasing by copy.

### 16. A few small editorial and freshness issues remain in current docs

Category: inconsistency
Severity: low

Evidence:

- [PREREAD_PRIMER.md](../current_documentation/concepts/PREREAD_PRIMER.md#L57) contains a stray `+` in the final sentence.
- [ROADMAP.md](../current_documentation/ROADMAP.md#L1) has no explicit `Last updated` line, while peer living docs such as [ARCHITECTURE.md](../current_documentation/ARCHITECTURE.md#L6) and [KNOWN_ISSUES.md](../current_documentation/KNOWN_ISSUES.md#L1) do.

Why this matters:

- These are small issues, but they reduce polish in the most reader-facing governance layer.
- Missing freshness metadata makes it harder to compare living-doc recency at a glance.

Recommended plan:

1. Fix obvious editorial artifacts like the stray `+`.
2. Standardize `Last updated` metadata across living docs, including `ROADMAP.md`.

### 17. `tag_trigger_publishing-reference.md` is structurally isolated

Category: ambiguity
Severity: low

Evidence:

- [tag_trigger_publishing-reference.md](../current_documentation/operations/tag_trigger_publishing-reference.md#L1) is a specialized publishing/operations reference.
- It sits directly under `current_documentation/` instead of under a topical subdirectory such as operations, support, or a code-quality-adjacent area.

Why this matters:

- It reads more like an operational playbook than a top-level program reference.
- Its current placement makes the top level of `current_documentation/` less semantically tidy.

Recommended plan:

1. Decide whether publishing/automation references deserve an `operations/` or similar subdirectory.
2. If not, at least add a clearer rationale for why this doc belongs at the top level.

### 18. Canonical sample-set naming is acknowledged but not yet resolved

Category: ambiguity
Severity: medium

Evidence:

- [ROADMAP.md](../current_documentation/ROADMAP.md#L90) says the intended near-term sample set is **Quori / Toasty**.
- [active_projects/authoring/summary.md](../active_projects/authoring/summary.md#L44) repeats that `Quori / Toasty` is the intended canonical sample set.
- [ARCHITECTURE.md](../current_documentation/ARCHITECTURE.md#L193) says the current visible inventory still includes Quori, Tiago, and other maintained samples, and explicitly calls out the mismatch with the roadmap.
- [guidebook/experience/sample-asset-exploration.md](../current_documentation/guidebook/experience/sample-asset-exploration.md#L49) still uses Quori and Tiago variants as the example rigged sample set.

Why this matters:

- The docs acknowledge the mismatch, but they do not yet explain the intended transition clearly enough for a reader.
- A contributor can tell that something changed, but not whether Tiago is still canonical, still supported-but-secondary, or in the process of being replaced by Toasty.
- That uncertainty leaks into tutorials, sample comparisons, and authoring/deployment expectations.

Recommended plan:

1. Add one canonical note in the current authoring/asset documentation that explains the status of Quori, Toasty, and Tiago.
2. Decide whether Tiago is:
   - still canonical
   - still supported but non-canonical
   - actively being retired from the maintained creator path
3. Reuse that exact wording in roadmap, architecture, guidebook sample-asset pages, and workshop material.

### 19. Parallel backlog `summary.md` filenames create discoverability ambiguity

Category: ambiguity, redundancy
Severity: medium

Evidence:

- The active current-phase summaries live at:
  - [active_projects/authoring/summary.md](../active_projects/authoring/summary.md)
  - [active_projects/runtime/summary.md](../active_projects/runtime/summary.md)
  - [active_projects/code_quality/summary.md](../active_projects/code_quality/summary.md)
- The backlog tree contains a second parallel set of summary filenames:
  - [backlog/active_projects/authoring/summary.md](../backlog/active_projects/authoring/summary.md#L1)
  - [backlog/active_projects/runtime/summary.md](../backlog/active_projects/runtime/summary.md#L1)
  - [backlog/active_projects/code_quality/summary.md](../backlog/active_projects/code_quality/summary.md#L1)
  - [backlog/active_projects/website/summary.md](../backlog/active_projects/website/summary.md#L1)
- Those backlog summaries already need defensive status notes such as:
  - [runtime/summary.md](../backlog/active_projects/runtime/summary.md#L12) saying it should no longer be read as the canonical runtime summary
  - [code_quality/summary.md](../backlog/active_projects/code_quality/summary.md#L12) saying it is not the canonical current code-quality summary
  - [authoring/summary.md](../backlog/active_projects/authoring/summary.md#L10) saying the path is historical and should not be read as abandonment

Why this matters:

- Search results and directory scans surface several equally named `summary.md` files with different authority levels.
- The repo is compensating with warning paragraphs inside the documents instead of letting filenames and placement communicate meaning up front.
- This increases the chance that someone opens or links the wrong summary first.

Recommended plan:

1. Either rename the backlog summaries to something visibly different, such as `backlog_summary.md` or `deferred_summary.md`, or move them into a more distinct structure.
2. If the current structure remains for now, add one small index/README that explains the active-vs-backlog summary split before readers enter those folders.
3. Fold this cleanup into the broader portfolio reshuffle so filenames and folder placement no longer need defensive disclaimers.

### 20. Behavior-tree docs straddle proposal and plan states without a clear lifecycle transition

Category: inconsistency, ambiguity
Severity: medium

Evidence:

- [backlog/backlog_proposals/behavior_tree-proposal.md](../backlog/backlog_proposals/behavior_tree-proposal.md#L2) still uses `status=proposal`.
- That proposal still says `Plan (pending)` at [behavior_tree-proposal.md](../backlog/backlog_proposals/behavior_tree-proposal.md#L4).
- A concrete discovery plan already exists at [backlog/active_projects/runtime/behavior_tree/behavior_tree-plan.md](../backlog/active_projects/runtime/behavior_tree/behavior_tree-plan.md#L1).
- That plan uses the legacy `status=planning` tag at [behavior_tree-plan.md](../backlog/active_projects/runtime/behavior_tree/behavior_tree-plan.md#L2).
- The runtime backlog summary still frames the work as explicitly exploratory at [runtime/summary.md](../backlog/active_projects/runtime/summary.md#L33), which is directionally sensible but does not clarify whether the work has formally advanced from proposal into approved planning.

Why this matters:

- The docs contain both a pending proposal and an active discovery plan, but they do not say clearly when or how the lifecycle transition happened.
- This makes the behavior-tree line a concrete example of the broader lifecycle/tag drift described earlier in the report.
- Readers can tell the work is exploratory, but not whether it is merely proposed or already approved for structured discovery.

Recommended plan:

1. Decide the true current state: exploratory proposal only, or approved discovery-planning work.
2. Update the proposal, plan, and runtime backlog summary so they all express that same state using the documented lifecycle vocabulary.
3. Once the state is decided, fix the related-doc wording so the proposal no longer says `Plan (pending)` if a real plan file is already meant to be active.

## Secondary Audit Reconciliation Notes

I also reconciled an additional external audit against the current repo state. Most of its findings are now reflected above, but three of its claims needed qualification:

- `current_documentation/workshops/` existed when this audit was written, but the workshop package has since moved into `archive/workshops/` as part of the follow-up tree cleanup.
- [POSE_GRAPH_CREATION.md](../current_documentation/concepts/POSE_GRAPH_CREATION.md) does exist, so the reported broken reference to that file was not reproducible.
- The behavior-tree issue is real and is reflected above, but the current repo shape is better described as lifecycle/location ambiguity between a proposal in `backlog/backlog_proposals/` and a plan in `backlog/active_projects/runtime/behavior_tree/`, not as the same proposal existing twice.

## Recommended Cleanup Sequence

If you want the most leverage with the least churn, I would do the work in this order:

1. Normalize metadata and lifecycle vocabulary.
2. Consolidate governance scaffolding and guidebook model definitions into single canonical sources.
3. Publish the canonical control-path taxonomy and sweep examples.
4. Eliminate duplicated workshop handout/reference bodies.
5. Separate canonical workshop docs from production/planning artifacts.
6. Restructure the concepts layer and remove empty/overlapping docs.
7. Fix broken links and add automated validation.
8. Re-home performance tracking, summary-placement drift, sample-set naming drift, and isolated operational docs.
9. Clean up archive structure last.

## Non-Fix Recommendation

I would not try to solve this in one giant rewrite. The repo now has a strong enough governance model that the next pass should be a structured normalization effort with clear conversion rules, not a prose-only cleanup sweep.
