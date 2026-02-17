# Morphological Analysis Implementation Status

## Phase 1: Message passing infrastructure — COMPLETE
## Phase 2: Prefix/suffix stripping in Rust + tooltip display — COMPLETE
## Phase 3: Farasa API integration for root + pattern — COMPLETE
## Phase 4: Hans Wehr dictionary — COMPLETE
## Phase 5: Tooltip polish + manifest permissions — COMPLETE
## Phase 6: Verb prefix stripping + dictionary fallback — COMPLETE
## Phase 7: Transparent failure display in tooltip — COMPLETE
## Phase 8: AlKhalil Root Extractor as Farasa fallback — COMPLETE

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

## Phase 6 Details
- Added `strip_verb_prefix` to `src/lib.rs`: strips أ/ت/ي/ن verb prefixes from stems ≥3 chars
- Added `verb_stem: Option<String>` to `AnalysisResult` — carries the verb-prefix-stripped stem
- Added `lookupWithFallback` to `extension/lib/dictionary.ts`: tries stem first, then verbStem fallback
- Updated `MorphAnalysis` type with `verbStem: string | null`
- Updated `parseAnalysis` to map `verb_stem` → `verbStem`
- Updated `enrichWithDictionary` to use `lookupWithFallback` instead of separate lookup calls
- Rust tests: 18 pass (4 new), clippy clean. Extension tests: 38 pass (3 new dictionary fallback), typecheck clean.

## Phase 7 Details
- Added `renderRoot` and `renderDefinition` helpers to `tooltip.ts`
- Non-particle words now always show root and definition lines
- Missing root shows "Root: —" with `sarf-missing` class (opacity: 0.5)
- Missing definition shows "No definition found" with `sarf-missing` class
- Particles unchanged — no missing indicators shown
- Added `.sarf-missing { opacity: 0.5; }` to `tooltip.css`
- Tests: 41 pass (3 new tooltip tests for missing states), typecheck clean

## Agreements Made (Phase 6-7)
- 2026-02-14: User: "Failed calls and lookups should still show the rest of the information, and make the failures clear."

## Phase 8 Details
- Created `extension/lib/alkhalil.ts`: AlKhalil API client (alkhalilRoot, parseAlkhalilResponse)
- API: GET `http://oujda-nlp-team.net:8080/api/ApiRacine/{word}` — returns `{{word:root}}` format
- Created `extension/lib/timeout.ts`: extracted shared `withTimeout` utility from background.ts
- Integrated into pipeline: WASM → Farasa (if key) → AlKhalil (no key needed) → Dictionary
- `enrichWithAlkhalil` short-circuits if root already found or word is particle
- 3-second timeout, silent failure on error (falls through to dictionary)
- HTTP note: AlKhalil only serves HTTP; Chrome extension background scripts are not subject to mixed-content restrictions
- Tests: 48 total pass (5 alkhalil + 2 timeout new), typecheck clean

## Agreements Made (Phase 8)
- 2026-02-16: User chose "AlKhalil as fallback" — use when Farasa is unavailable or fails

## Explicitly Rejected (Phase 8)
- Replacing Farasa entirely (user chose fallback, not replacement)

## Phase 9: AlKhalil MorphoSys Integration — COMPLETE
- Added MorphoSys as primary morphological analysis pipeline
- POST `http://oujda-nlp-team.net:8081/api/alkhalil` with `textinput={word}` — returns full XML morphological analysis
- New pure functions: `extractMorpheme`, `parseProcField`, `parseEncField`, `parseMorphoSysXml` in alkhalil.ts
- New `fetchMorphoSys` API client for MorphoSys endpoint
- Added `lemma: string | null` to `MorphAnalysis` type
- Added `stripDiacritics` and `lookupByLemma` to dictionary.ts for lemma-based dictionary lookup
- Pipeline: MorphoSys → [success] lemma-based lookup / [failure] WASM → Farasa → AlKhalil root → dictionary
- `enrichWithDictionary` tries lemma lookup first, falls back to stem/verbStem
- Tests: 63 total pass (15 new), typecheck clean

## Agreements Made (Phase 9)
- 2026-02-16: User chose "Yes, replace" manual stripping with a real service
- 2026-02-16: User chose "Find another service" (not Farasa, not heuristics-only)
- 2026-02-16: AlKhalil MorphoSys discovered — free, no key, full morphological analysis

## Explicitly Rejected (Phase 9)
- Farasa segmentation (requires API key — user rejected)
- Fixing heuristics only (user wants real morphological understanding)
- Web API-only search (user corrected: solutions include client-side, not just web APIs)

## Issues Encountered
- Background service worker IIFE format doesn't support WASM imports (top-level await). Fixed by using `type: 'module'` in `defineBackground()` to output ESM format.
- `تلقب` showed bare word because ت (verb prefix) was not stripped and `تلقب` is not a dictionary headword. Fixed by adding verb prefix stripping + dictionary fallback lookup.
