import { describe, it, expect } from 'vitest';
import { buildIndex, lookupWord, findRootEntry, lookupDefinition, lookupRootWord } from '../dictionary';
import type { DictEntry } from '../dictionary';

const sampleEntries: DictEntry[] = [
  { id: 100, word: 'كتب', definition: 'kataba to write', isRoot: true, parentId: 100 },
  { id: 101, word: 'كتاب', definition: 'kitāb book; writing', isRoot: false, parentId: 100 },
  { id: 102, word: 'مكتبة', definition: 'maktaba library', isRoot: false, parentId: 100 },
  { id: 200, word: 'درس', definition: 'darasa to study', isRoot: true, parentId: 200 },
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
