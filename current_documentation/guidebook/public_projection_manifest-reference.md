<!-- tags: family=guidebook; type=reference; editorial_status=completed; publication_status=planned; topics=guidebook,website,projection,public-docs -->

> **Last updated:** 2026-03-31
> **Purpose:** define the machine-readable manifest that projects guidebook modules into public docs and tutorial routes

# Public Projection Manifest

`public_projection_manifest.json` is the downstream contract between the canonical guidebook in `vizij-docs` and the public docs/tutorial site in `vizij-ai.github.io`.

`public_projection_manifest.schema.json` is the machine-readable schema for validating that contract.

The guidebook markdown files remain the canonical learner-facing body content.

The manifest exists so downstream surfaces can answer questions the guidebook body should not have to encode directly, such as:

1. whether a module publishes publicly right now,
2. whether it lands under `/docs` or `/tutorials`,
3. which public slug it should use,
4. how hubs, cards, and route ordering should appear on the public site,
5. which adjacent routes should be promoted in shared page chrome,
6. which site-only enhancements may attach to the route.

## Maintainer Sync Workflow

The manifest is only one part of the public projection flow.

End-to-end workflow:

1. edit the canonical guidebook markdown in `vizij-docs/current_documentation/guidebook/`
2. update `public_projection_manifest.json` if route placement, slugging, hub grouping, redirects, or route adjacency need to change
3. from `vizij-ai.github.io`, run:

```bash
npm run content:sync:guidebook
```

4. that sync script reads:
   - `vizij-docs/current_documentation/guidebook/public_projection_manifest.json`
   - the guidebook markdown source files referenced by `sourcePath`
   - `vizij-docs/current_documentation/guidebook/assets/`
5. it writes generated public output into:
   - `vizij-ai.github.io/src/generated/guidebook/pages/`
   - `vizij-ai.github.io/src/generated/guidebook/hubs.json`
   - `vizij-ai.github.io/src/generated/guidebook/redirects.json`
   - `vizij-ai.github.io/public/guidebook-assets/`

Do not hand-edit the generated output as the primary workflow. If the public page content is wrong, fix the guidebook source or manifest and rerun the sync.

## Top-Level Shape

The manifest has four top-level responsibilities:

1. `schemaVersion`
   - stable contract version for downstream generators
2. `publicAssetBase`
   - the public URL base where guidebook assets should be copied
3. `hubs`
   - surface-level metadata for `/docs/` and `/tutorials/`
4. `pages`
   - one route projection entry per published public page

## Hub Contract

Each `hubs.<surface>` object defines site-owned presentation metadata while staying downstream from the guidebook:

1. hero copy and image
2. call-to-action buttons
3. decision panels
4. route stage ordering
5. section grouping for hub cards

Hub metadata should not restate lesson body copy. It should only shape the public landing surface around the canonical guidebook route.

## Page Contract

Each `pages[]` entry describes one public route projection of one guidebook source module.

Required stable fields:

1. `pageId`
2. `moduleId`
3. `sourceModuleId`
4. `sourcePath`
5. `surface`
6. `publish`
7. `canonical`
8. `slug`
9. `hubGroup`
10. `order`
11. `routeRole`

Additional route-control fields currently supported:

1. `routeRoleLabel`
2. `titleOverride`
3. `summaryOverride`
4. `redirects`
5. `prev`
6. `next`
7. `implementationAnchors`
8. `labId`
9. `demoLinks`

## Field Notes

### `pageId`

Stable manifest-local identifier used by hub metadata.

Use this to reference a projected page from `routeStages` or hub `sections`.

### `moduleId`

Stable public-route identifier inside the manifest.

This should stay stable even if copy or display labels change.

### `sourceModuleId`

Stable guidebook-facing identifier for the source module.

Use a path-like id aligned with the guidebook structure so it is easy to trace back to the owning markdown file.

### `sourcePath`

Path to the canonical guidebook markdown source, relative to `current_documentation/guidebook/`.

This is what downstream generators should read and transform.

### `surface`

Current public landing surface.

Supported values for the current implementation:

1. `docs`
2. `tutorials`

### `publish`

Boolean gate for whether the route should publish publicly right now.

Use `false` for modules that should stay modeled in the manifest but stay out of downstream route generation.

### `canonical`

Boolean hint for which projection should win when multiple public pages reuse the same guidebook source module.

Use `false` when a second projection exists for route-shaping reasons but should not become the default target for guidebook-internal cross-links.

### `slug`

Public route slug under the selected surface.

Examples:

1. `getting-started`
2. `hello-face`
3. `deployment-model`

### `hubGroup`

Public hub grouping key used to cluster cards on `/docs/` or `/tutorials/`.

This is public-IA metadata, not a replacement for the guidebook bucket model.

### `order`

Numeric sort order inside the public hub and maintained route.

### `routeRole` and `routeRoleLabel`

Machine-readable route role plus optional user-facing label for shared page chrome.

Examples:

1. `orientation`
2. `model`
3. `walkthrough`
4. `operations`
5. `system-map`

### `titleOverride` and `summaryOverride`

Optional public-display copy when the source guidebook title or opening summary should be adapted to a clearer public route label.

These do not replace the guidebook body content.

### `redirects`

List of legacy or alternate slugs worth preserving as redirect aliases under the same surface.

Examples:

1. `runtime-inputs-and-semantics`
2. `hello-face-quickstart`

### `prev` and `next`

Public-route adjacency objects for shared page chrome.

Each object currently uses:

1. `label`
2. `href`
3. optional `description`

### `implementationAnchors`

Public-facing links to implementation truth.

These should point to the owning repo-local or internal docs surface when the public reader needs deeper verification.

### `labId`

Optional site-only enhancement hook for attaching an interactive micro-lab.

The guidebook remains canonical even when no lab exists.

### `demoLinks`

Optional demo cross-links for routes that should deliberately bridge into `/demos`.

These should stay declarative in the manifest rather than forking lesson copy into the site repo.

## Validation Rule

Downstream generators should validate `public_projection_manifest.json` against `public_projection_manifest.schema.json` before generating public routes.

If a route fails schema validation, fix the manifest entry rather than encoding compensating logic in the site.

## Authoring Rule

Do not use the manifest to replace guidebook writing.

Use it only to control downstream projection:

1. route placement,
2. public grouping,
3. site-only enhancements,
4. public display overrides,
5. route adjacency and implementation bridges.

If the lesson itself needs to change, edit the guidebook markdown module instead.
