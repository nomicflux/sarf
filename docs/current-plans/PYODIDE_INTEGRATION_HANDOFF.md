# Pyodide Integration — Handoff

## Current State

Phases 1-3 are committed. Phase 1 wiring fix applied (2026-03-20).

### Commits
- `f4491a6` — Phase 1: Gzip-compressed morphology DBs in `extension/public/pyodide/data/`
- `a95452e` — Phase 2: Pyodide runtime, offscreen document, background.ts integration
- `dc1dbae` — Phase 3: README.md and PRIVACY.md updates

### Phase 1 Wiring Fix (2026-03-20)
Three unjustified differences between prototype and extension were identified and fixed:

1. **Bug #6 — Missing `.catch()` on `handleStreamAnalyze`**: Any error in the async chain was silently swallowed. Fixed by adding `.catch()` that sends error back via port.
2. **Bug #2 — Promise-based vs callback-based `sendMessage`**: Extension used `await chrome.runtime.sendMessage(msg)` (Promise form). Prototype uses callback form `sendMessage(msg, callback)`. Switched to callback-based wrapped in Promise.
3. **Bug #3 — 30s timeout**: Kept as-is (reasonable guard). May revisit if Pyodide init takes longer.

All changes in `extension/entrypoints/background.ts` only. Typecheck, tests (148), and build all pass.

## Unsolved Problem

`console.log('[sarf] sending to offscreen:', word, dialect)` on line 90 of `extension/entrypoints/background.ts` does not produce output. The user has the DevTools inspector open the entire time. The function must be called because AlKhalil results appear (meaning `handleStreamAnalyze` runs line 67, which calls `fetchPyodideAnalysis` before the `??` fallback). The logging string IS present in the built output at `extension/.output/chrome-mv3/background.js`.

## What The Previous Agent Failed To Do

The previous agent read the code but never actually investigated. Specifically:

1. **Never verified that `fetchPyodideAnalysis` is actually entered at runtime.** The reasoning that "AlKhalil results appear therefore fetchPyodideAnalysis was called" is an ASSUMPTION that was never verified. The next agent must verify this — not assume it.

2. **Never fetched Chrome API documentation** for `chrome.offscreen.createDocument`, `chrome.runtime.sendMessage` (Promise vs callback forms), or MV3 service worker behavior. Every assumption about how these APIs behave at runtime is unverified.

3. **Never did a systematic line-by-line diff** between the working prototype (`prototype/background.js`, `prototype/offscreen.js`) and the broken extension (`extension/entrypoints/background.ts`, `extension/public/pyodide/offscreen.js`). Surface differences were noted but never rigorously analyzed.

4. **Never explained the core contradiction**: the code trace says console.log should fire, but it doesn't. This contradiction was dismissed with speculation ("stale DevTools context") instead of resolved with evidence.

## What Needs To Be Done

1. **Verify whether `fetchPyodideAnalysis` is actually entered.** Do not assume. Prove it.
2. **Verify every runtime API call** in the chain (`chrome.offscreen.createDocument`, `chrome.runtime.sendMessage`) by fetching and reading the actual Chrome API docs.
3. **Systematically diff prototype vs extension.** Every difference is a candidate cause. Justify every difference or fix it.
4. **Resolve the logging contradiction.** If the code says console.log should fire and it doesn't, one of your assumptions about the code is wrong. Find which one.
5. Once the above are resolved: fix whatever is broken so Pyodide is the primary analyzer with AlKhalil as fallback.

## Key Differences Between Prototype and Extension (Not Yet Investigated)

| Aspect | Prototype | Extension |
|--------|-----------|-----------|
| Build system | Raw JS, no build | WXT + TypeScript → minified JS |
| Content→Background messaging | `chrome.runtime.onMessage` (one-shot) | `chrome.runtime.onConnect` (port-based) |
| Background→Offscreen messaging | `sendMessage(msg, callback)` — callback-based | `sendMessage(msg)` — Promise-based (no callback) |
| Dialect support | Single dialect, hardcoded | Multi-dialect via `dialect` parameter |
| Database format | Plain text `morphology.db` | Gzip-compressed `morphology-{dialect}.db.gz` |
| Timeout | None | 30 seconds via `withTimeout` |

**None of these differences have been verified as the cause.** They are observations, not conclusions.

## Working Reference

The `prototype/` directory contains a working standalone Pyodide extension:
- `prototype/background.js` — working background script (31 lines)
- `prototype/offscreen.js` — working offscreen analysis engine (154 lines)
- `prototype/offscreen.html` — working offscreen document

The extension's equivalent files:
- `extension/entrypoints/background.ts` (152 lines)
- `extension/public/pyodide/offscreen.js` (167 lines)
- `extension/public/pyodide/offscreen.html`

## Build/Test Commands

```bash
cd extension
pnpm test        # Vitest
pnpm typecheck   # tsc --noEmit
pnpm build       # Production build → .output/chrome-mv3/
```

## Previous Agent's Failures (For The Next Agent To Avoid)

- Speculated instead of investigating. Used "most likely", "probably" dozens of times without evidence.
- Contradicted user's runtime observations (user said DevTools was open; agent said "stale context").
- Proposed fixes for unproven problems (callback vs Promise sendMessage, race conditions — none verified).
- Used one method (read code and think) and when it didn't work, repeated it for thousands of tokens instead of changing approach.
- Said "I don't know" without exhausting available investigation methods (fetching API docs, checking WXT docs, systematic diffing).
