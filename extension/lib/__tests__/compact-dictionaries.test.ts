import { describe, it, expect } from 'vitest';
import { resolveRootWords, compactEntry, compactDictionary, type CompactEntry } from '../../../scripts/compact-dictionaries';

interface OldDictEntry {
  id: number;
  word: string;
  definition: string;
  isRoot: boolean;
  parentId: number;
  source?: string;
}

describe('compact-dictionaries', () => {
  describe('resolveRootWords', () => {
    it('maps root entries to themselves', () => {
      const entries: OldDictEntry[] = [
        { id: 1, word: 'كتب', definition: 'to write', isRoot: true, parentId: 1 },
      ];
      const result = resolveRootWords(entries);
      expect(result.get(1)).toBe('كتب');
    });

    it('maps derived entries to parent word', () => {
      const entries: OldDictEntry[] = [
        { id: 1, word: 'كتب', definition: 'to write', isRoot: true, parentId: 1 },
        { id: 2, word: 'كتاب', definition: 'book', isRoot: false, parentId: 1 },
      ];
      const result = resolveRootWords(entries);
      expect(result.get(2)).toBe('كتب');
    });

    it('handles multiple derived entries', () => {
      const entries: OldDictEntry[] = [
        { id: 1, word: 'كتب', definition: 'to write', isRoot: true, parentId: 1 },
        { id: 2, word: 'كتاب', definition: 'book', isRoot: false, parentId: 1 },
        { id: 3, word: 'مكتبة', definition: 'library', isRoot: false, parentId: 1 },
      ];
      const result = resolveRootWords(entries);
      expect(result.get(1)).toBe('كتب');
      expect(result.get(2)).toBe('كتب');
      expect(result.get(3)).toBe('كتب');
    });
  });

  describe('compactEntry', () => {
    it('produces correct tuple format', () => {
      const entry: OldDictEntry = { id: 1, word: 'كتب', definition: 'to write', isRoot: true, parentId: 1 };
      const rootWords = new Map([[1, 'كتب']]);
      const result = compactEntry(entry, rootWords, 'hw');
      expect(result).toEqual(['كتب', 'to write', 'كتب', 'hw']);
    });

    it('uses rootWords map for root word', () => {
      const entry: OldDictEntry = { id: 2, word: 'كتاب', definition: 'book', isRoot: false, parentId: 1 };
      const rootWords = new Map([[2, 'كتب']]);
      const result = compactEntry(entry, rootWords, 'hw');
      expect(result).toEqual(['كتاب', 'book', 'كتب', 'hw']);
    });
  });

  describe('compactDictionary', () => {
    it('produces array of tuples for all entries', () => {
      const entries: OldDictEntry[] = [
        { id: 1, word: 'كتب', definition: 'to write', isRoot: true, parentId: 1 },
        { id: 2, word: 'كتاب', definition: 'book', isRoot: false, parentId: 1 },
      ];
      const result = compactDictionary(entries, 'hw');
      expect(result).toEqual([
        ['كتب', 'to write', 'كتب', 'hw'],
        ['كتاب', 'book', 'كتب', 'hw'],
      ]);
    });

    it('resolves roots correctly for all entries', () => {
      const entries: OldDictEntry[] = [
        { id: 1, word: 'كتب', definition: 'to write', isRoot: true, parentId: 1 },
        { id: 2, word: 'كتاب', definition: 'book', isRoot: false, parentId: 1 },
        { id: 3, word: 'مكتبة', definition: 'library', isRoot: false, parentId: 1 },
      ];
      const result = compactDictionary(entries, 'wk');
      expect(result[0][2]).toBe('كتب');
      expect(result[1][2]).toBe('كتب');
      expect(result[2][2]).toBe('كتب');
    });
  });
});
