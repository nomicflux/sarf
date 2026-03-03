# Dialect/Dictionary Separation — Implementation Status

## Goal
Separate the concept of "dialect" from "dictionary source" so the popup dropdown shows dialect names ("Egyptian", "Levantine", "Gulf") instead of dictionary names.

## Phase 1: Add Dialect type and update dict-prefs module — COMPLETE
- Added `Dialect` type (`'egy' | 'lev' | 'gulf'`)
- Added `DIALECT_LABELS` mapping dialects to display names
- Added `DIALECT_DICTS` mapping dialects to their `DictSource[]`
- Derived `DIALECT_SOURCES` from `DIALECT_DICTS`
- Updated `getDialect()`/`setDialect()` to use `Dialect` type
- Added 3 new tests for the new constants
- Updated 2 existing dialect tests to use new `Dialect` values
- All 144 tests pass

## Phase 2: Update popup to use Dialect type and labels — COMPLETE
- Updated import to include `Dialect`, `DIALECT_LABELS`, `DIALECT_DICTS`
- `getVisibleSources` now takes `Dialect | null`, returns `DIALECT_DICTS[dialect]`
- `buildDialectDropdown` iterates `DIALECT_LABELS` and shows dialect names ("Egyptian", "Levantine", "Gulf")
- Dialect change handler uses `DIALECT_DICTS[newDialect]` to spread dict sources
- All 144 tests pass

## Phase 3: Clean up and verify end-to-end — COMPLETE
- All 144 tests pass
- TypeScript compiles with no errors
- All `wk-egy`/`wk-lev`/`wk-gulf` references are in correct locations only (DictSource type, DIALECT_DICTS mapping, DICT_LABELS, dictionary data)
- No stale dialect references in popup code

## Storage Migration Note
Stored `dialect` value changed from `'wk-egy'` to `'egy'`. Existing users with stale values silently fall back to MSA (null default). No migration code needed.
