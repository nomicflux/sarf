# Sarf v1.1.0 Implementation Status

## Phase 1: POS Language Preference and Translation
**Status**: COMPLETE

**Files Created:**
- `extension/lib/pos-translate.ts` -- PosLanguage type, translatePosTag, translatePosFeature, translatePos
- `extension/lib/__tests__/pos-translate.test.ts` -- 7 tests

**Files Modified:**
- `extension/lib/dict-prefs.ts` -- added getPosLanguage/setPosLanguage, re-exports PosLanguage
- `extension/lib/__tests__/dict-prefs.test.ts` -- 3 new tests for POS prefs
- `extension/lib/tooltip.ts` -- renderPos/renderAnalysis/showTooltip now accept PosLanguage param
- `extension/lib/__tests__/tooltip.test.ts` -- all renderAnalysis calls updated, 1 new English POS test
- `extension/entrypoints/content.ts` -- reads posLang from storage, listens for changes, passes to showTooltip
- `extension/entrypoints/popup/index.html` -- "Settings" header, Dictionaries/POS Language sections, radio buttons
- `extension/entrypoints/popup/main.ts` -- wires POS language radio buttons

**Verification:** 121 tests pass, 0 type errors

## Phase 2: Progressive Rendering via Port Streaming
**Status**: COMPLETE

**Files Created:**
- `extension/lib/stream-types.ts` -- StreamMessage union type, AnalyzePortMessage, PartialMorph, isAnalyzePortMessage type guard
- `extension/lib/__tests__/stream-types.test.ts` -- 4 tests for type guard

**Files Modified:**
- `extension/lib/types.ts` -- removed unused AnalyzeRequest/AnalyzeResponse (replaced by stream-types)
- `extension/lib/tooltip.ts` -- extracted renderMorphHtml, added renderLoadingHtml, showLoadingTooltip, updateTooltipMorph, updateTooltipDict
- `extension/lib/__tests__/tooltip.test.ts` -- 7 new tests for progressive rendering functions
- `extension/entrypoints/background.ts` -- replaced onMessage with onConnect port-based streaming (morph → dict messages)
- `extension/entrypoints/content.ts` -- replaced sendMessage with port client, progressive tooltip updates
- `extension/assets/tooltip.css` -- added .sarf-loading pulse animation

**Verification:** 132 tests pass, 0 type errors

## Phase 3: Version Bump to 1.1.0
**Status**: PENDING
