import { describe, test, expect } from 'vitest';
import parser, { parseMarkdownToAST } from '../src/index.ts';

describe('Markdown to AST Parser', () => {
  test('default export callable parse works identically to named export', () => {
    const ast = parser('');
    expect(ast.type).toBe('root');
    expect(ast.children).toEqual([]);
  });

  test('parses empty string to empty Root AST', () => {
    const ast = parseMarkdownToAST('');
    expect(ast.type).toBe('root');
    expect(ast.children).toEqual([]);
  });

  test('parses markdown with headings, paragraphs, and list items', () => {
    const md = `
# Title
This is a paragraph.

- Item 1
- Item 2
    `;
    const ast = parseMarkdownToAST(md);
    expect(ast.type).toBe('root');
    expect(ast.children.length).toBeGreaterThanOrEqual(3);

    const [h1, p, list] = ast.children;
    expect(h1.type).toBe('heading');
    expect((h1 as any).depth).toBe(1);
    expect(h1.position).toBeDefined();

    expect(p.type).toBe('paragraph');

    expect(list.type).toBe('list');
    expect((list as any).children).toHaveLength(2);
  });

  test('parses markdown GFM features (like tables)', () => {
    const md = `
| Header 1 | Header 2 |
| --- | --- |
| Cell 1 | Cell 2 |
    `;
    const ast = parseMarkdownToAST(md);
    const table = ast.children.find((node) => node.type === 'table');
    expect(table).toBeDefined();
    expect((table as any).children).toHaveLength(2); // header row + body row
  });

  test('parses markdown math features (like inline and block math)', () => {
    const md = `
Inline math: $E = mc^2$

Block math:
$$
a^2 + b^2 = c^2
$$
    `;
    const ast = parseMarkdownToAST(md);

    let inlineMathNode: any = null;
    let mathNode: any = null;

    function walk(node: any) {
      if (node.type === 'inlineMath') inlineMathNode = node;
      if (node.type === 'math') mathNode = node;
      if (node.children) node.children.forEach(walk);
    }
    ast.children.forEach(walk);

    expect(inlineMathNode).not.toBeNull();
    expect(inlineMathNode.value).toBe('E = mc^2');
    expect(mathNode).not.toBeNull();
    expect(mathNode.value.trim()).toBe('a^2 + b^2 = c^2');
  });

  describe('Clean AST Options and Chaining', () => {
    const md = '# Hello World\nParagraph content.';

    test('supports clean option via parameter: parser(md, { clean: true })', () => {
      const ast = parser(md, { clean: true });
      expect(ast.position).toBeUndefined();
      expect(ast.children[0].position).toBeUndefined();
    });

    test('supports clean option via named function: parseMarkdownToAST(md, { clean: true })', () => {
      const ast = parseMarkdownToAST(md, { clean: true });
      expect(ast.position).toBeUndefined();
      expect(ast.children[0].position).toBeUndefined();
    });

    test('supports namespace helper: parser.clean(md)', () => {
      const ast = parser.clean(md);
      expect(ast.position).toBeUndefined();
      expect(ast.children[0].position).toBeUndefined();
    });

    test('supports namespace strip helper: parser.strip(ast)', () => {
      const ast = parser(md);
      expect(ast.position).toBeDefined();
      const stripped = parser.strip(ast);
      expect(stripped.position).toBeUndefined();
    });

    test('supports builder syntax: parser().parse(md) and parser().clean(md)', () => {
      const instance = parser();
      const ast1 = instance.parse(md);
      expect(ast1.position).toBeDefined();

      const ast2 = instance.clean(md);
      expect(ast2.position).toBeUndefined();

      const ast3 = instance.strip(ast1);
      expect(ast3.position).toBeUndefined();
    });
  });
});
