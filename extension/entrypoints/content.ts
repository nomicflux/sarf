import '../assets/tooltip.css';
import { containsArabic, extractWordAtOffset } from '../lib/arabic';
import { createTooltipElement, showTooltip, hideTooltip } from '../lib/tooltip';
import { getTextAtPoint } from '../lib/hit-test';

export default defineContentScript({
  matches: ['<all_urls>'],
  main(ctx) {
    const tooltip = createTooltipElement();

    const onMouseMove = (event: MouseEvent) => {
      const result = getTextAtPoint(event.clientX, event.clientY);
      if (!result) return hideTooltip(tooltip);

      const word = extractWordAtOffset(result.text, result.offset);
      if (!word || !containsArabic(word)) return hideTooltip(tooltip);

      showTooltip(tooltip, event.clientX, event.clientY, word);
    };

    ctx.addEventListener(document, 'mousemove', onMouseMove);
  },
});
