export type DictSource = 'hw' | 'wk';
const STORAGE_KEY = 'enabledDicts';
const DEFAULT_SOURCES: DictSource[] = ['hw', 'wk'];

export async function getEnabledDicts(): Promise<DictSource[]> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return (result[STORAGE_KEY] as DictSource[] | undefined) ?? DEFAULT_SOURCES;
}

export async function setEnabledDicts(sources: DictSource[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: sources });
}
