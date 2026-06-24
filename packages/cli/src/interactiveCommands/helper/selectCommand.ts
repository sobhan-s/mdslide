import readline from 'readline';
import { COLORS, STYLES, isTTY } from '../../constants/index.js';
import { Choice } from '../../types/index.js';
import { c, hideCursor, showCursor } from './helper.js';
import { icons } from '../../assets/index.js';

// List Selector
async function select<T>(
  prompt: string,
  choices: Choice<T>[],
  opts: { color?: boolean } = {}
): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!isTTY) {
      // Non-TTY fallback: pick first
      resolve(choices[0]!.value);
      return;
    }

    let idx = 0;

    let renderedLines = 0;

    const render = () => {
      const lines: string[] = [];

      choices.forEach((ch, i) => {
        const selected = i === idx;
        const cursor = selected ? c(COLORS.cyan, icons.navigateArrow) : ' ';
        const swatch = opts.color && ch.color ? `${ch.color}${icons.info}${STYLES.reset} ` : '';

        const label = selected ? c(STYLES.bold + COLORS.white, ch.label) : c(COLORS.grey, ch.label);

        const hint = ch.hint && selected ? `  ${c(COLORS.grey, ch.hint)}` : '';

        lines.push(`  ${cursor} ${swatch}${label}${hint}`);
      });

      process.stdout.write(lines.join('\n'));
      renderedLines = lines.length;
    };

    const clear = () => {
      for (let i = 0; i < renderedLines; i++) {
        process.stdout.write('\r\x1b[2K');

        if (i < renderedLines - 1) {
          process.stdout.write('\x1b[1A');
        }
      }

      process.stdout.write('\r');
    };

    // Print prompt
    process.stdout.write(
      `\n  ${c(COLORS.cyan, '?')} ${c(STYLES.bold, prompt)} ${c(COLORS.grey, '(↑↓ to move, Enter to select)')}\n`
    );

    hideCursor();
    render();

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);

    const onKey = (_: any, key: readline.Key) => {
      if (!key) return;

      if (key.name === 'up') {
        idx = (idx - 1 + choices.length) % choices.length;
      }
      if (key.name === 'down') {
        idx = (idx + 1) % choices.length;
      }

      if (key.name === 'return' || key.name === 'enter') {
        clear();
        process.stdout.write(
          `  ${c(COLORS.green, '✔')} ${c(STYLES.bold, prompt)}  ${c(COLORS.cyan, String((choices[idx] as any).label))}\n`
        );
        cleanup();
        resolve(choices[idx]!.value);
        return;
      }

      if (key.ctrl && key.name === 'c') {
        cleanup();
        showCursor();
        process.exit(130);
      }

      clear();
      render();
    };

    const cleanup = () => {
      process.stdin.removeListener('keypress', onKey);
      if (process.stdin.isTTY) process.stdin.setRawMode(false);
      showCursor();
    };

    process.stdin.on('keypress', onKey);
  });
}

export { select };
