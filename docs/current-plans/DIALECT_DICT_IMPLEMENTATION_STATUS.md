# Dialect Dictionary Implementation Status

## Overview
Adding Arabic dialect dictionary support (Egyptian, Levantine, Gulf) to Sarf.

## Phase 1: Dialect Wiktionary Build Script
- **Status**: COMPLETE
- **Deliverables**: `scripts/build-dialect-wiktionary.ts`, npm script `build:dialects`
- **Notes**:
  - lang_code values verified: arz (Egyptian), ajp (S. Levantine), apc (N. Levantine), afb (Gulf)
  - Each dialect gets unique startId range (100k, 200k, 300k) to avoid ID collisions
  - Reuses extractGlosses, mergeGlosses, deduplicateEntries, stripDiacritics from build-wiktionary.ts
  - 134/134 tests pass

## Phase 2: Expand DictSource and Compact Pipeline
- **Status**: COMPLETE
- **Notes**:
  - DictSource expanded: `'hw' | 'wk' | 'wk-egy' | 'wk-lev' | 'wk-gulf'`
  - Added DIALECT_SOURCES, DICT_LABELS exports
  - compact-dictionaries.ts now includes dialect files when present (skips if missing)
  - Added readAndCompact helper function
  - 2 new tests, 136/136 total pass

## Phase 3: Popup UI -- Dialect Dropdown and Dictionary Checkboxes
- **Status**: COMPLETE
- **Notes**:
  - Added getDialect/setDialect to dict-prefs.ts
  - Popup now shows dialect dropdown (None / Egyptian / Levantine / Gulf)
  - Wiktionary checkbox label updated to "Wiktionary (MSA)"
  - background.ts combines enabledDicts + dialect into effective source list
  - Cache clears on dialect change
  - 4 new tests for getDialect/setDialect, 140/140 total pass
