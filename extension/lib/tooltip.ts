import type { MorphAnalysis } from './types';

export function clampPosition(
  x: number,
  y: number,
  viewW: number,
  viewH: number,
  elW: number,
  elH: number,
): { x: number; y: number } {
  const cx = Math.min(x + 15, viewW - elW - 8);
  const cy = Math.min(y + 10, viewH - elH - 8);
  return { x: Math.max(8, cx), y: Math.max(8, cy) };
}

export function createTooltipElement(): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'sarf-tooltip';
  document.body.appendChild(el);
  return el;
}

function renderRoot(root: string | null): string {
  if (root) return `<div class="sarf-detail">Root: ${root}</div>`;
  return '<div class="sarf-detail sarf-missing">Root: —</div>';
}

function renderDefinition(definition: string | null): string {
  if (definition) return `<div class="sarf-definition">${definition}</div>`;
  return '<div class="sarf-definition sarf-missing">No definition found</div>';
}

function renderLemmas(lemmas: string[]): string {
  if (lemmas.length === 0) return '';
  return `<div class="sarf-detail">Lemma: ${lemmas.join(', ')}</div>`;
}

function renderPos(pos: string | null): string {
  if (!pos) return '';
  return `<div class="sarf-detail sarf-pos">${pos}</div>`;
}

function renderError(error: string | null): string {
  if (!error) return '';
  return `<div class="sarf-detail sarf-error">${error}</div>`;
}

export function renderAnalysis(analysis: MorphAnalysis): string {
  if (analysis.error) return renderError(analysis.error);
  const parts: string[] = [];
  analysis.prefixes.forEach((p) => parts.push(`<span class="sarf-prefix">${p}</span>`));
  parts.push(`<span class="sarf-stem">${analysis.stem}</span>`);
  analysis.suffixes.forEach((s) => parts.push(`<span class="sarf-suffix">${s}</span>`));
  let html = parts.join('<span class="sarf-separator"> + </span>');
  html += renderLemmas(analysis.lemmas);
  html += renderRoot(analysis.root);
  html += renderPos(analysis.pos);
  if (analysis.pattern) {
    html += `<div class="sarf-detail">Pattern: ${analysis.pattern}</div>`;
  }
  html += renderDefinition(analysis.definition);
  return html;
}

export function showTooltip(
  el: HTMLDivElement,
  x: number,
  y: number,
  analysis: MorphAnalysis,
): void {
  el.innerHTML = renderAnalysis(analysis);
  el.classList.add('sarf-visible');
  const pos = clampPosition(x, y, window.innerWidth, window.innerHeight, el.offsetWidth, el.offsetHeight);
  el.style.left = `${pos.x}px`;
  el.style.top = `${pos.y}px`;
}

export function hideTooltip(el: HTMLDivElement): void {
  el.classList.remove('sarf-visible');
}
