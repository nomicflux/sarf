# Pyodide + CAMeL Tools Prototype — Implementation Status

## Overview
Chrome MV3 extension prototype testing Pyodide + CAMeL Tools in an offscreen document.

## Phase 1: Research + Gulf DB Acquisition
**Status**: COMPLETE

### API Research Findings

**Chrome Offscreen API** (source: https://developer.chrome.com/docs/extensions/reference/api/offscreen)
- `chrome.offscreen.createDocument({url: string, reasons: Reason[], justification: string}): Promise<void>`
- Valid reasons include `WORKERS` (appropriate for compute workloads)
- Only one offscreen document can exist at a time per profile
- Messaging via `chrome.runtime.sendMessage()` / `chrome.runtime.onMessage.addListener()`
- URL must be a static HTML file bundled with the extension

**Pyodide JS API** (source: https://pyodide.org/en/stable/usage/api/js-api.html)
- `loadPyodide({indexURL?, env?, packages?, ...}): Promise<PyodideAPI>`
- `<script src="pyodide.js">` works (places `loadPyodide` on `globalThis`)
- `wasm-unsafe-eval` CSP is sufficient for Pyodide WASM compilation

**CSP constraint discovered**: MV3 `extension_pages` CSP does NOT allow remote script sources. Must bundle `pyodide.js` locally. WASM/packages can still load from CDN via fetch().

**CATALOGUE workaround** (source: https://github.com/CAMeL-Lab/camel_tools/blob/master/camel_tools/data/catalogue.py)
- `from camel_tools.morphology.database import MorphologyDB` triggers `load_catalogue()` at module import time
- If catalogue.json missing, it tries to download from network (will fail in Pyodide)
- Fix: Set `CAMELTOOLS_DATA` env var, write minimal `{"version":"0.0.0","packages":{},"components":{}}` to `$CAMELTOOLS_DATA/catalogue.json` before importing
- `MorphologyDB(fpath)` accepts direct file path — no catalogue needed for actual DB loading

**micropip** (source: https://micropip.pyodide.org/en/stable/project/api.html)
- `micropip.install(requirements, deps=True, ...)` — `deps=False` confirmed valid
- Only installs pure Python wheels or wasm32/emscripten wheels

**morphology.db format**: Text file (NOT SQLite) — custom tab/space-delimited format. No native DB driver needed.

### Files created
- `prototype/data/morphology.db` — Gulf dialect DB (7,976,670 bytes) from CAMeL-Lab release 2022.03.30
- `prototype/pyodide.js` — Pyodide loader (18,597 bytes) from CDN v0.29.3, bundled locally for MV3 CSP compliance

## Phase 2: Extension Shell + Pyodide in Offscreen Document
**Status**: COMPLETE

### Files created
- `prototype/manifest.json` — MV3 manifest with offscreen permission, local CSP (`'self' 'wasm-unsafe-eval'`)
- `prototype/background.js` — Creates offscreen doc on install, waits for "ready" signal, sends "init", logs timings
- `prototype/offscreen.html` — Loads local `pyodide.js` and `offscreen.js`
- `prototype/offscreen.js` — Signals "ready", listens for "init", loads Pyodide from CDN indexURL, reports timing

### Design decisions
- Offscreen doc signals "ready" before background sends "init" (avoids race condition)
- `loadPyodide({indexURL: CDN})` fetches WASM from CDN (fetch not restricted by script-src CSP)
- Reason: `WORKERS` (compute workload)

### Verification
Load `prototype/` as unpacked extension at `chrome://extensions`. Service worker console should show `[pyodide_init] Nms`.

## Phase 3: CAMeL Analysis + Full Benchmarks
**Status**: NOT STARTED
