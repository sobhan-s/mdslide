import fs from 'fs';
import path from 'path';
import { Logger } from '../logger/index.js';
import type { InitOptions } from '../types/index.js';
import { SAMPLE_SLIDES } from '../constants/sampleSlide.js';
import { SAMPLE_CONFIG } from '../constants/sampleConfig.js';
import { DEV_COMMANDS, FILE_NAME, INIT_MESSAGES } from '../constants/logs/initCommandLogs.js';

export async function initCommand(opts: InitOptions): Promise<void> {
  const log = new Logger(opts.logLevel ?? 'info');
  const cwd = process.cwd();
  const slidesPath = path.join(cwd, FILE_NAME.SAMPLE_FILE_NAME);
  const configPath = path.join(cwd, FILE_NAME.SAMPLE_CONFIG_FILE_NAME);

  let created = 0;

  if (!fs.existsSync(slidesPath) || opts.force) {
    fs.writeFileSync(slidesPath, SAMPLE_SLIDES);
    log.success(`${INIT_MESSAGES.SLIDES_CREATED}`);
    created++;
  } else {
    log.warn(`${INIT_MESSAGES.SLIDES_EXISTS}`);
  }

  if (!fs.existsSync(configPath) || opts.force) {
    fs.writeFileSync(configPath, SAMPLE_CONFIG);
    log.success(`${INIT_MESSAGES.CONFIG_CREATED}`);
    created++;
  } else {
    log.warn(`${INIT_MESSAGES.CONFIG_EXISTS}`);
  }

  const pkgPath = path.join(cwd, FILE_NAME.PACKAGE_NAME);
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (!pkg.scripts?.dev) {
        pkg.scripts = {
          ...pkg.scripts,
          dev: DEV_COMMANDS.DEV,
          build: DEV_COMMANDS.BUILD,
        };
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
        log.success(`${INIT_MESSAGES.SCRIPTS_ADDED}`);
      }
    } catch {}
  }

  if (created > 0) {
    log.raw('');
    log.step(INIT_MESSAGES.NEXT_STEPS);
    log.raw('');
  }
}
