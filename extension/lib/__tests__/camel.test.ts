import { describe, it, expect } from 'vitest';
import { camelToAnalysis, CamelAnalysis } from '../camel';

describe('camelToAnalysis', () => {
  it('returns skeleton for empty results', () => {
    const result = camelToAnalysis('كتاب', []);
    expect(result.stem).toBe('كتاب');
    expect(result.prefixes).toEqual([]);
    expect(result.suffixes).toEqual([]);
    expect(result.lemmas).toEqual([]);
    expect(result.root).toBeNull();
    expect(result.pos).toBeNull();
  });

  it('maps single result correctly', () => {
    const analysis: CamelAnalysis = {
      lemma: 'كِتَاب',
      root: 'k.t.b',
      pos: 'noun',
      gloss: 'book',
      pattern: 'فِعَال',
      diac: 'اَلْكِتَابُ',
      prefixes: ['ال'],
      suffixes: [],
      features: { gen: 'm', num: 's' },
    };

    const result = camelToAnalysis('الكتاب', [analysis]);
    expect(result.stem).toBe('كتاب');
    expect(result.prefixes).toEqual(['ال']);
    expect(result.suffixes).toEqual([]);
    expect(result.root).toBe('k.t.b');
    expect(result.pattern).toBe('فِعَال');
    expect(result.pos).toBe('noun');
    expect(result.lemmas).toEqual(['كتاب']);
  });

  it('deduplicates lemmas from multiple results', () => {
    const analyses: CamelAnalysis[] = [
      {
        lemma: 'كَتَبَ',
        root: 'k.t.b',
        pos: 'verb',
        gloss: 'write',
        pattern: '',
        diac: '',
        prefixes: [],
        suffixes: [],
        features: {},
      },
      {
        lemma: 'كَتَبَ',
        root: 'k.t.b',
        pos: 'verb',
        gloss: 'write',
        pattern: '',
        diac: '',
        prefixes: [],
        suffixes: [],
        features: {},
      },
      {
        lemma: 'كُتُب',
        root: 'k.t.b',
        pos: 'noun',
        gloss: 'books',
        pattern: '',
        diac: '',
        prefixes: [],
        suffixes: [],
        features: {},
      },
    ];

    const result = camelToAnalysis('كتب', analyses);
    expect(result.lemmas).toEqual(['كتب']);
  });
});
