# npm Publishing for `@vizij/*` Packages
<!-- tags: family=reference; type=reference; topics=publishing,automation,release,npm -->
> **Last updated:** 2026-07-30

> **Related documents:** [Operations Index](README.md) · [Project Documentation Guide](../../project_documenting_guide.md)

## Intention

The `vizij-web` monorepo ships several publishable packages under the `@vizij/*`
scope. This reference documents how they reach npm. The source of truth lives in
the repo — [`README.md` → Publishing & Versioning](https://github.com/vizij-ai/vizij-web/blob/main/README.md#publishing--versioning),
[`.github/workflows/publish-npm.yml`](https://github.com/vizij-ai/vizij-web/blob/main/.github/workflows/publish-npm.yml),
and [`scripts/publish-unpublished.mjs`](https://github.com/vizij-ai/vizij-web/blob/main/scripts/publish-unpublished.mjs);
this page is the cross-repo operational summary.

## The model: publish what isn't published

Publishing is driven by the **registry**, not by release tags or changesets:
whenever a publishable `@vizij/*` package's version in the repo is not yet on
npm, CI publishes it. The decision is per package —

- version already on npm → **skip**,
- version absent (package exists) → **publish**,
- package absent entirely → **bootstrap required** (see below), reported but
  non-fatal.

Already-published versions are skipped, so re-runs are idempotent and one
package failing does not block the rest. This also backfills the "version bumped
on GitHub but never released to npm" case automatically.

The workflow runs on every push to `main` that touches `packages/**`, and on
manual `workflow_dispatch`.

## Authentication: npm trusted publishing (OIDC)

Publishing uses **npm trusted publishing** — no `NPM_TOKEN`. The workflow runs
with `id-token: write`; each package has a trusted publisher configured on npm
against the repository `vizij-ai/vizij-web` and the workflow file
`publish-npm.yml`, and publishes are signed with provenance.

> **The workflow filename is load-bearing.** Renaming `publish-npm.yml` breaks
> OIDC publishing until every package's trusted publisher is reconfigured.

## Releasing a change

1. In your PR, bump the `version` of each package you changed. Use Changesets
   (`pnpm changeset` to record intent, `pnpm version:packages` to apply bumps and
   changelogs) or edit the `version` field for a one-off.
2. Merge to `main`. CI publishes every bumped version that isn't on npm yet.

Versioning is decoupled from publishing: CI publishes whatever versions land on
`main`, however they were bumped. Preview locally with `pnpm publish:unpublished
--dry-run`.

## First publish of a new package (bootstrap)

Trusted publishing **cannot create a brand-new package name** over OIDC — the
first publish 404s. For a new `@vizij/*` package, once:

1. Publish it manually from an npm-authenticated machine:
   `cd packages/@vizij/<name> && pnpm build && npm publish --access public`.
2. Add a trusted publisher for it on npm (npmjs.com → the package → Settings →
   Trusted Publisher): repository `vizij-ai/vizij-web`, workflow
   `publish-npm.yml`.

From then on CI publishes its versions like any other package. The publisher
lists any package still needing this at the end of its run.

## Prerequisites

- Internal dependencies use the workspace protocol (`workspace:*`). The publisher
  materialises these to real versions at publish time and restores the manifests
  afterward, so published packages carry real version ranges while the repo keeps
  `workspace:*`.
- Each publishable package sets `"private": false` (or omits `private`) and a
  `publishConfig.access` entry. Private packages and apps are skipped
  automatically.

## History

Publishing previously ran through Changesets on an `npm-pub-*` release tag,
which versioned and published in one CI step gated on pending changesets. That
gate skipped versions bumped without a changeset, and a brand-new package name
failing the OIDC first publish failed the whole run. The registry-driven
publisher above replaced it (vizij-web VIZ-89).
