import { describe, test, expect } from 'vitest';
import { normalizeHeading } from '../src/normalizer/normalizeHeading.ts';
import {
  parseLayoutOveride,
  resolveSlideLayout,
  parseBackgroundImage,
  parseTitlePositioning,
  parseOverflowConfig,
  parseAnimationConfig,
  normalizeAnimation,
  parseFontSizeConfig,
  normalizeFontSize,
} from '../src/normalizer/normalizeLayout.ts';
import { extractSlideNotes } from '../src/normalizer/normalizeNote.ts';
import {
  toSlideAstNode,
  normalizeSlide,
  normalizeSlides,
} from '../src/normalizer/mdAstToSlideBasedAst.ts';
import type { Heading, RootContent } from 'mdast';
import type { RawSlideBlock } from '../src/interfaces/index.ts';

describe('Normalize Heading', () => {
  test('correctly normalizes a heading node', () => {
    const headingNode: Heading = {
      type: 'heading',
      depth: 2,
      children: [{ type: 'text', value: 'Heading Text ' }],
    };
    const result = normalizeHeading(headingNode);
    expect(result.depth).toBe(2);
    expect(result.text).toBe('Heading Text');
  });
});

describe('Normalize Layout', () => {
  test('parseLayoutOveride extracts layout comment and filters nodes', () => {
    const nodes: RootContent[] = [
      { type: 'html', value: '<!-- layout: dark -->' },
      { type: 'paragraph', children: [{ type: 'text', value: 'Hello' }] },
    ];
    const { layoutOverride, filteredNodes } = parseLayoutOveride(nodes);
    expect(layoutOverride).toBe('dark');
    expect(filteredNodes).toHaveLength(1);
    expect(filteredNodes[0].type).toBe('paragraph');
  });

  test('parseLayoutOveride ignores invalid comments', () => {
    const nodes: RootContent[] = [
      { type: 'html', value: '<!-- layout: invalid layout -->' }, // invalid layout name with space
      { type: 'html', value: '<!-- not layout -->' },
    ];
    const { layoutOverride, filteredNodes } = parseLayoutOveride(nodes);
    expect(layoutOverride).toBeUndefined();
    expect(filteredNodes).toHaveLength(2);
  });

  test('parseBackgroundImage extracts background image comments and cleans wrapper', () => {
    const nodes: RootContent[] = [
      { type: 'html', value: '<!-- backgroundImage: https://example.com/bg.png -->' },
      { type: 'paragraph', children: [{ type: 'text', value: 'Hello' }] },
    ];
    const { backgroundImage, filteredNodes } = parseBackgroundImage(nodes);
    expect(backgroundImage).toBe('https://example.com/bg.png');
    expect(filteredNodes).toHaveLength(1);

    const nodesWithUrlWrapper: RootContent[] = [
      { type: 'html', value: '<!-- background-image: url("https://example.com/bg2.png") -->' },
    ];
    const { backgroundImage: bg2 } = parseBackgroundImage(nodesWithUrlWrapper);
    expect(bg2).toBe('https://example.com/bg2.png');
  });

  test('parseTitlePositioning extracts title alignment and vertical positioning comments', () => {
    const nodes: RootContent[] = [
      { type: 'html', value: '<!-- titleAlign: center -->' },
      { type: 'html', value: '<!-- titlePosition: bottom -->' },
      { type: 'paragraph', children: [{ type: 'text', value: 'Hello' }] },
    ];
    const { titleAlign, titlePosition, filteredNodes } = parseTitlePositioning(nodes);
    expect(titleAlign).toBe('center');
    expect(titlePosition).toBe('bottom');
    expect(filteredNodes).toHaveLength(1);
  });

  test('parseOverflowConfig extracts overflow comments and filters nodes', () => {
    const nodes: RootContent[] = [
      { type: 'html', value: '<!-- overflow: split -->' },
      { type: 'paragraph', children: [{ type: 'text', value: 'Hello' }] },
    ];
    const { overflow, filteredNodes } = parseOverflowConfig(nodes);
    expect(overflow).toBe('split');
    expect(filteredNodes).toHaveLength(1);
    expect(filteredNodes[0].type).toBe('paragraph');
  });

  test('parseAnimationConfig extracts animation comments and filters nodes', () => {
    const nodes1: RootContent[] = [
      { type: 'html', value: '<!-- animation: fade -->' },
      { type: 'paragraph', children: [{ type: 'text', value: 'Hello' }] },
    ];
    const { animation: anim1, filteredNodes: filtered1 } = parseAnimationConfig(nodes1);
    expect(anim1).toBe('fade');
    expect(filtered1).toHaveLength(1);

    const nodes2: RootContent[] = [
      { type: 'html', value: '<!-- build: fade -->' },
      { type: 'paragraph', children: [{ type: 'text', value: 'Hello' }] },
    ];
    const { animation: anim2, filteredNodes: filtered2 } = parseAnimationConfig(nodes2);
    expect(anim2).toBe('fade');
    expect(filtered2).toHaveLength(1);

    const nodes3: RootContent[] = [
      { type: 'html', value: '<!-- animation: slide-up -->' },
      { type: 'paragraph', children: [{ type: 'text', value: 'Hello' }] },
    ];
    const { animation: anim3, filteredNodes: filtered3 } = parseAnimationConfig(nodes3);
    expect(anim3).toBe('slide-up');
    expect(filtered3).toHaveLength(1);
  });

  test('normalizeAnimation maps values to standard animation strings', () => {
    expect(normalizeAnimation('fade')).toBe('fade');
    expect(normalizeAnimation('true')).toBe('fade');
    expect(normalizeAnimation('FADE')).toBe('fade');
    expect(normalizeAnimation('slide-up')).toBe('slide-up');
    expect(normalizeAnimation('zoom')).toBe('zoom');
    expect(normalizeAnimation('slide-left')).toBe('slide-left');
    expect(normalizeAnimation('slide-right')).toBe('slide-right');
    expect(normalizeAnimation('invalid')).toBeUndefined();
    expect(normalizeAnimation(undefined)).toBeUndefined();
  });

  test('parseFontSizeConfig extracts font size comments and filters nodes', () => {
    const nodes: RootContent[] = [
      { type: 'html', value: '<!-- fontSize: sm -->' },
      { type: 'paragraph', children: [{ type: 'text', value: 'Hello' }] },
    ];
    const { fontSize, filteredNodes } = parseFontSizeConfig(nodes);
    expect(fontSize).toBe('sm');
    expect(filteredNodes).toHaveLength(1);
    expect(filteredNodes[0].type).toBe('paragraph');
  });

  test('normalizeFontSize maps values to standard size strings', () => {
    expect(normalizeFontSize('xs')).toBe('xs');
    expect(normalizeFontSize('extra-large')).toBe('xl');
    expect(normalizeFontSize('extra large')).toBe('xl');
    expect(normalizeFontSize('xxl')).toBe('xxl');
    expect(normalizeFontSize('medium')).toBe('md');
    expect(normalizeFontSize('normal')).toBe('md');
    expect(normalizeFontSize('invalid')).toBeUndefined();
  });

  test('resolveSlideLayout returns custom layout if layoutOverride is valid', () => {
    const layout = resolveSlideLayout([], false, 'bullets');
    expect(layout).toBe('bullets');
  });

  test('resolveSlideLayout falls back if layoutOverride is invalid', () => {
    const layout = resolveSlideLayout([], true, 'invalid-layout');
    expect(layout).toBe('title'); // hasTitle = true, nodes = empty -> title
  });

  test('resolveSlideLayout auto-detects layouts', () => {
    // 1. title
    expect(resolveSlideLayout([], true)).toBe('title');

    // 2. bullets
    expect(resolveSlideLayout([{ type: 'list', children: [] }], false)).toBe('bullets');

    // 3. code
    expect(resolveSlideLayout([{ type: 'code', value: 'const a = 1;' }], false)).toBe('code');

    // 4. quote
    expect(resolveSlideLayout([{ type: 'blockquote', children: [] }], false)).toBe('quote');

    // 5. visual
    expect(resolveSlideLayout([{ type: 'image', url: 'img.png' }], false)).toBe('visual');

    // 6. table
    expect(resolveSlideLayout([{ type: 'table', children: [] }], false)).toBe('table');

    // 7. content (fallback)
    expect(resolveSlideLayout([{ type: 'paragraph', children: [] }], false)).toBe('content');
  });
});

describe('Normalize Note', () => {
  test('extractSlideNotes extracts notes between comments', () => {
    const nodes: RootContent[] = [
      { type: 'html', value: '<!-- notes -->' },
      { type: 'paragraph', children: [{ type: 'text', value: 'Note text 1' }] },
      { type: 'paragraph', children: [{ type: 'text', value: 'Note text 2' }] },
      { type: 'html', value: '<!-- /notes -->' },
      { type: 'paragraph', children: [{ type: 'text', value: 'Slide content' }] },
    ];

    const { notes, remainingNodes } = extractSlideNotes(nodes);
    expect(notes).toBe('Note text 1\nNote text 2');
    expect(remainingNodes).toHaveLength(1);
    expect(remainingNodes[0].type).toBe('paragraph');
  });
});

describe('toSlideAstNode', () => {
  test('converts basic node', () => {
    const node: RootContent = {
      type: 'paragraph',
      children: [{ type: 'text', value: 'some text' }] as any,
    };
    const slideNode = toSlideAstNode(node);
    expect(slideNode.type).toBe('paragraph');
    expect(slideNode.children).toHaveLength(1);
    expect(slideNode.children?.[0].type).toBe('text');
    expect(slideNode.children?.[0].value).toBe('some text');
  });

  test('converts table with header rows', () => {
    const tableNode: RootContent = {
      type: 'table',
      children: [
        {
          type: 'tableRow',
          children: [{ type: 'tableCell', children: [{ type: 'text', value: 'Header' }] }] as any,
        },
        {
          type: 'tableRow',
          children: [{ type: 'tableCell', children: [{ type: 'text', value: 'Data' }] }] as any,
        },
      ] as any,
    };
    const slideNode = toSlideAstNode(tableNode);
    expect(slideNode.type).toBe('table');
    expect(slideNode.children?.[0].type).toBe('tableRow');
    expect(slideNode.children?.[0].children?.[0].header).toBe(true);
    expect(slideNode.children?.[1].children?.[0].header).toBeFalsy();
  });
});

describe('normalizeSlide', () => {
  test('normalizes complete raw slide block', () => {
    const rawBlock: RawSlideBlock = {
      id: 'slide-1',
      nodes: [
        { type: 'html', value: '<!-- layout: bullets -->' },
        { type: 'heading', depth: 1, children: [{ type: 'text', value: 'My Slide Title' }] },
        { type: 'paragraph', children: [{ type: 'text', value: 'Body content' }] } as any,
        { type: 'html', value: '<!-- notes -->' },
        { type: 'paragraph', children: [{ type: 'text', value: 'Speaker note' }] } as any,
        { type: 'html', value: '<!-- /notes -->' },
      ],
    };

    const slide = normalizeSlide(rawBlock);
    expect(slide.id).toBe('slide-1');
    expect(slide.type).toBe('bullets'); // layoutOverride matches valid type
    expect(slide.title).toBe('My Slide Title');
    expect(slide.content).toHaveLength(1);
    expect(slide.content[0].type).toBe('paragraph');
    expect(slide.notes).toBe('Speaker note');
  });

  test('normalizes slide block with background image comment', () => {
    const rawBlock: RawSlideBlock = {
      id: 'slide-bg',
      nodes: [
        { type: 'html', value: '<!-- backgroundImage: https://example.com/bg.png dark -->' },
        { type: 'heading', depth: 1, children: [{ type: 'text', value: 'Slide Title' }] },
      ],
    };
    const slide = normalizeSlide(rawBlock);
    expect(slide.backgroundImage).toBe('https://example.com/bg.png dark');
  });
});

describe('normalizeSlides', () => {
  test('filters out slides with no title and no content', () => {
    const rawBlocks: RawSlideBlock[] = [
      { id: '1', nodes: [] }, // empty slide
      {
        id: '2',
        nodes: [{ type: 'heading', depth: 2, children: [{ type: 'text', value: 'Title' }] }],
      },
    ];
    const slides = normalizeSlides(rawBlocks);
    expect(slides).toHaveLength(1);
    expect(slides[0].id).toBe('2');
  });
});
