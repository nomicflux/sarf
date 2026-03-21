import { MorphAnalysis } from './types';
import { stripDiacritics } from './dictionary';

export interface CamelAnalysis {
  lemma: string;
  root: string;
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

export function camelToAnalysis(
  original: string,
  results: CamelAnalysis[],
): MorphAnalysis {
  if (results.length === 0) {
    return {
      original,
      prefixes: [],
      stem: original,
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
  }

  const first = results[0];
  const lemmas = [...new Set(results.map(r => stripDiacritics(r.lemma)))];

  return {
    original,
    prefixes: first.prefixes,
    stem: stripDiacritics(first.lemma),
    verbStem: null,
    suffixes: first.suffixes,
    root: first.root || null,
    pattern: cleanPattern(first.pattern),
    definitions: [],
    lemmas,
    pos: first.pos || null,
    isParticle: false,
    error: null,
  };
}
