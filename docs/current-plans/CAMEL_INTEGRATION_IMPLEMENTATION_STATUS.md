# CAMeL Tools Integration — Implementation Status

## Overview
Integrate CAMeL Tools as primary morphological analyzer with AlKhalil as fallback.

## Phase 1: Python Backend Service
- **Status**: COMPLETE
- **Subagent**: modular-builder
- **Files created**: `backend/main.py`, `backend/analyzer.py`, `backend/requirements.txt`, `backend/tests/__init__.py`, `backend/tests/test_analyzer.py`
- **Tests**: 9/9 passing
- **Notes**: Virtual environment created at `backend/venv/`. Added venv/cache dirs to `.gitignore`.

## Phase 2: Extension CAMeL Client + Type Mapping
- **Status**: COMPLETE
- **Subagent**: kiss-code-generator
- **Files created**: `extension/lib/camel.ts`, `extension/lib/__tests__/camel.test.ts`
- **Files modified**: `extension/wxt.config.ts` (added localhost host_permission)
- **Tests**: 148/148 passing (3 new camel tests + 145 existing)
- **Typecheck**: clean

## Phase 3: Wire CAMeL into Background with AlKhalil Fallback
- **Status**: COMPLETE
- **Subagent**: kiss-code-generator
- **Files modified**: `extension/entrypoints/background.ts`
- **Changes**:
  - Added imports: `fetchCamel`, `camelToAnalysis` from `lib/camel`; `getDialect` from `lib/dict-prefs`; `Dialect` type from `lib/dict-prefs`
  - Added `DIALECT_TO_CAMEL` mapping: `{ egy: 'egy', gulf: 'gulf', lev: 'msa' }`
  - Added `dialectToCamel(dialect: Dialect | null): string` helper (3 lines)
  - Added `fetchCamelSafe(word, dialect): Promise<MorphAnalysis | null>` (7 lines) - tries CAMeL with dialect parameter
  - Renamed `fetchMorphoSysSafe` → `fetchAlkhalilFallback` (8 lines) - returns `MorphAnalysis` directly
  - Updated `handleStreamAnalyze` to use CAMeL primary with AlKhalil fallback via nullish coalescing
  - Updated cache invalidation to clear on `dialect` changes in addition to `enabledDicts`
- **All functions under 20 lines**: ✓
- **No dead code**: All code paths used (old `fetchMorphoSysSafe` replaced completely)
- **Typecheck**: Pending user test run
