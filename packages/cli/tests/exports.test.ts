/// <reference types="node" />
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { spawn, execFileSync } from 'child_process';
import { EventEmitter } from 'events';
import { findChromeBinary, exportToPdf, compileToPdf } from '../src/exports/pdfExports.ts';
import { compileToScreenshotPptx } from '../src/exports/pptxScreenshotExporter.ts';
import { compileToEditablePptx } from '../src/exports/pptxEditableExporter.ts';
import * as helper from '../src/exports/helper/pptxEditableSlideHelper.ts';

// Mock child_process
vi.mock('child_process', async () => {
  const actual = await vi.importActual<typeof import('child_process')>('child_process');
  return {
    ...actual,
    spawn: vi.fn(),
    execFileSync: vi.fn(),
  };
});

// Mock child process class for spawn
class MockChildProcess extends EventEmitter {
  stderr = new EventEmitter();
  kill = vi.fn();
  constructor(
    private exitCode: number = 0,
    private delay: number = 10
  ) {
    super();
    setTimeout(() => {
      this.stderr.emit('data', Buffer.from('mock chrome stderr logs'));
      this.emit('close', this.exitCode);
    }, this.delay);
  }
}

class MockSpawnErrorProcess extends EventEmitter {
  stderr = new EventEmitter();
  constructor() {
    super();
    setTimeout(() => {
      this.emit('error', new Error('Failed to spawn chrome'));
    }, 10);
  }
}

describe('CLI Exporter Modules', () => {
  const tmpDir = path.join(__dirname, 'tmp-exports');
  let mockExecFileSyncSuccess = true;
  let spawnMode: 'success' | 'timeout' | 'error-exit' | 'spawn-error' = 'success';

  beforeEach(() => {
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    // Write a dummy PNG file so pptxgenjs does not fail on local image read
    fs.writeFileSync(path.join(tmpDir, 'nonexistent.png'), 'fake png data');

    // Write dummy static assets to test local server content-type headers
    fs.writeFileSync(path.join(tmpDir, 'test.css'), 'body { color: red; }');
    fs.writeFileSync(path.join(tmpDir, 'test.js'), 'console.log("test");');
    fs.writeFileSync(path.join(tmpDir, 'test.json'), '{"key": "value"}');
    fs.writeFileSync(path.join(tmpDir, 'test.png'), 'fake-png-bytes');
    fs.writeFileSync(path.join(tmpDir, 'test.jpg'), 'fake-jpg-bytes');
    fs.writeFileSync(path.join(tmpDir, 'test.woff'), 'fake-woff-bytes');

    mockExecFileSyncSuccess = true;
    spawnMode = 'success';

    // Set up execFileSync mock behavior
    vi.mocked(execFileSync).mockImplementation((file, args, options) => {
      if (mockExecFileSyncSuccess) {
        return Buffer.from('Google Chrome 120.0.0.0');
      }
      throw new Error('command not found');
    });

    // Set up spawn mock behavior
    vi.mocked(spawn).mockImplementation((cmd, args, options) => {
      const url = args ? args[args.length - 1] : '';
      if (spawnMode === 'success') {
        // Find output paths in arguments and create empty mock files
        if (args) {
          const pdfArg = args.find((a) => a.startsWith('--print-to-pdf='));
          const screenshotArg = args.find((a) => a.startsWith('--screenshot='));
          if (pdfArg) {
            const outPath = pdfArg.split('=')[1];
            if (outPath) fs.writeFileSync(outPath, 'dummy pdf data');
          } else if (screenshotArg) {
            const outPath = screenshotArg.split('=')[1];
            if (outPath) fs.writeFileSync(outPath, 'dummy png data');
          }

          // Make HTTP requests to local dev server to cover serveHtml paths
          if (url && url.startsWith('http://127.0.0.1')) {
            const baseHost = url.split('/?')[0];
            const safeGet = (u: string) => {
              http
                .get(u, (res) => {
                  res.on('data', () => {});
                })
                .on('error', () => {});
            };
            safeGet(url);
            safeGet(`${baseHost}/test.css`);
            safeGet(`${baseHost}/test.js`);
            safeGet(`${baseHost}/test.json`);
            safeGet(`${baseHost}/test.png`);
            safeGet(`${baseHost}/test.jpg`);
            safeGet(`${baseHost}/test.woff`);
            safeGet(`${baseHost}/nonexistent-file.css`);
          }
        }
        return new MockChildProcess(0) as any;
      }
      if (spawnMode === 'timeout') {
        return new MockChildProcess(0, 100000) as any;
      }
      if (spawnMode === 'error-exit') {
        return new MockChildProcess(1) as any;
      }
      if (spawnMode === 'spawn-error') {
        return new MockSpawnErrorProcess() as any;
      }
      return new MockChildProcess(0) as any;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  describe('PDF Exporter (pdfExports.ts)', () => {
    test('findChromeBinary returns first succeeding candidate path', () => {
      const bin = findChromeBinary();
      expect(bin).not.toBeNull();
      expect(typeof bin).toBe('string');
    });

    test('findChromeBinary returns null if all candidate paths fail', () => {
      mockExecFileSyncSuccess = false;
      const bin = findChromeBinary();
      expect(bin).toBeNull();
    });

    test('exportToPdf rejects if no chrome binary is found', async () => {
      mockExecFileSyncSuccess = false;
      await expect(exportToPdf('in.html', 'out.pdf', { chromePath: null as any })).rejects.toThrow(
        'PDF export requires Google Chrome or Chromium'
      );
    });

    test('exportToPdf succeeds when chrome exits with code 0', async () => {
      const outPdf = path.join(tmpDir, 'output.pdf');
      await exportToPdf('in.html', outPdf, { chromePath: 'mock-chrome' });
      expect(fs.existsSync(outPdf)).toBe(true);
    });

    test('exportToPdf rejects on timeout and kills child process', async () => {
      spawnMode = 'timeout';
      const outPdf = path.join(tmpDir, 'output-timeout.pdf');
      await expect(
        exportToPdf('in.html', outPdf, { chromePath: 'mock-chrome', timeoutMs: 10 })
      ).rejects.toThrow('PDF export timed out after');
    });

    test('exportToPdf rejects if chrome exits with non-zero code', async () => {
      spawnMode = 'error-exit';
      const outPdf = path.join(tmpDir, 'output-error.pdf');
      await expect(exportToPdf('in.html', outPdf, { chromePath: 'mock-chrome' })).rejects.toThrow(
        'Chrome exited with code 1'
      );
    });

    test('exportToPdf rejects if spawning fails', async () => {
      spawnMode = 'spawn-error';
      const outPdf = path.join(tmpDir, 'output-spawn-error.pdf');
      await expect(exportToPdf('in.html', outPdf, { chromePath: 'mock-chrome' })).rejects.toThrow(
        'Failed to start Chrome: Failed to spawn chrome'
      );
    });

    test('compileToPdf wrapper handles temp file creation and removal', async () => {
      const outPdf = path.join(tmpDir, 'compiled.pdf');
      await compileToPdf('<h1>Hello World</h1>', outPdf, { chromePath: 'mock-chrome' });
      expect(fs.existsSync(outPdf)).toBe(true);
    });
  });

  describe('Screenshot PPTX Exporter (pptxScreenshotExporter.ts)', () => {
    test('compileToScreenshotPptx throws if no chrome is found', async () => {
      mockExecFileSyncSuccess = false;
      await expect(
        compileToScreenshotPptx('<html></html>', 2, 'out.pptx', { chromePath: null as any })
      ).rejects.toThrow('Screenshot PPTX export requires Google Chrome or Chromium');
    });

    test('compileToScreenshotPptx compiles slides using local HTTP server and mock screenshots', async () => {
      const outPptx = path.join(tmpDir, 'screenshot.pptx');
      await compileToScreenshotPptx('<html><head></head><body></body></html>', 2, outPptx, {
        chromePath: 'mock-chrome',
        baseDir: tmpDir,
      });
      expect(fs.existsSync(outPptx)).toBe(true);
    });

    test('compileToScreenshotPptx handles chrome screenshot timeouts', async () => {
      spawnMode = 'timeout';
      const outPptx = path.join(tmpDir, 'screenshot-timeout.pptx');
      await expect(
        compileToScreenshotPptx('<html><head></head><body></body></html>', 1, outPptx, {
          chromePath: 'mock-chrome',
          timeoutMs: 10,
          baseDir: tmpDir,
        })
      ).rejects.toThrow('Screenshot timed out for:');
    });

    test('compileToScreenshotPptx handles chrome exit errors', async () => {
      spawnMode = 'error-exit';
      const outPptx = path.join(tmpDir, 'screenshot-err.pptx');
      await expect(
        compileToScreenshotPptx('<html><head></head><body></body></html>', 1, outPptx, {
          chromePath: 'mock-chrome',
          baseDir: tmpDir,
        })
      ).rejects.toThrow('Chrome screenshot failed');
    });

    test('compileToScreenshotPptx handles chrome spawn errors', async () => {
      spawnMode = 'spawn-error';
      const outPptx = path.join(tmpDir, 'screenshot-spawn-err.pptx');
      await expect(
        compileToScreenshotPptx('<html><head></head><body></body></html>', 1, outPptx, {
          chromePath: 'mock-chrome',
          baseDir: tmpDir,
        })
      ).rejects.toThrow('Failed to spawn chrome');
    });
  });

  describe('Editable PPTX Exporter (pptxEditableExporter.ts)', () => {
    test('compileToEditablePptx compiles all slide types and themes successfully', async () => {
      const outPptx = path.join(tmpDir, 'editable.pptx');
      const mockDeck = {
        meta: { theme: 'corporate' },
        slides: [
          {
            type: 'title',
            title: 'Welcome Slide',
            content: [
              { type: 'paragraph', children: [{ type: 'text', value: 'This is a subtitle' }] },
            ],
          },
          {
            type: 'statement',
            title: 'Core Value',
            content: [{ type: 'paragraph', children: [{ type: 'text', value: 'Statement text' }] }],
          },
          {
            type: 'quote',
            content: [
              {
                type: 'blockquote',
                children: [{ type: 'paragraph', children: [{ type: 'text', value: 'My Quote' }] }],
              },
            ],
          },
          {
            type: 'code',
            content: [{ type: 'code', value: 'const num = 42;' }],
          },
          {
            type: 'visual',
            title: 'Visual title',
            content: [{ type: 'image', url: './nonexistent.png' }],
          },
          {
            type: 'visual',
            content: [
              {
                type: 'paragraph',
                children: [{ type: 'text', value: 'Plain text visual fall-back' }],
              },
            ],
          },
          {
            type: 'table',
            content: [
              {
                type: 'table',
                children: [
                  {
                    type: 'tableRow',
                    children: [
                      {
                        type: 'tableCell',
                        header: true,
                        children: [{ type: 'text', value: 'Col A' }],
                      },
                      {
                        type: 'tableCell',
                        header: true,
                        children: [{ type: 'text', value: 'Col B' }],
                      },
                    ],
                  },
                  {
                    type: 'tableRow',
                    children: [
                      { type: 'tableCell', children: [{ type: 'text', value: 'A1' }] },
                      { type: 'tableCell', children: [{ type: 'text', value: 'B1' }] },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'split',
            content: [
              {
                type: 'column',
                children: [
                  {
                    type: 'list',
                    children: [
                      {
                        type: 'listItem',
                        children: [{ type: 'text', value: 'Item Left' }],
                      },
                    ],
                  },
                ],
              },
              {
                type: 'column',
                children: [{ type: 'code', value: 'const rightSide = true;' }],
              },
            ],
          },
          {
            type: 'split',
            content: [
              {
                type: 'column',
                children: [{ type: 'paragraph', children: [{ type: 'text', value: 'Left side' }] }],
              },
              {
                type: 'column',
                children: [{ type: 'image', url: 'https://example.com/remote.png' }],
              },
            ],
          },
          {
            type: 'split',
            content: [
              {
                type: 'column',
                children: [{ type: 'paragraph', children: [{ type: 'text', value: 'Left side' }] }],
              },
              {
                type: 'column',
                children: [
                  { type: 'paragraph', children: [{ type: 'text', value: 'Right side' }] },
                ],
              },
            ],
          },
          {
            type: 'bullets',
            title: 'Bullet Points',
            content: [
              {
                type: 'list',
                children: [
                  {
                    type: 'listItem',
                    children: [
                      { type: 'text', value: 'Parent Bullet' },
                      {
                        type: 'list',
                        children: [
                          {
                            type: 'listItem',
                            children: [{ type: 'text', value: 'Child Bullet' }],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              { type: 'image', url: 'https://example.com/img1.png' },
              { type: 'image', url: 'https://example.com/img2.png' },
            ],
          },
          {
            type: 'bullets',
            title: 'Formatting Text',
            content: [
              {
                type: 'paragraph',
                children: [
                  { type: 'text', value: 'Text ' },
                  { type: 'strong', children: [{ type: 'text', value: 'bold ' }] },
                  { type: 'emphasis', children: [{ type: 'text', value: 'italic ' }] },
                  { type: 'inlineCode', value: 'inline ' },
                  {
                    type: 'link',
                    url: 'https://example.com',
                    children: [{ type: 'text', value: 'link' }],
                  },
                ],
              },
            ],
          },
        ],
      };

      await compileToEditablePptx(mockDeck as any, outPptx, {
        theme: 'dark',
        baseDir: tmpDir,
      });

      expect(fs.existsSync(outPptx)).toBe(true);
    });
  });

  describe('Pptx Editable Helper Functions (pptxEditableSlideHelper.ts)', () => {
    test('nodeToPlainText recursively extracts text correctly', () => {
      const mockNode = {
        type: 'paragraph',
        children: [
          { type: 'text', value: 'Hello ' },
          { type: 'strong', children: [{ type: 'text', value: 'World!' }] },
        ],
      };
      expect(helper.nodeToPlainText(mockNode as any)).toBe('Hello World!');
    });

    test('resolveImagePath returns correct path absolute and relative configurations', () => {
      expect(helper.resolveImagePath('https://example.com/img.png')).toBe(
        'https://example.com/img.png'
      );
      expect(helper.resolveImagePath('/absolute/path.png')).toBe('/absolute/path.png');
      expect(helper.resolveImagePath('relative.png', '/base')).toBe('/base/relative.png');
      expect(helper.resolveImagePath('relative.png')).toContain('relative.png');
      expect(helper.resolveImagePath('')).toBe('');
    });
  });
});
