import { describe, it, expect, vi, beforeEach } from 'vitest';
import { callFarasa, farasaSegment, farasaStem } from '../farasa';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe('callFarasa', () => {
  it('sends POST with correct body', async () => {
    mockFetch.mockResolvedValue({ json: () => Promise.resolve('result') });
    await callFarasa('stem', 'كتب', 'test-key');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://farasa.qcri.org/webapi/stem/',
      expect.objectContaining({ method: 'POST' })
    );
  });
});

describe('farasaSegment', () => {
  it('splits response by +', async () => {
    mockFetch.mockResolvedValue({ json: () => Promise.resolve('ب+ال+كتاب') });
    const result = await farasaSegment('بالكتاب', 'key');
    expect(result).toEqual(['ب', 'ال', 'كتاب']);
  });
});

describe('farasaStem', () => {
  it('returns stem string', async () => {
    mockFetch.mockResolvedValue({ json: () => Promise.resolve('كتب') });
    const result = await farasaStem('كتاب', 'key');
    expect(result).toBe('كتب');
  });
});
