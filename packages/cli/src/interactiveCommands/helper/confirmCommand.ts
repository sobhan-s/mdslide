import readline from 'readline';
import { c, showCursor } from './helper.js';
import { isTTY, COLORS, STYLES } from '../../constants/index.js';

// Conform commands
async function confirm(prompt: string, def = true): Promise<boolean> {
  const hint = def ? 'Y/n' : 'y/N';
  process.stdout.write(
    `\n  ${c(COLORS.cyan, '?')} ${c(STYLES.bold, prompt)} ${c(COLORS.grey, `(${hint})`)}: `
  );
  showCursor();

  return new Promise((resolve) => {
    if (!isTTY) {
      resolve(def);
      return;
    }

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);

    const onKey = (_: any, key: readline.Key) => {
      if (!key) return;
      if (key.ctrl && key.name === 'c') {
        process.exit(130);
      }

      const ch = key.sequence?.toLowerCase();
      if (ch === 'y') {
        process.stdout.write('y\n');
        done(true);
        return;
      }
      if (ch === 'n') {
        process.stdout.write('n\n');
        done(false);
        return;
      }
      if (key.name === 'return' || key.name === 'enter') {
        process.stdout.write(def ? 'y\n' : 'n\n');
        done(def);
        return;
      }
    };

    const done = (val: boolean) => {
      process.stdin.removeListener('keypress', onKey);
      process.stdin.setRawMode(false);
      resolve(val);
    };

    process.stdin.on('keypress', onKey);
  });
}

export { confirm };
