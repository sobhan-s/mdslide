import { icons } from '../assets/index.js';
import { LEVELS, STYLES, COLORS } from '../constants/index.js';
import type { LogLevel } from '../types/index.js';
import { c, ICONS } from '../utils/index.js';

export class Logger {
  private level: number;

  constructor(level: LogLevel = 'info') {
    this.level = LEVELS[level];
  }

  info(message: string): void {
    if (this.level < 1) return;
    console.log(`  ${ICONS.info}  ${message}`);
  }

  success(message: string): void {
    if (this.level < 1) return;
    console.log(`  ${ICONS.success}  ${c(COLORS.green, message)}`);
  }

  warn(message: string): void {
    if (this.level < 1) return;
    console.warn(`  ${ICONS.warn}  ${c(COLORS.yellow, message)}`);
  }

  step(message: string): void {
    if (this.level < 1) return;
    console.log(`  ${ICONS.step}  ${c(STYLES.dim + COLORS.white, message)}`);
  }

  verbose(message: string): void {
    if (this.level < 2) return;
    console.log(`  ${ICONS.dim}  ${c(COLORS.grey, message)}`);
  }

  error(err: unknown): void {
    const e = err instanceof Error ? err : new Error(String(err));
    const hint = (e as any).hint as string | undefined;
    const file = (e as any).file as string | undefined;
    const line = (e as any).line as number | undefined;
    const code = (e as any).code as string | undefined;

    const label = code
      ? `${c(COLORS.red + STYLES.bold, e.name)}  ${c(COLORS.grey, code)}`
      : c(COLORS.red + STYLES.bold, e.name);
    const loc = file ? `  ${c(COLORS.grey, `(${file}${line != null ? `:${line}` : ''})`)}` : '';

    console.error('');
    console.error(`  ${ICONS.error}  ${label}${loc}`);
    console.error(`     ${c(COLORS.white, e.message)}`);
    if (hint) {
      console.error(`     ${c(COLORS.grey, icons.rightArrow)} ${c(COLORS.cyan, hint)}`);
    }
    console.error('');
  }

  banner(name: string, version: string): void {
    if (this.level < 1) return;
    console.log('');
    console.log(`  ${c(STYLES.bold + COLORS.white, name)} ${c(COLORS.grey, `v${version}`)}`);
    console.log('');
  }

  divider(): void {
    if (this.level < 1) return;
    const width = Math.min(process.stdout.columns ?? 60, 60);
    console.log(`  ${c(COLORS.grey, '─'.repeat(width - 2))}`);
  }

  raw(message: string): void {
    if (this.level < 1) return;
    console.log(message);
  }
}
