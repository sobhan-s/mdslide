import path from 'path';
import fs from 'fs';
import readline from 'readline';
import { Logger } from '../logger/index.js';
import { STYLES, COLORS, ERASE, CURSOR } from '../constants/index.js';
import { Choice, InteractiveResult } from '../types/index.js';
import { outputFormat, themeTypes } from '../constants/formats.js';
import { c } from './helper/helper.js';
import { confirm, input, select } from './helper/index.js';

// Interactive Prompt FLow Orchastrator
export async function runInteractivePrompt(inputFile: string): Promise<InteractiveResult> {
  const log = new Logger('info');
  const name = path.basename(inputFile);

  log.raw('');
  log.raw(`  ${c(COLORS.magenta + STYLES.bold, '✦ mdslide')}  ${c(COLORS.grey, `→ ${name}`)}`);
  log.raw(`  ${c(COLORS.grey, '─'.repeat(40))}`);

  // Outpur Format
  const format = await select<string>('Output format', outputFormat, { color: true });

  // Themes
  const theme = await select<string>('Theme', themeTypes, { color: true });

  // output File
  const defaultOut = `output.${format}`;
  const output = await input('Output file', defaultOut);

  // watch mode
  let watch = false;
  if (format === 'html') {
    watch = await confirm('Start live-reload watch server?', false);
  }

  // open after Compilation
  const open = await confirm('Open after compile?', true);

  // Summary
  log.raw('');
  log.raw(`  ${c(COLORS.grey, '─'.repeat(40))}`);
  log.raw(`  ${c(COLORS.grey, 'format')}  ${c(COLORS.cyan + STYLES.bold, format.toUpperCase())}`);
  log.raw(`  ${c(COLORS.grey, 'theme ')}  ${c(COLORS.cyan + STYLES.bold, theme)}`);
  log.raw(`  ${c(COLORS.grey, 'output')}  ${c(COLORS.cyan + STYLES.bold, output)}`);
  if (format === 'html') {
    log.raw(`  ${c(COLORS.grey, 'watch ')}  ${c(COLORS.cyan + STYLES.bold, watch ? 'yes' : 'no')}`);
  }
  log.raw(`  ${c(COLORS.grey, 'open  ')}  ${c(COLORS.cyan + STYLES.bold, open ? 'yes' : 'no')}`);
  log.raw('');

  const go = await confirm('Compile now?', true);
  if (!go) {
    log.raw(`\n  ${c(COLORS.grey, 'Cancelled.')}\n`);
    process.exit(0);
  }

  log.raw('');
  return { format, theme, output, watch, open };
}
