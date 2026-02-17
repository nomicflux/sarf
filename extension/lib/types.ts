export interface MorphAnalysis {
  original: string;
  prefixes: string[];
  stem: string;
  verbStem: string | null;
  suffixes: string[];
  root: string | null;
  pattern: string | null;
  definition: string | null;
  lemmas: string[];
  pos: string | null;
  isParticle: boolean;
  error: string | null;
}

export interface AnalyzeRequest {
  type: "analyze";
  word: string;
}

export type AnalyzeResponse = MorphAnalysis;
