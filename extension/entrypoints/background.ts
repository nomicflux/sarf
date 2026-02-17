import { init, analyze_word } from '../../pkg/sarf_core';
import type { AnalyzeRequest, MorphAnalysis } from '../lib/types';
import { farasaStem } from '../lib/farasa';
import { alkhalilRoot } from '../lib/alkhalil';
import { withTimeout } from '../lib/timeout';
import { createCache } from '../lib/cache';
import { buildIndex, lookupWithFallback } from '../lib/dictionary';
import type { DictEntry, DictIndex } from '../lib/dictionary';

const cache = createCache<MorphAnalysis>(500, 30 * 60 * 1000);
let dictIndex: DictIndex | null = null;

async function loadDictionary(): Promise<DictIndex> {
  if (dictIndex) return dictIndex;
  const url = chrome.runtime.getURL('hanswehr.json');
  const res = await fetch(url);
  const entries: DictEntry[] = await res.json();
  dictIndex = buildIndex(entries);
  return dictIndex;
}

export default defineBackground({
  type: 'module',
  main() {
    init();
    loadDictionary();

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

  const result = parseAnalysis(analyze_word(word));
  const enriched = await enrichWithFarasa(result);
  const withAlkhalil = await enrichWithAlkhalil(enriched);
  const withDict = await enrichWithDictionary(withAlkhalil);
  cache.set(word, withDict);
  sendResponse(withDict);
}

function parseAnalysis(json: string): MorphAnalysis {
  const raw = JSON.parse(json);
  return {
    original: raw.original,
    prefixes: raw.prefixes,
    stem: raw.stem,
    verbStem: raw.verb_stem ?? null,
    suffixes: raw.suffixes,
    root: raw.root ?? null,
    pattern: raw.pattern ?? null,
    definition: null,
    isParticle: raw.is_particle,
  };
}

async function enrichWithDictionary(analysis: MorphAnalysis): Promise<MorphAnalysis> {
  const dict = await loadDictionary();
  const { definition, rootWord } = lookupWithFallback(dict, analysis.stem, analysis.verbStem);
  const root = analysis.root ?? rootWord;
  return { ...analysis, definition, root };
}

async function enrichWithFarasa(analysis: MorphAnalysis): Promise<MorphAnalysis> {
  if (analysis.isParticle) return analysis;
  const apiKey = await getApiKey();
  if (!apiKey) return analysis;
  return applyFarasaRoot(analysis, apiKey);
}

async function getApiKey(): Promise<string | null> {
  const data = await chrome.storage.local.get('farasaApiKey');
  const key = data.farasaApiKey;
  return typeof key === 'string' ? key : null;
}

async function applyFarasaRoot(analysis: MorphAnalysis, apiKey: string): Promise<MorphAnalysis> {
  try {
    const root = await withTimeout(farasaStem(analysis.stem, apiKey), 3000);
    return { ...analysis, root: root || analysis.root };
  } catch {
    return analysis;
  }
}

async function enrichWithAlkhalil(analysis: MorphAnalysis): Promise<MorphAnalysis> {
  if (analysis.root || analysis.isParticle) return analysis;
  return applyAlkhalilRoot(analysis);
}

async function applyAlkhalilRoot(analysis: MorphAnalysis): Promise<MorphAnalysis> {
  try {
    const root = await withTimeout(alkhalilRoot(analysis.stem), 3000);
    return { ...analysis, root: root || analysis.root };
  } catch {
    return analysis;
  }
}
