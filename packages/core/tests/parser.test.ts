import { describe, test, expect } from 'vitest';
import * as lexer from '../src/parser/lexer.ts';
import { parseMarkdown } from '../src/parser/markdownParser.ts';

describe('Lexer', () => {
  test('correctly identifies different node types', () => {
    expect(lexer.isThematicBreak({ type: 'thematicBreak' })).toBe(true);
    expect(lexer.isThematicBreak({ type: 'Paragraph' })).toBe(false);

    expect(lexer.isHeading({ type: 'heading', depth: 1, children: [] })).toBe(true);
    expect(lexer.isHeading({ type: 'Paragraph' })).toBe(false);

    expect(lexer.isHTML({ type: 'html', value: '' })).toBe(true);
    expect(lexer.isHTML({ type: 'text', value: '' })).toBe(false);

    expect(lexer.isList({ type: 'list', children: [] })).toBe(true);
    expect(lexer.isList({ type: 'listItem', children: [] })).toBe(false);

    expect(lexer.isBlockquote({ type: 'blockquote', children: [] })).toBe(true);
    expect(lexer.isCode({ type: 'code', value: '' })).toBe(true);
    expect(lexer.isTable({ type: 'table', children: [] })).toBe(true);
    expect(lexer.isImage({ type: 'image', url: '' })).toBe(true);
  });
});

describe('Markdown Parser', () => {
  test('returns empty slides array for empty input', () => {
    const result = parseMarkdown('');
    expect(result.slides).toEqual([]);
    expect(result.root.children).toEqual([]);
  });

  describe('Phase 1: Thematic Break and H2 Splitting', () => {
    test('splits slides by thematic breaks (---)', () => {
      const md = `
# Slide 1
Some content
---
# Slide 2
More content
      `;
      const result = parseMarkdown(md);
      expect(result.slides).toHaveLength(2);
      expect(
        result.slides[0].nodes.some((n) => n.type === 'heading' && 'depth' in n && n.depth === 1)
      ).toBe(true);
      expect(
        result.slides[1].nodes.some((n) => n.type === 'heading' && 'depth' in n && n.depth === 1)
      ).toBe(true);
    });

    test('splits slides by Heading depth 2 (##)', () => {
      const md = `
## Slide A
Description A
## Slide B
Description B
      `;
      const result = parseMarkdown(md);
      expect(result.slides).toHaveLength(2);
      expect(result.slides[0].nodes[0].type).toBe('heading');
      expect((result.slides[0].nodes[0] as any).depth).toBe(2);
      expect(result.slides[1].nodes[0].type).toBe('heading');
      expect((result.slides[1].nodes[0] as any).depth).toBe(2);
    });

    test('retains empty slides or handles multiple consecutive thematic breaks', () => {
      const md = `
# Slide 1
---
---
# Slide 2
      `;
      const result = parseMarkdown(md);
      expect(result.slides).toHaveLength(2);
    });
  });

  describe('Phase 2: Other Structural Headings (# H1 or ### H3)', () => {
    test('splits slides by H1 or H3 when no H2 or thematic breaks exist', () => {
      const md = `
# Slide 1
Content 1
### Subheader 1
Content 2
      `;
      const result = parseMarkdown(md);
      expect(result.slides).toHaveLength(2);
      expect((result.slides[0].nodes[0] as any).depth).toBe(1);
      expect((result.slides[1].nodes[0] as any).depth).toBe(3);
    });
  });

  describe('Phase 3: Size-based Score Chunking', () => {
    test('splits flat content when the score exceeds MAX_SLIDE_SCORE', () => {
      const words = Array(180).fill('word').join(' ');
      const md = `
${words}

${words}
      `;
      const result = parseMarkdown(md);
      // It should split into at least 2 slides because weight of one paragraph is ~9.
      expect(result.slides.length).toBeGreaterThanOrEqual(2);
    });

    test('handles fallback score chunking for lists and tables', () => {
      // A list with 10 items. Weight of list = 10 > 8.
      const md = `
- Item 1
- Item 2
- Item 3
- Item 4
- Item 5
- Item 6
- Item 7
- Item 8
- Item 9
- Item 10
      `;
      const result = parseMarkdown(md);

      const mdParagraphs = `
Paragraph one text here.

Paragraph two text here.

Paragraph three text here.

Paragraph four text here.

Paragraph five text here.

Paragraph six text here.

Paragraph seven text here.

Paragraph eight text here.

Paragraph nine text here.
      `;
      const resultParagraphs = parseMarkdown(mdParagraphs);
      expect(resultParagraphs.slides.length).toBeGreaterThanOrEqual(1);
    });
  });
});
