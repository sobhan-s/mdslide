export type OutputFormat = 'html' | 'pdf' | 'pptx';

export type LogLevel = 'silent' | 'info' | 'verbose';

export interface GlobalOptions {
  logLevel?: LogLevel;
}

export interface CompileOptions extends GlobalOptions {
  theme?: string;
  output?: string;
  format?: OutputFormat;
  open?: boolean;
  strict?: boolean;
}

export interface WatchOptions extends GlobalOptions {
  theme?: string;
  output?: string;
  port?: number;
  open?: boolean;
}

export interface ServeOptions extends GlobalOptions {
  port?: number;
  open?: boolean;
}

export interface InitOptions extends GlobalOptions {
  force?: boolean;
}

export interface ValidateOptions extends GlobalOptions {
  strict?: boolean;
}

export interface CompileResult {
  outputPath: string;
  format: OutputFormat;
  slideCount: number;
  warnings: string[];
}

export interface Choice<T = string> {
  label: string;
  value: T;
  hint?: string;
  color?: string; // ansi color for the label swatch
}

export interface InteractiveResult {
  format: string;
  theme: string;
  output: string;
  watch: boolean;
  open: boolean;
}

export interface ValidationIssue {
  type: 'error' | 'warning';
  slide?: number;
  message: string;
  hint?: string;
}

export interface MdSlideConfig {
  theme?: string;
  output?: string;
  format?: string;
  watch?: {
    port?: number;
    open?: boolean;
  };
  pdf?: {
    chromePath?: string;
    printBackground?: boolean;
  };
}
