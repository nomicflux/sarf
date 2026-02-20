import type { AnalyzeRequest, MorphAnalysis } from '../lib/types';
import { fetchMorphoSys } from '../lib/alkhalil';
import type { MorphoSysAnalysis } from '../lib/alkhalil';
import { withTimeout } from '../lib/timeout';
import { createCache } from '../lib/cache';
import { lookupAnalysis, stripDiacritics } from '../lib/dictionary';
import { openDictDb, isDictPopulated, populateDict, queryByWord } from '../lib/dict-store';
import type { CompactEntry } from '../lib/dict-store';

const cache = createCache<MorphAnalysis>(500, 30 * 60 * 1000);
let db: IDBDatabase | null = null;

async function ensureDictReady(): Promise<IDBDatabase> {
  if (db) return db;
  db = await openDictDb();
  if (await isDictPopulated(db)) return db;
  const url = chrome.runtime.getURL('dict-compact.json');
  const res = await fetch(url);
  const entries: CompactEntry[] = await res.json();
  await populateDict(db, entries);
  return db;
}

export default defineBackground({
  type: 'module',
  main() {
    ensureDictReady();

    chrome.runtime.onMessage.addListener(
      (message: unknown, _sender, sendResponse) => {
        if (!isAnalyzeRequest(message)) return;
        handleAnalyze(message.word, sendResponse);
        return true;
      }
    );
  },
});

function isAnalyzeRequest(msg: unknown): msg is AnalyzeRequest {
  return typeof msg === 'object' && msg !== null && (msg as AnalyzeRequest).type === 'analyze';
}

async function handleAnalyze(
  word: string,
  sendResponse: (response: MorphAnalysis) => void,
): Promise<void> {
  const cached = cache.get(word);
  if (cached) return sendResponse(cached);

  const { results, error } = await fetchMorphoSysSafe(word);
  const analysis = morphoSysToAnalysis(word, results, error);
  const withDict = await enrichWithDictionary(analysis);
  cache.set(word, withDict);
  sendResponse(withDict);
}

async function fetchMorphoSysSafe(
  word: string,
): Promise<{ results: MorphoSysAnalysis[]; error: string | null }> {
  try {
    const results = await withTimeout(fetchMorphoSys(word), 3000);
    return { results, error: null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { results: [], error: `MorphoSys failed: ${msg}` };
  }
}

async function enrichWithDictionary(analysis: MorphAnalysis): Promise<MorphAnalysis> {
  const database = await ensureDictReady();
  const lookup = (word: string) => queryByWord(database, word);
  const result = await lookupAnalysis(lookup, analysis);
  const root = analysis.root ?? result.rootWord;
  const definitions = result.entries.map(e => ({ word: e.word, text: e.definition, source: e.source }));
  return { ...analysis, definitions, root };
}

function morphoSysToAnalysis(
  original: string, results: MorphoSysAnalysis[], error: string | null,
): MorphAnalysis {
  if (results.length === 0) {
    return {
      original, prefixes: [], stem: original, verbStem: null,
      suffixes: [], root: null, pattern: null, definitions: [],
      lemmas: [], pos: null, isParticle: false, error,
    };
  }
  const first = results[0];
  const lemmas = [...new Set(results.map((r) => stripDiacritics(r.lemma)))];
  return {
    original, prefixes: first.prefixes,
    stem: stripDiacritics(first.lemma), verbStem: null,
    suffixes: first.suffixes,
    root: first.root !== '-' ? first.root : null,
    pattern: first.pattern, definitions: [], lemmas,
    pos: first.pos || null, isParticle: false, error: null,
  };
}
