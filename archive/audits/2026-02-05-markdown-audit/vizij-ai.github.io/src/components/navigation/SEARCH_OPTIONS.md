<!-- Archived from vizij-ai.github.io/src/components/navigation/SEARCH_OPTIONS.md on 2026-02-05 -->
<!-- Reason: superseded or historical planning note; preserved for reference. -->

# Radix + Pagefind: React-first search architecture and implementation plan

This document proposes a reliable, customizable search solution using:
- Pagefind’s query API for fast, static-site indexing
- React for the complete search UI (desktop and mobile)
- Radix UI primitives for accessibility, focus management, and consistent interactions
- Shared UI components for consistency (search input, icon buttons, list items)

The plan keeps Pagefind as the search engine while moving all UI/interaction to React. It supports two layouts:
- Desktop: a Radix Dialog modal with a search field and a live-updating results list.
- Mobile: search is initiated from the MobileNavigation dialog header and “co-opts” the dialog’s content area to display results until the user exits search mode.

No implementation is included—this is a blueprint to guide development.


## Objectives

- React-first search UI with consistent theming and accessibility.
- Desktop modal search with suggestions/live filtering.
- Mobile search embedded within the MobileNavigation dialog to use its header space and main content area for results.
- Emphasize frontmatter fields (title, description, tags, type, year, status) over markdown content.
- Reuse shared UI components and styles to keep the experience cohesive.
- Keep static hosting (no external search service); lazy-load search logic for performance.


## High-level UX

- Desktop
  - Press “/” or click a header search button to open a Radix Dialog modal.
  - Input is auto-focused; results appear as the user types (debounced).
  - Keyboard: Up/Down to navigate, Enter to go, Esc to close.
  - The modal behaves like the current one, but fully React-driven.

- Mobile (inside MobileNavigation)
  - Tap the search button in the mobile menu header to enter “search mode”.
  - The header shows a search input (already in place) and the dialog’s content area is replaced with search results.
  - “Close” exits search mode and returns to normal menu items (or closes the dialog if user presses the dialog “X”).
  - Same live results behavior as desktop; consistent styling and keyboard handling.


## Architecture overview

- SearchProvider (React context)
  - Centralizes search state: open/closed, query, results, loading, error, mode (“desktop-modal” | “mobile-panel”), and keyboard hotkeys state.
  - Exposes functions: `openDesktopModal()`, `enterMobileMode()`, `exitSearchMode()`, `setQuery()`, `clear()`.
  - Handles lazy-loading Pagefind and orchestrates queries.

- PagefindClient (utility module)
  - Lazy-loads `pagefind.js` on first use via dynamic import.
  - Wraps the search API with a typed interface and minimal caching.
  - Normalizes results into a consistent shape.

- Shared components (React)
  - SearchInput: a stylized input with optional leading icon and clear button. Reused in both desktop modal and mobile header.
  - SearchResultsList: a virtualized list (optional) that renders rows using a shared row component.
  - SearchResultItem: minimal, consistent list item row. Consider a compact “link-style list item” that mirrors your navigation/links. Optionally show badges (type/status/year).
  - EmptyState / ErrorState: consistent empty/error visuals.

- Radix UI primitives
  - Desktop: Radix `Dialog.Root` + `Dialog.Content` for the modal.
  - Mobile: leverage existing Radix `Dialog` in `MobileNavigation` and render search “panel” within its content while in search mode (no nested dialogs).


## Data model and result normalization

Goal: favor frontmatter metadata for ranking and display.

- Ensure that during the Astro build, the target frontmatter fields (title, description, tags, type, status, year) are emitted into the HTML in a way that Pagefind can index:
  - Prefer machine-readable JSON in `<script type="application/ld+json">` or meta tags with consistent selectors/attributes that Pagefind can parse.
  - If needed, include hidden elements with data attributes that Pagefind indexes.

- Pagefind query flow:
  1. `const pagefind = await import('/pagefind/pagefind.js')`
  2. `const res = await pagefind.search(query, { filters?: … })`
  3. For each result: `const data = await result.data()` to fetch metadata.
  4. Map to our `SearchRecord`:
     - `url: string`
     - `title: string`
     - `description?: string`
     - `tags?: string[]`
     - `type?: 'hardware' | 'software' | 'research' | 'page' | string`
     - `status?: string`
     - `year?: number`
     - `excerpt?: string` (from Pagefind; can contain highlights)
  5. Derive display groupings or badges (e.g., type/status) as needed.

- Ranking and weighting:
  - Prefer frontmatter fields over body content.
  - If Pagefind’s default scoring over-indexes body text, further constrain the selection Pagefind indexes (e.g., wrap content blocks with `data-pagefind-ignore`, and allow only a metadata container to be indexed).


## State and behavior

- Query lifecycle:
  - Debounce input (200–250ms).
  - Maintain a monotonically increasing `requestId`; only apply results for the latest `requestId`.
  - Cache results by query string (LRU of last ~10 queries).
  - Preload Pagefind when the user presses “/” or focuses a search trigger.

- Keyboard and focus:
  - Global hotkey “/” opens the desktop modal (when not in input elements) or enters mobile search mode if on mobile.
  - Esc closes the active search UI.
  - Roving focus or active index within the result list for Up/Down/Enter.
  - On close, return focus to the trigger.

- Mobile mode:
  - Flag in context: `mode: 'mobile-panel' | 'desktop-modal' | 'none'`.
  - Mobile header search button calls `enterMobileMode()`.
  - When in `mobile-panel`, the `MobileNavigation` replaces its normal nav list with `<SearchResultsPanel />`.
  - “Back” or “Close search” clears query and exits search mode, restoring the menu list.

- Error handling:
  - If Pagefind fails to load or query, show a non-blocking inline error with a retry action.
  - Log errors to console or optional reporter (development).

- Performance:
  - Lazy-load Pagefind only on demand.
  - Optional: virtualize results with `react-virtual` if lists can be large.
  - Keep result items small and text-only to avoid layout shifts.


## Component breakdown

1) `SearchProvider` (context + reducer)
- Props: optional `initialMode`, `preloadOnMount?`
- State:
  - `mode`: 'none' | 'desktop-modal' | 'mobile-panel'
  - `query`: string
  - `results`: SearchRecord[]
  - `loading`: boolean
  - `error`: string | null
  - `activeIndex`: number | null
- Actions:
  - `openDesktopModal()`, `closeDesktopModal()`
  - `enterMobileMode()`, `exitSearchMode()`
  - `setQuery(q)`, `clear()`
  - `moveActive(delta)`, `activateIndex(i)`

2) `PagefindClient` (utility)
- Methods:
  - `load(): Promise<Pagefind>`
  - `search(query: string): Promise<SearchRecord[]>`
  - internal cache: `Map<string, SearchRecord[]>`

3) `SearchInput` (shared)
- Props:
  - `value: string`
  - `onChange(value: string)`
  - `onSubmit?()`
  - `autoFocus?: boolean`
  - `placeholder?: string`
  - `size?: 'sm' | 'md'`
- Behavior:
  - clear button when value is non-empty
  - submits on Enter
  - emits change with debouncing externally managed by provider hook

4) `SearchResultItem` (shared)
- Props: `record: SearchRecord`, `active?: boolean`
- Renders:
  - Title
  - Optional badges: `type`, `status`, `year`
  - Optional small description/excerpt with highlighted terms
- Styling:
  - Reuse navigation/link styles for consistency
- Behavior:
  - `active` styling for keyboard selection

5) `SearchResultsList` (shared)
- Props: `results: SearchRecord[]`, `activeIndex: number | null`, `onHoverIndex(i)`, `onSelect(record)`
- Behavior:
  - Optional virtualization for long lists
  - Handles empty state when `results.length === 0 && query.length > 0`

6) Desktop: `SearchModal`
- Uses Radix `Dialog.Root`/`Dialog.Content`.
- Renders:
  - `<SearchInput autoFocus />`
  - `<SearchResultsList />`
- Wires keyboard:
  - Up/Down adjust `activeIndex`
  - Enter goes to `results[activeIndex].url`
  - Esc closes modal
- Opens with “/” hotkey when not focused in input/textarea

7) Mobile: `SearchMobilePanel`
- Rendered by `MobileNavigation` when context `mode === 'mobile-panel'`.
- Uses the mobile dialog’s existing header:
  - Header already contains Search and Theme buttons—reuse `SearchInput` in the header (or open the panel on click as now).
- The dialog’s content area:
  - Replace nav items with `<SearchResultsList />` while in search mode.
  - Provide a small sticky sub-header (optional) for filters/sort if needed.
- Back/Close:
  - A simple “Back” or “Close search” button returns users to the nav list and clears query.
  - If user closes the whole mobile dialog (X), also exit search mode and clear.


## Event handling and integration

- Hotkeys:
  - Global “/” listener lives in `SearchProvider` and:
    - If on desktop width: `openDesktopModal()`
    - If on mobile width: `enterMobileMode()`
  - Debounce/prevent default when already in a text input.
  - Optionally support “Cmd+K” as an additional shortcut.

- Routing:
  - On selecting a result, navigate to `record.url`. In the mobile panel, also close the mobile dialog.
  - Consider Astro’s client-side navigation or full navigation—be consistent with current behavior.

- Theming:
  - Use the same Tailwind classes and CSS variables as the rest of the app.
  - Icons should mirror the theme toggle’s sun/moon pattern for consistency.

- Accessibility:
  - Manage `aria-activedescendant` on the list container.
  - Announce “N results” to screen readers on updates.
  - Ensure `Dialog` has appropriate labels and `aria-modal` semantics.


## Suggested file structure

- `src/components/search/`
  - `SearchProvider.tsx` (context + hooks)
  - `PagefindClient.ts` (loader + query + cache)
  - `SearchInput.tsx` (shared input)
  - `SearchResultItem.tsx` (shared row)
  - `SearchResultsList.tsx` (shared list + optional virtualization)
  - `SearchModal.tsx` (desktop modal using Radix Dialog)
  - `SearchMobilePanel.tsx` (mobile “co-opted” panel rendered inside MobileNavigation)
  - `index.ts` (barrel exports)

- Integration points:
  - Header: replace the current search trigger with one that calls `openDesktopModal()` from context.
  - MobileNavigation: on search button click, call `enterMobileMode()`; when in that mode, render `SearchMobilePanel` in place of the nav list.


## Pseudocode snippets

SearchProvider (core behaviors):
```
const SearchContext = React.createContext(...)

function SearchProvider({ children }) {
  const [mode, setMode] = useState<'none'|'desktop-modal'|'mobile-panel'>('none')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchRecord[]>([])
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const pagefind = useRef<Pagefind | null>(null)
  const cache = useRef(new Map<string, SearchRecord[]>())

  const ensurePagefind = async () => { ...dynamic import & assign... }

  const runSearch = useCallback(async (q: string, reqId: number) => {
    setLoading(true)
    try {
      await ensurePagefind()
      if (cache.current.has(q)) return applyResults(cache.current.get(q)!, reqId)
      const raw = await pagefind.current!.search(q)
      const records = await Promise.all(raw.results.map(r => r.data()).map(normalize))
      cache.current.set(q, records)
      applyResults(records, reqId)
    } catch (e) {
      // set error, show inline
    } finally {
      // only clear loading if still latest request
    }
  }, [])

  const setQueryDebounced = useDebouncedCallback((q) => {
    const req = ++lastRequestId.current
    setQuery(q)
    if (q.trim()) runSearch(q, req)
    else { setResults([]); setActiveIndex(null) }
  }, 200)

  const openDesktopModal = () => setMode('desktop-modal')
  const enterMobileMode = () => setMode('mobile-panel')
  const exitSearchMode = () => { setMode('none'); setQuery(''); setResults([]); }

  // hotkey '/'
  useEffect(() => {
    const onKey = (e) => { if (e.key === '/' && okToOpen()) openDesktopOrMobile() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <SearchContext.Provider value={{ mode, query, results, loading, activeIndex, setQuery: setQueryDebounced, ... }}>
      {children}
    </SearchContext.Provider>
  )
}
```

Desktop modal:
```
function SearchModal() {
  const { mode, setQuery, query, results, loading, activeIndex, moveActive, closeDesktopModal } = useSearch()

  return (
    <Dialog.Root open={mode === 'desktop-modal'} onOpenChange={(o) => !o && closeDesktopModal()}>
      <Dialog.Portal>
        <Dialog.Overlay ... />
        <Dialog.Content ...>
          <SearchInput autoFocus value={query} onChange={setQuery} />
          <SearchResultsList results={results} activeIndex={activeIndex} ... />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

Mobile panel within MobileNavigation:
```
function MobileNavigation(...) {
  const { mode, enterMobileMode, exitSearchMode } = useSearch()

  return (
    <Dialog.Root ...>
      <Dialog.Trigger>...</Dialog.Trigger>
      <Dialog.Content>
        <header>
          <button onClick={enterMobileMode}>Search</button>
          <button ...>Theme</button>
          <Dialog.Close>...</Dialog.Close>
        </header>

        {mode === 'mobile-panel'
          ? <SearchMobilePanel onClose={exitSearchMode} />
          : <NavList ... />
        }
      </Dialog.Content>
    </Dialog.Root>
  )
}
```

SearchMobilePanel:
```
function SearchMobilePanel({ onClose }) {
  const { query, setQuery, results, activeIndex, ... } = useSearch()
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <SearchInput autoFocus value={query} onChange={setQuery} />
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <SearchResultsList results={results} activeIndex={activeIndex} ... />
      </div>
      <div className="p-2">
        <button onClick={onClose}>Back</button>
      </div>
    </div>
  )
}
```


## Rollout plan

1) Prepare metadata
- Confirm frontmatter fields are emitted in HTML in a Pagefind-indexable way (e.g., JSON-LD/meta tags). Limit body indexing as needed.

2) Build the core (Provider + PagefindClient)
- Create `SearchProvider` and `PagefindClient` with lazy loading, caching, and debounced queries.

3) Build shared UI
- Implement `SearchInput`, `SearchResultItem`, `SearchResultsList` with site-consistent styles.
- Optionally reuse existing icon/button components where available.

4) Desktop modal
- Implement `SearchModal` with Radix Dialog and wire up hotkey ‘/’.

5) Mobile panel
- Integrate `SearchMobilePanel` into `MobileNavigation` and wire the search button to `enterMobileMode()`.

6) Theming, a11y, and QA
- Confirm dark/light mode support.
- Add screen reader announcements and keyboard navigation.
- Test on varied devices and slow networks.

7) Metrics (optional)
- Add lightweight telemetry for search queries and selections.


## Conclusion

This plan preserves Pagefind’s fast static search while giving you full control over a React-first UI on both desktop and mobile. Using Radix for primitives and shared UI components ensures consistent styling, robust accessibility, and a maintainable codebase. The provider-based design also keeps the desktop modal and mobile panel in sync while remaining decoupled from existing Astro components.

---

## Progress log (ongoing)

- Step 1 (completed): Scaffolded `SearchProvider` with:
  - Modes: `none`, `desktop-modal`, `mobile-panel`
  - Debounced `setQuery`, request coalescing, and result caching
  - Pagefind lazy loading (`/pagefind/pagefind.js`) and result normalization
  - Hotkey handler for `/` to open desktop or mobile mode
  - Public actions: `openDesktopModal`, `closeDesktopModal`, `enterMobileMode`, `exitSearchMode`, `moveActive`, `activateIndex`, `clear`
- Step 2 (completed): Added `SearchModal` (desktop) stub using Radix Dialog:
  - Reads provider state, autofocuses the input, supports basic keyboard navigation
  - Displays a simple list of results and a clear button
  - Not yet wired into the layout; safe to land incrementally
- Step 3 (pending): Wire Provider + Modal into the app layout
  - Wrap header/nav region with `SearchProvider`
  - Render one `<SearchModal />` at a high level (e.g., in Header or Base layout)
  - Replace desktop search trigger to call `openDesktopModal()`
- Step 4 (pending): Build `SearchMobilePanel` and integrate with `MobileNavigation`
  - When provider `mode === 'mobile-panel'`, replace the nav content area with results
  - Use the existing dialog header search button to call `enterMobileMode()`
  - Ensure no nested dialogs; reuse the mobile nav’s Radix dialog content
- Step 5 (pending): Shared components
  - `SearchInput`: shared input element for both desktop modal and mobile panel
  - `SearchResultItem`: consistent list item UX with type/status/year badges
  - `SearchResultsList`: scrollable list, optional virtualization
- Step 6 (pending): Finalize Pagefind data mapping
  - Verify that frontmatter (title, description, tags, type, status, year) is visible in `result.data()`
  - Adjust normalization if fields differ; tweak selection/indexing to reduce noisy body content
- Step 7 (completed): Remove dependency on `Search.astro`
  - Legacy component deleted; ensure React triggers cover both desktop and mobile flows

## Next steps checklist (actionable)

- [ ] Mount `SearchProvider` around header/nav (e.g., the React `Header` rendered from `SiteShell`)
- [ ] Render `<SearchModal />` once at the same level
- [ ] Swap desktop search trigger to call `openDesktopModal()` (old handler assumed the legacy Astro search element)
- [ ] Implement `SearchMobilePanel` and gate nav content with provider `mode`
- [ ] Replace mobile dialog header search button’s handler with `enterMobileMode()`
- [ ] Create `SearchInput`, `SearchResultItem`, `SearchResultsList` and swap them into both desktop and mobile shells
- [ ] Validate Pagefind path under the site’s base URL (adjust import path if needed)
- [ ] Cross-browser QA: focus traps, hotkeys, scrolling, dark mode
- [x] Remove `Search.astro` entirely when new React UI is verified on mobile and desktop (deleted; ensure React triggers stay wired)

## Notes and pitfalls

- Avoid hiding or unmounting the search core during mobile use; the React provider keeps state in one place and eliminates race conditions between dialog visibility and search availability.
- If the site is deployed under a base path, `/pagefind/pagefind.js` may need to be prefixed with the runtime base URL. Validate in production build.
- Keep keyboard handling centralized in the provider; components should be mostly dumb views bound to provider state.

## How to resume work quickly

- Integrate `SearchProvider` and `SearchModal` into the layout (Step 3), then:
  - Build `SearchMobilePanel` in `src/components/search/`
  - Update `MobileNavigation` to conditionally render the panel when `mode === 'mobile-panel'`
  - Replace triggers:
    - Desktop trigger: `openDesktopModal()`
    - Mobile dialog header trigger: `enterMobileMode()`
- Once both views are working, implement shared components and remove the legacy search element.
