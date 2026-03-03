import type { PosLanguage } from './pos-translate';

export type DictSource = 'hw' | 'wk' | 'wk-egy' | 'wk-lev' | 'wk-gulf';
const STORAGE_KEY = 'enabledDicts';
const DEFAULT_SOURCES: DictSource[] = ['hw', 'wk'];
const POS_LANG_KEY = 'posLanguage';
const DEFAULT_POS_LANG: PosLanguage = 'en';

export const DIALECT_SOURCES: DictSource[] = ['wk-egy', 'wk-lev', 'wk-gulf'];

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

export async function getPosLanguage(): Promise<PosLanguage> {
  const result = await chrome.storage.local.get(POS_LANG_KEY);
  return (result[POS_LANG_KEY] as PosLanguage | undefined) ?? DEFAULT_POS_LANG;
}

export async function setPosLanguage(lang: PosLanguage): Promise<void> {
  await chrome.storage.local.set({ [POS_LANG_KEY]: lang });
}

export type { PosLanguage };
