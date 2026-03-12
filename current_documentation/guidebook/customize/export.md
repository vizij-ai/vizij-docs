<!-- tags: type=guidebook-module; status=written; topics=guidebook,customize,export,bundle -->

> **Last updated:** 2026-03-11
> **Purpose:** explain what leaves `vizij-authoring`, what export guardrails protect, and how export bridges customization into integration

# Export

## Reader Outcome

After this page, you should be able to explain what the main exported Vizij artifact is, what supporting export variants exist, what validation and audit guardrails protect export, and why `Export` is the bridge from `Customize` into `Integrate`.

## Intended Audience

This page is for readers who already understand how a face can be rigged, posed, and animated in `vizij-authoring` and now need to understand what actually leaves the authoring surface.

It is especially for readers who need to stop using `export` as a vague synonym for either:

1. saving the current UI state,
2. producing any JSON file at all,
3. already integrating the face into an application.

## What You Need

It helps if you have already read:

1. [Poses](poses.md),
2. [Animations](animations.md),
3. [Loading, Playback, and Embedding](../integrate/loading-playback-and-embedding.md) only at a high level.

From `vizij-web`:

```bash
pnpm run dev:vizij-authoring
```

You do not need to build an embedded app yet.

## Artifact Being Touched

The artifact in this page is the exported Vizij package that leaves `vizij-authoring`.

In the current tool, the main export target is usually a bundled GLB that can carry:

1. the face asset and scene data,
2. rig graph payloads,
3. pose payloads and related metadata when authored and valid,
4. animation payloads when present and included,
5. bundle metadata that later runtime surfaces can inspect and load.

There are also narrower export surfaces for authoring and round-trip work, such as graph JSON, pose config, and pose IR data.

## Why This Page Exists Separately

`Export` needs its own page because it protects the boundary between authoring and runtime use.

`Rigging`, `Poses`, and `Animations` explain how a face is authored.

`Export` explains when that authored state becomes a transportable artifact.

`Integrate` explains how later applications load and use that artifact.

If those ideas collapse together, readers make three common mistakes:

1. assuming authoring is complete as soon as the preview looks right,
2. assuming every authored concept is always serialized automatically,
3. assuming export already teaches application embedding and deployment.

## What Export Means In Vizij

In Vizij, export is the step where the current authored face state is packaged into a form later runtime surfaces can consume honestly.

That is broader than “download a file.”

The current authoring tool treats export as a contract boundary that has to answer questions such as:

1. which authored graph data is valid enough to carry forward,
2. whether pose payloads should be included,
3. whether authored and imported animations should both be included,
4. whether bundle graph audits show contract violations that should block export,
5. whether the artifact still corresponds to a real face and valid runtime targets.

That is why `Export` still belongs in `Customize`: it is the last authoring step before a later bucket consumes the result.

## The Primary Export Target

The current `vizij-authoring` README is explicit: the primary export target is a bundled GLB.

That matters because the guidebook route should center the artifact the runtime most naturally consumes later.

A bundled GLB is valuable because it can keep the visual asset and the authored behavior together:

1. mesh and scene data,
2. rig graph content,
3. pose payloads when authored and valid,
4. animation payloads when present,
5. bundle metadata for later runtime inspection.

This is the cleanest bridge into `Integrate` because later pages can talk about loading a single authored artifact instead of reconstructing the authoring session by hand.

## Secondary Export Variants

The current tool also exposes narrower export paths that are useful for inspection, debugging, and round-trip authoring.

Meaningful secondary exports include:

1. rig graph JSON,
2. pose graph export,
3. pose config export,
4. pose IR export when pose IR support is available,
5. related JSON-style graph and metadata snapshots.

These exports are useful, but they are not the main route artifact.

They exist so the tool can support debugging, review, comparison, and selective round-trips without forcing every learner to think of export only as one giant opaque bundle.

## What Validation And Guardrails Protect

> TODO(content-model): Add a checklist here to summarize the export guardrails a reader should verify before trusting the bundle. Best fit because this section is about operational readiness and a compact validation list would support repeated use better than prose alone.

The important teaching truth is that export is guarded.

The tool does not treat every authored state as automatically fit for packaging.

### Graph validity and export blocking

The current authoring README says bundled export is blocked when GraphSpec is invalid.

That is the first export discipline: if the graph contract is broken in a way the runtime cannot trust, the primary export path should not silently ship it.

### Bundle audit and contract checks

`useVizijExport.ts` and `bundleAudit.ts` show a second layer of protection.

Before final bundled output is written, the tool can:

1. audit bundle graphs against their IR payloads,
2. compare compiled and normalized graph forms,
3. inspect output coverage against valid runtime targets,
4. surface contract-violation messages when the bundle is not trustworthy enough to ship.

This matters because export is not only file generation. It is quality control over what later runtime surfaces will assume is real.

### Conditional pose and animation payloads

Not every export includes every possible authored layer.

Current export behavior is conditional on actual authored state and validity. In practice, that means:

1. pose payloads may be omitted when there is no authored pose data worth carrying,
2. pose export may be derived from pose IR or pose config depending on what is available,
3. authored animation clips are included when present,
4. imported animations can be included conditionally rather than unconditionally,
5. metadata records what was actually bundled.

That conditional behavior is part of the teaching model. It prevents readers from assuming export is a blind dump of every panel in the app.

## What Readers Actually Do In The Current App

> TODO(content-model): Add a config fragment or output inventory example here to show the main bundle artifact and one supporting export variant side by side. Best fit because this section bridges authoring into integration and readers need to see what actually leaves the tool.

In the current authoring surface, export work usually looks like this:

1. open the `File -> Export...` flow,
2. choose the primary bundled export or a narrower supporting export,
3. inspect advanced options when needed,
4. let the tool validate graphs, pose payloads, and animation inclusion,
5. write the artifact only once the export path is considered fit.

The smoke and round-trip tests reinforce the same idea:

1. rig graph export should produce real non-empty output,
2. pose config export should round-trip back into authoring,
3. export is a maintained workflow, not a dead-end button.

## How Export Bridges To Integrate

This page is the hinge between `Customize` and `Integrate`.

Export matters because it turns authored work into something a later runtime can load.

The correct mental sequence is:

1. customize the face,
2. export the authored artifact,
3. load that exported artifact into a player or application shell,
4. then reason about playback, embedding, and deployment from the runtime side.

That means `Export` should point forward to `Integrate`, but it should not try to teach the whole integration story itself.

## What This Page Does Not Teach

This page does not teach:

1. how to build the rig structure,
2. how to author poses or animations,
3. how a React app embeds and boots a runtime surface,
4. how a deployment endpoint is operated,
5. how every advanced export toggle behaves internally.

Those belong to neighboring modules because they answer different questions.

This page teaches the authored artifact boundary.

## A Useful Mental Model

Use this sequence when you need to reason clearly:

1. rigging defines controllable structure,
2. poses define named states,
3. animations define motion over time,
4. export packages the authored result with guardrails,
5. integrate loads that exported result into a real runtime surface.

If you keep that order clear, the guidebook route stays clean.

## Success Check

You are done with this page when:

1. you can name the main export artifact `vizij-authoring` is trying to produce,
2. you can explain why graph validity and bundle audits matter,
3. you can explain why pose and animation payloads may be included conditionally,
4. you can explain why `Export` is the bridge into `Integrate` rather than already being `Integrate`.

## Implementation Anchors

Use these when you need the current implementation truth:

1. `vizij-web/apps/vizij-authoring/README.md`
2. `vizij-web/apps/vizij-authoring/docs/ARCHITECTURE.md`
3. `vizij-web/apps/vizij-authoring/src/hooks/useVizijExport.ts`
4. `vizij-web/apps/vizij-authoring/src/utils/bundleAudit.ts`
5. `vizij-web/apps/vizij-authoring/src/types/bundle.ts`
6. `vizij-web/apps/vizij-authoring/src/components/app/AppMenuBar.tsx`
7. `vizij-web/apps/vizij-authoring/e2e/export.smoke.pw.ts`
8. `vizij-web/apps/vizij-authoring/e2e/pose-roundtrip.workflow.pw.ts`

## Next Step

If you want to understand how the exported artifact becomes a real runtime surface, continue to [Loading, Playback, and Embedding](../integrate/loading-playback-and-embedding.md).
