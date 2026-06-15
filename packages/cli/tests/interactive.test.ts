/// <reference types="node" />
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import readline from 'readline';
import { runInteractivePrompt } from '../src/interactiveCommands/index.ts';
import { confirm } from '../src/interactiveCommands/helper/confirmCommand.ts';
import { input } from '../src/interactiveCommands/helper/inputCommand.ts';
import { select } from '../src/interactiveCommands/helper/selectCommand.ts';
import process from 'process';

let mockIsTTY = false;
vi.mock('../src/constants/tellyTypewriter.ts', () => {
  return {
    get isTTY() {
      return mockIsTTY;
    },
  };
});

describe('CLI Interactive Commands - non-TTY fallback', () => {
  beforeEach(() => {
    mockIsTTY = false;
  });

  test('confirm returns default value in non-TTY mode', async () => {
    const res = await confirm('Do something', true);
    expect(res).toBe(true);

    const res2 = await confirm('Do something else', false);
    expect(res2).toBe(false);
  });

  test('input returns default value in non-TTY mode', async () => {
    const res = await input('Enter name', 'Alice');
    expect(res).toBe('Alice');
  });

  test('select returns first choice value in non-TTY mode', async () => {
    const choices = [
      { label: 'One', value: 1 },
      { label: 'Two', value: 2 },
    ];
    const res = await select('Select number', choices);
    expect(res).toBe(1);
  });

  test('runInteractivePrompt resolves with default selections in non-TTY mode', async () => {
    const res = await runInteractivePrompt('test.md');
    expect(res.format).toBe('html');
    expect(res.theme).toBe('light');
    expect(res.output).toBe('output.html');
    expect(res.watch).toBe(false);
    expect(res.open).toBe(true);
  });
});

describe('CLI Interactive Commands - TTY interactive mode', () => {
  let stdoutWriteSpy: any;
  let exitSpy: any;

  beforeEach(() => {
    mockIsTTY = true;
    stdoutWriteSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    exitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation((code?: string | number | null | undefined) => {
        throw new Error(`process.exit called with code: ${code}`);
      });

    if (!process.stdin.setRawMode) {
      process.stdin.setRawMode = () => process.stdin;
    } else {
      vi.spyOn(process.stdin, 'setRawMode').mockImplementation(() => process.stdin);
    }
  });

  afterEach(() => {
    stdoutWriteSpy.mockRestore();
    exitSpy.mockRestore();
    vi.restoreAllMocks();
  });

  test('confirm resolves true on y keypress in TTY mode', async () => {
    const p = confirm('Is correct?', false);

    // Simulate keypress
    process.stdin.emit('keypress', 'y', { name: 'y', sequence: 'y' });

    const res = await p;
    expect(res).toBe(true);
  });

  test('confirm resolves false on n keypress in TTY mode', async () => {
    const p = confirm('Is correct?', true);

    // Simulate keypress
    process.stdin.emit('keypress', 'n', { name: 'n', sequence: 'n' });

    const res = await p;
    expect(res).toBe(false);
  });

  test('confirm resolves default on enter keypress in TTY mode', async () => {
    const p = confirm('Is correct?', true);

    // Simulate keypress
    process.stdin.emit('keypress', null, { name: 'return' });

    const res = await p;
    expect(res).toBe(true);
  });

  test('confirm exits with code 130 on ctrl+c keypress', async () => {
    const p = confirm('Is correct?', true);

    // Simulate ctrl+c
    expect(() => {
      process.stdin.emit('keypress', null, { name: 'c', ctrl: true });
    }).toThrow('process.exit called with code: 130');
  });

  test('input resolves user typed value on enter in TTY mode', async () => {
    const p = input('Your name', 'Bob');

    // Type name: 'M', 'a', 'x', backspace, 'y'
    process.stdin.emit('keypress', 'M', { sequence: 'M' });
    process.stdin.emit('keypress', 'a', { sequence: 'a' });
    process.stdin.emit('keypress', 'x', { sequence: 'x' });
    process.stdin.emit('keypress', null, { name: 'backspace' });
    process.stdin.emit('keypress', 'y', { sequence: 'y' });
    process.stdin.emit('keypress', null, { name: 'enter' });

    const res = await p;
    expect(res).toBe('May');
  });

  test('select resolves correct chosen choice in TTY mode', async () => {
    const choices = [
      { label: 'One', value: 1 },
      { label: 'Two', value: 2 },
      { label: 'Three', value: 3 },
    ];
    const p = select('Number', choices);

    // Press down twice, then enter
    process.stdin.emit('keypress', null, { name: 'down' });
    process.stdin.emit('keypress', null, { name: 'down' });
    process.stdin.emit('keypress', null, { name: 'enter' });

    const res = await p;
    expect(res).toBe(3);
  });
});
