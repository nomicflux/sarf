// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { alkhalilRoot, parseAlkhalilResponse, extractMorpheme, parseProcField, parseEncField, parseMorphoSysXml, fetchMorphoSys } from '../alkhalil';

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

describe('extractMorpheme', () => {
  it('extracts part before colon', () => {
    expect(extractMorpheme('ال: التعريف')).toBe('ال');
  });

  it('returns whole string if no colon', () => {
    expect(extractMorpheme('ب')).toBe('ب');
  });
});

describe('parseProcField', () => {
  it('returns empty array for #', () => {
    expect(parseProcField('#')).toEqual([]);
  });

  it('parses single prefix', () => {
    expect(parseProcField('ال: التعريف')).toEqual(['ال']);
  });

  it('parses compound prefix with +', () => {
    expect(parseProcField('بِ: حرف الجر+ال: التعريف')).toEqual(['بِ', 'ال']);
  });
});

describe('parseEncField', () => {
  it('returns empty array for #', () => {
    expect(parseEncField('#')).toEqual([]);
  });

  it('parses single suffix', () => {
    expect(parseEncField('ة: تاء التأنيث')).toEqual(['ة']);
  });
});

describe('parseMorphoSysXml', () => {
  it('parses XML with morph_feature_set attributes', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<analysis>
  <result word='الإدارية' nbresult='1'>
    <morph_feature_set diac="الْإِدَارِيَّةِ" stem="الْإِدَارِيَّةِ"
      lemma="إِدَارِيّ" root="دور" pat_lemma="إِفْعَلِيّ"
      pos="اسم|نسبة|مفرد|مؤنث|معرف" cas="مجرور"
      proc="ال: التعريف" enc="ة: تاء التأنيث" />
  </result>
</analysis>`;
    const results = parseMorphoSysXml(xml);
    expect(results).toHaveLength(1);
    expect(results[0].lemma).toBe('إِدَارِيّ');
    expect(results[0].root).toBe('دور');
    expect(results[0].prefixes).toEqual(['ال']);
    expect(results[0].suffixes).toEqual(['ة']);
    expect(results[0].pattern).toBe('إِفْعَلِيّ');
    expect(results[0].pos).toBe('اسم|نسبة|مفرد|مؤنث|معرف');
  });

  it('returns empty array for empty XML', () => {
    const xml = `<?xml version="1.0"?><analysis><result word='x' nbresult='0'></result></analysis>`;
    expect(parseMorphoSysXml(xml)).toEqual([]);
  });
});

describe('fetchMorphoSys', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('posts to MorphoSys API and returns first result', async () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<analysis>
  <result word='كتاب' nbresult='1'>
    <morph_feature_set lemma="كِتَاب" root="كتب" pat_lemma="فِعَال"
      pos="اسم" proc="#" enc="#" diac="كِتَابٌ" stem="كِتَابٌ" cas="مرفوع" />
  </result>
</analysis>`;
    mockFetch.mockResolvedValue({ text: async () => xml });

    const result = await fetchMorphoSys('كتاب');
    expect(result).not.toBeNull();
    expect(result!.lemma).toBe('كِتَاب');
    expect(result!.root).toBe('كتب');
    expect(result!.prefixes).toEqual([]);
    expect(result!.suffixes).toEqual([]);
    expect(mockFetch).toHaveBeenCalledWith(
      'http://oujda-nlp-team.net:8081/api/alkhalil',
      expect.objectContaining({ method: 'POST' })
    );
  });
});
