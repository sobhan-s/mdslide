export interface CompileOptions {
  theme?: string;
}

export interface CompileResult {
  meta: Record<string, unknown>;
  slides: any[];
  html: string;
}
