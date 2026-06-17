import { describe, test, expect } from 'vitest';
import { processOverflow } from '../src/overflow/index.ts';
import { createSlide, createSlideNode } from '../src/ast/createSlideNode.ts';
import type { Slide } from '@mindfiredigital/mdslide-shared';

describe('Overflow Engine', () => {
  test('returns slide unchanged if content is empty or short', () => {
    const slide = createSlide({
      id: 'slide-1',
      title: 'Short Slide',
      content: [
        createSlideNode({
          type: 'paragraph',
          children: [createSlideNode({ type: 'text', value: 'Hello' })],
        }),
      ],
    });

    const result = processOverflow([slide]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('slide-1');
    expect(result[0].title).toBe('Short Slide');
  });

  test('splits long code block when height budget is exceeded', () => {
    // Height of code node = 40 + lines * 16.
    // Let's create a code block with 45 lines. Height = 40 + 45 * 16 = 760, which is > MAX_CONTENT_HEIGHT (650).
    const lines = Array(45).fill('console.log("line");').join('\n');
    const slide = createSlide({
      id: 'slide-code',
      title: 'Long Code Block',
      content: [
        createSlideNode({
          type: 'code',
          value: lines,
        }),
      ],
    });

    const result = processOverflow([slide]);
    // It should split into at least 2 slides
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result[0].id).toBe('slide-code');
    expect(result[0].title).toBe('Long Code Block');
    expect(result[1].id).toBe('slide-code-cont-p1');
    expect(result[1].title).toBe('Long Code Block (Cont.)');
  });

  test('splits long list when height budget is exceeded', () => {
    // List item base height = max(22, wrapLines * 20)
    // 35 items of ~25px each = ~875px, which is > 650px.
    const listItems = Array(35)
      .fill(null)
      .map((_, i) =>
        createSlideNode({
          type: 'listItem',
          children: [createSlideNode({ type: 'text', value: `List item number ${i}` })],
        })
      );

    const slide = createSlide({
      id: 'slide-list',
      title: 'Long List',
      content: [
        createSlideNode({
          type: 'list',
          children: listItems,
        }),
      ],
    });

    const result = processOverflow([slide]);
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result[0].id).toBe('slide-list');
    expect(result[0].title).toBe('Long List');
    expect(result[1].id).toBe('slide-list-cont-p1');
    expect(result[1].title).toBe('Long List (Cont.)');
  });

  test('splits general flat content slide when height budget is exceeded', () => {
    // 30 paragraph nodes. Each paragraph = ~28px.
    // 30 * 28 = 840px > 650px.
    const paragraphs = Array(30)
      .fill(null)
      .map((_, i) =>
        createSlideNode({
          type: 'paragraph',
          children: [
            createSlideNode({
              type: 'text',
              value: `This is paragraph number ${i} which has some content text.`,
            }),
          ],
        })
      );

    const slide = createSlide({
      id: 'slide-paragraphs',
      title: 'Long Paragraphs',
      content: paragraphs,
    });

    const result = processOverflow([slide]);
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result[0].id).toBe('slide-paragraphs');
    expect(result[1].id).toBe('slide-paragraphs-cont-p1');
    expect(result[1].title).toBe('Long Paragraphs (Cont.)');
  });

  test('does not split code block if it is a mermaid diagram', () => {
    const lines = Array(45).fill('A --> B').join('\n');
    const slide = createSlide({
      id: 'slide-mermaid',
      title: 'Mermaid Diagram',
      content: [
        createSlideNode({
          type: 'code',
          lang: 'mermaid',
          value: lines,
        }),
      ],
    });

    const result = processOverflow([slide]);
    expect(result).toHaveLength(1);
    expect(result[0].content).toHaveLength(1);
    expect(result[0].content[0].value).toBe(lines);
  });
});
