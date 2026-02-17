import { XMLParser } from 'fast-xml-parser';

const ALKHALIL_URL = 'http://oujda-nlp-team.net:8080/api/ApiRacine';

export async function alkhalilRoot(word: string): Promise<string | null> {
  const res = await fetch(`${ALKHALIL_URL}/${encodeURIComponent(word)}`);
  const text = await res.text();
  return parseAlkhalilResponse(text);
}

export function parseAlkhalilResponse(text: string): string | null {
  const match = text.match(/^\{\{.+?:(.+?)\}\}$/);
  return match ? match[1] : null;
}

const MORPHOSYS_URL = 'http://oujda-nlp-team.net:8081/api/alkhalil';

export interface MorphoSysAnalysis {
  lemma: string;
  root: string;
  prefixes: string[];
  suffixes: string[];
  pattern: string | null;
  pos: string;
}

export function extractMorpheme(segment: string): string {
  return segment.split(':')[0].trim();
}

export function parseProcField(proc: string): string[] {
  if (proc === '#') return [];
  return proc.split('+').map(extractMorpheme);
}

export function parseEncField(enc: string): string[] {
  if (enc === '#') return [];
  return enc.split('+').map(extractMorpheme);
}

const xmlParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });

function toArray<T>(val: T | T[] | undefined): T[] {
  if (val === undefined) return [];
  return Array.isArray(val) ? val : [val];
}

export function parseMorphoSysXml(xml: string): MorphoSysAnalysis[] {
  const parsed = xmlParser.parse(xml);
  const sets = toArray(parsed?.analysis?.result?.morph_feature_set);
  return sets.map((s: Record<string, string>) => ({
    lemma: s.lemma ?? '',
    root: s.root ?? '',
    prefixes: parseProcField(s.proc ?? '#'),
    suffixes: parseEncField(s.enc ?? '#'),
    pattern: s.pat_lemma || null,
    pos: s.pos ?? '',
  }));
}

export async function fetchMorphoSys(word: string): Promise<MorphoSysAnalysis[]> {
  const body = new URLSearchParams({ textinput: word });
  const res = await fetch(MORPHOSYS_URL, { method: 'POST', body });
  const xml = await res.text();
  return parseMorphoSysXml(xml);
}
