import type { DictEntry } from './dictionary';
import type { DictSource } from './dict-prefs';

export function filterBySource(entries: DictEntry[], enabledSources: DictSource[]): DictEntry[] {
  return entries.filter(e => enabledSources.includes(e.source as DictSource));
}
