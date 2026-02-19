# Tooltip Improvements: Multi-Definition, Sizing, Visual Sections

## Phase 1: Multi-Definition Data Pipeline — COMPLETE

### Changes Made
- `extension/lib/types.ts` — Replaced `definition: string | null` + `source: string | null` with `definitions: Array<{ text: string; source: string }>`
- `extension/lib/dictionary.ts` — Added `lookupAllWords`, updated `lookupByLemma`/`lookupWithFallback`/`lookupAnalysis` to return `{ entries: DictEntry[]; rootWord: string | null }`
- `extension/entrypoints/background.ts` — Updated `enrichWithDictionary` and `morphoSysToAnalysis` for new `definitions` field
- `extension/lib/tooltip.ts` — Temporary bridge to extract first definition for rendering
- `extension/lib/__tests__/dictionary.test.ts` — Updated all lookup tests for new return types, added `lookupAllWords` tests
- `extension/lib/__tests__/tooltip.test.ts` — Updated all `MorphAnalysis` fixtures

### Verification
- 87/87 tests pass
- Typecheck clean

## Phase 2: Tooltip Rendering and CSS Overhaul — PENDING
