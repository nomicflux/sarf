import { describe, it, expect } from 'vitest';
import { filterBySource } from '../filter';
import type { DictEntry } from '../dictionary';

const hw: DictEntry = { word: 'كتب', definition: 'to write', rootWord: 'كتب', source: 'hw' };
const wk: DictEntry = { word: 'كتب', definition: 'write', rootWord: 'كتب', source: 'wk' };

describe('filterBySource', () => {
  it('returns all entries when both sources enabled', () => {
    expect(filterBySource([hw, wk], ['hw', 'wk'])).toEqual([hw, wk]);
  });

  it('filters to only hw', () => {
    expect(filterBySource([hw, wk], ['hw'])).toEqual([hw]);
  });

  it('filters to only wk', () => {
    expect(filterBySource([hw, wk], ['wk'])).toEqual([wk]);
  });

  it('returns empty when no sources enabled', () => {
    expect(filterBySource([hw, wk], [])).toEqual([]);
  });
});
