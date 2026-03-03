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

export function readAndCompact(filePath: string, source: string): CompactEntry[] {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as OldDictEntry[];
  return compactDictionary(data, source);
}

export function filterOutSources(entries: CompactEntry[], sourcesToRemove: string[]): CompactEntry[] {
  return entries.filter(entry => !sourcesToRemove.includes(entry[3]));
}

if (require.main === module) {
  const publicDir = path.join(__dirname, '../extension/public');
  const compactPath = path.join(publicDir, 'dict-compact.json');

  const DIALECT_FILES = [
    { file: 'wiktionary-egy.json', source: 'wk-egy' },
    { file: 'wiktionary-lev.json', source: 'wk-lev' },
    { file: 'wiktionary-gulf.json', source: 'wk-gulf' },
  ];

  const dialectSources = DIALECT_FILES.map(d => d.source);

  // Read existing compact data (has hw + wk already)
  const existing = JSON.parse(fs.readFileSync(compactPath, 'utf-8')) as CompactEntry[];

  // Remove any old dialect entries so this script is re-runnable
  const base = filterOutSources(existing, dialectSources);

  // Compact each dialect file and append
  const dialectEntries: CompactEntry[] = [];
  for (const { file, source } of DIALECT_FILES) {
    const filePath = path.join(publicDir, file);
    dialectEntries.push(...readAndCompact(filePath, source));
  }

  const combined = [...base, ...dialectEntries];

  fs.writeFileSync(compactPath, JSON.stringify(combined));

  const outputSize = fs.statSync(compactPath).size;
  console.log(`Base entries (hw + wk): ${base.length}`);
  console.log(`Dialect entries added: ${dialectEntries.length}`);
  console.log(`Total: ${combined.length}`);
  console.log(`File size: ${(outputSize / 1024 / 1024).toFixed(2)} MB`);
}
