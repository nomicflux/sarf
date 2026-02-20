import { describe, it, expect, beforeEach } from 'vitest';
import { renderAnalysis, clampPosition, renderDefinitions, truncateDefinition, pinTooltip, unpinTooltip, isPinned, hideTooltip, splitPos } from '../tooltip';
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
      definitions: [{ word: 'كتاب', text: 'book; writing', source: 'hw' }],
      lemmas: [],
      pos: null,
      isParticle: false,
      error: null,
    };
    const html = renderAnalysis(analysis);
    expect(html).toContain('sarf-definition');
    expect(html).toContain('book; writing');
    expect(html).toContain('sarf-source');
    expect(html).toContain('Hans Wehr');
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
      definitions: [{ word: 'إداري', text: 'administrative', source: '' }],
      lemmas: ['إداري'],
      pos: null,
      isParticle: false,
      error: null,
    };
    const html = renderAnalysis(analysis);
    expect(html).toContain('Lemma: <span class="sarf-value">إداري</span>');
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
      definitions: [{ word: 'إداري', text: 'administrative', source: '' }],
      lemmas: ['إداري'],
      pos: 'اسم|نسبة|مفرد|مؤنث|معرف',
      isParticle: false,
      error: null,
    };
    const html = renderAnalysis(analysis);
    expect(html).toContain('POS: <span class="sarf-value">اسم</span> · ');
    expect(html).toContain('نسبة');
    expect(html).toContain('sarf-features');
    expect(html).toContain(' · ');
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
      definitions: [{ word: 'كتاب', text: 'book', source: 'hw' }],
      lemmas: [],
      pos: null,
      isParticle: false,
      error: null,
    };
    const html = renderAnalysis(analysis);
    expect(html).toContain('<span class="sarf-source">Hans Wehr</span>');
    expect(html).toContain('book');
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
      definitions: [{ word: 'كتاب', text: 'book', source: 'wk' }],
      lemmas: [],
      pos: null,
      isParticle: false,
      error: null,
    };
    const html = renderAnalysis(analysis);
    expect(html).toContain('<span class="sarf-source">Wiktionary</span>');
    expect(html).toContain('book');
  });

  it('renders divider before definitions', () => {
    const analysis: MorphAnalysis = {
      original: 'كتاب',
      prefixes: [],
      stem: 'كتاب',
      verbStem: null,
      suffixes: [],
      root: null,
      pattern: null,
      definitions: [{ word: 'كتاب', text: 'book', source: 'hw' }],
      lemmas: [],
      pos: null,
      isParticle: false,
      error: null,
    };
    const html = renderAnalysis(analysis);
    expect(html).toContain('sarf-divider');
  });

  it('renders word label in definition', () => {
    const analysis: MorphAnalysis = {
      original: 'كتاب',
      prefixes: [],
      stem: 'كتاب',
      verbStem: null,
      suffixes: [],
      root: null,
      pattern: null,
      definitions: [{ word: 'كتاب', text: 'book', source: 'hw' }],
      lemmas: [],
      pos: null,
      isParticle: false,
      error: null,
    };
    const html = renderAnalysis(analysis);
    expect(html).toContain('<span class="sarf-def-word">كتاب</span>');
  });
});

describe('truncateDefinition', () => {
  it('returns full text when under limit', () => {
    const result = truncateDefinition('short text');
    expect(result).toEqual({ short: 'short text', truncated: false });
  });

  it('truncates text over 200 characters', () => {
    const longText = 'a'.repeat(250);
    const result = truncateDefinition(longText);
    expect(result.short).toHaveLength(200);
    expect(result.truncated).toBe(true);
  });

  it('does not truncate exactly 200 characters', () => {
    const text = 'a'.repeat(200);
    const result = truncateDefinition(text);
    expect(result).toEqual({ short: text, truncated: false });
  });
});

describe('renderDefinitions', () => {
  it('returns missing message for empty array', () => {
    const html = renderDefinitions([]);
    expect(html).toContain('No definition found');
    expect(html).toContain('sarf-missing');
  });

  it('renders single definition with source label', () => {
    const html = renderDefinitions([{ word: 'كتاب', text: 'book', source: 'hw' }]);
    expect(html).toContain('sarf-definition');
    expect(html).toContain('<span class="sarf-source">Hans Wehr</span>');
    expect(html).toContain('book');
  });

  it('renders multiple definitions', () => {
    const html = renderDefinitions([
      { word: 'كتاب', text: 'book', source: 'hw' },
      { word: 'كتابة', text: 'writing', source: 'wk' },
    ]);
    expect(html).toContain('book');
    expect(html).toContain('writing');
    expect(html).toContain('Hans Wehr');
    expect(html).toContain('Wiktionary');
  });

  it('renders Hans Wehr source correctly', () => {
    const html = renderDefinitions([{ word: 'test', text: 'test', source: 'hw' }]);
    expect(html).toContain('Hans Wehr');
  });

  it('renders Wiktionary source correctly', () => {
    const html = renderDefinitions([{ word: 'test', text: 'test', source: 'wk' }]);
    expect(html).toContain('Wiktionary');
  });

  it('renders ellipsis for long definitions', () => {
    const longDef = { word: 'كتاب', text: 'a'.repeat(250), source: 'hw' };
    const html = renderDefinitions([longDef]);
    expect(html).toContain('sarf-ellipsis');
    expect(html).toContain('sarf-def-short');
    expect(html).toContain('sarf-def-full');
    expect(html).toContain('…');
  });

  it('does not render ellipsis for short definitions', () => {
    const shortDef = { word: 'كتاب', text: 'book', source: 'hw' };
    const html = renderDefinitions([shortDef]);
    expect(html).not.toContain('sarf-ellipsis');
    expect(html).not.toContain('sarf-def-short');
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

describe('pinTooltip', () => {
  let el: HTMLDivElement;

  beforeEach(() => {
    el = document.createElement('div');
    el.className = 'sarf-tooltip';
  });

  it('adds sarf-pinned class', () => {
    pinTooltip(el);
    expect(el.classList.contains('sarf-pinned')).toBe(true);
  });
});

describe('isPinned', () => {
  let el: HTMLDivElement;

  beforeEach(() => {
    el = document.createElement('div');
    el.className = 'sarf-tooltip';
  });

  it('returns true when pinned', () => {
    el.classList.add('sarf-pinned');
    expect(isPinned(el)).toBe(true);
  });

  it('returns false when not pinned', () => {
    expect(isPinned(el)).toBe(false);
  });
});

describe('hideTooltip', () => {
  let el: HTMLDivElement;

  beforeEach(() => {
    el = document.createElement('div');
    el.className = 'sarf-tooltip sarf-visible';
  });

  it('does not hide when pinned', () => {
    el.classList.add('sarf-pinned');
    hideTooltip(el);
    expect(el.classList.contains('sarf-visible')).toBe(true);
  });

  it('hides when not pinned', () => {
    hideTooltip(el);
    expect(el.classList.contains('sarf-visible')).toBe(false);
  });
});

describe('splitPos', () => {
  it('splits POS tag from features', () => {
    const result = splitPos('اسم|نسبة|مفرد|مؤنث|معرف');
    expect(result.tag).toBe('اسم');
    expect(result.features).toEqual(['نسبة', 'مفرد', 'مؤنث', 'معرف']);
  });

  it('handles single POS with no features', () => {
    const result = splitPos('فعل');
    expect(result.tag).toBe('فعل');
    expect(result.features).toEqual([]);
  });
});
