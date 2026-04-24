import { describe, it, expect } from 'vitest';
import { parse } from '../src/parse.js';

describe('parse', () => {
  it('parse a simple paragraph to slide', () => {
    const { slides } = parse('hello world');
    expect(slides).toHaveLength(1);
    expect(slides[0].content[0].type).toBe('paragraph');
  });

  it('--- : splits into two slides', () => {
    const { slides } = parse(`
first slide
---
second slide
    `);
    expect(slides).toHaveLength(2);
  });

  it('# sets the title on the slide', () => {
    const { slides } = parse(`
# My Presentation

some content
    `);
    expect(slides[0].title).toBe('My Presentation');
  });

  it('## starts a new slide with that title', () => {
    const { slides } = parse(`
## Intro

some content
    `);
    const slide = slides.find((s) => s.title === 'Intro');
    expect(slide).toBeDefined();
    expect(slide!.content[0].type).toBe('paragraph');
  });

  it('bullet list is present then slide detected as bullets layout', () => {
    const { slides } = parse(`
## Features

- fast
- simple
- reliable
    `);
    const slide = slides.find((s) => s.title === 'Features');
    expect(slide).toBeDefined();
    expect(slide!.type).toBe('bullets');
  });

  it('title is present then slide detected as title layout', () => {
    const { slides } = parse('# My Presentation');
    expect(slides[0].type).toBe('title');
  });

  it('extracts frontmatter meta and does not show in slides', () => {
    const { meta, slides } = parse(`---
title: My Deck
theme: dark
---

# First Slide
    `);
    expect(meta.title).toBe('My Deck');
    expect(meta.theme).toBe('dark');
    expect(slides[0].content).toHaveLength(0);
  });

  it('returns empty meta when no frontmatter is present', () => {
    const { meta } = parse('# No Frontmatter');
    expect(meta).toEqual({});
  });

  it('collects notes into the notes field and removes them from content', () => {
    const { slides } = parse(`
## My Slide

- Point one

<!-- notes -->
Hi I am Rushik who works on projects
<!-- /notes -->
    `);
    const slide = slides.find((s) => s.title === 'My Slide');
    expect(slide).toBeDefined();
    expect(slide!.notes).toBe('Hi I am Rushik who works on projects');
    const hasHtmlNode = slide!.content.some((n) => n.type === 'html');
    expect(hasHtmlNode).toBe(false);
  });

  it('respects layout override comment and skips auto-detection', () => {
    const { slides } = parse(`
## My Slide

<!-- layout: content -->

- Point one
- Point two
    `);
    const slide = slides.find((s) => s.title === 'My Slide');
    expect(slide).toBeDefined();
    expect(slide!.type).toBe('content');
  });
});
