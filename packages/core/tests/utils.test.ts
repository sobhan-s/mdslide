import { describe, test, expect } from 'vitest';
import { countImages } from '../src/utils/countImages.ts';
import { extractTextLength } from '../src/utils/extractTextLength.ts';
import { getNodeWeight } from '../src/utils/getNodeWeight.ts';
import { sanitizeHtml, sanitizeUrl } from '../src/utils/html.ts';
import { createSlideNode } from '../src/ast/createSlideNode.ts';
import type { RootContent } from 'mdast';

describe('Utility - countImages', () => {
  test('returns 0 if no images are present', () => {
    const nodes = [createSlideNode({ type: 'paragraph', value: 'hello' })];
    expect(countImages(nodes)).toBe(0);
  });

  test('counts simple image nodes', () => {
    const nodes = [
      createSlideNode({ type: 'image', url: 'img1.png' }),
      createSlideNode({ type: 'paragraph', value: 'text' }),
      createSlideNode({ type: 'image', url: 'img2.png' }),
    ];
    expect(countImages(nodes)).toBe(2);
  });

  test('counts nested image nodes recursively', () => {
    const nodes = [
      createSlideNode({
        type: 'list',
        children: [
          createSlideNode({
            type: 'listItem',
            children: [createSlideNode({ type: 'image', url: 'nested.png' })],
          }),
        ],
      }),
    ];
    expect(countImages(nodes)).toBe(1);
  });
});

describe('Utility - extractTextLength', () => {
  test('returns length of node value', () => {
    const node = createSlideNode({ type: 'text', value: 'hello' });
    expect(extractTextLength(node)).toBe(5);
  });

  test('returns combined length of children values recursively', () => {
    const node = createSlideNode({
      type: 'paragraph',
      children: [
        createSlideNode({ type: 'text', value: 'ab' }),
        createSlideNode({
          type: 'emphasis',
          children: [createSlideNode({ type: 'text', value: 'cde' })],
        }),
      ],
    });
    expect(extractTextLength(node)).toBe(5);
  });
});

describe('Utility - getNodeWeight', () => {
  test('assigns weight of 2 to headings', () => {
    const heading: RootContent = { type: 'heading', depth: 1, children: [] };
    expect(getNodeWeight(heading)).toBe(2);
  });

  test('assigns weight to paragraphs based on word count', () => {
    // 0 to 20 words = weight 1
    const p1: RootContent = {
      type: 'paragraph',
      children: [{ type: 'text', value: 'short text' }] as any,
    };
    expect(getNodeWeight(p1)).toBe(1);

    // 21 to 40 words = weight 2
    const longText = Array(30).fill('word').join(' ');
    const p2: RootContent = {
      type: 'paragraph',
      children: [{ type: 'text', value: longText }] as any,
    };
    expect(getNodeWeight(p2)).toBe(2);
  });

  test('assigns weight to list matching children count', () => {
    const list: RootContent = {
      type: 'list',
      children: [
        { type: 'listItem', children: [] },
        { type: 'listItem', children: [] },
        { type: 'listItem', children: [] },
      ] as any,
    };
    expect(getNodeWeight(list)).toBe(3);
  });

  test('assigns weight of 4 to table', () => {
    const table: RootContent = { type: 'table', children: [] };
    expect(getNodeWeight(table)).toBe(4);
  });

  test('assigns weight to code based on lines count', () => {
    const code1: RootContent = { type: 'code', value: 'line1\nline2' }; // 2 lines -> 1 weight
    expect(getNodeWeight(code1)).toBe(1);

    const code2: RootContent = { type: 'code', value: Array(12).fill('line').join('\n') }; // 12 lines -> 12/5 = 2.4 -> weight 3
    expect(getNodeWeight(code2)).toBe(3);
  });

  test('assigns default weight of 1 to other nodes', () => {
    const other: RootContent = { type: 'thematicBreak' };
    expect(getNodeWeight(other)).toBe(1);
  });
});

describe('Utility - sanitizeHtml', () => {
  test('sanitizes dangerous HTML characters', () => {
    expect(sanitizeHtml('&')).toBe('&amp;');
    expect(sanitizeHtml('<')).toBe('&lt;');
    expect(sanitizeHtml('>')).toBe('&gt;');
    expect(sanitizeHtml('"')).toBe('&quot;');
    expect(sanitizeHtml('a & b < c > d "e"')).toBe('a &amp; b &lt; c &gt; d &quot;e&quot;');
  });
});

describe('Utility - sanitizeUrl', () => {
  test('allows safe HTTP and HTTPS protocols', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    expect(sanitizeUrl('http://example.com/path?query=val')).toBe(
      'http://example.com/path?query=val'
    );
  });

  test('allows mailto: and tel: protocols', () => {
    expect(sanitizeUrl('mailto:user@example.com')).toBe('mailto:user@example.com');
    expect(sanitizeUrl('tel:+1234567890')).toBe('tel:+1234567890');
  });

  test('blocks javascript: URLs', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('about:blank');
    expect(sanitizeUrl('  javascript:alert("XSS")  ')).toBe('about:blank');
    expect(sanitizeUrl('JAVASCRIPT:alert(1)')).toBe('about:blank');
  });

  test('blocks vbscript: URLs', () => {
    expect(sanitizeUrl('vbscript:msgbox("hello")')).toBe('about:blank');
  });

  test('blocks data: URLs in non-image contexts', () => {
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('about:blank');
  });

  test('allows safe data:image URIs only when isImage is true', () => {
    const pngData = 'data:image/png;base64,iVBORw0KGgoAAAANS';
    expect(sanitizeUrl(pngData, true)).toBe(pngData);
    expect(sanitizeUrl(pngData, false)).toBe('about:blank');

    const svgData = 'data:image/svg+xml;base64,PHN2Zz...';
    expect(sanitizeUrl(svgData, true)).toBe(svgData);

    const txtData = 'data:text/plain;base64,aGVsbG8=';
    expect(sanitizeUrl(txtData, true)).toBe('about:blank');
  });

  test('allows relative paths and anchors', () => {
    expect(sanitizeUrl('./path/to/image.png')).toBe('./path/to/image.png');
    expect(sanitizeUrl('#slide-3')).toBe('#slide-3');
    expect(sanitizeUrl('//example.com')).toBe('//example.com');
  });
});
