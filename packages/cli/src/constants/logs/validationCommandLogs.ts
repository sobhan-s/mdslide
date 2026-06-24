import { COLORS, STYLES } from '../terminalEscapeCode.js';

export const VALIDATION_RULES = {
  MAX_LINES_PER_SLIDE: 30,
} as const;

export const VALID_THEMES = [
  'light',
  'dark',
  'notion',
  'terminal',
  'gradient',
  'corporate',
  'solarized',
] as const;

export const VALID_LAYOUTS = [
  'title',
  'bullets',
  'content',
  'code',
  'visual',
  'table',
  'quote',
  'statement',
] as const;

export const SUPPORTED_LANGS = [
  'javascript',
  'js',
  'typescript',
  'ts',
  'html',
  'css',
  'json',
  'rust',
  'go',
  'python',
  'bash',
  'sh',
  'c',
  'cpp',
  'java',
  'sql',
  'yaml',
  'yml',
  'mermaid',
] as const;

export const VALIDATION_MESSAGES = {
  NO_SEPARATORS: {
    message: 'No slide separators (---) found.',
    hint: 'Separate slides with a line containing only ---',
  },
  EMPTY_SLIDE: {
    message: 'Slide is empty.',
  },
  NO_HEADING: {
    message: 'Slide has no heading.',
    hint: 'Add a # heading to give the slide a title.',
  },
  UNCLOSED_CODE_FENCE: {
    message: 'Unclosed code fence (```).',
    hint: 'Make sure every opening ``` has a matching closing ```.',
  },

  OVERFLOW: (lineCount: number) => ({
    message: `Slide has ${lineCount} lines - may overflow in the browser.`,
    hint: 'Split into multiple slides.',
  }),

  INVALID_FRONTMATTER: (reason: string) => ({
    message: 'Failed to parse frontmatter.',
    hint: reason,
  }),

  INVALID_THEME: (theme: string) => ({
    message: `Theme "${theme}" is not a built-in theme.`,
    hint: `Supported themes: ${VALID_THEMES.join(', ')}`,
  }),

  INVALID_LAYOUT: (layout: string) => ({
    message: `Invalid layout override "${layout}".`,
    hint: `Supported layouts: ${VALID_LAYOUTS.join(', ')}`,
  }),

  MULTIPLE_LAYOUTS: {
    message: 'Multiple layout overrides found on a single slide.',
    hint: 'Only one layout override should be specified per slide.',
  },

  UNCLOSED_NOTES: {
    message: 'Unclosed notes block (missing <!-- /notes -->).',
    hint: 'Ensure every <!-- notes --> tag has a corresponding <!-- /notes --> tag.',
  },

  NESTED_NOTES: {
    message: 'Nested notes block detected.',
    hint: 'Avoid placing <!-- notes --> inside an already open notes block.',
  },

  STRAY_NOTES_CLOSE: {
    message: 'Stray closing notes tag (<!-- /notes -->).',
    hint: 'Ensure <!-- /notes --> is only used to close an open <!-- notes --> block.',
  },

  UNSUPPORTED_LANG: (lang: string) => ({
    message: `Language "${lang}" in code fence is not supported for syntax highlighting.`,
    hint: `Supported languages: ${SUPPORTED_LANGS.join(', ')}`,
  }),

  MULTIPLE_SPLITS: {
    message: 'Multiple ::split:: markers found in a single slide.',
    hint: 'Only the first ::split:: marker will be used to divide columns.',
  },

  EMPTY_SPLIT_COLUMN: {
    message: 'Empty column in split layout.',
    hint: 'Add content before and after the ::split:: marker.',
  },

  MULTIPLE_H1: {
    message: 'Multiple level 1 headings (#) found on a single slide.',
    hint: 'Use level 2 (##) or level 3 (###) headings for sub-sections.',
  },

  BROKEN_IMAGE: (imgUrl: string) => ({
    message: `Referenced image "${imgUrl}" does not exist on disk.`,
    hint: 'Check that the path is correct relative to the markdown file.',
  }),

  LOG_SUCCESS: (filename: string, slideCount: number) =>
    `${filename} - ${slideCount} slides, no issues found`,

  LOG_SUMMARY: (slideCount: number, errors: number, warnings: number) =>
    `  ${COLORS.grey}${slideCount} slides - ${errors} error${errors !== 1 ? 's' : ''}, ${warnings} warning${warnings !== 1 ? 's' : ''}${STYLES.reset}`,

  LOG_LOCATION: (slideNum: number | undefined) => (slideNum != null ? `  (slide ${slideNum})` : ''),
} as const;
