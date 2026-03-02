import '../assets/tooltip.css';
import { containsArabic, extractWordAtOffset } from '../lib/arabic';
import {
  createTooltipElement, showTooltip, showLoadingTooltip,
  updateTooltipMorph, updateTooltipDict,
  hideTooltip, pinTooltip, unpinTooltip, isPinned,
} from '../lib/tooltip';
import { getTextAtPoint } from '../lib/hit-test';
import { debounce } from '../lib/debounce';
import { getPosLanguage, type PosLanguage } from '../lib/dict-prefs';
import type { MorphAnalysis } from '../lib/types';
import type { StreamMessage, AnalyzePortMessage } from '../lib/stream-types';

export default defineContentScript({
  matches: ['<all_urls>'],
  main(ctx) {
    const tooltip = createTooltipElement();
    let lastWord: string | null = null;
    let currentPort: chrome.runtime.Port | null = null;
    let posLang: PosLanguage = 'en';
    getPosLanguage().then(lang => { posLang = lang; });
    chrome.storage.onChanged.addListener((changes) => {
      if (changes['posLanguage']) posLang = changes['posLanguage'].newValue as PosLanguage;
    });

    const onMouseMove = debounce((event: MouseEvent) => {
      if (isPinned(tooltip)) return;
      const result = getTextAtPoint(event.clientX, event.clientY);
      if (!result) return hideTooltip(tooltip);

      const word = extractWordAtOffset(result.text, result.offset);
      if (!word || !containsArabic(word)) return hideTooltip(tooltip);

      if (word === lastWord) return;
      lastWord = word;

      analyzeAndShow(word, event.clientX, event.clientY);
    }, 100);

    function disconnectPort(): void {
      if (currentPort) {
        currentPort.disconnect();
        currentPort = null;
      }
    }

    function analyzeAndShow(word: string, x: number, y: number): void {
      disconnectPort();
      showLoadingTooltip(tooltip, x, y);
      const port = chrome.runtime.connect({ name: 'sarf' });
      currentPort = port;
      port.onMessage.addListener((msg: StreamMessage) => {
        handleStreamMessage(msg, x, y);
      });
      port.postMessage({ type: 'analyze', word } as AnalyzePortMessage);
    }

    function handleStreamMessage(msg: StreamMessage, x: number, y: number): void {
      switch (msg.type) {
        case 'cached':
          showTooltip(tooltip, x, y, msg.data, posLang);
          disconnectPort();
          break;
        case 'morph':
          updateTooltipMorph(tooltip, msg.data, posLang);
          break;
        case 'dict':
          updateTooltipDict(tooltip, msg.definitions, msg.root);
          disconnectPort();
          break;
        case 'error':
          tooltip.innerHTML = `<div class="sarf-detail sarf-error">${msg.error}</div>`;
          disconnectPort();
          break;
      }
    }

    function onClick(event: MouseEvent): void {
      if (isPinned(tooltip)) {
        if (!tooltip.contains(event.target as Node)) {
          unpinTooltip(tooltip);
          lastWord = null;
        }
        return;
      }
      const result = getTextAtPoint(event.clientX, event.clientY);
      if (!result) return;
      const word = extractWordAtOffset(result.text, result.offset);
      if (word && containsArabic(word)) pinTooltip(tooltip);
    }

    ctx.addEventListener(document, 'mousemove', onMouseMove);
    ctx.addEventListener(document, 'click', onClick);
  },
});
