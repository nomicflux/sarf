import { describe, it, expect } from 'vitest';
import {
  normalizeAlif,
  stripDiacritics,
  extractGlosses,
  mergeGlosses,
  deduplicateEntries,
  createDictEntries,
} from '../../scripts/build-wiktionary';

describe('normalizeAlif', () => {
  it('converts alif variants to plain alif', () => {
    expect(normalizeAlif('أَبْ')).toBe('اَبْ');
    expect(normalizeAlif('إِنَّ')).toBe('اِنَّ');
    expect(normalizeAlif('آخِر')).toBe('اخِر');
  });

  it('leaves plain alif unchanged', () => {
    expect(normalizeAlif('الكتاب')).toBe('الكتاب');
  });
});

describe('stripDiacritics', () => {
  it('removes diacritics and normalizes alif', () => {
    expect(stripDiacritics('كِتَاب')).toBe('كتاب');
    expect(stripDiacritics('أَكْتُبُ')).toBe('اكتب');
  });

  it('leaves bare text unchanged', () => {
    expect(stripDiacritics('كتاب')).toBe('كتاب');
  });
});

describe('extractGlosses', () => {
  it('extracts glosses from senses', () => {
    const entry = {
      word: 'كتاب',
      lang_code: 'ar',
      senses: [
        { glosses: ['book'] },
        { glosses: ['letter', 'epistle'] },
      ],
    };
    expect(extractGlosses(entry)).toEqual(['book', 'letter', 'epistle']);
  });

  it('returns empty array for missing senses', () => {
    const entry = { word: 'test', lang_code: 'ar' };
    expect(extractGlosses(entry)).toEqual([]);
  });

  it('skips senses without glosses', () => {
    const entry = {
      word: 'test',
      lang_code: 'ar',
      senses: [{ glosses: ['valid'] }, {}, { glosses: [] }],
    };
    expect(extractGlosses(entry)).toEqual(['valid']);
  });
});

describe('mergeGlosses', () => {
  it('joins glosses with semicolon separator', () => {
    expect(mergeGlosses(['book', 'letter'])).toBe('book; letter');
  });

  it('handles single gloss', () => {
    expect(mergeGlosses(['book'])).toBe('book');
  });
});

describe('deduplicateEntries', () => {
  it('merges glosses for same normalized word', () => {
    const map = new Map<string, string[]>([
      ['كتاب', ['book', 'letter']],
      ['قلم', ['pen', 'pencil']],
    ]);
    const result = deduplicateEntries(map);
    expect(result.get('كتاب')).toBe('book; letter');
    expect(result.get('قلم')).toBe('pen; pencil');
  });
});

describe('createDictEntries', () => {
  it('creates dict entries starting at ID 24931', () => {
    const map = new Map<string, string>([
      ['كتاب', 'book'],
      ['قلم', 'pen'],
    ]);
    const entries = createDictEntries(map);
    expect(entries).toHaveLength(2);
    expect(entries[0].id).toBe(24931);
    expect(entries[0].word).toBe('كتاب');
    expect(entries[0].definition).toBe('book');
    expect(entries[0].isRoot).toBe(false);
    expect(entries[0].parentId).toBe(24931);
    expect(entries[1].id).toBe(24932);
  });
});
