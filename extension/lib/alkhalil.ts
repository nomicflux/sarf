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
