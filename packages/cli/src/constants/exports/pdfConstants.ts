import { icons } from '../../assets/index.js';

export const PDF_CONFIG = {
  DEFAULT_TIMEOUT_MS: 30_000,
  CHROME_CANDIDATES: [
    process.env['CHROME_PATH'],
    process.env['CHROMIUM_PATH'],
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome-beta',
    '/usr/bin/google-chrome-unstable',
    '/opt/google/chrome/google-chrome',

    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '~/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',

    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Users\\<User>\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',

    // Chromium
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
    '/opt/chromium/chromium',

    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '~/Applications/Chromium.app/Contents/MacOS/Chromium',

    'C:\\Program Files\\Chromium\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Chromium\\Application\\chrome.exe',
    'C:\\Users\\<User>\\AppData\\Local\\Chromium\\Application\\chrome.exe',

    // Microsoft Edge
    '/usr/bin/microsoft-edge',
    '/usr/bin/microsoft-edge-stable',
    '/opt/microsoft/msedge/msedge',

    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '~/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',

    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Users\\<User>\\AppData\\Local\\Microsoft\\Edge\\Application\\msedge.exe',

    // Brave Browser
    '/usr/bin/brave-browser',
    '/usr/bin/brave-browser-stable',
    '/usr/bin/brave-browser-beta',
    '/opt/brave.com/brave/brave-browser',

    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    '~/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',

    'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
    'C:\\Program Files (x86)\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
    'C:\\Users\\<User>\\AppData\\Local\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
  ].filter(Boolean) as string[],
  CHROME_ARGS: (outputPath: string, url: string) => [
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--run-all-compositor-stages-before-draw',
    '--virtual-time-budget=10000',
    `--print-to-pdf=${outputPath}`,
    '--print-to-pdf-no-header',
    url,
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
