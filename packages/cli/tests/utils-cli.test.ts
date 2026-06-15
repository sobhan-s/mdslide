/// <reference types="node" />
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger } from '../src/logger/index.ts';
import { Spinner } from '../src/ui/spinner.ts';
import { onShutdown } from '../src/middleware/signals.ts';
import {
  MdSlideError,
  InputNotFoundError,
  InvalidFormatError,
  ChromeNotFoundError,
  PortInUseError,
  CompileError,
} from '../src/middleware/errors.ts';
import { c, link } from '../src/utils/index.ts';
import process from 'process';

describe('CLI Logger', () => {
  let logSpy: any;
  let warnSpy: any;
  let errorSpy: any;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  test('info logs messages', () => {
    const logger = new Logger('info');
    logger.info('test info message');
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('test info message'));
  });

  test('warn logs warnings', () => {
    const logger = new Logger('info');
    logger.warn('test warning');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('test warning'));
  });

  test('verbose does not log if level is info', () => {
    const logger = new Logger('info');
    logger.verbose('test verbose');
    expect(logSpy).not.toHaveBeenCalled();
  });

  test('verbose logs if level is verbose', () => {
    const logger = new Logger('verbose');
    logger.verbose('test verbose');
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('test verbose'));
  });

  test('does not log anything (including raw) if level is silent', () => {
    const logger = new Logger('silent');
    logger.info('test info');
    logger.warn('test warn');
    logger.verbose('test verbose');
    logger.step('test step');
    logger.raw('test raw');

    expect(logSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  test('error prints MDslide error properties', () => {
    const logger = new Logger('info');
    const err = new InputNotFoundError('slides.md');
    logger.error(err);

    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('InputNotFoundError'));
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('slides.md'));
  });
});

describe('CLI Spinner', () => {
  let logSpy: any;
  let stdoutSpy: any;
  let stderrSpy: any;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    logSpy.mockRestore();
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
  });

  test('spinner logs step in non-TTY mode', () => {
    const logger = new Logger('info');
    const spinner = new Spinner(logger);

    // Force non-TTY spinner property
    (spinner as any).isTTY = false;

    spinner.start('Compiling');
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Compiling'));
  });

  test('spinner updates step in non-TTY mode', () => {
    const logger = new Logger('info');
    const spinner = new Spinner(logger);
    (spinner as any).isTTY = false;

    spinner.update('Updating');
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Updating'));
  });

  test('spinner fail writes error icon in non-TTY mode', () => {
    const logger = new Logger('info');
    const spinner = new Spinner(logger);
    (spinner as any).isTTY = false;

    spinner.fail('Failed compilation');
    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining('✖  Failed compilation'));
  });
});

describe('CLI Errors', () => {
  test('creates custom errors with correct codes and hints', () => {
    const e1 = new InputNotFoundError('path/to/file');
    expect(e1.code).toBe('ERR_INPUT_NOT_FOUND');
    expect(e1.message).toContain('path/to/file');
    expect(e1.hint).toBeDefined();

    const e2 = new InvalidFormatError('epub');
    expect(e2.code).toBe('ERR_INVALID_FORMAT');
    expect(e2.hint).toContain('html');

    const e3 = new ChromeNotFoundError();
    expect(e3.code).toBe('ERR_CHROME_NOT_FOUND');

    const e4 = new PortInUseError(4000);
    expect(e4.code).toBe('ERR_PORT_IN_USE');

    const e5 = new CompileError('syntax error', { line: 12 });
    expect(e5.code).toBe('ERR_COMPILE');
    expect(e5.line).toBe(12);
  });
});

describe('CLI Signal handlers', () => {
  test('onShutdown registers SIGINT and SIGTERM listeners', () => {
    const processOnSpy = vi.spyOn(process, 'on').mockImplementation(() => process);
    const mockCleanup = vi.fn();

    onShutdown(mockCleanup);

    expect(processOnSpy).toHaveBeenCalledWith('SIGINT', expect.any(Function));
    expect(processOnSpy).toHaveBeenCalledWith('SIGTERM', expect.any(Function));

    processOnSpy.mockRestore();
  });
});

describe('CLI Helper Utils', () => {
  test('link outputs string', () => {
    expect(link('http://foo.com')).toBe('http://foo.com');
  });

  test('c returns plain text in non-TTY mode', () => {
    const hasOriginal = 'isTTY' in process.stdout;
    const original = process.stdout.isTTY;
    (process.stdout as any).isTTY = false;

    expect(c('\x1b[31m', 'red text')).toBe('red text');

    if (hasOriginal) {
      process.stdout.isTTY = original;
    } else {
      delete (process.stdout as any).isTTY;
    }
  });
});
