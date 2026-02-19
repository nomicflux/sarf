export interface DictEntry {
  id: number;
  word: string;
  definition: string;
  isRoot: boolean;
  parentId: number;
  source: string;
}

export interface DictIndex {
  byWord: Map<string, DictEntry[]>;
  byId: Map<number, DictEntry>;
}

export function buildIndex(entries: DictEntry[]): DictIndex {
  const byWord = new Map<string, DictEntry[]>();
  const byId = new Map<number, DictEntry>();
  for (const entry of entries) {
    byId.set(entry.id, entry);
    const existing = byWord.get(entry.word);
    if (existing) existing.push(entry);
    else byWord.set(entry.word, [entry]);
  }
  return { byWord, byId };
}

export function lookupWord(index: DictIndex, word: string): DictEntry | null {
  return index.byWord.get(word)?.[0] ?? null;
}

export function findRootEntry(index: DictIndex, entry: DictEntry): DictEntry | null {
  if (entry.isRoot) return entry;
  return index.byId.get(entry.parentId) ?? null;
}

export function lookupDefinition(index: DictIndex, word: string): string | null {
  const entry = lookupWord(index, word);
  if (!entry) return null;
  return entry.definition;
}

export function lookupRootWord(index: DictIndex, word: string): string | null {
  const entry = lookupWord(index, word);
  if (!entry) return null;
  const root = findRootEntry(index, entry);
  return root?.word ?? null;
}

export function lookupAllWords(index: DictIndex, word: string): DictEntry[] {
  return index.byWord.get(word) ?? [];
}

export function lookupWithFallback(
  index: DictIndex,
  stem: string,
  verbStem: string | null,
): { entries: DictEntry[]; rootWord: string | null } {
  const entries = lookupAllWords(index, stem);
  if (entries.length > 0) {
    const root = findRootEntry(index, entries[0]);
    return { entries, rootWord: root?.word ?? null };
  }
  if (verbStem) {
    const fallback = lookupAllWords(index, verbStem);
    if (fallback.length > 0) {
      const root = findRootEntry(index, fallback[0]);
      return { entries: fallback, rootWord: root?.word ?? null };
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

export function lookupByLemma(
  index: DictIndex, lemma: string,
): { entries: DictEntry[]; rootWord: string | null } {
  const bare = stripDiacritics(lemma);
  const entries = lookupAllWords(index, bare);
  if (entries.length === 0) return { entries: [], rootWord: null };
  const root = findRootEntry(index, entries[0]);
  return { entries, rootWord: root?.word ?? null };
}

export function lookupAnalysis(
  index: DictIndex,
  analysis: { lemmas: string[]; stem: string; verbStem: string | null },
): { entries: DictEntry[]; rootWord: string | null } {
  const allEntries: DictEntry[] = [];
  let rootWord: string | null = null;
  for (const lemma of analysis.lemmas) {
    const result = lookupByLemma(index, lemma);
    if (result.entries.length > 0) {
      allEntries.push(...result.entries);
      rootWord = rootWord ?? result.rootWord;
    }
  }
  if (allEntries.length > 0) return { entries: allEntries, rootWord };
  return lookupWithFallback(index, analysis.stem, analysis.verbStem);
}
