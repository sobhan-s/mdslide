import { describe, it, expect } from 'vitest';
import { resolveTheme, baseCSS } from '../src/theme.js';

describe('baseCSS', () => {
  const css = baseCSS();

  it('contains layout classes and CSS variables', () => {
    expect(css).toContain('.slide');
    expect(css).toContain('.slide-counter');
    expect(css).toContain('var(--slide-bg)');
    expect(css).toContain('var(--slide-text)');
    expect(css).toContain('var(--slide-font)');
  });

  it('keeps notes hidden and change the theme for each slide', () => {
    expect(css).toContain('.notes');
    expect(css).toContain('display: none');
    expect(css).toContain('[data-theme="dark"]');
    expect(css).toContain('[data-theme="light"]');
  });
});

describe('resolveTheme', () => {
  it('light theme defines all required CSS variables', () => {
    const css = resolveTheme('light');
    [
      '--slide-bg',
      '--slide-text',
      '--slide-accent',
      '--slide-muted',
      '--slide-font',
      '--slide-mono',
      '--slide-radius',
      '--slide-shadow',
    ].forEach((v) => expect(css).toContain(v));
  });

  it.each([
    ['dark', '--slide-bg: #0f0f0f'],
    ['notion', '--slide-bg: #f7f6f3'],
    ['terminal', '--slide-bg: #0d0d0d'],
    ['gradient', '--slide-bg: #1e1b4b'],
  ])('resolves %s theme correctly', (name, expected) => {
    expect(resolveTheme(name)).toContain(expected);
  });

  it('returns the string as-is when not a built-in name', () => {
    const rawCss = '--slide-bg: hotpink;';
    expect(resolveTheme(rawCss)).toBe(rawCss);
  });
});
