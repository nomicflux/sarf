import type { MorphAnalysis } from './types';

const MAX_DEF_LENGTH = 200;

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

export function truncateDefinition(text: string): { short: string; truncated: boolean } {
  if (text.length <= MAX_DEF_LENGTH) return { short: text, truncated: false };
  return { short: text.slice(0, MAX_DEF_LENGTH), truncated: true };
}

function renderRoot(root: string | null): string {
  if (root) return `<div class="sarf-detail">Root: <span class="sarf-value">${root}</span></div>`;
  return '<div class="sarf-detail sarf-missing">Root: —</div>';
}

function renderOneDefinition(def: { word: string; text: string; source: string }): string {
  const label = def.source === 'hw' ? 'Hans Wehr' : 'Wiktionary';
  const sourceSpan = `<span class="sarf-source">${label}</span>`;
  const wordSpan = `<span class="sarf-def-word">${def.word}</span>`;
  const { short, truncated } = truncateDefinition(def.text);
  if (!truncated) return `<div class="sarf-definition">${sourceSpan} ${wordSpan} ${def.text}</div>`;
  return `<div class="sarf-definition">${sourceSpan} ${wordSpan} <span class="sarf-def-short">${short}</span><span class="sarf-def-full">${def.text}</span><span class="sarf-ellipsis">…</span></div>`;
}

export function renderDefinitions(definitions: Array<{ word: string; text: string; source: string }>): string {
  if (definitions.length === 0) {
    return '<div class="sarf-definition sarf-missing">No definition found</div>';
  }
  return definitions.map(renderOneDefinition).join('');
}

function renderLemmas(lemmas: string[]): string {
  if (lemmas.length === 0) return '';
  return `<div class="sarf-detail">Lemma: <span class="sarf-value">${lemmas.join(', ')}</span></div>`;
}

export function splitPos(pos: string): { tag: string; features: string[] } {
  const parts = pos.split('|');
  return { tag: parts[0], features: parts.slice(1) };
}

function renderPos(pos: string | null): string {
  if (!pos) return '';
  const { tag, features } = splitPos(pos);
  const feats = features.length > 0 ? ` · <span class="sarf-features">${features.join(' · ')}</span>` : '';
  return `<div class="sarf-detail">POS: <span class="sarf-value">${tag}</span>${feats}</div>`;
}

function renderError(error: string | null): string {
  if (!error) return '';
  return `<div class="sarf-detail sarf-error">${error}</div>`;
}

export function attachEllipsisHandlers(container: HTMLElement): void {
  container.querySelectorAll('.sarf-ellipsis').forEach(span => {
    span.addEventListener('click', () => {
      span.parentElement?.classList.add('sarf-expanded');
    });
  });
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
    html += `<div class="sarf-detail">Pattern: <span class="sarf-value">${analysis.pattern}</span></div>`;
  }
  html += '<hr class="sarf-divider">';
  html += renderDefinitions(analysis.definitions);
  return html;
}

export function showTooltip(
  el: HTMLDivElement,
  x: number,
  y: number,
  analysis: MorphAnalysis,
): void {
  el.innerHTML = renderAnalysis(analysis);
  attachEllipsisHandlers(el);
  el.classList.add('sarf-visible');
  const pos = clampPosition(x, y, window.innerWidth, window.innerHeight, el.offsetWidth, el.offsetHeight);
  el.style.left = `${pos.x}px`;
  el.style.top = `${pos.y}px`;
}

export function pinTooltip(el: HTMLDivElement): void {
  el.classList.add('sarf-pinned');
}

export function unpinTooltip(el: HTMLDivElement): void {
  el.classList.remove('sarf-pinned');
  hideTooltip(el);
}

export function isPinned(el: HTMLDivElement): boolean {
  return el.classList.contains('sarf-pinned');
}

export function hideTooltip(el: HTMLDivElement): void {
  if (isPinned(el)) return;
  el.classList.remove('sarf-visible');
}
