import { describe, it, expect } from 'vitest';
import { camelToAnalysis, CamelAnalysis } from '../lib/camel';

function makeCamel(overrides: Partial<CamelAnalysis> = {}): CamelAnalysis {
  return {
    lemma: 'test',
    root: 'tst',
    stem: 'test',
    pos: 'noun',
    gloss: 'test',
    pattern: '1a2a3',
    diac: 'test',
    prefixes: [],
    suffixes: [],
    features: {},
    ...overrides,
  };
}

describe('camelToAnalysis', () => {
  it('should convert pattern digits to Arabic template letters', () => {
    const results = [makeCamel({ pattern: 'لَ1ايَة' })];
    const analysis = camelToAnalysis('لايةtest', results)[0];
    expect(analysis.pattern).toBe('لَفايَة');
  });

  it('should pass through patterns without digits unchanged', () => {
    const results = [makeCamel({ pattern: 'فَعَلَ' })];
    const analysis = camelToAnalysis('فعلtest', results)[0];
    expect(analysis.pattern).toBe('فَعَلَ');
  });

  it('should convert empty pattern to null', () => {
    const results = [makeCamel({ pattern: '' })];
    const analysis = camelToAnalysis('test', results)[0];
    expect(analysis.pattern).toBeNull();
  });

  it('should pass root with # through as-is', () => {
    const results = [makeCamel({ root: 'ك#ب' })];
    const analysis = camelToAnalysis('test', results)[0];
    expect(analysis.root).toBe('ك#ب');
  });

  it('should pass normal root through as-is', () => {
    const results = [makeCamel({ root: 'كتب' })];
    const analysis = camelToAnalysis('test', results)[0];
    expect(analysis.root).toBe('كتب');
  });

  it('should produce default MorphAnalysis for empty results array', () => {
    const analysis = camelToAnalysis('original', [])[0];
    expect(analysis.pattern).toBeNull();
    expect(analysis.root).toBeNull();
    expect(analysis.prefixes).toEqual([]);
    expect(analysis.suffixes).toEqual([]);
  });

  it('should use stem field for stem display', () => {
    const results = [makeCamel({ stem: 'كُتّاب', lemma: 'كُتّاب' })];
    const analysis = camelToAnalysis('test', results)[0];
    expect(analysis.stem).toBe('كتاب');
  });

  it('should fall back to lemma when stem is empty', () => {
    const results = [makeCamel({ stem: '', lemma: 'كِتَاب' })];
    const analysis = camelToAnalysis('test', results)[0];
    expect(analysis.stem).toBe('كتاب');
  });

  it('should pass through prefixes and suffixes arrays', () => {
    const results = [
      makeCamel({
        prefixes: ['وَ', 'الـ'],
        suffixes: ['ه'],
      }),
    ];
    const analysis = camelToAnalysis('test', results)[0];
    expect(analysis.prefixes).toEqual(['وَ', 'الـ']);
    expect(analysis.suffixes).toEqual(['ه']);
  });
});
