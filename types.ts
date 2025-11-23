export interface ScanMetrics {
  url: string;
  statusCode: number | null;
  responseTimeMs: number | null;
  headers: Record<string, string>;
  htmlSnippet: string | null;
  fetchError?: string;
}

export interface AIAnalysis {
  healthScore: number;
  seo: {
    summary: string;
    details: string[];
  };
  accessibility: {
    summary: string;
    details: string[];
  };
  privacy: {
    summary: string;
    details: string[];
    level: 'Low concern' | 'Needs attention' | 'High concern';
  };
  jsErrors: {
    summary: string;
    details: string[];
  } | null;
  recommendations: string[];
}

export type ScanStatus = 'idle' | 'scanning' | 'analyzing' | 'complete' | 'error';
