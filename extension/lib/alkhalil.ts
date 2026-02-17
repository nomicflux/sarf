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

export function parseMorphoSysXml(xml: string): MorphoSysAnalysis[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const nodes = doc.querySelectorAll('morph_feature_set');
  return Array.from(nodes).map((node) => ({
    lemma: node.getAttribute('lemma') ?? '',
    root: node.getAttribute('root') ?? '',
    prefixes: parseProcField(node.getAttribute('proc') ?? '#'),
    suffixes: parseEncField(node.getAttribute('enc') ?? '#'),
    pattern: node.getAttribute('pat_lemma') || null,
    pos: node.getAttribute('pos') ?? '',
  }));
}

export async function fetchMorphoSys(word: string): Promise<MorphoSysAnalysis | null> {
  const body = new URLSearchParams({ textinput: word });
  const res = await fetch(MORPHOSYS_URL, { method: 'POST', body });
  const xml = await res.text();
  const results = parseMorphoSysXml(xml);
  return results[0] ?? null;
}
