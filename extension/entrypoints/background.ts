import type { MorphAnalysis } from '../lib/types';
import { fetchMorphoSys } from '../lib/alkhalil';
import type { MorphoSysAnalysis } from '../lib/alkhalil';
import { withTimeout } from '../lib/timeout';
import { createCache } from '../lib/cache';
import { lookupAnalysis, lookupByLemma, filterEntriesByPos, stripDiacritics } from '../lib/dictionary';
import { openDictDb, isDictPopulated, populateDict, queryByWord } from '../lib/dict-store';
import type { CompactEntry } from '../lib/dict-store';
import { getEnabledDicts, getDialect, getExtensionEnabled, getAnalysisCount } from '../lib/dict-prefs';
import type { Dialect } from '../lib/dict-prefs';
import { filterBySource } from '../lib/filter';
import { isAnalyzePortMessage } from '../lib/stream-types';
import type { StreamMessage } from '../lib/stream-types';
import { camelToAnalysis, deduplicateAnalyses } from '../lib/camel';

const cache = createCache<MorphAnalysis[]>(500, 30 * 60 * 1000);
let db: IDBDatabase | null = null;

const DIALECT_TO_CAMEL: Record<Dialect, string> = { egy: 'egy', gulf: 'gulf', lev: 'msa' };

function dialectToCamel(dialect: Dialect | null): string {
  return dialect ? DIALECT_TO_CAMEL[dialect] : 'msa';
}

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
        void runAnalyzeIfEnabled(msg.word, port);
      });
    });

    chrome.storage.onChanged.addListener((changes) => {
      if (changes.enabledDicts || changes.dialect) cache.clear();
    });
  },
});

function portSend(port: chrome.runtime.Port, msg: StreamMessage): void {
  try { port.postMessage(msg); } catch { /* port disconnected */ }
}

async function runAnalyzeIfEnabled(word: string, port: chrome.runtime.Port): Promise<void> {
  if (!(await getExtensionEnabled())) return;
  try {
    await handleStreamAnalyze(word, port);
  } catch (e) {
    portSend(port, { type: 'error', error: String(e) });
  }
}

async function handleStreamAnalyze(
  word: string, port: chrome.runtime.Port,
): Promise<void> {
  const cached = cache.get(word);
  if (cached) return portSend(port, { type: 'cached', data: cached });

  const dialect = await getDialect();
  const camelDialect = dialectToCamel(dialect);
  const raw = await fetchPyodideAnalysis(word, camelDialect) ?? [await fetchAlkhalilFallback(word)];
  const analyses = deduplicateAnalyses(raw);
  portSend(port, { type: 'morph', data: analyses });

  const lemmaOnly = analyses.length > 1;
  const withDicts = await Promise.all(analyses.map(a => enrichWithDictionary(a, lemmaOnly)));
  cache.set(word, withDicts);
  portSend(port, { type: 'dict', analyses: withDicts });
}

async function ensureOffscreen(): Promise<void> {
  try {
    await chrome.offscreen.createDocument({
      url: 'pyodide/offscreen.html',
      reasons: ['WORKERS'],
      justification: 'Run Pyodide for Arabic morphological analysis',
    });
  } catch { /* already exists */ }
}

async function fetchPyodideAnalysis(
  word: string, dialect: string,
): Promise<MorphAnalysis[] | null> {
  try {
    await ensureOffscreen();
    console.log('[sarf] sending to offscreen:', word, dialect);
    const topN = await getAnalysisCount();
    const response = await withTimeout(
      new Promise<any>((resolve) => {
        chrome.runtime.sendMessage(
          { type: 'offscreen-analyze', word, dialect, topN },
          (resp) => resolve(resp),
        );
      }),
      30000,
    );
    console.log('[sarf] offscreen response:', response);
    if (!response || response.error) {
      console.error('[sarf] offscreen returned error or empty:', response);
      return null;
    }
    return camelToAnalysis(word, response.analyses);
  } catch (e) {
    console.error('[sarf] fetchPyodideAnalysis failed:', e);
    return null;
  }
}

async function fetchAlkhalilFallback(word: string): Promise<MorphAnalysis> {
  try {
    const results = await withTimeout(fetchMorphoSys(word), 3000);
    return morphoSysToAnalysis(word, results, null);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return morphoSysToAnalysis(word, [], `MorphoSys failed: ${msg}`);
  }
}

async function enrichWithDictionary(analysis: MorphAnalysis, lemmaOnly = false): Promise<MorphAnalysis> {
  const enabledSources = await getEnabledDicts();
  if (enabledSources.length === 0) return { ...analysis, definitions: [] };
  const database = await ensureDictReady();
  const lookup = (word: string) => queryByWord(database, word);
  const result = lemmaOnly
    ? await lookupByLemma(lookup, analysis.lemmas[0] ?? '')
    : await lookupAnalysis(lookup, analysis);
  const byPos = filterEntriesByPos(result.entries, analysis.pos);
  const filtered = filterBySource(byPos, enabledSources);
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
