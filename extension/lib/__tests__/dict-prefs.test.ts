import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getEnabledDicts, setEnabledDicts } from '../dict-prefs';

function mockStorage(data: Record<string, unknown> = {}) {
  const store = { ...data };
  const mock = {
    get: vi.fn((key: string) => Promise.resolve(key in store ? { [key]: store[key] } : {})),
    set: vi.fn((obj: Record<string, unknown>) => {
      Object.assign(store, obj);
      return Promise.resolve();
    }),
  };
  vi.stubGlobal('chrome', { storage: { local: mock } });
  return mock;
}

describe('dict-prefs', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns default when storage is empty', async () => {
    mockStorage();
    const result = await getEnabledDicts();
    expect(result).toEqual(['hw', 'wk']);
  });

  it('returns stored value when storage has data', async () => {
    mockStorage({ enabledDicts: ['hw'] });
    const result = await getEnabledDicts();
    expect(result).toEqual(['hw']);
  });

  it('writes to storage', async () => {
    const mock = mockStorage();
    await setEnabledDicts(['wk']);
    expect(mock.set).toHaveBeenCalledWith({ enabledDicts: ['wk'] });
  });
});
