export interface DictEntry {
  id: number;
  word: string;
  definition: string;
  isRoot: boolean;
  parentId: number;
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
