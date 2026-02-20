import { describe, it, expect } from 'vitest';
import { lookupWithFallback, stripDiacritics, normalizeAlif, lookupByLemma, lookupAnalysis } from '../dictionary';
import { parseCompactEntry } from '../dict-store';
import type { DictEntry } from '../dictionary';
import type { CompactEntry } from '../dict-store';

const sampleEntries: DictEntry[] = [
  { word: 'كتب', definition: 'kataba to write', rootWord: 'كتب', source: 'hw' },
  { word: 'كتاب', definition: 'kitāb book; writing', rootWord: 'كتب', source: 'hw' },
  { word: 'مكتبة', definition: 'maktaba library', rootWord: 'كتب', source: 'hw' },
  { word: 'درس', definition: 'darasa to study', rootWord: 'درس', source: 'wk' },
  { word: 'لقب', definition: 'laqab nickname; title', rootWord: 'لقب', source: 'wk' },
];

function createMockLookup(entries: DictEntry[]): (word: string) => Promise<DictEntry[]> {
  const map = new Map<string, DictEntry[]>();
  for (const entry of entries) {
    const existing = map.get(entry.word) ?? [];
    existing.push(entry);
    map.set(entry.word, existing);
  }
  return async (word: string) => map.get(word) ?? [];
}

describe('lookupWithFallback', () => {
  const lookup = createMockLookup(sampleEntries);

  it('returns stem match when found', async () => {
    const result = await lookupWithFallback(lookup, 'كتاب', null);
    expect(result.entries[0].definition).toBe('kitāb book; writing');
    expect(result.rootWord).toBe('كتب');
    expect(result.entries[0].source).toBe('hw');
  });

  it('falls back to verbStem when stem not found', async () => {
    const result = await lookupWithFallback(lookup, 'تلقب', 'لقب');
    expect(result.entries[0].definition).toBe('laqab nickname; title');
    expect(result.rootWord).toBe('لقب');
    expect(result.entries[0].source).toBe('wk');
  });

  it('returns nulls when neither found', async () => {
    const result = await lookupWithFallback(lookup, 'xyz', 'abc');
    expect(result.entries).toEqual([]);
    expect(result.rootWord).toBeNull();
  });
});

describe('stripDiacritics', () => {
  it('removes Arabic diacritics', () => {
    expect(stripDiacritics('كِتَابٌ')).toBe('كتاب');
  });

  it('removes shadda', () => {
    expect(stripDiacritics('إِدَارِيّ')).toBe('اداري');
  });

  it('returns plain text unchanged', () => {
    expect(stripDiacritics('كتاب')).toBe('كتاب');
  });
});

describe('normalizeAlif', () => {
  it('normalizes hamza below alif', () => {
    expect(normalizeAlif('إمساك')).toBe('امساك');
  });

  it('normalizes hamza above alif', () => {
    expect(normalizeAlif('أحمد')).toBe('احمد');
  });

  it('normalizes alif madda', () => {
    expect(normalizeAlif('آخر')).toBe('اخر');
  });

  it('leaves bare alif unchanged', () => {
    expect(normalizeAlif('امساك')).toBe('امساك');
  });
});

describe('lookupByLemma', () => {
  const lookup = createMockLookup(sampleEntries);

  it('finds entry after stripping diacritics', async () => {
    const result = await lookupByLemma(lookup, 'كِتَابٌ');
    expect(result.entries[0].definition).toBe('kitāb book; writing');
    expect(result.rootWord).toBe('كتب');
    expect(result.entries[0].source).toBe('hw');
  });

  it('returns nulls when lemma not found', async () => {
    const result = await lookupByLemma(lookup, 'مَجْهُول');
    expect(result.entries).toEqual([]);
    expect(result.rootWord).toBeNull();
  });
});

describe('lookupAnalysis', () => {
  const lookup = createMockLookup(sampleEntries);

  it('finds by first matching lemma', async () => {
    const result = await lookupAnalysis(lookup, { lemmas: ['مَجْهُول', 'كِتَابٌ'], stem: 'xyz', verbStem: null });
    expect(result.entries[0].definition).toBe('kitāb book; writing');
    expect(result.entries[0].source).toBe('hw');
  });

  it('falls back to stem when no lemma matches', async () => {
    const result = await lookupAnalysis(lookup, { lemmas: ['مَجْهُول'], stem: 'درس', verbStem: null });
    expect(result.entries[0].definition).toBe('darasa to study');
    expect(result.entries[0].source).toBe('wk');
  });

  it('tries all lemmas before falling back', async () => {
    const result = await lookupAnalysis(lookup, { lemmas: ['abc', 'def', 'كِتَابٌ'], stem: 'xyz', verbStem: null });
    expect(result.entries[0].definition).toBe('kitāb book; writing');
    expect(result.entries[0].source).toBe('hw');
  });

  it('returns nulls when nothing found', async () => {
    const result = await lookupAnalysis(lookup, { lemmas: [], stem: 'xyz', verbStem: null });
    expect(result.entries).toEqual([]);
  });
});

describe('parseCompactEntry', () => {
  it('converts tuple to DictEntry', () => {
    const tuple: CompactEntry = ['كتاب', 'kitāb book', 'كتب', 'hw'];
    const entry = parseCompactEntry(tuple);
    expect(entry).toEqual({
      word: 'كتاب',
      definition: 'kitāb book',
      rootWord: 'كتب',
      source: 'hw',
    });
  });
});
