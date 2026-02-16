import type { MorphAnalysis } from './types';

export function createTooltipElement(): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'sarf-tooltip';
  document.body.appendChild(el);
  return el;
}

export function renderAnalysis(analysis: MorphAnalysis): string {
  if (analysis.isParticle) {
    return `<span class="sarf-particle">حرف</span> <span class="sarf-stem">${analysis.original}</span>`;
  }
  const parts: string[] = [];
  analysis.prefixes.forEach((p) => parts.push(`<span class="sarf-prefix">${p}</span>`));
  parts.push(`<span class="sarf-stem">${analysis.stem}</span>`);
  analysis.suffixes.forEach((s) => parts.push(`<span class="sarf-suffix">${s}</span>`));
  return parts.join('<span class="sarf-separator"> + </span>');
}

export function showTooltip(
  el: HTMLDivElement,
  x: number,
  y: number,
  analysis: MorphAnalysis,
): void {
  el.innerHTML = renderAnalysis(analysis);
  el.style.left = `${x + 15}px`;
  el.style.top = `${y + 10}px`;
  el.classList.add('sarf-visible');
}

export function hideTooltip(el: HTMLDivElement): void {
  el.classList.remove('sarf-visible');
}
