/// <reference types="node" />
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { initCommand } from '../src/commands/init.ts';
import process from 'process';

describe('CLI Init Command', () => {
  const tmpDir = path.join(__dirname, 'tmp-init');
  const originalCwd = process.cwd();

  let logSpy: any;

  beforeEach(() => {
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    process.chdir(tmpDir);
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    process.chdir(originalCwd);
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('scaffolds presentation files in a clean directory', async () => {
    await initCommand({ logLevel: 'silent' });

    expect(fs.existsSync('slides.md')).toBe(true);
    expect(fs.existsSync('mdslide.config.ts')).toBe(true);

    const slidesContent = fs.readFileSync('slides.md', 'utf8');
    expect(slidesContent).toContain('My Presentation');
  });

  test('injects dev and build scripts into existing package.json', async () => {
    const pkg = {
      name: 'test-project',
      version: '1.0.0',
      scripts: {
        test: 'vitest',
      },
    };
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));

    await initCommand({ logLevel: 'silent' });

    const updatedPkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    expect(updatedPkg.scripts.test).toBe('vitest');
    expect(updatedPkg.scripts.dev).toBe('mdslide watch slides.md');
    expect(updatedPkg.scripts.build).toBe('mdslide compile slides.md');
  });

  test('does not overwrite existing slides without force option', async () => {
    fs.writeFileSync('slides.md', 'existing custom slides');

    await initCommand({ logLevel: 'silent' });

    const slidesContent = fs.readFileSync('slides.md', 'utf8');
    expect(slidesContent).toBe('existing custom slides');
  });

  test('overwrites existing slides with force option', async () => {
    fs.writeFileSync('slides.md', 'existing custom slides');

    await initCommand({ force: true, logLevel: 'silent' });

    const slidesContent = fs.readFileSync('slides.md', 'utf8');
    expect(slidesContent).not.toBe('existing custom slides');
    expect(slidesContent).toContain('My Presentation');
  });

  test('does not overwrite existing config without force option', async () => {
    fs.writeFileSync('mdslide.config.ts', 'existing custom config');

    await initCommand({ logLevel: 'silent' });

    const configContent = fs.readFileSync('mdslide.config.ts', 'utf8');
    expect(configContent).toBe('existing custom config');
  });
});
