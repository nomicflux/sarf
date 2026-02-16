# Morphological Analysis Implementation Status

## Phase 1: Message passing infrastructure — COMPLETE
## Phase 2: Prefix/suffix stripping in Rust + tooltip display — COMPLETE
## Phase 3: Farasa API integration for root + pattern — COMPLETE
## Phase 4: Hans Wehr dictionary — COMPLETE
## Phase 5: Tooltip polish + manifest permissions — COMPLETE

## Phase 1 Details
- Created `extension/lib/types.ts` with `MorphAnalysis`, `AnalyzeRequest`, `AnalyzeResponse`
- Rewrote `extension/entrypoints/background.ts`: imports WASM, listens for "analyze" messages, returns stub MorphAnalysis
- Modified `extension/entrypoints/content.ts`: sends message to background, shows tooltip from response
- Modified `extension/lib/tooltip.ts`: accepts `MorphAnalysis` instead of `string`
- Used `type: 'module'` in defineBackground to enable ESM format (required for WASM imports in service worker)
- Tests: 10/10 pass, typecheck clean, build succeeds

## Agreements Made
- 2026-02-14: User chose "Background + messaging" for runtime architecture
- 2026-02-14: User chose "Hybrid: API + fallback" for morphological analysis data source
- 2026-02-14: User chose "Full breakdown + English translation" for tooltip display
- 2026-02-14: User chose "Same hybrid approach" for English translations (embedded Hans Wehr + API)
- 2026-02-14: User requested word caching: "No need to make repeated API calls for the same word within a session (with sensible features for regular cache clearing based on cache size or age of entries)"

## Explicitly Rejected
- Pure TypeScript analysis (rejected in favor of Rust/WASM via background messaging)
- Algorithmic-only approach (rejected in favor of hybrid API + embedded data)
- Simple parts-only display (rejected in favor of full breakdown + translation)

## Phase 2 Details
- Added serde/serde_json to Cargo.toml
- Rewrote `src/lib.rs`: `is_particle`, `strip_prefixes`, `strip_suffixes`, `analyze_word` returning JSON
- Updated `background.ts`: parses JSON from WASM, maps snake_case→camelCase
- Updated `tooltip.ts`: `renderAnalysis()` returns structured HTML with prefix/stem/suffix spans
- Created `tooltip.test.ts`: 4 tests for renderAnalysis
- Updated `tooltip.css`: styles for prefix, stem, suffix, separator, particle
- Rust tests: 14 pass, clippy clean. Extension tests: 14 pass, typecheck clean.

## Phase 3 Details
- Created `extension/lib/farasa.ts`: Farasa API client (callFarasa, farasaSegment, farasaStem)
- Created `extension/lib/cache.ts`: LRU cache with TTL (500 entries, 30min TTL)
- Background: cache check → Rust WASM → Farasa enrichment (3s timeout) → cache store
- Tooltip: shows root/pattern detail lines when present
- API key stored in chrome.storage.local, settable via devtools console
- Tests: 22 total (10 arabic + 5 tooltip + 3 farasa + 4 cache)

## Phase 4 Details
- Generated `extension/public/hanswehr.json` from SQLite (24,799 entries, 5.4MB)
- Created `extension/lib/dictionary.ts`: DictIndex with byWord + byId maps, pure lookup functions
- Created `extension/lib/__tests__/dictionary.test.ts`: 7 tests with sample data
- Background loads dictionary at startup, enriches analysis with definition + root
- Tooltip shows definition in LTR italic text
- Priority: Farasa root > dictionary root; dictionary definition always
- Tests: 30 total pass, typecheck clean, build succeeds

## Phase 5 Details
- Added `"storage"` permission to manifest (for Farasa API key)
- Created `extension/lib/debounce.ts`: pure debounce helper (100ms on mousemove)
- Added `clampPosition` to tooltip.ts: keeps tooltip within viewport bounds
- Responsive tooltip max-width: `min(300px, 90vw)`
- Tests: 35 total pass (3 debounce + 2 clampPosition new)

## Issues Encountered
- Background service worker IIFE format doesn't support WASM imports (top-level await). Fixed by using `type: 'module'` in `defineBackground()` to output ESM format.
