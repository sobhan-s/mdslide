import { isTTY } from '../../constants/tellyTypewriter.js';
import { CURSOR, ERASE, STYLES } from '../../constants/terminalEscapeCode.js';

function c(color: string, text: string) {
  return isTTY ? `${color}${text}${STYLES.reset}` : text;
}

function clrLine() {
  if (isTTY) {
    // Moves to start, then erases the line contents
    process.stdout.write(`${CURSOR.carriageReturn}${ERASE.line}`);
  }
}

function movUp(n = 1) {
  if (isTTY) process.stdout.write(CURSOR.up(n));
}

function hideCursor() {
  if (isTTY) process.stdout.write(CURSOR.hide);
}

function showCursor() {
  if (isTTY) process.stdout.write(CURSOR.show);
}

export { c, clrLine, movUp, hideCursor, showCursor };
