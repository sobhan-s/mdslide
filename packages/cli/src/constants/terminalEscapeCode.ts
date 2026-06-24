import { LogLevel } from '../types/index.js';

// Text Styling
export const STYLES = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

// Standard Foreground Colors
export const COLORS = {
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  grey: '\x1b[90m',
  white: '\x1b[37m',
};

export const ERASE = {
  line: '\x1b[2K', // Erases the entire current line
};

// Cursor Control Sequences
export const CURSOR = {
  up: (n = 1) => `\x1b[${n}A`, // Moves cursor up by n lines
  hide: '\x1b[?25l', // Private Mode: Hides cursor
  show: '\x1b[?25h', // Private Mode: Shows cursor
  carriageReturn: '\r', // Moves cursor to the start of the line
};

export const LEVELS: Record<LogLevel, number> = {
  silent: 0,
  info: 1,
  verbose: 2,
};
