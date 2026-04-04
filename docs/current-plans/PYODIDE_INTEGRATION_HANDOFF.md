# Pyodide Integration — Handoff

## Current State

Phases 1-3 are committed. Wiring fix committed as `7032540` (2026-03-20).

### Commits
- `f4491a6` — Phase 1: Gzip-compressed morphology DBs in `extension/public/pyodide/data/`
- `a95452e` — Phase 2: Pyodide runtime, offscreen document, background.ts integration
- `dc1dbae` — Phase 3: README.md and PRIVACY.md updates
- `7032540` — Wiring fix: callback-based sendMessage + .catch() on handleStreamAnalyze

### Status after wiring fix
- CAMeL/Pyodide results DO reach the tooltip
- Service worker console shows logs
- But the CAMeL display is broken (garbled prefixes/suffixes, bad root, bad pattern)
- AlKhalil display is fine
- Next task: understand the CAMeL data before fixing display — see `CAMEL_DATA_UNDERSTANDING.md`

## Build/Test Commands

```bash
cd extension
pnpm test        # Vitest
pnpm typecheck   # tsc --noEmit
pnpm build       # Production build → .output/chrome-mv3/
```
