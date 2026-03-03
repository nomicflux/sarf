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

## Phase 2: Update popup to use Dialect type and labels — PENDING

## Phase 3: Clean up and verify end-to-end — PENDING
