
interface OldDictEntry {
  id: number;
  word: string;
  definition: string;
  isRoot: boolean;
  parentId: number;
  source?: string;
  pos?: string;
}

export type CompactEntry = [string, string, string, string, string | null]; // [word, definition, rootWord, source, pos]

export function resolveRootWords(entries: OldDictEntry[]): Map<number, string> {
  const idToWord = new Map<number, string>();
  for (const entry of entries) {
    idToWord.set(entry.id, entry.word);
  }

  const rootWords = new Map<number, string>();
  for (const entry of entries) {
    const rootWord = idToWord.get(entry.parentId) ?? entry.word;
    rootWords.set(entry.id, rootWord);
  }
  return rootWords;
}

export function compactEntry(
  entry: OldDictEntry,
  rootWords: Map<number, string>,
  source: string
): CompactEntry {
  const rootWord = rootWords.get(entry.id) ?? entry.word;
  return [entry.word, entry.definition, rootWord, source, entry.pos ?? null];
}

export function compactDictionary(entries: OldDictEntry[], source: string): CompactEntry[] {
  const rootWords = resolveRootWords(entries);
  return entries.map((entry) => compactEntry(entry, rootWords, source));
}

export function filterOutSources(entries: CompactEntry[], sourcesToRemove: string[]): CompactEntry[] {
  return entries.filter(entry => !sourcesToRemove.includes(entry[3]));
}
