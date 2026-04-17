import { describe, it, expect } from 'vitest';
import { splitSlides } from '../src/split.js';
import type { Root } from 'mdast';

describe('splitSlides', () => {
  it('plain paragraph ends up in one slide', () => {
    const tree: Root = {
      type: 'root',
      children: [{ type: 'paragraph', children: [{ type: 'text', value: 'hi-rushik' }] }],
    };

    const result = splitSlides(tree);
    expect(result).toHaveLength(1);
    expect(result[0].content[0].type).toBe('paragraph');
  });

  it('thematic break which creates two slides', () => {
    const tree: Root = {
      type: 'root',
      children: [
        { type: 'paragraph', children: [{ type: 'text', value: 'slide-1' }] },
        { type: 'thematicBreak' },
        { type: 'paragraph', children: [{ type: 'text', value: 'slide-2' }] },
      ],
    };

    const result = splitSlides(tree);
    expect(result).toHaveLength(2);
  });

  it('## starts a new slide and becomes its title', () => {
    const tree: Root = {
      type: 'root',
      children: [
        { type: 'heading', depth: 2, children: [{ type: 'text', value: 'Main' }] },
        { type: 'paragraph', children: [{ type: 'text', value: 'Para' }] },
      ],
    };

    const result = splitSlides(tree);
    const slide = result.find((s) => s.title === 'Main');
    expect(slide).toBeDefined();
    expect(slide!.content[0].type).toBe('paragraph');
  });

  it('# sets as main title ', () => {
    const tree: Root = {
      type: 'root',
      children: [
        { type: 'heading', depth: 1, children: [{ type: 'text', value: 'My Presentation' }] },
        { type: 'paragraph', children: [{ type: 'text', value: 'some content' }] },
      ],
    };

    const result = splitSlides(tree);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('My Presentation');
  });

  it('every slide gets its own id', () => {
    const tree: Root = {
      type: 'root',
      children: [{ type: 'thematicBreak' }, { type: 'thematicBreak' }],
    };

    const result = splitSlides(tree);
    const ids = result.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
