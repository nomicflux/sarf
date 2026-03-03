import * as https from 'https';
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import { extractGlosses, deduplicateEntries, stripDiacritics } from './build-wiktionary';
import { compactDictionary, filterOutSources, type CompactEntry } from './compact-dictionaries';

interface DictEntry {
  id: number;
  word: string;
  definition: string;
  isRoot: boolean;
  parentId: number;
  source: string;
}

interface WiktionaryEntry {
  word: string;
  lang_code: string;
  senses?: Array<{ glosses?: string[] }>;
}

interface DialectConfig {
  name: string;
  sources: Array<{ url: string; langCode: string }>;
  source: string;
  startId: number;
}

const DIALECTS: DialectConfig[] = [
  {
    name: 'Egyptian Arabic',
    sources: [
      { url: 'https://kaikki.org/dictionary/Egyptian%20Arabic/kaikki.org-dictionary-EgyptianArabic.jsonl', langCode: 'arz' },
    ],
    source: 'wk-egy',
    startId: 100000,
  },
  {
    name: 'Levantine Arabic',
    sources: [
      { url: 'https://kaikki.org/dictionary/South%20Levantine%20Arabic/kaikki.org-dictionary-SouthLevantineArabic.jsonl', langCode: 'ajp' },
      { url: 'https://kaikki.org/dictionary/North%20Levantine%20Arabic/kaikki.org-dictionary-NorthLevantineArabic.jsonl', langCode: 'apc' },
    ],
    source: 'wk-lev',
    startId: 200000,
  },
  {
    name: 'Gulf Arabic',
    sources: [
      { url: 'https://kaikki.org/dictionary/Gulf%20Arabic/kaikki.org-dictionary-GulfArabic.jsonl', langCode: 'afb' },
    ],
    source: 'wk-gulf',
    startId: 300000,
  },
];

export function createDialectEntries(deduplicated: Map<string, string>, source: string, startId: number): DictEntry[] {
  const entries: DictEntry[] = [];
  let id = startId;
  for (const [word, definition] of deduplicated) {
    entries.push({
      id,
      word,
      definition,
      isRoot: false,
      parentId: id,
      source,
    });
    id++;
  }
  return entries;
}

function downloadJsonl(url: string, langCode: string): Promise<Map<string, string[]>> {
  return new Promise((resolve, reject) => {
    const glossMap = new Map<string, string[]>();

    https.get(url, (response) => {
      const rl = readline.createInterface({ input: response });

      rl.on('line', (line) => {
        const entry = JSON.parse(line) as WiktionaryEntry;

        if (entry.lang_code !== langCode) return;

        const glosses = extractGlosses(entry);
        if (glosses.length === 0) return;

        const normalized = stripDiacritics(entry.word);
        const existing = glossMap.get(normalized) || [];
        glossMap.set(normalized, [...existing, ...glosses]);
      });

      rl.on('close', () => {
        resolve(glossMap);
      });

      rl.on('error', reject);
    }).on('error', reject);
  });
}

async function downloadDialect(dialect: DialectConfig): Promise<DictEntry[]> {
  console.log(`Processing ${dialect.name}...`);

  const glossMap = new Map<string, string[]>();

  for (const source of dialect.sources) {
    console.log(`  Downloading ${source.url}...`);
    const sourceMap = await downloadJsonl(source.url, source.langCode);
    for (const [word, glosses] of sourceMap) {
      const existing = glossMap.get(word) || [];
      glossMap.set(word, [...existing, ...glosses]);
    }
  }

  const deduplicated = deduplicateEntries(glossMap);
  const entries = createDialectEntries(deduplicated, dialect.source, dialect.startId);
  console.log(`  ${entries.length} entries`);
  return entries;
}

async function buildAll(): Promise<void> {
  const compactPath = path.join(__dirname, '../extension/public/dict-compact.json');
  const dialectSources = DIALECTS.map(d => d.source);

  const existing = JSON.parse(fs.readFileSync(compactPath, 'utf-8')) as CompactEntry[];
  const base = filterOutSources(existing, dialectSources);

  const dialectEntries: CompactEntry[] = [];
  for (const dialect of DIALECTS) {
    const entries = await downloadDialect(dialect);
    dialectEntries.push(...compactDictionary(entries, dialect.source));
  }

  const combined = [...base, ...dialectEntries];
  fs.writeFileSync(compactPath, JSON.stringify(combined));

  const outputSize = fs.statSync(compactPath).size;
  console.log(`Base entries (hw + wk): ${base.length}`);
  console.log(`Dialect entries added: ${dialectEntries.length}`);
  console.log(`Total: ${combined.length}`);
  console.log(`File size: ${(outputSize / 1024 / 1024).toFixed(2)} MB`);
}

if (require.main === module) {
  buildAll().catch(console.error);
}
