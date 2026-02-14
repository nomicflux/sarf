# Hover Tooltip Implementation Status

## Phase 1: Vitest setup + Arabic helper pure functions
- **Status**: COMPLETE
- **Completed**: 2026-02-14
- **Details**:
  - Added vitest devDependency and `"test": "vitest run"` script
  - Created `vitest.config.ts` with WxtVitest plugin
  - Created `lib/arabic.ts` with `containsArabic()` and `extractWordAtOffset()`
  - Created `lib/__tests__/arabic.test.ts` with 10 tests (all passing)

## Phase 2: Tooltip helpers, CSS, and hit-test bridge
- **Status**: COMPLETE
- **Completed**: 2026-02-14
- **Details**:
  - Created `assets/tooltip.css` with `.sarf-tooltip` and `.sarf-visible` classes
  - Created `lib/tooltip.ts` with `createTooltipElement()`, `showTooltip()`, `hideTooltip()`
  - Created `lib/hit-test.ts` with `getTextAtPoint()` (Chrome + Firefox fallback)
  - `pnpm test` — 10/10 pass
  - `pnpm run typecheck` — clean

## Phase 3: Wire content script with mousemove handler
- **Status**: PENDING

## Agreements Made
- Tokenization is simple: split by spaces and punctuation
- Morphological analyzer handles prefixes/suffixes, not this feature
- Deliverable: tooltip shows the hovered Arabic word, nothing else

## Explicitly Rejected
- (none yet)

## Issues Encountered
- (none yet)
