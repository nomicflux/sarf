const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

export function containsArabic(text: string): boolean {
  return ARABIC_REGEX.test(text);
}

export function extractWordAtOffset(text: string, offset: number): string | null {
  if (offset < 0 || offset >= text.length) {
    return null;
  }

  if (/\s/.test(text[offset]) || /[^\w\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text[offset])) {
    return null;
  }

  let start = offset;
  let end = offset;

  while (start > 0 && !/\s/.test(text[start - 1]) && !/[^\w\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text[start - 1])) {
    start--;
  }

  while (end < text.length - 1 && !/\s/.test(text[end + 1]) && !/[^\w\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text[end + 1])) {
    end++;
  }

  return text.substring(start, end + 1);
}
