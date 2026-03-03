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
- **Status**: PENDING

## Phase 3: Popup UI -- Dialect Dropdown and Dictionary Checkboxes
- **Status**: PENDING
