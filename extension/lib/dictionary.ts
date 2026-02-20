export interface DictEntry {
  word: string;
  definition: string;
  rootWord: string;
  source: string;
}

export async function lookupWithFallback(
  lookup: (word: string) => Promise<DictEntry[]>,
  stem: string,
  verbStem: string | null,
): Promise<{ entries: DictEntry[]; rootWord: string | null }> {
  const entries = await lookup(stem);
  if (entries.length > 0) {
    return { entries, rootWord: entries[0].rootWord };
  }
  if (verbStem) {
    const fallback = await lookup(verbStem);
    if (fallback.length > 0) {
      return { entries: fallback, rootWord: fallback[0].rootWord };
    }
  }
  return { entries: [], rootWord: null };
}

const DIACRITICS = /[\u064B-\u065F\u0670]/g;

export function normalizeAlif(text: string): string {
  return text.replace(/[\u0622\u0623\u0625]/g, '\u0627');
}

export function stripDiacritics(text: string): string {
  return normalizeAlif(text.replace(DIACRITICS, ''));
}

export async function lookupByLemma(
  lookup: (word: string) => Promise<DictEntry[]>,
  lemma: string,
): Promise<{ entries: DictEntry[]; rootWord: string | null }> {
  const bare = stripDiacritics(lemma);
  const entries = await lookup(bare);
  if (entries.length === 0) return { entries: [], rootWord: null };
  return { entries, rootWord: entries[0].rootWord };
}

export async function lookupAnalysis(
  lookup: (word: string) => Promise<DictEntry[]>,
  analysis: { lemmas: string[]; stem: string; verbStem: string | null },
): Promise<{ entries: DictEntry[]; rootWord: string | null }> {
  const allEntries: DictEntry[] = [];
  let rootWord: string | null = null;
  for (const lemma of analysis.lemmas) {
    const result = await lookupByLemma(lookup, lemma);
    if (result.entries.length > 0) {
      allEntries.push(...result.entries);
      rootWord = rootWord ?? result.rootWord;
    }
  }
  if (allEntries.length > 0) return { entries: allEntries, rootWord };
  return lookupWithFallback(lookup, analysis.stem, analysis.verbStem);
}
