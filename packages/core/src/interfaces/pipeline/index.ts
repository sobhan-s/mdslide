import type { Slide } from '@mindfiredigital/mdslide-shared';

export interface CompileOptions {
  theme?: string;
}

export interface CompileResult {
  meta: Record<string, unknown>;
  slides: Slide[];
  html: string;
}
