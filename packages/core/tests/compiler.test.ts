import { describe, test, expect } from 'vitest';
import { Compiler } from '../src/pipeline/compiler.ts';

describe('Compiler Integration', () => {
  const compiler = new Compiler();

  test('compiles a complete markdown deck successfully', () => {
    const md = `---
title: Test Slide Deck
theme: terminal
author: Sobhan
---

# Introduction to MdSlide
Welcome to the compiler integration test.

---

# Features
<!-- layout: bullets -->
- Custom themes
- Auto splitting
- Code highlighting

<!-- notes -->
Make sure to explain all the features.
<!-- /notes -->
`;

    const result = compiler.compile(md);

    // Verify Meta
    expect(result.meta).toEqual({
      title: 'Test Slide Deck',
      theme: 'terminal',
      author: 'Sobhan',
    });

    // Verify Slides
    expect(result.slides).toHaveLength(2);

    // Slide 1
    const s1 = result.slides[0];
    expect(s1.title).toBe('Introduction to MdSlide');
    expect(s1.type).toBe('content');
    expect(s1.content).toHaveLength(1);
    expect(s1.content[0].type).toBe('paragraph');

    // Slide 2
    const s2 = result.slides[1];
    expect(s2.title).toBe('Features');
    expect(s2.type).toBe('bullets'); // Layout override layout: bullets
    expect(s2.content).toHaveLength(1);
    expect(s2.content[0].type).toBe('list');
    expect(s2.notes).toBe('Make sure to explain all the features.');

    // Verify HTML Output
    expect(result.html).toContain('<!DOCTYPE html>');
    expect(result.html).toContain('data-theme="terminal"');
    expect(result.html).toContain('<title>Test Slide Deck</title>');
    expect(result.html).toContain('Introduction to MdSlide');
    expect(result.html).toContain('Custom themes');
  });

  test('handles frontmatter-only markdown without crash', () => {
    const md = `---
title: Empty Presentation
---
`;
    const result = compiler.compile(md);
    expect(result.meta).toEqual({ title: 'Empty Presentation' });
    expect(result.slides).toEqual([]);
    expect(result.html).toContain('<title>Empty Presentation</title>');
  });
});
