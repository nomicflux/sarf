import { describe, it, expect } from 'vitest';
import { buildIndex, lookupWord, findRootEntry, lookupDefinition, lookupRootWord, lookupWithFallback, stripDiacritics, normalizeAlif, lookupByLemma, lookupAnalysis, lookupAllWords } from '../dictionary';
import type { DictEntry } from '../dictionary';

const sampleEntries: DictEntry[] = [
  { id: 100, word: 'كتب', definition: 'kataba to write', isRoot: true, parentId: 100, source: 'hw' },
  { id: 101, word: 'كتاب', definition: 'kitāb book; writing', isRoot: false, parentId: 100, source: 'hw' },
  { id: 102, word: 'مكتبة', definition: 'maktaba library', isRoot: false, parentId: 100, source: 'hw' },
  { id: 200, word: 'درس', definition: 'darasa to study', isRoot: true, parentId: 200, source: 'wk' },
  { id: 300, word: 'لقب', definition: 'laqab nickname; title', isRoot: true, parentId: 300, source: 'wk' },
];

describe('dictionary', () => {
  const index = buildIndex(sampleEntries);

  it('lookupWord finds exact match', () => {
    const entry = lookupWord(index, 'كتاب');
    expect(entry?.definition).toBe('kitāb book; writing');
  });

  it('lookupWord returns null for unknown', () => {
    expect(lookupWord(index, 'xyz')).toBeNull();
  });

  it('findRootEntry returns root for derived entry', () => {
    const entry = lookupWord(index, 'كتاب')!;
    const root = findRootEntry(index, entry);
    expect(root?.word).toBe('كتب');
  });

  it('findRootEntry returns self for root entry', () => {
    const entry = lookupWord(index, 'كتب')!;
    const root = findRootEntry(index, entry);
    expect(root?.word).toBe('كتب');
  });

  it('lookupDefinition returns definition string', () => {
    expect(lookupDefinition(index, 'مكتبة')).toBe('maktaba library');
  });

  it('lookupRootWord returns root word', () => {
    expect(lookupRootWord(index, 'كتاب')).toBe('كتب');
  });

  it('lookupRootWord returns null for unknown', () => {
    expect(lookupRootWord(index, 'unknown')).toBeNull();
  });
});

describe('lookupAllWords', () => {
  const index = buildIndex(sampleEntries);

  it('returns all entries for a word', () => {
    const entries = lookupAllWords(index, 'كتب');
    expect(entries).toHaveLength(1);
    expect(entries[0].definition).toBe('kataba to write');
  });

  it('returns empty array for unknown word', () => {
    expect(lookupAllWords(index, 'xyz')).toEqual([]);
  });
});

describe('lookupWithFallback', () => {
  const index = buildIndex(sampleEntries);

  it('returns stem match when found', () => {
    const result = lookupWithFallback(index, 'كتاب', null);
    expect(result.entries[0].definition).toBe('kitāb book; writing');
    expect(result.rootWord).toBe('كتب');
    expect(result.entries[0].source).toBe('hw');
  });

  it('falls back to verbStem when stem not found', () => {
    const result = lookupWithFallback(index, 'تلقب', 'لقب');
    expect(result.entries[0].definition).toBe('laqab nickname; title');
    expect(result.rootWord).toBe('لقب');
    expect(result.entries[0].source).toBe('wk');
  });

  it('returns nulls when neither found', () => {
    const result = lookupWithFallback(index, 'xyz', 'abc');
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
  const index = buildIndex(sampleEntries);

  it('finds entry after stripping diacritics', () => {
    const result = lookupByLemma(index, 'كِتَابٌ');
    expect(result.entries[0].definition).toBe('kitāb book; writing');
    expect(result.rootWord).toBe('كتب');
    expect(result.entries[0].source).toBe('hw');
  });

  it('returns nulls when lemma not found', () => {
    const result = lookupByLemma(index, 'مَجْهُول');
    expect(result.entries).toEqual([]);
    expect(result.rootWord).toBeNull();
  });
});

describe('lookupAnalysis', () => {
  const index = buildIndex(sampleEntries);

  it('finds by first matching lemma', () => {
    const result = lookupAnalysis(index, { lemmas: ['مَجْهُول', 'كِتَابٌ'], stem: 'xyz', verbStem: null });
    expect(result.entries[0].definition).toBe('kitāb book; writing');
    expect(result.entries[0].source).toBe('hw');
  });

  it('falls back to stem when no lemma matches', () => {
    const result = lookupAnalysis(index, { lemmas: ['مَجْهُول'], stem: 'درس', verbStem: null });
    expect(result.entries[0].definition).toBe('darasa to study');
    expect(result.entries[0].source).toBe('wk');
  });

  it('tries all lemmas before falling back', () => {
    const result = lookupAnalysis(index, { lemmas: ['abc', 'def', 'كِتَابٌ'], stem: 'xyz', verbStem: null });
    expect(result.entries[0].definition).toBe('kitāb book; writing');
    expect(result.entries[0].source).toBe('hw');
  });

  it('returns nulls when nothing found', () => {
    const result = lookupAnalysis(index, { lemmas: [], stem: 'xyz', verbStem: null });
    expect(result.entries).toEqual([]);
  });
});
