export function createTooltipElement(): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'sarf-tooltip';
  document.body.appendChild(el);
  return el;
}

export function showTooltip(
  el: HTMLDivElement,
  x: number,
  y: number,
  text: string,
): void {
  el.textContent = text;
  el.style.left = `${x + 15}px`;
  el.style.top = `${y + 10}px`;
  el.classList.add('sarf-visible');
}

export function hideTooltip(el: HTMLDivElement): void {
  el.classList.remove('sarf-visible');
}
