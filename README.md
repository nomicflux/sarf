# Sarf — Arabic Morphology Browser Extension

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
│   │   ├── alkhalil.ts           # AlKhalil MorphoSys API client
│   │   ├── arabic.ts             # Arabic text utilities
│   │   ├── cache.ts              # TTL cache for analysis results
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
│   │   └── dict-compact.json     # Bundled dictionary data (loaded into IndexedDB)
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
3. The background script calls the [AlKhalil MorphoSys](http://oujda-nlp-team.net/) API for morphological analysis
4. It then looks up definitions in **IndexedDB** (populated from the bundled compact dictionary on first load)
5. Results are filtered by the user's dictionary preferences and sent back to the content script
6. The **tooltip** renders the analysis with color-coded morphemes and expandable definitions
