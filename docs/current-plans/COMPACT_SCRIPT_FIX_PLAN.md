# Fix: compact-dictionaries.ts

## Problem

`compact-dictionaries.ts` main block tries to read `hanswehr.json` from `extension/public/`. That file does not exist and has never existed in this working tree. It was removed in commit `fe3e3c1`.

The actual state of `extension/public/`:
- `dict-compact.json` — 7.4MB, contains hw + wk entries already compacted as `[word, definition, rootWord, source]` tuples
- `wiktionary.json` — 5.2MB, raw OldDictEntry[] built by `build:wiktionary`
- `wiktionary-egy.json` — 0.14MB, raw OldDictEntry[] built by `build:dialects`
- `wiktionary-lev.json` — 0.58MB, raw OldDictEntry[] built by `build:dialects`
- `wiktionary-gulf.json` — 0.12MB, raw OldDictEntry[] built by `build:dialects`
- **No `hanswehr.json`**

## What the compact script needs to do

Read the existing `dict-compact.json` (which already has hw + wk data), strip out any old dialect entries if present, compact the three dialect JSON files, append them, and write the result back.

This way:
- hw data is preserved from the existing compact file (no raw source needed)
- wk data is preserved from the existing compact file (no raw source needed)
- Dialect data is freshly compacted from the raw dialect JSONs
- The script is re-runnable (strips old dialect entries before appending new ones)

## Phase 1: Rewrite compact-dictionaries.ts main block

**Subagent**: kiss-code-generator

**Code Style Checklist**:
- [ ] Functions <20 lines, <10 preferred
- [ ] Pure functions, no side effects in logic
- [ ] No dead code
- [ ] No defensive coding
- [ ] Tests for all new functions

### Changes to `scripts/compact-dictionaries.ts`

The exported pure functions (`resolveRootWords`, `compactEntry`, `compactDictionary`, `readAndCompact`) stay unchanged.

Add one new exported pure function:

```typescript
export function filterOutSources(entries: CompactEntry[], sourcesToRemove: string[]): CompactEntry[] {
  return entries.filter(entry => !sourcesToRemove.includes(entry[3]));
}
```

Rewrite the `if (require.main === module)` block:

```typescript
if (require.main === module) {
  const publicDir = path.join(__dirname, '../extension/public');
  const compactPath = path.join(publicDir, 'dict-compact.json');

  const DIALECT_FILES = [
    { file: 'wiktionary-egy.json', source: 'wk-egy' },
    { file: 'wiktionary-lev.json', source: 'wk-lev' },
    { file: 'wiktionary-gulf.json', source: 'wk-gulf' },
  ];

  const dialectSources = DIALECT_FILES.map(d => d.source);

  // Read existing compact data (has hw + wk already)
  const existing = JSON.parse(fs.readFileSync(compactPath, 'utf-8')) as CompactEntry[];

  // Remove any old dialect entries so this script is re-runnable
  const base = filterOutSources(existing, dialectSources);

  // Compact each dialect file and append
  const dialectEntries: CompactEntry[] = [];
  for (const { file, source } of DIALECT_FILES) {
    const filePath = path.join(publicDir, file);
    dialectEntries.push(...readAndCompact(filePath, source));
  }

  const combined = [...base, ...dialectEntries];

  fs.writeFileSync(compactPath, JSON.stringify(combined));

  const outputSize = fs.statSync(compactPath).size;
  console.log(`Base entries (hw + wk): ${base.length}`);
  console.log(`Dialect entries added: ${dialectEntries.length}`);
  console.log(`Total: ${combined.length}`);
  console.log(`File size: ${(outputSize / 1024 / 1024).toFixed(2)} MB`);
}
```

### Changes to `extension/lib/__tests__/compact-dictionaries.test.ts`

Add test for `filterOutSources`:

```typescript
describe('filterOutSources', () => {
  it('removes entries matching specified sources', () => {
    const entries: CompactEntry[] = [
      ['كتب', 'to write', 'كتب', 'hw'],
      ['كتاب', 'book', 'كتب', 'wk-egy'],
      ['مكتبة', 'library', 'كتب', 'wk'],
    ];
    const result = filterOutSources(entries, ['wk-egy']);
    expect(result).toEqual([
      ['كتب', 'to write', 'كتب', 'hw'],
      ['مكتبة', 'library', 'كتب', 'wk'],
    ]);
  });
});
```

### Changes to `extension/package.json`

The `build:dicts` script changes. The compact step only compacts dialect files into the existing compact JSON. `build:wiktionary` is not part of this pipeline — wk data is already in `dict-compact.json`.

```
"build:dicts": "npm run build:dialects && npm run build:compact"
```

`build:wiktionary` stays as a standalone script for when MSA wiktionary needs rebuilding separately.

### Files modified
- `scripts/compact-dictionaries.ts` — rewrite main block, add `filterOutSources`
- `extension/lib/__tests__/compact-dictionaries.test.ts` — add test for `filterOutSources`
- `extension/package.json` — fix `build:dicts` script

### Verification

1. `cd /Users/demouser/Code/sarf/extension && npm test` — 100% pass
2. `cd /Users/demouser/Code/sarf/extension && npx tsc --noEmit` — no type errors
3. `cd /Users/demouser/Code/sarf/extension && npm run build:dicts` — actually runs to completion, produces updated `dict-compact.json` with hw + wk + dialect entries
4. Verify `dict-compact.json` contains entries with sources: hw, wk, wk-egy, wk-lev, wk-gulf
5. `cd /Users/demouser/Code/sarf/extension && npm run build` — extension builds
6. Commit

### What this does NOT touch
- `build-dialect-wiktionary.ts` — working correctly
- `build-wiktionary.ts` — working correctly
- `dict-prefs.ts` — already done
- Popup UI — already done
- Background script — already done
