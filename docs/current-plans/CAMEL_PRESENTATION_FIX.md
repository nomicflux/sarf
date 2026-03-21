# Plan: Correct CAMeL Data Presentation

## Context

CAMeL analyzer output has two presentation problems documented in
`docs/current-plans/CAMEL_DATA_UNDERSTANDING.md`:

1. **Pattern digits**: Pattern field uses `1`, `2`, `3` as root radical
   placeholders (e.g. `لَ1ايَةٌ`). Should use traditional Arabic template letters ف ع ل.
2. **Missing affixes**: `extract_affixes` only captures first and last `bw`
   segment, losing multi-part prefixes (e.g. `وَ + الـ` only returns `وَ`).

Root with `#` placeholders: display as-is (user decision 2026-03-20).

## Agreements Made

- "Show as-is" for root `#` placeholders — 2026-03-20
- "Replace digits with ف ع ل" for pattern — 2026-03-20
- "Also fix multi-affix extraction" — 2026-03-20

## Explicitly Rejected

- Nulling/hiding root when it contains `#` — user: "WHERE DID I ASK YOU TO SET # TO NULL"
- Manual stem-matching to find affixes — user: "Doesn't CAMeL give you the stem? Why are you doing manual work?"
- Asking questions whose answers are in the data understanding doc

## Files to modify

1. `extension/public/pyodide/offscreen.js` — Python: new `clean_pattern`, rewritten `extract_affixes`, updated `format_analysis`
2. `extension/lib/camel.ts` — TypeScript: add `cleanPattern` safety net in `camelToAnalysis`
3. `extension/tests/camel.test.ts` — new file: tests for `camelToAnalysis` including pattern cleaning

## Changes

### `extension/public/pyodide/offscreen.js` (Python inside setupAnalysis template string)

**Add `clean_pattern` (before `format_analysis`):**
```python
def clean_pattern(pattern):
    return pattern.replace("1", "ف").replace("2", "ع").replace("3", "ل")
```

**Replace `extract_affixes` (lines 99-105):**

Current code splits `bw` on `+` and takes first/last. New code uses CAMeL's
proclitic fields (`prc0-3`, `enc0` — documented in CAMEL_DATA_UNDERSTANDING.md
section 2) to know how many prefix segments exist, assumes 1 stem segment,
remainder are suffixes:

```python
def count_proclitics(raw):
    return sum(1 for k in ("prc3", "prc2", "prc1", "prc0") if raw.get(k, "0") != "0")

def extract_affixes(raw):
    bw = raw.get("bw", "")
    parts = bw.split("+")
    n_pre = count_proclitics(raw)
    if n_pre >= len(parts):
        return ([], [])
    prefixes = [bw2ar(p) for p in parts[:n_pre]]
    suffixes = [bw2ar(p) for p in parts[n_pre + 1:]]
    return (prefixes, suffixes)
```

**Update `format_analysis` (lines 107-119):**
- Change `extract_affixes(raw.get("bw", ""))` to `extract_affixes(raw)`
- Change `"pattern": raw.get("pattern", "")` to `"pattern": clean_pattern(raw.get("pattern", ""))`

### `extension/lib/camel.ts`

**Add `cleanPattern` helper:**
```typescript
function cleanPattern(pattern: string): string | null {
  if (!pattern) return null;
  return pattern.replace(/1/g, 'ف').replace(/2/g, 'ع').replace(/3/g, 'ل');
}
```

**Update `camelToAnalysis` return (line 48):**
- Change `pattern: first.pattern || null` to `pattern: cleanPattern(first.pattern)`

### `extension/tests/camel.test.ts` (new)

Tests for `camelToAnalysis`:
- Pattern with digits `"لَ1ايَة"` produces `"لَفايَة"`
- Pattern without digits passes through unchanged
- Empty pattern produces `null`
- Root with `#` passes through as-is
- Normal root passes through as-is
- Empty results array produces default MorphAnalysis with `null` fields
- Multiple prefixes/suffixes arrays pass through correctly

## What is NOT changing

- `extension/lib/types.ts` — already has `string[]` for prefixes/suffixes, `string | null` for pattern
- `extension/lib/tooltip.ts` — already renders arrays and handles null pattern
- Root handling — no transformation
- AlKhalil path — untouched

## Verification

1. `cd extension && npm test` — new and existing tests pass
2. `cd extension && npm run build` — no type errors

## Implementation Status

### Phase 1: Python-side fixes — COMPLETE

**Changes applied to `extension/public/pyodide/offscreen.js`:**
- Added `clean_pattern(pattern)` — replaces 1→ف, 2→ع, 3→ل
- Added `count_proclitics(raw)` — counts active prc0-3 fields in raw dict
- Replaced `extract_affixes(bwtok)` with `extract_affixes(raw)` — uses proclitic count for prefix/suffix split
- Updated `format_analysis` to call `extract_affixes(raw)` and `clean_pattern(raw.get("pattern", ""))`

**Runtime trace:**
1. `clean_pattern(pattern)`: Pure string replacement. Called with `raw.get("pattern", "")` which is always a string. Returns string with digits replaced. No failure mode.
2. `count_proclitics(raw)`: Reads `prc3`, `prc2`, `prc1`, `prc0` from raw dict via `.get(k, "0")`. CAMeL always provides these fields in analysis output. Returns int 0-4. No failure mode.
3. `extract_affixes(raw)`: Calls `raw.get("bw", "")` — always a string. Splits on `+`. Calls `count_proclitics(raw)` for prefix count. Guard: if `n_pre >= len(parts)`, returns empty. Otherwise slices `parts[:n_pre]` for prefixes, `parts[n_pre+1:]` for suffixes, converting each via `bw2ar()`. `bw2ar` is a CAMeL CharMapper — accepts any string, returns Arabic transliteration. No silent failures.
4. `format_analysis(raw)`: Calls `extract_affixes(raw)` (changed from passing just bw string). Calls `clean_pattern(raw.get("pattern", ""))`. All other fields unchanged. Returns dict consumed by `json.dumps` in `analyze_word_json`. No failure mode.

**Diff against prior implementation:**
- Old `extract_affixes(bwtok)` took a string; new takes full `raw` dict — JUSTIFIED: needs proclitic fields
- Old used heuristic (first/last segment); new uses proclitic count — JUSTIFIED: fixes multi-affix bug
- Old had no `clean_pattern`; new adds it — JUSTIFIED: fixes digit display bug
