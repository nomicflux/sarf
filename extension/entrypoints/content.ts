import '../assets/tooltip.css';
import { containsArabic, extractWordAtOffset } from '../lib/arabic';
import { createTooltipElement, showTooltip, hideTooltip, pinTooltip, unpinTooltip, isPinned } from '../lib/tooltip';
import { getTextAtPoint } from '../lib/hit-test';
import { debounce } from '../lib/debounce';
import type { AnalyzeRequest, MorphAnalysis } from '../lib/types';

export default defineContentScript({
  matches: ['<all_urls>'],
  main(ctx) {
    const tooltip = createTooltipElement();
    let lastWord: string | null = null;

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

    function analyzeAndShow(word: string, x: number, y: number): void {
      const message: AnalyzeRequest = { type: 'analyze', word };
      chrome.runtime.sendMessage(message, (response: MorphAnalysis) => {
        showTooltip(tooltip, x, y, response);
      });
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
