import { describe, it, expect } from 'vitest';
import { renderAnalysis, clampPosition } from '../tooltip';
import type { MorphAnalysis } from '../types';

describe('renderAnalysis', () => {
  it('renders particle with label', () => {
    const analysis: MorphAnalysis = {
      original: 'في',
      prefixes: [],
      stem: 'في',
      verbStem: null,
      suffixes: [],
      root: null,
      pattern: null,
      definition: null,
      lemma: null,
      isParticle: true,
    };
    const html = renderAnalysis(analysis);
    expect(html).toContain('sarf-particle');
    expect(html).toContain('حرف');
    expect(html).toContain('في');
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
      definition: null,
      lemma: null,
      isParticle: false,
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
      definition: null,
      lemma: null,
      isParticle: false,
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
      definition: null,
      lemma: null,
      isParticle: false,
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
      definition: null,
      lemma: null,
      isParticle: false,
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
      definition: 'book; writing',
      lemma: null,
      isParticle: false,
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
      definition: null,
      lemma: null,
      isParticle: false,
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
      definition: null,
      lemma: null,
      isParticle: false,
    };
    const html = renderAnalysis(analysis);
    expect(html).toContain('No definition found');
    expect(html).toContain('sarf-missing');
  });

  it('does not show missing indicators for particle', () => {
    const analysis: MorphAnalysis = {
      original: 'في',
      prefixes: [],
      stem: 'في',
      verbStem: null,
      suffixes: [],
      root: null,
      pattern: null,
      definition: null,
      lemma: null,
      isParticle: true,
    };
    const html = renderAnalysis(analysis);
    expect(html).not.toContain('sarf-missing');
    expect(html).not.toContain('Root: —');
    expect(html).not.toContain('No definition found');
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
