import * as https from 'https';
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { compactDictionary, filterOutSources, type CompactEntry } from './compact-dictionaries';

interface DictEntry {
  id: number;
  word: string;
  definition: string;
  isRoot: boolean;
  parentId: number;
  source: string;
  pos?: string;
}

interface WiktionaryEntry {
  word: string;
  lang_code: string;
  pos?: string;
  senses?: Array<{ glosses?: string[] }>;
}

const DIACRITICS = /[\u064B-\u065F\u0670]/g;
const START_ID = 24931;
const COMPACT_PATH = path.join(__dirname, '../extension/public/dict-compact.json');
const WIKTIONARY_URL = 'https://kaikki.org/dictionary/Arabic/kaikki.org-dictionary-Arabic.jsonl';

export function normalizeAlif(text: string): string {
  return text.replace(/[\u0622\u0623\u0625]/g, '\u0627');
}

export function stripDiacritics(text: string): string {
  return normalizeAlif(text.replace(DIACRITICS, ''));
}

export function extractGlosses(entry: WiktionaryEntry): string[] {
  if (!entry.senses) return [];
  const glosses: string[] = [];
  for (const sense of entry.senses) {
    if (sense.glosses && sense.glosses.length > 0) {
      glosses.push(...sense.glosses);
    }
  }
  return glosses;
}

export function mergeGlosses(glosses: string[]): string {
  return glosses.join('; ');
}

export function deduplicateEntries(entries: Map<string, string[]>): Map<string, string> {
  const result = new Map<string, string>();
  for (const [word, glosses] of entries) {
    result.set(word, mergeGlosses(glosses));
  }
  return result;
}

export function createDictEntries(deduplicated: Map<string, string>): DictEntry[] {
  const entries: DictEntry[] = [];
  let id = START_ID;
  for (const [key, definition] of deduplicated) {
    const pipe = key.indexOf('|');
    const word = key.slice(0, pipe);
    const pos = key.slice(pipe + 1);
    entries.push({ id, word, definition, isRoot: false, parentId: id, source: 'wk', pos });
    id++;
  }
  return entries;
}

function downloadAndProcess(): Promise<void> {
  return new Promise((resolve, reject) => {
    const glossMap = new Map<string, string[]>();
    let totalProcessed = 0;

    https.get(WIKTIONARY_URL, (response) => {
      const rl = readline.createInterface({ input: response });

      rl.on('line', (line) => {
        totalProcessed++;
        const entry = JSON.parse(line) as WiktionaryEntry;

        if (entry.lang_code !== 'ar') return;

        const glosses = extractGlosses(entry);
        if (glosses.length === 0) return;

        const normalized = stripDiacritics(entry.word);
        const pos = entry.pos ?? 'unknown';
        const key = `${normalized}|${pos}`;
        const existing = glossMap.get(key) || [];
        glossMap.set(key, [...existing, ...glosses]);
      });

      rl.on('close', () => {
        const deduplicated = deduplicateEntries(glossMap);
        const entries = createDictEntries(deduplicated);
        const newWk = compactDictionary(entries, 'wk');

        const existing = JSON.parse(fs.readFileSync(COMPACT_PATH, 'utf-8')) as CompactEntry[];
        const base = filterOutSources(existing, ['wk']);
        const combined = [...base, ...newWk];
        fs.writeFileSync(COMPACT_PATH, JSON.stringify(combined));

        console.log(`Processed ${totalProcessed} JSONL entries`);
        console.log(`New wk entries: ${newWk.length}`);
        console.log(`Total entries: ${combined.length}`);
        console.log(`File size: ${(fs.statSync(COMPACT_PATH).size / 1024 / 1024).toFixed(2)} MB`);
        resolve();
      });

      rl.on('error', reject);
    }).on('error', reject);
  });
}

if (require.main === module) {
  downloadAndProcess().catch(console.error);
}
