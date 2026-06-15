import { icons } from '../../assets/index.js';

export const PDF_CONFIG = {
  DEFAULT_TIMEOUT_MS: 30_000,
  CHROME_CANDIDATES: [
    process.env['CHROME_PATH'],
    process.env['CHROMIUM_PATH'],
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ].filter(Boolean) as string[],
  CHROME_ARGS: (outputPath: string, htmlPath: string) => [
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    `--print-to-pdf=${outputPath}`,
    '--print-to-pdf-no-header',
    htmlPath,
  ],
} as const;

export const PDF_MESSAGES = {
  CHROME_NOT_FOUND:
    'PDF export requires Google Chrome or Chromium.\n' +
    `  ${icons.rightArrow} Install Chrome/Chromium, or set the CHROME_PATH environment variable.\n` +
    `  ${icons.rightArrow} Example: CHROME_PATH=/usr/bin/chromium mdslide compile slides.md -f pdf`,

  TIMEOUT_ERROR: (timeoutMs: number) =>
    `PDF export timed out after ${timeoutMs / 1000}s.\n` +
    `  ${icons.rightArrow} Chrome process was killed.\n` +
    `  ${icons.rightArrow} Increase timeout with --pdf-timeout <ms> or check if the HTML file is valid.`,

  EMPTY_OUTPUT_ERROR: (outputPath: string) =>
    `Chrome exited successfully but did not write a PDF to ${outputPath}.\n` +
    `  ${icons.rightArrow} Ensure the output directory exists and is writable.`,

  CHROME_EXIT_ERROR: (code: number | null, stderrText: string) =>
    `Chrome exited with code ${code}.\n` +
    (stderrText
      ? `  Chrome stderr:\n  ${stderrText.split('\n').join('\n  ')}`
      : '  No stderr output.'),

  START_FAILURE_ERROR: (message: string, chromeBin: string) =>
    `Failed to start Chrome: ${message}\n` +
    `  → Chrome binary: ${chromeBin}\n` +
    `  ${icons.rightArrow} Set CHROME_PATH to override.`,
} as const;
