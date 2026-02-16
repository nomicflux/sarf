import { describe, it, expect } from 'vitest';
import { renderAnalysis } from '../tooltip';
import type { MorphAnalysis } from '../types';

describe('renderAnalysis', () => {
  it('renders particle with label', () => {
    const analysis: MorphAnalysis = {
      original: 'في',
      prefixes: [],
      stem: 'في',
      suffixes: [],
      root: null,
      pattern: null,
      definition: null,
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
      suffixes: [],
      root: null,
      pattern: null,
      definition: null,
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
      suffixes: ['ها'],
      root: null,
      pattern: null,
      definition: null,
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
      suffixes: [],
      root: null,
      pattern: null,
      definition: null,
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
      suffixes: [],
      root: 'ك ت ب',
      pattern: null,
      definition: null,
      isParticle: false,
    };
    const html = renderAnalysis(analysis);
    expect(html).toContain('sarf-detail');
    expect(html).toContain('ك ت ب');
  });
});
