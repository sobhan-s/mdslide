export const INIT_MESSAGES = {
  SLIDES_CREATED: 'Created slides.md',
  SLIDES_EXISTS: 'slides.md already exists - skipping (use --force to overwrite)',
  CONFIG_CREATED: 'Created mdslide.config.ts',
  CONFIG_EXISTS: 'mdslide.config.ts already exists - skipping (use --force to overwrite)',
  SCRIPTS_ADDED: 'Added "dev" and "build" scripts to package.json',
  NEXT_STEPS: 'Run `mdslide watch slides.md` to start the live preview server.',
} as const;

export const FILE_NAME = {
  SAMPLE_FILE_NAME: 'slides.md',
  SAMPLE_CONFIG_FILE_NAME: 'mdslide.config.ts',
  PACKAGE_NAME: 'package.json',
};

export const DEV_COMMANDS = {
  DEV: 'mdslide watch slides.md',
  BUILD: 'mdslide compile slides.md',
};
