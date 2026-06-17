import { describe, test, expect } from 'vitest';
import {
  renderDeck,
  renderSlide,
  nodeToHtml,
  childrenToHtml,
  renderListItemText,
} from '../src/renderer/html/index.ts';
import { renderCodeBlock, renderInlineCode } from '../src/renderer/html/renderCode.ts';
import { renderTable, renderTableRow, renderTableCell } from '../src/renderer/html/renderTable.ts';
import { createSlide, createSlideNode } from '../src/ast/createSlideNode.ts';
import { sanitizeHtml } from '../src/utils/html.ts';

describe('HTML Sanitization', () => {
  test('escapes HTML special characters', () => {
    expect(sanitizeHtml('<div>Hello & Welcome</div>')).toBe(
      '&lt;div&gt;Hello &amp; Welcome&lt;/div&gt;'
    );
  });
});

describe('Node and Children Renderer', () => {
  test('nodeToHtml renders text nodes', () => {
    const node = createSlideNode({ type: 'text', value: 'Hello & Welcome' });
    expect(nodeToHtml(node)).toBe('Hello &amp; Welcome');
  });

  test('nodeToHtml renders formatting nodes (strong, emphasis, break)', () => {
    const strong = createSlideNode({
      type: 'strong',
      children: [createSlideNode({ type: 'text', value: 'bold' })],
    });
    expect(nodeToHtml(strong)).toBe('<strong>bold</strong>');

    const em = createSlideNode({
      type: 'emphasis',
      children: [createSlideNode({ type: 'text', value: 'italic' })],
    });
    expect(nodeToHtml(em)).toBe('<em>italic</em>');

    const br = createSlideNode({ type: 'break' });
    expect(nodeToHtml(br)).toBe('<br />');
  });

  test('nodeToHtml renders blockquotes, images, links', () => {
    const bq = createSlideNode({
      type: 'blockquote',
      children: [createSlideNode({ type: 'text', value: 'quote' })],
    });
    expect(nodeToHtml(bq)).toBe('<blockquote>quote</blockquote>');

    const img = createSlideNode({ type: 'image', url: 'foo.png', alt: 'bar' });
    expect(nodeToHtml(img)).toBe('<img src="foo.png" alt="bar" loading="lazy" />');

    const link = createSlideNode({
      type: 'link',
      url: 'https://foo.com',
      children: [createSlideNode({ type: 'text', value: 'link text' })],
    });
    expect(nodeToHtml(link)).toBe('<a href="https://foo.com">link text</a>');
  });

  test('nodeToHtml renders lists', () => {
    const ul = createSlideNode({
      type: 'list',
      ordered: false,
      children: [
        createSlideNode({
          type: 'listItem',
          children: [createSlideNode({ type: 'text', value: 'item' })],
        }),
      ],
    });
    expect(nodeToHtml(ul)).toBe('<ul><li>item</li></ul>');

    const ol = createSlideNode({
      type: 'list',
      ordered: true,
      children: [
        createSlideNode({
          type: 'listItem',
          children: [createSlideNode({ type: 'text', value: 'item' })],
        }),
      ],
    });
    expect(nodeToHtml(ol)).toBe('<ol><li>item</li></ol>');
  });

  test('renderCodeBlock generates styled blocks', () => {
    const tsNode = createSlideNode({ type: 'code', lang: 'typescript', value: 'const a = 1;' });
    expect(renderCodeBlock(tsNode)).toBe(
      '<pre class="lineNumbers language-typescript"><code class="language-typescript">const a = 1;</code></pre>'
    );

    const rawNode = createSlideNode({ type: 'code', value: 'raw code' });
    expect(renderCodeBlock(rawNode)).toBe('<pre><code>raw code</code></pre>');

    const inlineNode = createSlideNode({ type: 'inlineCode', value: 'inline' });
    expect(renderInlineCode(inlineNode)).toBe('<code>inline</code>');
  });

  test('renderTable renders table components', () => {
    const thNode = createSlideNode({
      type: 'tableCell',
      header: true,
      children: [createSlideNode({ type: 'text', value: 'head' })],
    });
    expect(renderTableCell(thNode, childrenToHtml)).toBe('<th>head</th>');

    const tdNode = createSlideNode({
      type: 'tableCell',
      header: false,
      children: [createSlideNode({ type: 'text', value: 'data' })],
    });
    expect(renderTableCell(tdNode, childrenToHtml)).toBe('<td>data</td>');

    const trNode = createSlideNode({ type: 'tableRow', children: [tdNode] });
    expect(renderTableRow(trNode, childrenToHtml)).toBe('<tr><td>data</td></tr>');

    const tableNode = createSlideNode({ type: 'table', children: [trNode] });
    expect(renderTable(tableNode, childrenToHtml)).toBe('<table><tr><td>data</td></tr></table>');
  });
});

describe('Slide and Deck Renderer', () => {
  test('renderSlide generates section with properties', () => {
    const slide = createSlide({
      id: 'slide-abc',
      type: 'content',
      title: 'Slide Title',
      content: [
        createSlideNode({
          type: 'paragraph',
          children: [createSlideNode({ type: 'text', value: 'Body content' })],
        }),
      ],
      notes: 'Speaker Note',
    });

    const html = renderSlide(slide);
    expect(html).toContain('<section class="slide" data-type="content" data-id="slide-abc">');
    expect(html).toContain('<h2 class="slideTitle">Slide Title</h2>');
    expect(html).toContain('<div class="slideContent">');
    expect(html).toContain('<p>Body content</p>');
    expect(html).toContain('<aside class="notes" hidden>Speaker Note</aside>');
  });

  test('renderSlide supports split layouts manually', () => {
    const slide = createSlide({
      id: 'slide-split',
      type: 'split',
      content: [
        createSlideNode({
          type: 'column',
          children: [createSlideNode({ type: 'text', value: 'Left Column' })],
        }),
        createSlideNode({
          type: 'column',
          children: [createSlideNode({ type: 'text', value: 'Right Column' })],
        }),
      ],
    });

    const html = renderSlide(slide);
    expect(html).toContain('<div class="splitLayout">');
    expect(html).toContain('<div class="splitColumn textColumn">');
    expect(html).toContain('<div class="splitColumn rightColumn">');
  });

  test('renderSlide supports auto-detected split layouts with image', () => {
    const slide = createSlide({
      id: 'slide-auto-split',
      type: 'split',
      content: [
        createSlideNode({
          type: 'paragraph',
          children: [createSlideNode({ type: 'text', value: 'Text explanation' })],
        }),
        createSlideNode({ type: 'image', url: 'logo.png', alt: 'Logo' }),
      ],
    });

    const html = renderSlide(slide);
    expect(html).toContain('<div class="splitLayout">');
    expect(html).toContain('<div class="splitColumn textColumn">');
    expect(html).toContain('<div class="splitColumn imageColumn">');
    expect(html).toContain('<img src="logo.png" alt="Logo" loading="lazy" />');
  });

  test('renderDeck generates complete template with scripts', () => {
    const deck = {
      meta: { title: 'My Deck', theme: 'dark' },
      slides: [
        createSlide({
          id: 'slide-1',
          content: [createSlideNode({ type: 'text', value: 'Hello' })],
        }),
      ],
    };

    const html = renderDeck(deck);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html lang="en" data-theme="dark">');
    expect(html).toContain('<title>My Deck</title>');
    expect(html).toContain('<style id="mdslideBase">');
    expect(html).toContain('<style id="mdslideTheme">');
    expect(html).toContain('class="deck"');
    expect(html).toContain('class="progressBarContainer"');
    expect(html).toContain('class="dokContainer"');
  });

  test('renderListItemText handles different node types', () => {
    // image node -> ''
    expect(renderListItemText(createSlideNode({ type: 'image', url: 'foo.png' }))).toBe('');

    // text node -> escaped value
    expect(renderListItemText(createSlideNode({ type: 'text', value: 'hello <world>' }))).toBe(
      'hello &lt;world&gt;'
    );

    // children nodes -> join
    const parent = createSlideNode({
      type: 'listItem',
      children: [
        createSlideNode({ type: 'text', value: 'hello' }),
        createSlideNode({ type: 'text', value: ' ' }),
        createSlideNode({ type: 'text', value: 'world' }),
      ],
    });
    expect(renderListItemText(parent)).toBe('hello world');

    // other node without value/children -> ''
    expect(renderListItemText(createSlideNode({ type: 'unknown' }))).toBe('');
  });

  test('nodeToHtml handles paragraph of only images', () => {
    const node = createSlideNode({
      type: 'paragraph',
      children: [
        createSlideNode({ type: 'image', url: 'img.png' }),
        createSlideNode({ type: 'text', value: '   ' }), // whitespace text node
      ],
    });
    expect(nodeToHtml(node)).toBe('<img src="img.png" alt="" loading="lazy" />');
  });

  test('nodeToHtml handles list carrying a nested image', () => {
    const listNode = createSlideNode({
      type: 'list',
      ordered: false,
      children: [
        // list item without image
        createSlideNode({
          type: 'listItem',
          children: [createSlideNode({ type: 'text', value: 'No image here' })],
        }),
        // list item with nested image
        createSlideNode({
          type: 'listItem',
          children: [
            createSlideNode({ type: 'text', value: 'With image' }),
            createSlideNode({ type: 'image', url: 'nested.png' }),
          ],
        }),
      ],
    });

    const html = nodeToHtml(listNode);
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>No image here</li>');
    expect(html).toContain('<li>With image</li>');
    expect(html).toContain('<div class="inlineImageGrid">');
    expect(html).toContain('<img src="nested.png"');
  });

  test('nodeToHtml handles table, html and unknown nodes', () => {
    // table
    const tableNode = createSlideNode({
      type: 'table',
      children: [
        createSlideNode({
          type: 'tableRow',
          children: [
            createSlideNode({
              type: 'tableCell',
              header: true,
              children: [createSlideNode({ type: 'text', value: 'H1' })],
            }),
          ],
        }),
      ],
    });
    expect(nodeToHtml(tableNode)).toBe('<table><tr><th>H1</th></tr></table>');

    // html
    const htmlNode = createSlideNode({ type: 'html', value: '<!-- comment -->' });
    expect(nodeToHtml(htmlNode)).toBe('');

    // unknown node default case
    const unknownWithValue = createSlideNode({ type: 'custom-type' as any, value: '<script>' });
    expect(nodeToHtml(unknownWithValue)).toBe('&lt;script&gt;');

    const unknownWithChildren = createSlideNode({
      type: 'custom-type' as any,
      children: [createSlideNode({ type: 'text', value: 'child text' })],
    });
    expect(nodeToHtml(unknownWithChildren)).toBe('child text');

    const unknownEmpty = createSlideNode({ type: 'custom-type' as any });
    expect(nodeToHtml(unknownEmpty)).toBe('');
  });

  test('renderSlide handles split layout with 0 or 2+ images fallback', () => {
    // 2 images in split layout (auto-split fallback to normal render)
    const slide = createSlide({
      id: 'slide-fallback',
      type: 'split',
      content: [
        createSlideNode({ type: 'image', url: 'img1.png' }),
        createSlideNode({ type: 'image', url: 'img2.png' }),
      ],
    });
    const html = renderSlide(slide);
    expect(html).not.toContain('<div class="splitLayout">');
    expect(html).toContain('img1.png');
    expect(html).toContain('img2.png');
  });

  test('nodeToHtml renders math and inlineMath nodes using KaTeX', () => {
    const inlineMath = createSlideNode({ type: 'inlineMath' as any, value: 'c^2 = a^2 + b^2' });
    const htmlInline = nodeToHtml(inlineMath);
    expect(htmlInline).toContain('class="math math-inline"');
    expect(htmlInline).toContain('katex');

    const blockMath = createSlideNode({ type: 'math' as any, value: '\\sum_{i=1}^n i' });
    const htmlBlock = nodeToHtml(blockMath);
    expect(htmlBlock).toContain('class="math math-display"');
    expect(htmlBlock).toContain('katex-display');
  });

  test('nodeToHtml renders mermaid code block as div with class mermaid', () => {
    const node = createSlideNode({ type: 'code', lang: 'mermaid', value: 'graph TD\nA --> B' });
    const html = nodeToHtml(node);
    expect(html).toBe('<div class="mermaid">graph TD\nA --&gt; B</div>');
  });
});
