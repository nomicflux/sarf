import { describe, it, expect } from 'vitest';
import { isAnalyzePortMessage } from '../stream-types';

describe('isAnalyzePortMessage', () => {
  it('returns true for valid analyze message', () => {
    expect(isAnalyzePortMessage({ type: 'analyze', word: 'test' })).toBe(true);
  });

  it('returns false for null', () => {
    expect(isAnalyzePortMessage(null)).toBe(false);
  });

  it('returns false for wrong type', () => {
    expect(isAnalyzePortMessage({ type: 'other' })).toBe(false);
  });

  it('returns false for non-object', () => {
    expect(isAnalyzePortMessage('string')).toBe(false);
  });
});
