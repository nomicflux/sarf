import type { MorphAnalysis } from './types';
import { stripDiacritics } from './dictionary';

export interface CamelAnalysis {
  lemma: string;
  root: string;
  stem: string;
  pos: string;
  gloss: string;
  pattern: string;
  diac: string;
  prefixes: string[];
  suffixes: string[];
  features: Record<string, string>;
}

function cleanPattern(pattern: string): string | null {
  if (!pattern) return null;
  return pattern.replace(/1/g, 'ف').replace(/2/g, 'ع').replace(/3/g, 'ل');
}

function hasBreakdown(a: MorphAnalysis): boolean {
  return a.prefixes.length > 0 || a.suffixes.length > 0;
}

export function deduplicateAnalyses(analyses: MorphAnalysis[]): MorphAnalysis[] {
  const seen = new Map<string, MorphAnalysis>();
  for (const a of analyses) {
    const key = `${a.lemmas[0] ?? ''}|${a.pos ?? ''}`;
    const existing = seen.get(key);
    if (!existing || (!hasBreakdown(existing) && hasBreakdown(a))) seen.set(key, a);
  }
  return [...seen.values()];
}

export function camelToAnalysis(
  original: string,
  results: CamelAnalysis[],
): MorphAnalysis[] {
  if (results.length === 0) {
    return [{
      original, prefixes: [], stem: original, verbStem: null,
      suffixes: [], root: null, pattern: null, definitions: [],
      lemmas: [], pos: null, isParticle: false, error: null,
    }];
  }
  return results.map(r => ({
    original,
    prefixes: r.prefixes,
    stem: r.stem ? stripDiacritics(r.stem) : stripDiacritics(r.lemma),
    verbStem: null,
    suffixes: r.suffixes,
    root: r.root || null,
    pattern: cleanPattern(r.pattern),
    definitions: [],
    lemmas: [stripDiacritics(r.lemma)],
    pos: r.pos || null,
    isParticle: false,
    error: null,
  }));
}
