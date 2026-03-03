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

export async function fetchCamel(
  word: string,
  dialect: string,
): Promise<CamelAnalysis[]> {
  const response = await fetch('http://localhost:8000/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ word, dialect }),
  });
  const data = await response.json();
  return data.analyses;
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
    pattern: first.pattern || null,
    definitions: [],
    lemmas,
    pos: first.pos || null,
    isParticle: false,
    error: null,
  };
}
