export function getTextAtPoint(
  x: number,
  y: number,
): { text: string; offset: number } | null {
  let range = null;
  if ('caretRangeFromPoint' in document) {
    range = document.caretRangeFromPoint(x, y);
  } else {
    const position = (document as any).caretPositionFromPoint(x, y);
    if (position) {
      range = {
        startContainer: position.offsetNode,
        startOffset: position.offset,
      };
    }
  }

  if (!range?.startContainer) return null;

  const textNode = range.startContainer;
  const text = textNode.textContent ?? '';
  const offset = range.startOffset;

  return { text, offset };
}
