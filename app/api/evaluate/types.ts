export interface SizeComplianceResult {
  score: number;
  reasoning: string;
  isOptimal: boolean;
}

export interface BrandComplianceResult {
  score: number;
  styleAlignment: number;
  colorCompliance: number;
  voiceConsistency: number;
  visionAlignment: number;
  reasoning: string;
  strengths: string;
  improvements: string;
}

export interface AggregatorResult {
  endScore: number;
  summary: string;
}