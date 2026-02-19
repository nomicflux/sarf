import { describe, it, expect } from 'vitest';
import { renderAnalysis, clampPosition } from '../tooltip';
import type { MorphAnalysis } from '../types';

describe('renderAnalysis', () => {
  it('renders particle with stem', () => {
    const analysis: MorphAnalysis = {
      original: 'في',
      prefixes: [],
      stem: 'في',
      verbStem: null,
      suffixes: [],
      root: null,
      pattern: null,
      definitions: [],
      lemmas: [],
      pos: null,
      isParticle: true,
      error: null,
    };
    const html = renderAnalysis(analysis);
    expect(html).toContain('sarf-stem');
    expect(html).toContain('في');
    expect(html).toContain('sarf-missing');
  });

  it('renders word with prefixes', () => {
    const analysis: MorphAnalysis = {
      original: 'بالكتاب',
      prefixes: ['ب', 'ال'],
      stem: 'كتاب',
      verbStem: null,
      suffixes: [],
      root: null,
      pattern: null,
      definitions: [],
      lemmas: [],
      pos: null,
      isParticle: false,
      error: null,
    };
    const html = renderAnalysis(analysis);
    expect(html).toContain('sarf-prefix');
    expect(html).toContain('ب');
    expect(html).toContain('ال');
    expect(html).toContain('sarf-stem');
    expect(html).toContain('كتاب');
    expect(html).toContain('sarf-separator');
  });

  it('renders word with suffixes', () => {
    const analysis: MorphAnalysis = {
      original: 'كتابها',
      prefixes: [],
      stem: 'كتاب',
      verbStem: null,
      suffixes: ['ها'],
      root: null,
      pattern: null,
      definitions: [],
      lemmas: [],
      pos: null,
      isParticle: false,
      error: null,
    };
    const html = renderAnalysis(analysis);
    expect(html).toContain('sarf-stem');
    expect(html).toContain('كتاب');
    expect(html).toContain('sarf-suffix');
    expect(html).toContain('ها');
  });

  it('renders plain word with no affixes', () => {
    const analysis: MorphAnalysis = {
      original: 'كتاب',
      prefixes: [],
      stem: 'كتاب',
      verbStem: null,
      suffixes: [],
      root: null,
      pattern: null,
      definitions: [],
      lemmas: [],
      pos: null,
      isParticle: false,
      error: null,
    };
    const html = renderAnalysis(analysis);
    expect(html).toContain('sarf-stem');
    expect(html).toContain('كتاب');
    expect(html).not.toContain('sarf-separator');
  });

  it('renders root when present', () => {
    const analysis: MorphAnalysis = {
      original: 'كتاب',
      prefixes: [],
      stem: 'كتاب',
      verbStem: null,
      suffixes: [],
      root: 'ك ت ب',
      pattern: null,
      definitions: [],
      lemmas: [],
      pos: null,
      isParticle: false,
      error: null,
    };
    const html = renderAnalysis(analysis);
    expect(html).toContain('sarf-detail');
    expect(html).toContain('ك ت ب');
  });

  it('renders definition when present', () => {
    const analysis: MorphAnalysis = {
      original: 'كتاب',
      prefixes: [],
      stem: 'كتاب',
      verbStem: null,
      suffixes: [],
      root: 'ك ت ب',
      pattern: null,
      definitions: [{ text: 'book; writing', source: '' }],
      lemmas: [],
      pos: null,
      isParticle: false,
      error: null,
    };
    const html = renderAnalysis(analysis);
    expect(html).toContain('sarf-definition');
    expect(html).toContain('book; writing');
  });

  it('shows missing root indicator for non-particle', () => {
    const analysis: MorphAnalysis = {
      original: 'كتاب',
      prefixes: [],
      stem: 'كتاب',
      verbStem: null,
      suffixes: [],
      root: null,
      pattern: null,
      definitions: [],
      lemmas: [],
      pos: null,
      isParticle: false,
      error: null,
    };
    const html = renderAnalysis(analysis);
    expect(html).toContain('sarf-missing');
    expect(html).toContain('Root: —');
  });

  it('shows missing definition indicator for non-particle', () => {
    const analysis: MorphAnalysis = {
      original: 'كتاب',
      prefixes: [],
      stem: 'كتاب',
      verbStem: null,
      suffixes: [],
      root: null,
      pattern: null,
      definitions: [],
      lemmas: [],
      pos: null,
      isParticle: false,
      error: null,
    };
    const html = renderAnalysis(analysis);
    expect(html).toContain('No definition found');
    expect(html).toContain('sarf-missing');
  });


  it('renders lemma when present', () => {
    const analysis: MorphAnalysis = {
      original: 'الإدارية',
      prefixes: ['ال'],
      stem: 'إداري',
      verbStem: null,
      suffixes: ['ة'],
      root: 'دور',
      pattern: null,
      definitions: [{ text: 'administrative', source: '' }],
      lemmas: ['إداري'],
      pos: null,
      isParticle: false,
      error: null,
    };
    const html = renderAnalysis(analysis);
    expect(html).toContain('Lemma: إداري');
    expect(html).toContain('sarf-detail');
  });

  it('renders POS when present', () => {
    const analysis: MorphAnalysis = {
      original: 'الإدارية',
      prefixes: ['ال'],
      stem: 'إداري',
      verbStem: null,
      suffixes: ['ة'],
      root: 'دور',
      pattern: null,
      definitions: [{ text: 'administrative', source: '' }],
      lemmas: ['إداري'],
      pos: 'اسم|نسبة|مفرد|مؤنث|معرف',
      isParticle: false,
      error: null,
    };
    const html = renderAnalysis(analysis);
    expect(html).toContain('اسم|نسبة|مفرد|مؤنث|معرف');
    expect(html).toContain('sarf-pos');
  });

  it('renders Hans Wehr source label when present', () => {
    const analysis: MorphAnalysis = {
      original: 'كتاب',
      prefixes: [],
      stem: 'كتاب',
      verbStem: null,
      suffixes: [],
      root: 'ك ت ب',
      pattern: null,
      definitions: [{ text: 'book', source: 'hw' }],
      lemmas: [],
      pos: null,
      isParticle: false,
      error: null,
    };
    const html = renderAnalysis(analysis);
    expect(html).toContain('Hans Wehr');
    expect(html).toContain('sarf-source');
  });

  it('renders Wiktionary source label when present', () => {
    const analysis: MorphAnalysis = {
      original: 'كتاب',
      prefixes: [],
      stem: 'كتاب',
      verbStem: null,
      suffixes: [],
      root: 'ك ت ب',
      pattern: null,
      definitions: [{ text: 'book', source: 'wk' }],
      lemmas: [],
      pos: null,
      isParticle: false,
      error: null,
    };
    const html = renderAnalysis(analysis);
    expect(html).toContain('Wiktionary');
    expect(html).toContain('sarf-source');
  });
});

describe('clampPosition', () => {
  it('keeps tooltip within viewport', () => {
    const pos = clampPosition(900, 700, 1024, 768, 200, 100);
    expect(pos.x).toBeLessThanOrEqual(1024 - 200 - 8);
    expect(pos.y).toBeLessThanOrEqual(768 - 100 - 8);
  });

  it('does not go below minimum', () => {
    const pos = clampPosition(-100, -100, 1024, 768, 200, 100);
    expect(pos.x).toBeGreaterThanOrEqual(8);
    expect(pos.y).toBeGreaterThanOrEqual(8);
  });
});
