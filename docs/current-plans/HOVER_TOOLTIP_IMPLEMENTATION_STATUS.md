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
- **Status**: COMPLETE
- **Completed**: 2026-02-14
- **Details**:
  - Rewrote `extension/entrypoints/content.ts` to import helpers and CSS
  - Implemented main() handler with ctx.addEventListener for automatic cleanup
  - Created onMouseMove handler (8 lines) that:
    - Calls getTextAtPoint(clientX, clientY)
    - Extracts word using extractWordAtOffset()
    - Checks containsArabic() before showing tooltip
    - Shows/hides tooltip appropriately
  - `pnpm test` — 10/10 pass
  - `pnpm run typecheck` — clean
  - `pnpm run build` — succeeds (CSS bundled to content-scripts/content.css)

## Agreements Made
- Tokenization is simple: split by spaces and punctuation
- Morphological analyzer handles prefixes/suffixes, not this feature
- Deliverable: tooltip shows the hovered Arabic word, nothing else

## Explicitly Rejected
- (none yet)

## Issues Encountered
- (none yet)
