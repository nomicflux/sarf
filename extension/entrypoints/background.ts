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
  analyze_word(word);
  sendResponse(createStubAnalysis(word));
}

function createStubAnalysis(word: string): MorphAnalysis {
  return {
    original: word,
    stem: word,
    prefixes: [],
    suffixes: [],
    root: null,
    pattern: null,
    definition: null,
    isParticle: false,
  };
}
