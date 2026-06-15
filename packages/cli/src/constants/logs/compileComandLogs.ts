export const COMPILE_CONFIG = {
  DEFAULT_FORMAT: 'html' as const,
  SUPPORTED_FORMATS: ['html', 'pdf', 'pptx'] as const,
  CHROME_CANDIDATES: [
    process.env['CHROME_PATH'],
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ].filter(Boolean) as string[],
  CHROME_FLAGS: '--headless --disable-gpu --no-sandbox',
} as const;

export const COMPILE_MESSAGES = {
  CORE_NOT_FOUND: 'Cannot find @mindfiredigital/mdslide-core. Make sure the core package is built.',
  SPINNER_START: (filename: string, format: string) =>
    `Compiling ${filename} → ${format.toUpperCase()}`,
  SPINNER_LAUNCHING_CHROME: 'Launching Chrome for PDF export...',
  SUCCESS_SUMMARY: (relativePath: string, slideCount: number, warningCount: number) => {
    const summaryText =
      warningCount > 0
        ? `(${warningCount} warning${warningCount > 1 ? 's' : ''})`
        : `  ${slideCount} slide${slideCount !== 1 ? 's' : ''}`;
    return `${relativePath}  ${summaryText}`;
  },
} as const;
