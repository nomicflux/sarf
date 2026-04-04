import '../assets/tooltip.css';
import { containsArabic, extractWordAtOffset } from '../lib/arabic';
import {
  createTooltipElement, showTooltip, showLoadingTooltip,
  updateTooltipMorph,
  hideTooltip, pinTooltip, unpinTooltip, isPinned,
} from '../lib/tooltip';
import { getTextAtPoint } from '../lib/hit-test';
import { debounce } from '../lib/debounce';
import {
  getPosLanguage, getExtensionEnabled, EXTENSION_ENABLED_STORAGE_KEY, type PosLanguage,
} from '../lib/dict-prefs';
import type { StreamMessage, AnalyzePortMessage } from '../lib/stream-types';

export default defineContentScript({
  matches: ['<all_urls>'],
  main(ctx) {
    const tooltip = createTooltipElement();
    let lastWord: string | null = null;
    let currentPort: chrome.runtime.Port | null = null;
    let posLang: PosLanguage = 'en';
    let extensionOn = true;

    function disconnectPort(): void {
      if (currentPort) {
        currentPort.disconnect();
        currentPort = null;
      }
    }

    function stopExtensionUi(): void {
      disconnectPort();
      lastWord = null;
      unpinTooltip(tooltip);
    }

    getPosLanguage().then(lang => { posLang = lang; });
    getExtensionEnabled().then(v => { extensionOn = v; });

    chrome.storage.onChanged.addListener((changes) => {
      if (changes.posLanguage) posLang = changes.posLanguage.newValue as PosLanguage;
      if (!changes[EXTENSION_ENABLED_STORAGE_KEY]) return;
      const nv = changes[EXTENSION_ENABLED_STORAGE_KEY].newValue;
      extensionOn = typeof nv === 'boolean' ? nv : true;
      if (!extensionOn) stopExtensionUi();
    });

    const onMouseMove = debounce((event: MouseEvent) => {
      if (!extensionOn) return unpinTooltip(tooltip);
      if (isPinned(tooltip)) return;
      const result = getTextAtPoint(event.clientX, event.clientY);
      if (!result) return hideTooltip(tooltip);

      const word = extractWordAtOffset(result.text, result.offset);
      if (!word || !containsArabic(word)) return hideTooltip(tooltip);

      if (word === lastWord) return;
      lastWord = word;

      analyzeAndShow(word, event.clientX, event.clientY);
    }, 100);

    function analyzeAndShow(word: string, x: number, y: number): void {
      if (!extensionOn) return;
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
          showTooltip(tooltip, x, y, msg.analyses, posLang);
          disconnectPort();
          break;
        case 'error':
          tooltip.innerHTML = `<div class="sarf-detail sarf-error">${msg.error}</div>`;
          disconnectPort();
          break;
      }
    }

    function onClick(event: MouseEvent): void {
      if (!extensionOn) return;
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
