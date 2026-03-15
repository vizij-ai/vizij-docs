<!-- tags: type=guidebook-module; status=written; topics=guidebook,quality,communication,review -->

> **Last updated:** 2026-03-12
> **Purpose:** define the quality criteria and success measures for the Vizij guidebook as a communication system

# Guidebook Quality Criteria

## Guidebook Context

1. **Bucket:** [Support](README.md)
2. **Depth role:** cross-cutting reusable support layer
3. **Module type:** support guide
4. **Bucket overview:** [Guidebook Support](README.md)
5. **Useful previous module:** [Guidebook Content Model Reference](../content-model-reference.md)
6. **Useful next module:** [Validation Checkpoints](validation-checkpoints.md)

## Reader Outcome

After this page, you should be able to evaluate the Vizij guidebook at three levels:

1. individual module quality,
2. route quality across connected modules,
3. system quality across downstream projections such as public docs, tutorials, demos, and workshops.

You should also be able to distinguish hard quality gates from deeper communication quality and from longer-horizon system health.

## What You Need

This page assumes you already understand the guidebook model and its teaching structure.

Read these first if needed:

1. [Guidebook README](../README.md)
2. [Guidebook Learning Model](../learning-model.md)
3. [Guidebook Content Model Reference](../content-model-reference.md)
4. [Guidebook Module Inventory](../module_inventory-reference.md)

## Module Notes

- This page is for guidebook authors, reviewers, facilitators, and anyone projecting guidebook modules into tutorials, demos, or workshops.
- It treats the guidebook as a communication system, so the criteria focus on whether readers can orient, succeed, and move forward without losing the teaching thread.
- The artifact here is the quality framework itself: module quality, route quality, and downstream projection quality.

## How To Read The Criteria

Use these three layers in order:

1. **Hard gates**
   - non-negotiable failures that block a page from counting as guidebook-ready
2. **Communication quality**
   - the reader-facing qualities that make the page, route, or system teach well
3. **System health**
   - the reuse, projection, and maintainability properties that keep the whole guidebook trustworthy over time

If a hard gate fails, deeper quality does not rescue the module.

## Hard Gates

Every learner-facing page should pass these gates before anyone spends time debating nuance.

### 1. Accuracy and Authority

The page must reflect the current maintained route honestly and must distinguish teaching abstraction from implementation truth.

Strong evidence:

1. commands, file paths, app names, and runtime states are current,
2. implementation anchors point to the owning surfaces,
3. the page does not imply architectural claims the guidebook does not own.

Automatic failure patterns:

1. stale commands or app names,
2. wrong owning implementation surface,
3. teaching abstractions presented as package or ABI truth.

### 2. Navigation and Context Clarity

A reader should know where the page sits in the guidebook without reading the full page.

Every learner-facing module should expose a consistent top-of-page context block or equivalent that makes clear:

1. which bucket the page belongs to,
2. which depth level it occupies,
3. which module type it is,
4. the bucket overview page,
5. the most relevant adjacent modules in the learning sequence,
6. who the page is for,
7. what the page assumes,
8. the most useful next step.

Automatic failure patterns:

1. the page has no bucket or depth context,
2. the reader cannot tell whether the page is a tutorial, explainer, reference bridge, or support guide,
3. backlinks and next-step links are missing or weak,
4. the page hides the point where the reader should jump to implementation anchors.

### 3. Accessibility and Inclusive Comprehension

The page must remain usable without relying on screenshots, color, or implied visual understanding alone.

Strong evidence:

1. non-decorative images have alt text or equivalent explanation,
2. steps are understandable without image-only instructions,
3. diagrams and tables are explained in prose when they carry meaning,
4. headings and labels make the page scannable.

Automatic failure patterns:

1. a critical procedure depends on image-only cues,
2. a diagram is required to understand a step but is not explained,
3. a success signal is described only visually.

### 4. Tutorial Executability

Tutorials and quickstarts have an extra hard gate: if a reader follows the instructions exactly, the tutorial should succeed.

That means the page must make explicit:

1. all required prerequisites,
2. all commands or setup transitions,
3. which repo or working directory the reader is in,
4. which files or UI surfaces they must touch,
5. what they should expect to see after each important step,
6. how to validate success,
7. what is optional explanation versus mandatory execution.

Automatic failure patterns:

1. hidden environment assumptions,
2. skipped setup,
3. ambiguous step order,
4. missing expected outputs or observable checkpoints,
5. "magic" transitions between steps that require knowledge the page did not provide.

### 5. Guidebook-First Sufficiency

Guidebook tutorial-class pages must teach enough locally that the reader is not pushed back into repo-local docs just to complete the route.

Strong evidence:

1. the page carries the full execution spine itself,
2. repo-local docs are linked as implementation anchors or deeper follow-up,
3. the reader can complete the task and understand why it worked before leaving the guidebook page.

Automatic failure patterns:

1. the page names a maintained example but only summarizes it,
2. the reader must open multiple repo-local docs to find the actual steps,
3. the guidebook outsources the concrete lesson while keeping only the route framing.

## Module-Level Communication Criteria

Use these criteria for any individual guidebook page.

| Criterion | What success looks like | Observable evidence | Common failure mode |
| --- | --- | --- | --- |
| Audience fit | the page is clearly written for a specific reader state | explicit audience note and assumptions | mixed audience or unexplained jargon load |
| Context fit | the page explains why this page exists in the route | bucket, depth, module type, adjacent links, next-step note | page feels detached from the guidebook |
| Scaffolding restraint | support notes stay subordinate to the main teaching job | `Module Notes` are brief, grouped, or omitted when unnecessary | writer-facing framing overwhelms the page |
| Learning objective clarity | the page states what the reader will be able to do or understand | explicit reader outcome and success check | page is informative but not goal-shaped |
| Terminology stability | terms are used consistently with the rest of the guidebook | glossary alignment and stable labels for artifacts | local synonyms create route confusion |
| Evidence quality | the page uses the right proof for the teaching job | screenshots, code, diagrams, demos, or state descriptions that match the concept | page asserts without showing enough evidence |
| Validation quality | the reader can tell whether they succeeded | concrete checkpoints, expected states, troubleshooting links | page ends without a believable success test |
| Implementation handoff quality | the page tells the reader when and where to leave the guidebook | scoped implementation anchors and authority language | guidebook and implementation docs blur together |
| Navigation quality | the page supports forward and backward movement | bucket overview link, adjacent module links, next-step note, backlinks | reader gets stranded or loops blindly |

### Reader-Facing Framing Restraint

`Intended Audience`, `Why This Page Exists`, `Artifact Being Touched`, `What This Page Does And Does Not Teach`, and similar page-scope or teaching-scope meta notes are useful only when they help the reader orient or make a decision.

Default expectation:

1. they are optional,
2. when used, they are usually grouped under `Module Notes`,
3. they should usually read as one short grouped note or a few brief sentences rather than a miniature subsection tree,
4. add H3s only when the separation materially helps the reader orient,
5. they should not push the main instructional or conceptual flow too far down the page.

Typical scope notes that usually belong there:

1. what this page covers or does not cover,
2. what this page teaches or does not teach,
3. why this page exists separately,
4. what this page is not.

## Content-Type Legibility

Every module should make its content type obvious because different types deserve different quality standards.

The minimum guidebook content types to judge distinctly are:

1. tutorial or quickstart,
2. explainer or concept page,
3. comparison or decision guide,
4. reference bridge,
5. operational guide,
6. support page.

### Tutorial or Quickstart

Judge primarily on:

1. exact followability,
2. reliable task completion,
3. explicit prerequisites,
4. low ambiguity,
5. strong validation,
6. self-sufficient teaching depth.

### Explainer or Concept Page

Judge primarily on:

1. mental-model clarity,
2. scope discipline,
3. terminology precision,
4. clear boundaries with adjacent concepts,
5. good routing to operational follow-up.

### Comparison or Decision Guide

Judge primarily on:

1. decision clarity,
2. fair distinction between options,
3. explicit tradeoffs,
4. clean route branching.

### Reference Bridge

Judge primarily on:

1. precision,
2. compactness,
3. strong implementation anchors,
4. low duplication of repo-local truth.

### Operational Guide

Judge primarily on:

1. sequence clarity,
2. validation and recovery quality,
3. believable runtime or deployment states,
4. operator-oriented completeness.

### Support Page

Judge primarily on:

1. diagnosis clarity,
2. recovery speed,
3. reuse across routes and downstream surfaces,
4. preservation of the teaching objective under failure.

## Tutorial Executable Contract

Use this contract whenever a module tells the reader to do something step by step.

A tutorial is guidebook-ready only if all of the following are true:

1. the starting state is explicit,
2. the working directory or app surface is explicit,
3. all required credentials, environment variables, assets, or tools are named,
4. every important step has a visible or observable expected result,
5. the page separates mandatory steps from optional interpretation,
6. the success check proves the intended outcome rather than a weak proxy,
7. the page includes the exact app, file, hook, or panel the reader is being taught through,
8. the page shows a compact code or config excerpt when the implementation shape matters,
9. likely failure points are named with a fast recovery path or support link,
10. the page leaves the reader with one concrete next move they can perform immediately,
11. the fallback path for likely failures is discoverable.

## Tutorial Writing Pattern

The strongest maintained Vizij tutorials already use a reliable pattern. Guidebook walkthroughs should reuse it directly:

1. start with the exact runnable surface
2. show the smallest believable success quickly
3. explain the runtime or app state the reader is seeing
4. point to the exact files and code shape that produce that behavior
5. extract the reusable pattern, not just the local app detail
6. close with validation and the next real step

This keeps learner pages operational without turning them into raw implementation dumps.

Use this review question directly:

> If a capable reader follows this tutorial exactly and knows only what the page says they know, will they succeed without guessing?

If the answer is no, the tutorial fails the contract.

## Route-Level Criteria

Use these criteria for the main guidebook paths, such as:

1. `Introduction -> Experience -> Control -> Integrate -> Deploy`
2. `Introduction -> Experience -> Control -> Customize -> Integrate -> Deploy`

| Criterion | What success looks like | Observable evidence | Common failure mode |
| --- | --- | --- | --- |
| Continuity across pages | each page picks up the same artifact and route logic cleanly | repeated route language, stable artifact naming, consistent next-step links | each page reintroduces the system differently |
| Vocabulary consistency | the same concepts keep the same names across the route | glossary alignment and matching labels | route pages rename concepts casually |
| Low transition confusion | moving from one module to the next feels justified and legible | readers know why this next page exists | route jumps feel arbitrary |
| Depth progression | `Surface`, `Fundamentals`, and `Advanced` genuinely deepen rather than repeat | each deeper page adds mental-model or ownership value | depth labels exist but do not change the teaching job |
| Recovery quality | failed checkpoints route readers into support without losing the learning objective | good support links and conceptual fallback paths | a broken module collapses the whole route |

## Guidebook-System Criteria

Use these criteria for the guidebook as the upstream canonical system.

| Criterion | What success looks like | Observable evidence | Common failure mode |
| --- | --- | --- | --- |
| Projection fidelity | downstream docs, tutorials, demos, and workshops preserve the same teaching model | downstream pages can be traced back to canonical modules | downstream surfaces drift into separate narratives |
| Reuse without drift | shared support, glossary, and reference modules stay authoritative | repeated content points back to shared modules | copied fragments evolve independently |
| Canonical lineage | a downstream page has a clear originating guidebook module or route role | maintainers can identify the source module quickly | downstream material has no canonical owner |
| Link maintainability | cross-links, anchors, and implementation bridges remain stable enough to trust | link audits stay clean and authoring patterns stay consistent | readers hit stale links or generic anchors |
| Accessibility consistency | downstream surfaces preserve the same accessibility expectations | alt text, explanatory text, and scannable structure survive projection | accessibility is lost during repackaging |
| Authority discipline | guidebook, repo-local docs, and public surfaces keep their roles distinct | authority notes and implementation anchors remain explicit | the same concept is owned in too many places |

## Measuring Success

Some criteria are best measured as hard review checks. Others are best measured through reader behavior and maintenance signals.

### Qualitative Review Baselines

The review should be able to answer yes or no to all of these:

1. Is the page type obvious near the top?
2. Is the bucket and depth obvious near the top?
3. Can the reader move backward and forward through the route cleanly?
4. Does the page declare what it assumes about the reader?
5. For tutorials, can a reader succeed without hidden knowledge?
6. Does the page signal when to leave the guidebook for implementation truth?

### Quantitative Signals Worth Tracking Later

Use these only where the team can collect them honestly.

Recommended signals:

1. task completion rate for tutorials and quickstarts,
2. median time to first successful completion on `Surface` routes,
3. tutorial failure rate caused by missing prerequisites or ambiguous steps,
4. transition rate from `Surface` pages into the intended `Fundamentals` follow-up,
5. support escalations caused by "what do I do next?" confusion,
6. broken-link rate and stale-anchor rate across guidebook and downstream projections.

Suggested initial baselines:

1. tutorials should aim for strong first-pass completion by a prepared reader,
2. route pages should make the next step obvious enough that navigation confusion is rare,
3. critical learner-facing pages should not ship with known hidden prerequisites,
4. downstream teaching surfaces should be traceable back to canonical guidebook modules.

## External Baselines

This framework aligns with the main external standards that matter for a guidebook like this:

1. [Diataxis](https://diataxis.fr/)
   - keep tutorial, how-to, explanation, and reference jobs distinct
2. [Google developer documentation style guidance](https://developers.google.com/style)
   - emphasize audience fit, scannability, accessibility, and task clarity
3. [GitHub Docs content model](https://docs.github.com/en/contributing/style-guide-and-content-model)
   - use explicit content types and predictable page shape
4. [Microsoft developer content guidance](https://learn.microsoft.com/en-us/style-guide/developer-content/)
   - write for task completion, clarity, and developer action
5. [WCAG non-text content guidance](https://www.w3.org/WAI/WCAG21/Understanding/non-text-content)
   - do not let essential understanding depend on images alone

These are baselines, not replacements for Vizij's local guidebook model. The guidebook still needs its own route logic, bucket/depth structure, and implementation-bridge discipline.

## Success Check

You are done with this page when:

1. you can distinguish hard gates from communication quality from system health,
2. you can review a module without relying on taste alone,
3. you can judge tutorials differently from explainers, reference bridges, and support pages,
4. you know what evidence later scoring should look for.

## Implementation Anchors

Use these when you need the canonical internal framing behind this page:

1. [Guidebook README](../README.md)
2. [Guidebook Learning Model](../learning-model.md)
3. [Guidebook Content Model Reference](../content-model-reference.md)
4. [Guidebook Module Inventory](../module_inventory-reference.md)
5. [Validation Checkpoints](validation-checkpoints.md)
6. [Troubleshooting Matrix](troubleshooting-matrix.md)

## Next Step

1. If you are authoring or revising a module, return to [Guidebook Content Model Reference](../content-model-reference.md).
2. If you are checking route-level success and failure conditions, continue to [Validation Checkpoints](validation-checkpoints.md).
