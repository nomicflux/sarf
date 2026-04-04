import { describe, it, expect } from 'vitest';
import { camelToAnalysis, deduplicateAnalyses, CamelAnalysis } from '../camel';
import type { MorphAnalysis } from '../types';

function makeAnalysis(lemma: string, pos: string, prefixes: string[] = [], suffixes: string[] = []): MorphAnalysis {
  return {
    original: lemma, prefixes, stem: lemma, verbStem: null, suffixes,
    root: null, pattern: null, definitions: [], lemmas: [lemma],
    pos, isParticle: false, error: null,
  };
}

describe('camelToAnalysis', () => {
  it('returns skeleton for empty results', () => {
    const result = camelToAnalysis('كتاب', [])[0];
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
      stem: '',
      pos: 'noun',
      gloss: 'book',
      pattern: 'فِعَال',
      diac: 'اَلْكِتَابُ',
      prefixes: ['ال'],
      suffixes: [],
      features: { gen: 'm', num: 's' },
    };

    const result = camelToAnalysis('الكتاب', [analysis])[0];
    expect(result.stem).toBe('كتاب');
    expect(result.prefixes).toEqual(['ال']);
    expect(result.suffixes).toEqual([]);
    expect(result.root).toBe('k.t.b');
    expect(result.pattern).toBe('فِعَال');
    expect(result.pos).toBe('noun');
    expect(result.lemmas).toEqual(['كتاب']);
  });

  it('returns same array when no duplicates', () => {
    const analyses = [makeAnalysis('على', 'prep'), makeAnalysis('على', 'noun')];
    expect(deduplicateAnalyses(analyses)).toHaveLength(2);
  });

  it('removes duplicate lemma+pos, keeping first', () => {
    const analyses = [makeAnalysis('موجود', 'noun'), makeAnalysis('موجود', 'noun')];
    expect(deduplicateAnalyses(analyses)).toHaveLength(1);
  });

  it('prefers analysis with breakdown over one without', () => {
    const plain = makeAnalysis('على', 'prep');
    const withBreak = makeAnalysis('على', 'prep', ['علي'], ['ها']);
    expect(deduplicateAnalyses([plain, withBreak])[0].prefixes).toEqual(['علي']);
    expect(deduplicateAnalyses([withBreak, plain])[0].prefixes).toEqual(['علي']);
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

    const result = camelToAnalysis('كتب', analyses)[0];
    expect(result.lemmas).toEqual(['كتب']);
  });
});
