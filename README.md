# Sarf — Arabic Morphology Browser Extension

[![License: CC BY 4.0](https://img.shields.io/badge/License-CC_BY_4.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)

A browser extension that shows morphological analysis and dictionary definitions for Arabic words on any webpage. Hover over an Arabic word to see its root, pattern, part of speech, and definitions from Hans Wehr and Wiktionary.

## Using the Extension

**Hover** over any Arabic word on a webpage to see a tooltip with:

- **Morpheme breakdown** — prefixes, stem, and suffixes, color-coded
- **Root** — the Arabic root letters
- **Lemma** — dictionary form(s)
- **Part of speech** — with grammatical features (gender, number, etc.)
- **Pattern** — morphological pattern when available
- **Definitions** — from Hans Wehr and/or Wiktionary

**Click** a word to pin the tooltip so it stays visible while you interact with the page. Click elsewhere to dismiss it.

**Dictionary selection** — click the extension icon to open a popup where you can choose which dictionaries to include (Hans Wehr, Wiktionary, or both). Unchecking both hides the definitions section entirely. Your selection persists across sessions.

## Project Layout

```
sarf/
├── extension/                    # Browser extension (WXT + TypeScript)
│   ├── entrypoints/
│   │   ├── content.ts            # Content script — hover/click handling
│   │   ├── background.ts         # Background script — analysis + dictionary lookup
│   │   └── popup/                # Extension popup — dictionary checkboxes
│   │       ├── index.html
│   │       └── main.ts
│   ├── lib/
│   │   ├── alkhalil.ts           # AlKhalil MorphoSys API client (fallback)
│   │   ├── arabic.ts             # Arabic text utilities
│   │   ├── cache.ts              # TTL cache for analysis results
│   │   ├── camel.ts              # CAMeL analysis type conversion
│   │   ├── dict-prefs.ts         # Dictionary selection preferences (chrome.storage)
│   │   ├── dict-store.ts         # IndexedDB dictionary store
│   │   ├── dictionary.ts         # Dictionary lookup with fallback strategies
│   │   ├── filter.ts             # Filter dictionary entries by source
│   │   ├── timeout.ts            # Promise timeout utility
│   │   ├── tooltip.ts            # Tooltip rendering
│   │   ├── types.ts              # Shared TypeScript types
│   │   └── __tests__/            # Vitest unit tests
│   ├── assets/
│   │   └── tooltip.css           # Tooltip styles
│   ├── public/
│   │   ├── dict-compact.json     # Bundled dictionary data (loaded into IndexedDB)
│   │   ├── pyodide/              # Pyodide runtime + CAMeL Tools (local analysis)
│   │   │   ├── offscreen.html    # Offscreen document entry point
│   │   │   ├── offscreen.js      # Pyodide loader + multi-dialect analysis engine
│   │   │   ├── data/             # Gzip-compressed morphology databases
│   │   │   └── [runtime files]   # Pyodide WASM, stdlib, Python wheels
│   ├── wxt.config.ts             # WXT/manifest configuration
│   └── package.json
├── scripts/
│   ├── build-wiktionary.ts       # Downloads + processes Wiktionary Arabic data
│   └── compact-dictionaries.ts   # Merges Hans Wehr + Wiktionary into compact format
└── pkg/                          # Legacy WASM build artifacts (unused)
```

## Building

Prerequisites: Node.js and pnpm.

```bash
cd extension
pnpm install
```

**Development** (auto-reloads on changes):

```bash
pnpm dev           # Chrome
pnpm dev:firefox   # Firefox
```

**Production build**:

```bash
pnpm build           # Chrome — output in .output/chrome-mv3
pnpm build:firefox   # Firefox
```

**Package for distribution**:

```bash
pnpm zip             # Chrome
pnpm zip:firefox     # Firefox
```

## Testing

```bash
cd extension
pnpm test            # Run all tests (Vitest)
pnpm run typecheck   # TypeScript type checking
```

## Rebuilding Dictionary Data

The compact dictionary file (`extension/public/dict-compact.json`) is checked into the repo. To rebuild it from source:

1. Download and process Wiktionary data:
   ```bash
   cd extension
   pnpm run build:wiktionary
   ```

2. Merge sources into the compact format:
   ```bash
   npx tsx ../scripts/compact-dictionaries.ts
   ```

## How It Works

1. The **content script** listens for mouse movement over Arabic text on any webpage
2. When a word is detected, it sends a message to the **background script**
3. The background script forwards the word to an **offscreen document** running [Pyodide](https://pyodide.org/) (Python in WebAssembly), which loads [CAMeL Tools](https://github.com/CAMeL-Lab/camel_tools) for morphological analysis — entirely local, no network request
4. If Pyodide analysis fails, the extension falls back to the [AlKhalil MorphoSys](http://alkhalil.oujda-nlp-team.net/AlKhalil-MorphoSys.php) API (network request)
5. Definitions are looked up in **IndexedDB** (populated from the bundled compact dictionary on first load)
6. Results are filtered by the user's dictionary preferences and sent back to the content script
7. The **tooltip** renders the analysis with color-coded morphemes and expandable definitions

## External Services

**Primary analysis** runs entirely locally using [CAMeL Tools](https://github.com/CAMeL-Lab/camel_tools) via [Pyodide](https://pyodide.org/) (Python compiled to WebAssembly). Morphology databases for Gulf, MSA, and Egyptian Arabic are bundled with the extension. No word is sent to any external service for primary analysis.

**[AlKhalil MorphoSys](http://alkhalil.oujda-nlp-team.net/AlKhalil-MorphoSys.php)** — morphosyntactic analyzer for Standard Arabic, developed by [Université Mohammed Premier](https://www.sciencedirect.com/science/article/pii/S131915781630026X) (Oujda, Morocco). Used as a **fallback only** when Pyodide analysis fails. When triggered, the hovered Arabic word is sent to their API. No other page content is transmitted.
