/// <reference types="node" />
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { validateCommand } from '../src/commands/validate.ts';
import process from 'process';

describe('CLI Validate Command', () => {
  const tmpDir = path.join(__dirname, 'tmp-validate');
  const validMd = path.join(tmpDir, 'valid.md');
  const invalidMd = path.join(tmpDir, 'invalid.md');
  const warningMd = path.join(tmpDir, 'warning.md');

  const frontmatterErrorMd = path.join(tmpDir, 'frontmatter-error.md');
  const frontmatterWarningMd = path.join(tmpDir, 'frontmatter-warning.md');
  const frontmatterNonStringThemeMd = path.join(tmpDir, 'frontmatter-non-string-theme.md');
  const emptySlideMd = path.join(tmpDir, 'empty-slide.md');
  const overflowSlideMd = path.join(tmpDir, 'overflow-slide.md');
  const overflowSplitCommentMd = path.join(tmpDir, 'overflow-split-comment.md');
  const overflowSplitMetaMd = path.join(tmpDir, 'overflow-split-meta.md');
  const layoutWarningMd = path.join(tmpDir, 'layout-warning.md');
  const multipleLayoutsWarningMd = path.join(tmpDir, 'multiple-layouts.md');
  const unclosedNotesWarningMd = path.join(tmpDir, 'unclosed-notes.md');
  const nestedNotesWarningMd = path.join(tmpDir, 'nested-notes.md');
  const strayNotesCloseWarningMd = path.join(tmpDir, 'stray-notes-close.md');
  const unsupportedLangWarningMd = path.join(tmpDir, 'unsupported-lang.md');
  const multipleSplitsWarningMd = path.join(tmpDir, 'multiple-splits.md');
  const emptySplitColumnWarningMd = path.join(tmpDir, 'empty-split-column.md');
  const multipleH1WarningMd = path.join(tmpDir, 'multiple-h1.md');
  const brokenImageWarningMd = path.join(tmpDir, 'broken-image.md');
  const workingImageMd = path.join(tmpDir, 'working-image.md');
  const sampleImg = path.join(tmpDir, 'present-img.png');

  let exitSpy: any;
  let logSpy: any;

  beforeEach(() => {
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    fs.writeFileSync(validMd, '# Page One\nContent 1\n---\n# Page Two\nContent 2\n');
    fs.writeFileSync(invalidMd, '# Unclosed Fence\n```javascript\nconst a = 1;\n');
    fs.writeFileSync(warningMd, 'No Heading Here\n');
    fs.writeFileSync(frontmatterErrorMd, '---\ntheme: [unclosed-array\n---\n# Page One\n');
    fs.writeFileSync(frontmatterWarningMd, '---\ntheme: nonexistent-theme\n---\n# Page One\n');
    fs.writeFileSync(frontmatterNonStringThemeMd, '---\ntheme: 123\n---\n# Page One\n');
    fs.writeFileSync(emptySlideMd, '# Page One\n---\n\n---\n# Page Three\n');
    fs.writeFileSync(overflowSlideMd, '# Page One\n' + Array(35).fill('line').join('\n'));
    fs.writeFileSync(
      overflowSplitCommentMd,
      '# Page One\n<!-- overflow: split -->\n' + Array(35).fill('line').join('\n')
    );
    fs.writeFileSync(
      overflowSplitMetaMd,
      '---\noverflow: split\n---\n# Page One\n' + Array(35).fill('line').join('\n')
    );
    fs.writeFileSync(layoutWarningMd, '# Page One\n<!-- layout: nonexistent-layout -->\n');
    fs.writeFileSync(
      multipleLayoutsWarningMd,
      '# Page One\n<!-- layout: code -->\n<!-- layout: bullets -->\n'
    );
    fs.writeFileSync(unclosedNotesWarningMd, '# Page One\n<!-- notes -->\nSome notes content\n');
    fs.writeFileSync(
      nestedNotesWarningMd,
      '# Page One\n<!-- notes -->\n<!-- notes -->\n<!-- /notes -->\n'
    );
    fs.writeFileSync(strayNotesCloseWarningMd, '# Page One\n<!-- /notes -->\n');
    fs.writeFileSync(
      unsupportedLangWarningMd,
      '# Page One\n```nonexistentlang\nconst x = 1;\n```\n'
    );
    fs.writeFileSync(
      multipleSplitsWarningMd,
      '# Page One\nCol 1\n::split::\nCol 2\n::split::\nCol 3\n'
    );
    fs.writeFileSync(emptySplitColumnWarningMd, '# Page One\n::split::\n');
    fs.writeFileSync(multipleH1WarningMd, '# Title One\n# Title Two\n');
    fs.writeFileSync(brokenImageWarningMd, '# Page One\n![Broken](./missing-img.png)\n');

    // Existing image test
    fs.writeFileSync(sampleImg, 'dummy image data');
    fs.writeFileSync(workingImageMd, `# Page One\n![Working](./present-img.png)\n`);

    exitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation((code?: string | number | null | undefined) => {
        throw new Error(`process.exit called with code: ${code}`);
      });
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    exitSpy.mockRestore();
    logSpy.mockRestore();
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('validates clean slides successfully without errors or exit', async () => {
    await validateCommand(validMd, { logLevel: 'silent' });
  });

  test('fails validation and exits on syntax errors', async () => {
    await expect(validateCommand(invalidMd, { logLevel: 'silent' })).rejects.toThrow(
      'process.exit called with code: 1'
    );
  });

  test('does not exit on warnings by default', async () => {
    await validateCommand(warningMd, { logLevel: 'silent' });
  });

  test('fails validation and exits on warnings when strict is true', async () => {
    await expect(validateCommand(warningMd, { strict: true, logLevel: 'silent' })).rejects.toThrow(
      'process.exit called with code: 1'
    );
  });

  test('fails and exits if input file does not exist', async () => {
    await expect(validateCommand('nonexistent.md', { logLevel: 'silent' })).rejects.toThrow(
      'process.exit called with code: 1'
    );
  });

  // New validation tests
  test('fails on invalid YAML frontmatter syntax', async () => {
    await expect(validateCommand(frontmatterErrorMd, { logLevel: 'silent' })).rejects.toThrow(
      'process.exit called with code: 1'
    );
  });

  test('warns on unrecognized theme name', async () => {
    await validateCommand(frontmatterWarningMd, { logLevel: 'info' });
    const output = logSpy.mock.calls.map((c: any) => c[0]).join('\n');
    expect(output).toContain('Theme "nonexistent-theme" is not a built-in theme');
  });

  test('warns on unrecognized layout override name', async () => {
    await validateCommand(layoutWarningMd, { logLevel: 'info' });
    const output = logSpy.mock.calls.map((c: any) => c[0]).join('\n');
    expect(output).toContain('Invalid layout override "nonexistent-layout"');
  });

  test('warns on multiple layout overrides in a slide', async () => {
    await validateCommand(multipleLayoutsWarningMd, { logLevel: 'info' });
    const output = logSpy.mock.calls.map((c: any) => c[0]).join('\n');
    expect(output).toContain('Multiple layout overrides found on a single slide');
  });

  test('warns on unclosed speaker notes block', async () => {
    await validateCommand(unclosedNotesWarningMd, { logLevel: 'info' });
    const output = logSpy.mock.calls.map((c: any) => c[0]).join('\n');
    expect(output).toContain('Unclosed notes block (missing <!-- /notes -->)');
  });

  test('warns on nested speaker notes blocks', async () => {
    await validateCommand(nestedNotesWarningMd, { logLevel: 'info' });
    const output = logSpy.mock.calls.map((c: any) => c[0]).join('\n');
    expect(output).toContain('Nested notes block detected');
  });

  test('warns on stray closing notes tag', async () => {
    await validateCommand(strayNotesCloseWarningMd, { logLevel: 'info' });
    const output = logSpy.mock.calls.map((c: any) => c[0]).join('\n');
    expect(output).toContain('Stray closing notes tag (<!-- /notes -->)');
  });

  test('warns on unsupported syntax highlighting language in code block', async () => {
    await validateCommand(unsupportedLangWarningMd, { logLevel: 'info' });
    const output = logSpy.mock.calls.map((c: any) => c[0]).join('\n');
    expect(output).toContain('Language "nonexistentlang" in code fence is not supported');
  });

  test('warns on multiple split markers in a single slide', async () => {
    await validateCommand(multipleSplitsWarningMd, { logLevel: 'info' });
    const output = logSpy.mock.calls.map((c: any) => c[0]).join('\n');
    expect(output).toContain('Multiple ::split:: markers found in a single slide');
  });

  test('warns on empty column in split layout', async () => {
    await validateCommand(emptySplitColumnWarningMd, { logLevel: 'info' });
    const output = logSpy.mock.calls.map((c: any) => c[0]).join('\n');
    expect(output).toContain('Empty column in split layout');
  });

  test('warns on multiple level 1 headings on a single slide', async () => {
    await validateCommand(multipleH1WarningMd, { logLevel: 'info' });
    const output = logSpy.mock.calls.map((c: any) => c[0]).join('\n');
    expect(output).toContain('Multiple level 1 headings (#) found on a single slide');
  });

  test('warns on broken local image references', async () => {
    await validateCommand(brokenImageWarningMd, { logLevel: 'info' });
    const output = logSpy.mock.calls.map((c: any) => c[0]).join('\n');
    expect(output).toContain('Referenced image "./missing-img.png" does not exist on disk');
  });

  test('does not warn on working local image references', async () => {
    await validateCommand(workingImageMd, { logLevel: 'info' });
    const output = logSpy.mock.calls.map((c: any) => c[0]).join('\n');
    expect(output).not.toContain('does not exist on disk');
  });

  test('warns on non-string theme in frontmatter', async () => {
    await validateCommand(frontmatterNonStringThemeMd, { logLevel: 'info' });
    const output = logSpy.mock.calls.map((c: any) => c[0]).join('\n');
    expect(output).toContain('Theme "" is not a built-in theme');
  });

  test('warns on empty slide', async () => {
    await validateCommand(emptySlideMd, { logLevel: 'info' });
    const output = logSpy.mock.calls.map((c: any) => c[0]).join('\n');
    expect(output).toContain('Slide is empty');
  });

  test('warns on slide with overflow lines', async () => {
    await validateCommand(overflowSlideMd, { logLevel: 'info' });
    const output = logSpy.mock.calls.map((c: any) => c[0]).join('\n');
    expect(output).toContain('may overflow in the browser');
  });

  test('does not warn on slide with overflow lines when comment overflow: split is used', async () => {
    await validateCommand(overflowSplitCommentMd, { logLevel: 'info' });
    const output = logSpy.mock.calls.map((c: any) => c[0]).join('\n');
    expect(output).not.toContain('may overflow in the browser');
  });

  test('does not warn on slide with overflow lines when frontmatter overflow: split is used', async () => {
    await validateCommand(overflowSplitMetaMd, { logLevel: 'info' });
    const output = logSpy.mock.calls.map((c: any) => c[0]).join('\n');
    expect(output).not.toContain('may overflow in the browser');
  });
});
