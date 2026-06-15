import { COLORS, STYLES } from '../index.js';

export const VALIDATION_RULES = {
  MAX_LINES_PER_SLIDE: 30,
} as const;

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
    message: `Slide has ${lineCount} lines — may overflow in the browser.`,
    hint: 'Split into multiple slides.',
  }),

  LOG_SUCCESS: (filename: string, slideCount: number) =>
    `${filename} — ${slideCount} slides, no issues found`,

  LOG_SUMMARY: (slideCount: number, errors: number, warnings: number) =>
    `  ${COLORS.grey}${slideCount} slides — ${errors} error${errors !== 1 ? 's' : ''}, ${warnings} warning${warnings !== 1 ? 's' : ''}${STYLES.reset}`,

  LOG_LOCATION: (slideNum: number | undefined) => (slideNum != null ? `  (slide ${slideNum})` : ''),
} as const;
