import type { Logger } from '../logger/index.js';

const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';
const GRAY = '\x1b[90m';

function c(color: string, text: string): string {
  if (!process.stdout.isTTY) return text;
  return `${color}${text}${RESET}`;
}

export class Spinner {
  private log: Logger;
  private timer?: NodeJS.Timeout;
  private frame = 0;
  private label = '';
  private isTTY = !!process.stdout.isTTY;

  constructor(log: Logger) {
    this.log = log;
  }

  start(label: string): void {
    this.label = label;
    this.frame = 0;

    if (!this.isTTY) {
      this.log.step(label);
      return;
    }

    process.stdout.write('\x1b[?25l'); // hide cursor
    this.timer = setInterval(() => {
      const icon = c(CYAN, FRAMES[this.frame % FRAMES.length]!);
      process.stdout.write(`\r  ${icon}  ${c(DIM, this.label)}`);
      this.frame++;
    }, 80);
  }

  update(label: string): void {
    this.label = label;
    if (!this.isTTY) this.log.step(label);
  }

  succeed(label?: string): void {
    this.stop();
    this.log.success(label ?? this.label);
  }

  fail(label?: string): void {
    this.stop();
    if (this.isTTY) process.stdout.write('\r\x1b[2K'); // clear line
    const msg = label ?? this.label;
    process.stderr.write(`  ${c(RED, '✖')}  ${msg}\n`);
  }

  private stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
    if (this.isTTY) {
      process.stdout.write('\r\x1b[2K'); // clear spinner line
      process.stdout.write('\x1b[?25h'); // restore cursor
    }
  }
}
