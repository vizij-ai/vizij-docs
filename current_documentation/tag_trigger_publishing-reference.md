# Tag-Based Trigger Publishing Guide for Monorepo Packages
<!-- tags: status=reference; topics=publishing,automation,release,changesets -->

> **Related documents:** [Project Documentation Guide](../project_documenting_guide.md) · [Code Quality Summary](../active_projects/code_quality/summary.md)

## Intention
We maintain multiple publishable packages under the `@vizij/*` scope inside the `vizij-web` monorepo. This guide documents how to record changes with Changesets, cut a release tag, and let CI publish only the packages that changed.

## Overview Workflow
1. Make code changes in one or more packages.
2. Run `pnpm changeset` (as many times as needed) to capture the semver impact for each affected package.
3. After the branch merges to `main`, run the release script to apply version bumps, commit the generated changelog + lockfile updates, and push an annotated tag (`release-YYYYMMDD-HHMMSS`).
4. GitHub Actions triggers on the tag, installs dependencies, verifies publishable packages, and runs `changeset publish`.
5. npm receives new versions only for the packages that were bumped; internal dependency ranges stay in sync automatically.

## Setup

### 1) Standardise internal dependency declarations
Use the workspace protocol across every internal dependency so pnpm and Changesets keep them aligned:

```json
"dependencies": {
  "@vizij/render": "workspace:^"
}
```

Add to the repo root `.npmrc`:

```ini
save-workspace-protocol = true
```

Run `pnpm install --frozen-lockfile` once after updating dependency ranges to refresh the lockfile.

### 2) Configure Changesets (`vizij-web/.changeset/config.json`)

```json
{
  "$schema": "https://unpkg.com/@changesets/config@2.3.1/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

The `commit: false` flag keeps Git history in our control; the release script (below) handles commits. If you prefer the GitHub-flavoured changelog, swap the `changelog` entry for `["@changesets/changelog-github", { "repo": "vizij-ai/vizij-web" }]` and add that package as a dev dependency.

### 3) Root `package.json` scripts
Add helper scripts that limit CI work to publishable packages:

```json
"scripts": {
  "changeset": "changeset",
  "version:packages": "changeset version",
  "verify:packages": "pnpm run build:packages && pnpm -r --filter \"@vizij/*\" run --if-present lint && pnpm -r --filter \"@vizij/*\" run --if-present test",
  "publish:packages": "pnpm exec changeset publish",
  "release:ci": "pnpm run verify:packages && pnpm run publish:packages"
}
```

`build:packages` already exists and only targets the packages that ship to npm. Adjust the filters if new package scopes are added later.

### 4) GitHub Actions workflow (`vizij-web/.github/workflows/release-tag.yml`)

```yaml
name: Release on Tag

on:
  push:
    tags:
      - 'release-*'

permissions:
  contents: write
  id-token: write
  packages: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: https://registry.npmjs.org
      - name: Enable pnpm
        run: corepack enable pnpm
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Verify packages
        run: pnpm run verify:packages
      - name: Publish changed packages
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: pnpm run publish:packages
```

`changeset publish` automatically skips packages that were not bumped in the release commit and it honours `private: true`.

### 5) Local release helper (`vizij-web/scripts/release-tag.sh`)

```bash
#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)/vizij-web"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "❌ Working tree is not clean. Commit or stash changes first." >&2
  exit 1
fi

shopt -s nullglob
changesets=(.changeset/*.md)
shopt -u nullglob

changeset_count=0
for file in "${changesets[@]}"; do
  [[ "$(basename "$file")" != "README.md" ]] && ((changeset_count++))
done

if [[ "$changeset_count" -eq 0 ]]; then
  echo "❌ No pending changesets. Run 'pnpm changeset' before releasing." >&2
  exit 1
fi

echo "📦 Applying version bumps..."
pnpm install --frozen-lockfile
pnpm run version:packages
pnpm install --frozen-lockfile

git add -A .changeset
git add pnpm-lock.yaml || true
git add packages

if git diff --cached --quiet; then
  echo "ℹ️ Nothing to commit after versioning. Aborting."
  exit 0
fi

git commit -m "chore: release"

TAG="release-$(date -u '+%Y%m%d-%H%M%S')"
git push origin HEAD
git tag -a "$TAG" -m "Trigger package publish ($TAG)"
git push origin "$TAG"

echo "✅ Release tag pushed: $TAG. CI will publish the bumped packages."
```

Run this from `vizij-web` on `main` once your feature branches (and their changesets) have landed.

### 6) Example usage
- Implement a change in `@vizij/runtime-react`.
- Run `pnpm changeset` and mark the package for a minor/patch as appropriate.
- Merge the feature branch to `main`.
- From an up-to-date local `main`, run `scripts/release-tag.sh`.
- CI publishes the bumped package(s) to npm when the `release-*` tag build succeeds.

## Additional Notes & Tips
- `fetch-depth: 0` in CI is required so the workflow sees the tag that triggered it.
- Make sure every package intended for npm has `"private": false` and a `publishConfig.access` value.
- Keep release commits focused: avoid staging unrelated files before running the script.
- If you publish build artefacts from `dist/`, ensure `dist` is listed under `files` and consider `publishConfig.directory` if you need to publish out of a subfolder.
- If you prefer semantic tags (for example `release-v0.0.5`), adjust the script to compute the label from `changeset status --output` before running `changeset version`.

## TL;DR
Capture changes with `pnpm changeset`, run `scripts/release-tag.sh` on `main` to commit the version bumps and push a `release-*` tag, then let the GitHub Action invoke `pnpm run release:ci` so `changeset publish` ships only the updated packages.
