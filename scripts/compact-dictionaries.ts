import * as fs from 'fs';
import * as path from 'path';

interface OldDictEntry {
  id: number;
  word: string;
  definition: string;
  isRoot: boolean;
  parentId: number;
  source?: string;
}

export type CompactEntry = [string, string, string, string]; // [word, definition, rootWord, source]

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
  return [entry.word, entry.definition, rootWord, source];
}

export function compactDictionary(entries: OldDictEntry[], source: string): CompactEntry[] {
  const rootWords = resolveRootWords(entries);
  return entries.map((entry) => compactEntry(entry, rootWords, source));
}

if (require.main === module) {
  const hanswehrPath = path.join(__dirname, '../extension/public/hanswehr.json');
  const wiktionaryPath = path.join(__dirname, '../extension/public/wiktionary.json');
  const outputPath = path.join(__dirname, '../extension/public/dict-compact.json');

  const hanswehrData = JSON.parse(fs.readFileSync(hanswehrPath, 'utf-8')) as OldDictEntry[];
  const wiktionaryData = JSON.parse(fs.readFileSync(wiktionaryPath, 'utf-8')) as OldDictEntry[];

  const wiktionaryCompact = compactDictionary(wiktionaryData, 'wk');
  const hanswehrCompact = compactDictionary(hanswehrData, 'hw');

  const combined = [...wiktionaryCompact, ...hanswehrCompact];

  const hanswehrSize = fs.statSync(hanswehrPath).size;
  const wiktionarySize = fs.statSync(wiktionaryPath).size;
  const totalBefore = hanswehrSize + wiktionarySize;

  fs.writeFileSync(outputPath, JSON.stringify(combined));

  const outputSize = fs.statSync(outputPath).size;

  console.log(`Before: ${(totalBefore / 1024 / 1024).toFixed(2)} MB`);
  console.log(`After: ${(outputSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Combined ${combined.length} entries`);
}
