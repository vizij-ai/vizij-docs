<!-- Archived from vizij-ai.github.io/docs/react-migration-plan.md on 2026-02-05 -->
<!-- Reason: superseded or historical planning note; preserved for reference. -->

# React Migration Plan

Audience: Maintainers and contributors of the Semio Community website.
Status: In progress
Last updated: 2025-11-14

## Purpose

Standardize the codebase on React for components and page UIs while retaining Astro for routing, content collections, and SSG. The migration must preserve or improve performance (TTFB, CLS, JS shipped), maintainability, and developer experience.

## Current state (summary)

- Astro v5 with React integration enabled.
- Routes: `.astro` files remain in `src/pages/**`, but most static routes now simply load data and render a React page from `src/react-pages/**` (home, about, contributors, projects, events, services, get-involved, 404). Dynamic slugs still use `.astro` to access `astro:content`.
- UI: shared components are React-first; only the global layout primitives (`BaseHead`, Header/Footer, SkipLink, ThemeProvider) remain in `.astro` while a React rewrite of the shell is planned.
- Content: Astro Content Collections + Zod schemas + MDX in `src/content/**`.
- Styling: Tailwind v4 via Vite plugin.
- Search: Pagefind.
- Hosting: GitHub Pages (DNS via Squarespace).

## Goals

- React-first component architecture across the site.
- Keep Astro for:
  - File-based routing and redirects.
  - Static Site Generation (SSG).
  - Content Collections and MDX parsing.
  - Head/SEO primitives and zero-JS-by-default ergonomics.
- Maintain Astro-level performance: only hydrate what needs interactivity.
- Minimize churn for MDX content authors.

## Non-goals

- Switching hosting or build system.
- Replacing Astro Content Collections.
- Introducing a different meta-framework (e.g., Next.js) at this time.

## Design principles

- Astro for routing, React for rendering:
  - Use `.astro` route files as thin wrappers whose primary job is to load data and render a single React page component.
- Default to server-rendered React components with no hydration:
  - Only add hydration directives (client:*) on components that require interactivity.
- Keep data-fetching in shared server-side modules (`src/data/**`):
  - Import those in `.astro` routes and pass results into React page components as props.
- Maintain “islands” boundaries:
  - Keep interactive components small and self-contained.
- Favor incremental, reversible changes:
  - Migrate core layout first, then components, then pages, then dynamic routes.

## Directory conventions

- React page components:
  - `src/pages` remains Astro route files.
  - Add `src/react-pages/` (or `src/pages-react/`) for page-level React components (one per route).
- React shared components:
  - Continue using `src/components/**` for shared UI; prefer `.tsx`.
- Layout:
  - Use `src/layouts/SiteLayout.tsx` (React) for the content wrapper and `src/layouts/SiteShell.astro` (Astro) to compose shell concerns (ThemeProvider, SkipLink, Header/Footer slots) and hydrate only backgrounds where needed.
- Data modules:
  - Keep and extend `src/data/**` for content queries (already in use).

## Hydration strategy

- SSR-only by default (no client directive) for:
  - Headers/footers, static sections, cards, lists.
- Use hydration only for interactive elements:
  - `client:visible` for UI that appears in viewport (e.g., mobile menu, search modal).
  - `client:idle` for low-priority enhancements.
- Avoid `client:load` unless the interaction must be immediately available at page load.
- Consider dynamic `import()` for heavy subtrees within interactive components.
- Validate that any component with hydration has a clear user interaction justification.
- Current usage:
  - Background parallax (ParallaxHexBackground) hydrates via a small island composed by `SiteShell` while the rest of the homepage remains SSR-only.
  - Events listing uses `<EventsSections client:load>` passed from the `.astro` route into the React page so only the expandable grid hydrates.
  - Person popovers hydrate via `client:idle` and receive fully-serialized people objects computed in the route.

## Performance guardrails

- JS shipped per route should not increase materially after migration.
- Track:
  - Lighthouse score ≥ pre-migration.
  - TTI, TBT, CLS at or better than baseline.
  - Bundle sizes using Vite’s analysis.
- Use code-splitting for large, optional UI (e.g., search).
- Keep image handling unchanged to leverage Astro image pipelines where applicable.

## Phased migration approach

Phase 0 — Preparation (Status: partially complete)
- Completed:
  - Created `src/react-pages/` and established React-first page composition for the experimental homepage route.
  - Baseline conventions documented in this plan; directory naming aligned.
  - TypeScript strict settings and React 19 compat verified.
  - Added ADR 0001 (React-first UI; `.astro` only for routing/head/hydration glue) and a hydration policy reference document for contributors.
- Remaining:
  - CI: Lighthouse/bundle-size reporting and budgets.

Phase 1 — Layout and head (Status: in progress)
- Completed:
  - Introduced `SiteLayout.tsx` (SSR-only React layout wrapper).
  - Introduced `SiteShell.astro` to compose ThemeProvider/SkipLink/Header/Footer and hydrate background only.
  - Implemented a parallax background as a dedicated React component with island hydration (minimal scope).
  - Applied `SiteShell` across every top-level route now that each renders a React page component.
  - Rebuilt ThemeProvider, SkipLink, Header, and Footer as React components and render them automatically from `SiteShell` (header hydrates with `client:load` for nav/search).
- Remaining:
  - A React head utility (optional) if we decide to manage `<head>` in React; currently `BaseHead.astro` remains in use.

Phase 2 — Shared components (Status: ✅ complete)
- Completed:
  - Ported and/or created React equivalents used on the homepage:
    - `HeroHeader`, `ParallaxHexBackground`, `SectionBlock` (shared), `LinkCard`.
  - Ensured exact style parity for cards/sections (class translations).
  - Converted the remaining detail primitives (`BaseDetailLayout`, `InfoCard`, `ContentSection`, `ChipsList`, `FeaturesList`, `SpecificationsList`, `BasicChip`, `OrganizationChip`, `PersonPopover`) to React and deleted their `.astro` shims now that every slug route consumes the React exports directly.
  - Replaced the last card/section wrappers (`HardwareCard.astro`, `SoftwareCard.astro`, `ResearchCard.astro`, `PersonCard.astro`, `PersonListElement.astro`, `PartnerCard.astro`, `EventCard.astro`, `sections/SubsectionGrid.astro`) with their React counterparts so Contributors and Projects now render the React components directly.
- Remaining:
  - Only the head/layout glue (`BaseHead.astro` + `SiteShell.astro`) remain as Astro files; plan a follow-up to replace BaseHead with a React head helper or confirm Astro head stays indefinitely.

Phase 3 — Page components (Status: ✅ complete)
- Completed:
  - Homepage content now composed of reusable React sections (`HeroSection`, `MissionSection`, `ProgramsSection`, `PartnersSection`, `ConnectSection`) with background hydration isolated to the Parallax background island.
  - All static routes (`index`, `about`, `contributors`, `projects`, `events`, `services`, `get-involved`, `404`) now render dedicated React page modules from `src/react-pages/<route>/`.
  - Slug routes (hardware, software, organizations, people, research, events) consume the React detail stack directly; `.astro` wrappers only load content collections and wire hydration directives for specific interactive leaves (e.g., `EventsSections client:load`).
  - `src/react-pages/README.md` documents the pattern and every route folder now matches the "<route>/Page.tsx" convention, improving discoverability.
- Remaining:
  - Keep auditing new routes to ensure they follow the same pattern and continue to document any exceptions (e.g., client islands that must stay in `.astro` for hydration directives).

Phase 4 — Dynamic routes (Status: not started)
- Plan:
  - Keep `.astro` dynamic routes (e.g., `[...slug].astro`) as thin wrappers to load content via `astro:content`.
  - Render React detail components with passed props.
  - Replace any `.astro`-only widgets within details with React variants.

Phase 5 — Cleanup and stabilization (Status: not started)
- Plan:
  - Remove deprecated `.astro` components after React parity is verified site-wide.
  - Ensure all pages standardize on `SiteLayout` + `SiteShell`.
  - Rebaseline performance metrics and update onboarding docs.

## Data and content considerations

- Continue using Astro Content Collections and Zod schemas (no change for authors).
- MDX content remains in `src/content/**`.
- If any React component needs `ImageMetadata` from Astro’s `image()`:
  - Keep importing content via `.astro` route and pass already-resolved image props into React components.
  - Alternatively, relax Zod image types to accept `string | ImageMetadata` and handle both forms in React components if needed.

## Testing and verification

- Unit tests:
  - Add lightweight tests for React components (props, rendering, simple logic).
- Visual checks:
  - Storybook (optional) or per-route screenshots for common viewports.
- Performance:
  - Lighthouse CI or WebPageTest budget checks in CI.
- Accessibility:
  - Axe/lighthouse a11y checks for key pages.
- Content integrity:
  - Existing build checks (`astro check`, draft verifier) continue to run.

## Rollback plan

- Each phase is PR-gated and reversible.
- Avoid deleting `.astro` components until their React equivalents are battle-tested and merged.
- Maintain branches per phase to allow quick revert to last known good.

## Risks and mitigations

- Risk: Increased JS shipped to client.
  - Mitigation: Strict hydration policy; measure bundle sizes per page.
- Risk: Layout differences.
  - Mitigation: Incremental rollout; compare screenshots and DOM diffs.
- Risk: Image pipeline regressions.
  - Mitigation: Keep Astro handling of images at the route level and pass results to React; test image-heavy pages.
- Risk: Developer confusion during transition.
  - Mitigation: Document conventions; use consistent naming and colocated page components.

## Success criteria

- All UI components migrated to React `.tsx`.
- `.astro` files remain primarily as route wrappers + head/SEO + hydration directives.
- Equal or better Lighthouse scores and JS payloads.
- No regressions in content rendering, search, or navigation.
- Documentation updated; contributors can follow conventions without confusion.

## Task checklist (high level)

- ✅ Create `SiteLayout.tsx` and `SiteShell.astro`; keep SSR-only by default and hydrate background only.
- ✅ Convert legacy shared `.astro` wrappers (cards, chips, detail layout, CTA buttons) to React; only layout/head helpers remain in `.astro`.
- ✅ Migrate `index.astro`, `about.astro`, `contributors.astro`, `projects.astro`, `events.astro`, `services.astro`, `get-involved.astro`, and `404.astro` to render React pages within `SiteShell`.
- ✅ Move hardware/software/organization/people/research/events detail routes onto the React detail stack while keeping `.astro` for data loading and hydration directives.
- 🔄 Replace hydration for nav/search/popovers with `client:visible`/`client:idle` where feasible (navigation/search audit pending).
- 🔄 Remove the remaining `.astro` layout primitives once the React shell/head strategy is ready.
- ⏱️ Establish CI checks for performance, bundle size, and a11y.
- ⏱️ Update docs and contributor guide with hydration policy + ADR (in progress via this plan).

## Appendix: practical tips

- Keep `.astro` route files as small as possible: imports, data fetch, single React render.
- Co-locate page-specific components under `src/react-pages/your-page/` to avoid a flat, crowded components directory.
- For any React component that must run only on the client, consider moving it behind a small `.astro` “island” wrapper with the appropriate `client:*` directive.
- Use dynamic `import()` in React for optional panels (e.g., search modal) to avoid loading them in the main bundle.
- Prefer stable UI libraries you already use (Radix UI) and avoid new heavy dependencies during migration.

## Phase 0 — Status audit (current findings)

- Linting/formatting:
  - Biome and Prettier are configured. Biome formatter is set to ignore *.astro files; Prettier is run with prettier-plugin-astro for formatting .astro via "format:code" script.
  - Scripts present: "lint", "format", "format:code", "format:imports".
- TypeScript:
  - tsconfig extends "astro/tsconfigs/strictest", with DOM libs and path alias "@/*" → "src/*".
  - Strict settings are enabled; React 19 is compatible with current TS version (>=5.7).
- React and Astro:
  - react and react-dom are at ^19.2.0.
  - @astrojs/react integration is installed and enabled in astro.config.ts.
- Routing and data:
  - `.astro` files now primarily serve as thin routers/head wrappers; every static page renders a React module from `src/react-pages/**`, and dynamic slugs only keep `.astro` for `astro:content` + hydration directives.
  - Data fetching remains centralized in src/data/** modules and is only called from the `.astro` routes (good baseline).
- Hydration/interactivity:
  - Interactive components (navigation, search, person popovers, events grids) are implemented in React TSX; hydration relies on explicit `client:*` directives attached in the `.astro` route or `SiteShell` (e.g., `Header client:load`, `EventsSections client:load`, `PersonPopover client:idle`).
  - Hydration policy is documented in `docs/hydration-policy.md`; default remains SSR-only React pages with targeted islands for specific interactions.
- Layout:
  - `SiteShell.astro` is the shared layout wrapper; it renders the React ThemeProvider/SkipLink/Header/Footer set and hydrates only the background + header.
- Content and images:
  - Astro Content Collections with Zod schemas in src/content.config.ts.
  - MDX entries under src/content/**.
  - Image fields use image() where applicable; components accept Astro image metadata.
- CI/CD:
  - GitHub Actions workflow builds and deploys to GitHub Pages.
  - No performance checks (Lighthouse/bundle size) in CI at present.
- Performance:
  - Tailwind v4 via Vite plugin; Pagefind runs postbuild for search indexing.
  - No bundle size regression guardrails yet.
- Previews:
  - Pages deploy on merge to main; no PR preview environment configured.

## Phase 0 — Actionable next steps

- Conventions and docs:
  - ✅ ADR 0001 + hydration policy landed; keep them updated as new routes/components come online.
- Directory structure:
  - ✅ `src/react-pages/` exists with per-route folders plus a README that documents the convention. Keep adding new routes here and avoid reintroducing flat React files under `src/components`.
- Layout scaffolding:
  - ✅ `SiteLayout.tsx` + `SiteShell.astro` replaced `Base.astro`. Next milestone is a React head helper so we can consider dropping `BaseHead.astro` if/when desired.
- Linting/formatting:
  - Keep current setup. Optionally remove "*.astro" ignore from Biome formatter once most UI moves to React; Prettier already formats .astro via plugin.
- CI enhancements:
  - Add Lighthouse CI (or GitHub Action) to measure LCP/CLS/TBT on key routes.
  - Add a bundle size report step (e.g., vite-bundle-visualizer or rollup-plugin-visualizer in CI) with a basic budget.
- Hydration guardrails:
  - Person popovers (`client:idle`), navigation/search (`Header client:load`), and events grids (`client:load`) are explicitly annotated per `docs/hydration-policy.md`. Continue documenting any new interactive leaves.
- Previews (optional):
  - Add PR preview builds (e.g., publish build artifacts and comment URLs, or deploy previews to a secondary static host).
- Success criteria baseline:
  - Capture current Lighthouse scores and JS payload sizes for Home, Projects, and a Detail page to compare post-migration.

## Icon migration registry (homepage React components)

Purpose:
- Keep a running record of icons used in React components to ensure consistent, solar-only icon usage and aid future migrations.

Library:
- Use line icons from "@solar-icons/react-perf/LineDuotone".
- Icons should inherit color via currentColor; pass className to control size/color/hover transforms.
- Prefer passing a React element (icon) or a render function (iconRender) over string-based icon names.

Components and icons (current homepage):

- ProgramsSection (src/react-pages/home/sections/ProgramsSection.tsx)
  - Hardware: CpuBolt
  - Software: CodeSquare
  - Research: TestTube
  - Notes:
    - Icons are injected via iconRender={(className) => <Icon className={className} />} so they receive size/variant color classes and hover scaling.

- PartnersSection (src/react-pages/home/sections/PartnersSection.tsx)
  - Academia: SquareAcademicCap
  - Industry: Buildings2
  - Public Sector: Flag2
  - Notes:
    - Icons use className="w-12 h-12" and inherit contextual color (e.g., variant text classes).

- LinkCard (src/components/cards/LinkCard.tsx)
  - Accepts either:
    - icon: a React node (must respect currentColor), or
    - iconRender: (className) => ReactNode (recommended to ensure consistent styling)
  - Used by ProgramsSection to render the three program tiles.

Pending mappings / TODO:
- MissionSection (src/react-pages/home/sections/MissionSection.tsx)
  - Currently rendered without icons in React for parity. The original Astro used mixed icon sets (hugeicons and a solar icon).
  - Action: decide on solar-only equivalents for:
    - Community-Driven (TBD)
    - Human-Centered (TBD)
    - Replicable (TBD)
  - Apply the same pattern as ProgramsSection (iconRender) once decided.

Conventions (for future components):
- Import icons from "@solar-icons/react-perf/LineDuotone".
- Standard size: "w-12 h-12" unless a specific component requires a different scale.
- Color and hover: let parent container provide the color via variant text classes; icons inherit via currentColor.
- Avoid string-based icon lookups. Pass React elements directly to maintain type-safety and remove runtime resolution.

## Astro component audit (2025-11-14)

Legacy `.astro` wrappers that no longer had importers have been deleted in this pass (`Hero.astro`, `Section.astro`, `GlyphField.astro`, `CallToActionButton.astro`, `ItemCard.astro`, `FeatureCard.astro`, `LinkCard.astro`, `Search.astro`, `ThemeToggle.astro`, `Timeline.astro`, `LinkButton.astro`, `TagsList.astro`, `PricingInfo.astro`, `BackgroundParallaxHexIsland.astro`, `detail/BaseDetailLayout.astro`, `detail/ContentSection.astro`, `detail/InfoCard.astro`, `detail/ChipsList.astro`, `detail/FeaturesList.astro`, `detail/SpecificationsList.astro`, `ui/BasicChip.astro`, `ui/OrganizationChip.astro`, `people/PersonPopoverWrapper.astro`, `sections/SubsectionGrid.astro`, `cards/EventCard.astro`, `cards/HardwareCard.astro`, `cards/SoftwareCard.astro`, `cards/ResearchCard.astro`, `cards/PersonCard.astro`, `cards/PersonListElement.astro`, `cards/PartnerCard.astro`). The list below tracks the remaining files under `src/components/**/*.astro`, their current usage, and what needs to happen before they can be removed.

| Component(s) | Current usage | Removal path |
| --- | --- | --- |
| `BaseHead.astro` | Head meta helper for every route | Keep until we decide on a React head strategy or confirm Astro head stays indefinitely. |
| `layouts/SiteShell.astro` | Layout glue that loads header data, injects ThemeProvider/SkipLink/Header/Footer, and hydrates the background island | Needed to keep hydration directives (`client:load` on Header, `client:only="react"` on Parallax). Can revisit once we adopt a pure React shell. |

✅ Audit outcome: no stray `.astro` wrappers remain under `src/components/**`. ThemeProvider, SkipLink, Header, and Footer now live in React; future deletions are blocked on the React head plan and possible SiteShell rewrite.

All other component directories are now React-only, which keeps discovery predictable (`src/components/cards/**`, `src/components/sections/**`, etc.). The remaining Astro files live under `src/components/BaseHead.astro` and `src/layouts/SiteShell.astro` until we finalize the head/shell strategy.
