import { init, analyze_word } from '../../pkg/sarf_core';
import type { AnalyzeRequest, MorphAnalysis } from '../lib/types';

export default defineBackground({
  type: 'module',
  main() {
    init();

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

function handleAnalyze(
  word: string,
  sendResponse: (response: MorphAnalysis) => void,
): void {
  const json = analyze_word(word);
  sendResponse(parseAnalysis(json));
}

function parseAnalysis(json: string): MorphAnalysis {
  const raw = JSON.parse(json);
  return {
    original: raw.original,
    prefixes: raw.prefixes,
    stem: raw.stem,
    suffixes: raw.suffixes,
    root: raw.root ?? null,
    pattern: raw.pattern ?? null,
    definition: null,
    isParticle: raw.is_particle,
  };
}
