import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getEnabledDicts, setEnabledDicts, getDialect, setDialect, getPosLanguage, setPosLanguage, DIALECT_SOURCES, DICT_LABELS, DIALECT_LABELS, DIALECT_DICTS } from '../dict-prefs';

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

  it('returns default POS language when storage is empty', async () => {
    mockStorage();
    const result = await getPosLanguage();
    expect(result).toBe('en');
  });

  it('returns stored POS language when storage has data', async () => {
    mockStorage({ posLanguage: 'ar' });
    const result = await getPosLanguage();
    expect(result).toBe('ar');
  });

  it('writes POS language to storage', async () => {
    const mock = mockStorage();
    await setPosLanguage('ar');
    expect(mock.set).toHaveBeenCalledWith({ posLanguage: 'ar' });
  });

  it('DIALECT_SOURCES contains dialect codes', () => {
    expect(DIALECT_SOURCES).toEqual(['wk-egy', 'wk-lev', 'wk-gulf']);
  });

  it('DICT_LABELS has label for every source', () => {
    const allSources: Array<'hw' | 'wk' | 'wk-egy' | 'wk-lev' | 'wk-gulf'> = ['hw', 'wk', 'wk-egy', 'wk-lev', 'wk-gulf'];
    for (const source of allSources) {
      expect(DICT_LABELS[source]).toBeDefined();
      expect(typeof DICT_LABELS[source]).toBe('string');
    }
  });

  it('returns null dialect when storage is empty', async () => {
    mockStorage();
    const result = await getDialect();
    expect(result).toBeNull();
  });

  it('returns stored dialect when storage has data', async () => {
    mockStorage({ dialect: 'egy' });
    const result = await getDialect();
    expect(result).toBe('egy');
  });

  it('returns null for stale dialect value', async () => {
    mockStorage({ dialect: 'wk-egy' });
    const result = await getDialect();
    expect(result).toBeNull();
  });

  it('writes dialect to storage', async () => {
    const mock = mockStorage();
    await setDialect('lev');
    expect(mock.set).toHaveBeenCalledWith({ dialect: 'lev' });
  });

  it('writes null dialect to storage', async () => {
    const mock = mockStorage();
    await setDialect(null);
    expect(mock.set).toHaveBeenCalledWith({ dialect: null });
  });

  it('DIALECT_LABELS has a label for every dialect', () => {
    for (const key of ['egy', 'lev', 'gulf'] as const) {
      expect(typeof DIALECT_LABELS[key]).toBe('string');
    }
  });

  it('DIALECT_DICTS maps every dialect to at least one DictSource', () => {
    for (const key of ['egy', 'lev', 'gulf'] as const) {
      expect(DIALECT_DICTS[key].length).toBeGreaterThan(0);
    }
  });

  it('DIALECT_SOURCES equals flattened DIALECT_DICTS values', () => {
    const flattened = Object.values(DIALECT_DICTS).flat();
    expect(DIALECT_SOURCES).toEqual(flattened);
  });
});
