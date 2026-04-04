import type { PosLanguage } from './pos-translate';

export type DictSource = 'hw' | 'wk' | 'wk-egy' | 'wk-lev' | 'wk-gulf';
const STORAGE_KEY = 'enabledDicts';
const DEFAULT_SOURCES: DictSource[] = ['hw', 'wk'];
const POS_LANG_KEY = 'posLanguage';
const DEFAULT_POS_LANG: PosLanguage = 'en';
export const EXTENSION_ENABLED_STORAGE_KEY = 'extensionEnabled';
const DEFAULT_EXTENSION_ENABLED = true;

export type Dialect = 'egy' | 'lev' | 'gulf';

export const DIALECT_LABELS: Record<Dialect, string> = {
  'egy': 'Egyptian',
  'lev': 'Levantine',
  'gulf': 'Gulf',
};

export const DIALECT_DICTS: Record<Dialect, DictSource[]> = {
  'egy': ['wk-egy'],
  'lev': ['wk-lev'],
  'gulf': ['wk-gulf'],
};

export const DIALECT_SOURCES: DictSource[] = Object.values(DIALECT_DICTS).flat();

export const DICT_LABELS: Record<DictSource, string> = {
  'hw': 'Hans Wehr',
  'wk': 'Wiktionary (MSA)',
  'wk-egy': 'Wiktionary (Egyptian)',
  'wk-lev': 'Wiktionary (Levantine)',
  'wk-gulf': 'Wiktionary (Gulf)',
};

export async function getEnabledDicts(): Promise<DictSource[]> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return (result[STORAGE_KEY] as DictSource[] | undefined) ?? DEFAULT_SOURCES;
}

export async function setEnabledDicts(sources: DictSource[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: sources });
}

export async function getExtensionEnabled(): Promise<boolean> {
  const result = await chrome.storage.local.get(EXTENSION_ENABLED_STORAGE_KEY);
  const value = result[EXTENSION_ENABLED_STORAGE_KEY];
  if (typeof value === 'boolean') return value;
  return DEFAULT_EXTENSION_ENABLED;
}

export async function setExtensionEnabled(enabled: boolean): Promise<void> {
  await chrome.storage.local.set({ [EXTENSION_ENABLED_STORAGE_KEY]: enabled });
}

export async function getPosLanguage(): Promise<PosLanguage> {
  const result = await chrome.storage.local.get(POS_LANG_KEY);
  return (result[POS_LANG_KEY] as PosLanguage | undefined) ?? DEFAULT_POS_LANG;
}

export async function setPosLanguage(lang: PosLanguage): Promise<void> {
  await chrome.storage.local.set({ [POS_LANG_KEY]: lang });
}

const DIALECT_KEY = 'dialect';

export async function getDialect(): Promise<Dialect | null> {
  const result = await chrome.storage.local.get(DIALECT_KEY);
  const value = result[DIALECT_KEY] as string | undefined;
  return value && value in DIALECT_LABELS ? (value as Dialect) : null;
}

export async function setDialect(dialect: Dialect | null): Promise<void> {
  await chrome.storage.local.set({ [DIALECT_KEY]: dialect });
}

export type { PosLanguage };
