import { describe, it, expect, vi, beforeEach } from 'vitest';
import { alkhalilRoot, parseAlkhalilResponse } from '../alkhalil';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('parseAlkhalilResponse', () => {
  it('extracts root from valid response', () => {
    expect(parseAlkhalilResponse('{{كتاب:كتب}}')).toBe('كتب');
  });

  it('extracts root from another valid response', () => {
    expect(parseAlkhalilResponse('{{ذهبوا:ذهب}}')).toBe('ذهب');
  });

  it('returns null for input without braces', () => {
    expect(parseAlkhalilResponse('xyz')).toBe(null);
  });

  it('returns null for empty string', () => {
    expect(parseAlkhalilResponse('')).toBe(null);
  });
});

describe('alkhalilRoot', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('calls API and returns extracted root', async () => {
    mockFetch.mockResolvedValue({
      text: async () => '{{كتاب:كتب}}',
    });

    const result = await alkhalilRoot('كتاب');
    expect(result).toBe('كتب');
    expect(mockFetch).toHaveBeenCalledWith(
      'http://oujda-nlp-team.net:8080/api/ApiRacine/%D9%83%D8%AA%D8%A7%D8%A8'
    );
  });
});
