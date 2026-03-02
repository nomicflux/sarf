import type { MorphAnalysis } from '../lib/types';
import { fetchMorphoSys } from '../lib/alkhalil';
import type { MorphoSysAnalysis } from '../lib/alkhalil';
import { withTimeout } from '../lib/timeout';
import { createCache } from '../lib/cache';
import { lookupAnalysis, stripDiacritics } from '../lib/dictionary';
import { openDictDb, isDictPopulated, populateDict, queryByWord } from '../lib/dict-store';
import type { CompactEntry } from '../lib/dict-store';
import { getEnabledDicts } from '../lib/dict-prefs';
import { filterBySource } from '../lib/filter';
import { isAnalyzePortMessage } from '../lib/stream-types';
import type { StreamMessage } from '../lib/stream-types';

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

    chrome.runtime.onConnect.addListener((port) => {
      if (port.name !== 'sarf') return;
      port.onMessage.addListener((msg: unknown) => {
        if (!isAnalyzePortMessage(msg)) return;
        handleStreamAnalyze(msg.word, port);
      });
    });

    chrome.storage.onChanged.addListener((changes) => {
      if (changes.enabledDicts) cache.clear();
    });
  },
});

function portSend(port: chrome.runtime.Port, msg: StreamMessage): void {
  try { port.postMessage(msg); } catch { /* port disconnected */ }
}

async function handleStreamAnalyze(
  word: string, port: chrome.runtime.Port,
): Promise<void> {
  const cached = cache.get(word);
  if (cached) return portSend(port, { type: 'cached', data: cached });

  const { results, error } = await fetchMorphoSysSafe(word);
  const analysis = morphoSysToAnalysis(word, results, error);
  portSend(port, { type: 'morph', data: analysis });

  const withDict = await enrichWithDictionary(analysis);
  cache.set(word, withDict);
  portSend(port, { type: 'dict', definitions: withDict.definitions, root: withDict.root });
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
  const enabledSources = await getEnabledDicts();
  if (enabledSources.length === 0) return { ...analysis, definitions: [] };
  const database = await ensureDictReady();
  const lookup = (word: string) => queryByWord(database, word);
  const result = await lookupAnalysis(lookup, analysis);
  const filtered = filterBySource(result.entries, enabledSources);
  const root = analysis.root ?? result.rootWord;
  const definitions = filtered.map(e => ({ word: e.word, text: e.definition, source: e.source }));
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
