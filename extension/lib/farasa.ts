const FARASA_BASE = 'https://farasa.qcri.org/webapi';

export async function callFarasa(endpoint: string, text: string, apiKey: string): Promise<string> {
  const body = new URLSearchParams({ text, api_key: apiKey });
  const res = await fetch(`${FARASA_BASE}/${endpoint}/`, { method: 'POST', body });
  const data = await res.json();
  return String(data);
}

export async function farasaSegment(text: string, apiKey: string): Promise<string[]> {
  const result = await callFarasa('segmentation', text, apiKey);
  return result.split('+');
}

export async function farasaStem(text: string, apiKey: string): Promise<string> {
  return callFarasa('stem', text, apiKey);
}
