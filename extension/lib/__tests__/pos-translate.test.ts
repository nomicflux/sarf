import { describe, it, expect } from 'vitest';
import { translatePosTag, translatePosFeature, translatePos } from '../pos-translate';

describe('translatePosTag', () => {
  it('translates known Arabic tag to English', () => {
    expect(translatePosTag('اسم')).toBe('noun');
    expect(translatePosTag('فعل')).toBe('verb');
    expect(translatePosTag('حرف')).toBe('particle');
  });

  it('returns unknown tag unchanged', () => {
    expect(translatePosTag('unknown')).toBe('unknown');
  });
});

describe('translatePosFeature', () => {
  it('translates known Arabic feature to English', () => {
    expect(translatePosFeature('مفرد')).toBe('singular');
    expect(translatePosFeature('مؤنث')).toBe('feminine');
    expect(translatePosFeature('معرف')).toBe('definite');
  });

  it('translates noun subtypes from AlKhalil', () => {
    expect(translatePosFeature('اسم زمان أو مكان')).toBe('noun of time/place');
    expect(translatePosFeature('اسم فاعل')).toBe('active participle');
    expect(translatePosFeature('اسم مفعول')).toBe('passive participle');
    expect(translatePosFeature('اسم جامد')).toBe('concrete noun');
    expect(translatePosFeature('مصدر أصلي')).toBe('verbal noun');
  });

  it('translates verb and particle subtypes from AlKhalil', () => {
    expect(translatePosFeature('ماض')).toBe('past');
    expect(translatePosFeature('معلوم')).toBe('active');
    expect(translatePosFeature('جر')).toBe('preposition');
    expect(translatePosFeature('عطف')).toBe('conjunction');
  });

  it('returns unknown feature unchanged', () => {
    expect(translatePosFeature('unknown')).toBe('unknown');
  });
});

describe('translatePos', () => {
  it('returns original tag and features when lang is ar', () => {
    const result = translatePos('اسم', ['مفرد', 'مؤنث'], 'ar');
    expect(result.tag).toBe('اسم');
    expect(result.features).toEqual(['مفرد', 'مؤنث']);
  });

  it('translates tag and features to English when lang is en', () => {
    const result = translatePos('اسم', ['مفرد', 'مؤنث', 'معرف'], 'en');
    expect(result.tag).toBe('noun');
    expect(result.features).toEqual(['singular', 'feminine', 'definite']);
  });

  it('handles empty features array', () => {
    const result = translatePos('فعل', [], 'en');
    expect(result.tag).toBe('verb');
    expect(result.features).toEqual([]);
  });
});
