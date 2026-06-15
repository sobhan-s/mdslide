import readline from 'readline';
import { COLORS, STYLES, isTTY } from '../../constants/index.js';
import { c, clrLine, showCursor } from './helper.js';

// Input as a text
async function input(prompt: string, defaultVal?: string): Promise<string> {
  return new Promise((resolve) => {
    if (!isTTY) {
      resolve(defaultVal ?? '');
      return;
    }

    const def = defaultVal ? c(COLORS.grey, ` (${defaultVal})`) : '';
    process.stdout.write(`\n  ${c(COLORS.cyan, '?')} ${c(STYLES.bold, prompt)}${def}: `);
    showCursor();

    let answer = '';
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) process.stdin.setRawMode(true);

    const onKey = (_: any, key: readline.Key) => {
      if (!key) return;

      if (key.ctrl && key.name === 'c') {
        process.stdin.removeListener('keypress', onKey);
        if (process.stdin.isTTY) process.stdin.setRawMode(false);
        process.exit(130);
      }

      if (key.name === 'return' || key.name === 'enter') {
        process.stdout.write('\n');
        process.stdin.removeListener('keypress', onKey);
        if (process.stdin.isTTY) process.stdin.setRawMode(false);
        resolve(answer.trim() || defaultVal || '');
        return;
      }

      if (key.name === 'backspace') {
        answer = answer.slice(0, -1);
        clrLine();
        process.stdout.write(`  ${c(COLORS.cyan, '?')} ${c(STYLES.bold, prompt)}${def}: ${answer}`);
        return;
      }

      if (key.sequence && !key.ctrl && !key.meta) {
        answer += key.sequence;
        process.stdout.write(key.sequence);
      }
    };

    process.stdin.on('keypress', onKey);
  });
}

export { input };
