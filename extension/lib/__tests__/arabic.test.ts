import { describe, it, expect } from 'vitest';
import { containsArabic, extractWordAtOffset } from '../arabic';

describe('containsArabic', () => {
  it('returns true for Arabic text', () => {
    expect(containsArabic('مرحبا')).toBe(true);
  });

  it('returns false for English text', () => {
    expect(containsArabic('hello')).toBe(false);
  });

  it('returns true for mixed text', () => {
    expect(containsArabic('hello مرحبا')).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(containsArabic('')).toBe(false);
  });
});

describe('extractWordAtOffset', () => {
  it('extracts word from middle', () => {
    expect(extractWordAtOffset('hello world', 7)).toBe('world');
  });

  it('extracts word from start', () => {
    expect(extractWordAtOffset('hello world', 0)).toBe('hello');
  });

  it('extracts word from end', () => {
    expect(extractWordAtOffset('hello world', 10)).toBe('world');
  });

  it('returns null when offset is on space', () => {
    expect(extractWordAtOffset('hello world', 5)).toBe(null);
  });

  it('returns null when offset is out of bounds', () => {
    expect(extractWordAtOffset('hello', 10)).toBe(null);
    expect(extractWordAtOffset('hello', -1)).toBe(null);
  });

  it('extracts Arabic word', () => {
    expect(extractWordAtOffset('مرحبا بك', 2)).toBe('مرحبا');
  });
});
