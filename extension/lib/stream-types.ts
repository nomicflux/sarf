import type { MorphAnalysis } from './types';

export type PartialMorph = Omit<MorphAnalysis, 'definitions'>;

export interface AnalyzePortMessage {
  type: 'analyze';
  word: string;
}

export type StreamMessage =
  | { type: 'morph'; data: PartialMorph }
  | { type: 'dict'; definitions: Array<{ word: string; text: string; source: string }>; root: string | null }
  | { type: 'cached'; data: MorphAnalysis }
  | { type: 'error'; error: string };

export function isAnalyzePortMessage(msg: unknown): msg is AnalyzePortMessage {
  return typeof msg === 'object' && msg !== null && (msg as AnalyzePortMessage).type === 'analyze';
}
