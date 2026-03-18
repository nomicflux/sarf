# Pyodide + CAMeL Tools Prototype — Implementation Status

## Overview
Chrome MV3 extension prototype testing Pyodide + CAMeL Tools in an offscreen document.
User clicks Arabic word on any webpage → analysis overlay with timing appears.

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

**CSP constraints discovered**:
- MV3 `extension_pages` CSP does NOT allow remote script sources
- Must bundle ALL Pyodide runtime files locally (pyodide.js, pyodide.asm.js, pyodide.asm.wasm, pyodide-lock.json, python_stdlib.zip)
- `loadPyodide({indexURL: "./"})` loads from local bundle

**CATALOGUE workaround** (source: https://github.com/CAMeL-Lab/camel_tools/blob/master/camel_tools/data/catalogue.py)
- `from camel_tools.morphology.database import MorphologyDB` triggers `load_catalogue()` at module import time
- Fix: Set `CAMELTOOLS_DATA` env var, write minimal catalogue.json before importing
- `MorphologyDB(fpath)` accepts direct file path

**micropip** (source: https://micropip.pyodide.org/en/stable/project/api.html)
- `micropip.install('camel-tools', deps=False)` — confirmed valid

**morphology.db format**: Text file (NOT SQLite) — custom tab/space-delimited format.

### Files created
- `prototype/data/morphology.db` — Gulf dialect DB (7,976,670 bytes) from CAMeL-Lab release 2022.03.30
- `prototype/pyodide.js` — Pyodide loader bundled locally
- `prototype/pyodide.asm.js`, `pyodide.asm.wasm`, `pyodide-lock.json`, `python_stdlib.zip` — full Pyodide runtime bundled locally

## Phase 2: Extension Shell + Pyodide in Offscreen Document
**Status**: COMPLETE (superseded by Phase 3 rewrites)

Created initial extension shell. Files were rewritten in Phase 3 to support full pipeline.

## Phase 3: Full Pipeline — Click Word on Page, See Analysis + Timing
**Status**: COMPLETE (pending manual verification)

### Architecture
```
content.js  →  background.js  →  offscreen.js
(click word)    (relay + stats)    (Pyodide + CAMeL)
(show overlay)←     ←              (analyze word)
```

### Files created/modified
- `prototype/manifest.json` — added content_scripts, host_permissions, popup action
- `prototype/background.js` — message relay between content script ↔ offscreen, stats accumulator
- `prototype/offscreen.js` — lazy Pyodide init, CAMeL package install, DB load, analysis service
- `prototype/content.js` — click handler, Arabic word extraction, analysis overlay
- `prototype/popup.html` — timing dashboard
- `prototype/popup.js` — renders init + per-word latency stats

### How it works
1. User clicks Arabic word on any webpage
2. Content script extracts word, sends to background
3. Background ensures offscreen doc exists, forwards request
4. Offscreen initializes Pyodide+CAMeL on first request (lazy), then analyzes word
5. Result returns to content script, overlay shown near clicked word with timing
6. Popup shows accumulated timing dashboard (init costs + per-word latencies)

### Verification
1. Load `prototype/` as unpacked extension
2. Navigate to Arabic Wikipedia or any Arabic text page
3. Click an Arabic word → overlay appears with analysis + timing
4. Click extension icon → popup shows timing stats
