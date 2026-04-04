import type { MorphAnalysis } from './types';

export type PartialMorph = Omit<MorphAnalysis, 'definitions'>;

export interface AnalyzePortMessage {
  type: 'analyze';
  word: string;
}

export type StreamMessage =
  | { type: 'morph'; data: PartialMorph[] }
  | { type: 'dict'; analyses: MorphAnalysis[] }
  | { type: 'cached'; data: MorphAnalysis[] }
  | { type: 'error'; error: string };

export function isAnalyzePortMessage(msg: unknown): msg is AnalyzePortMessage {
  return typeof msg === 'object' && msg !== null && (msg as AnalyzePortMessage).type === 'analyze';
}
