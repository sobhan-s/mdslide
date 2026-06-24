import { describe, test, expect } from 'vitest';
import { createSlideNode, createSlide } from '../src/ast/createSlideNode.ts';
import { extractTextFromNode } from '../src/ast/extractTextFromNode.ts';

describe('AST Utilities', () => {
  describe('createSlideNode', () => {
    test('creates a standard slide node with partial attributes', () => {
      const node = createSlideNode({
        type: 'paragraph',
        value: 'Hello World',
        children: [],
        url: 'https://example.com',
      });

      expect(node).toEqual({
        type: 'paragraph',
        value: 'Hello World',
        children: [],
        lang: undefined,
        ordered: undefined,
        url: 'https://example.com',
        alt: undefined,
        header: undefined,
      });
    });

    test('creates a node with minimal arguments', () => {
      const node = createSlideNode({ type: 'break' });
      expect(node.type).toBe('break');
      expect(node.value).toBeUndefined();
      expect(node.url).toBeUndefined();
    });
  });

  describe('createSlide', () => {
    test('creates a slide with default UUID and content type', () => {
      const slide = createSlide({});
      expect(slide.id).toBeDefined();
      expect(typeof slide.id).toBe('string');
      expect(slide.id.length).toBeGreaterThan(0);
      expect(slide.type).toBe('content');
      expect(slide.content).toEqual([]);
      expect(slide.title).toBeUndefined();
    });

    test('creates a slide with provided details', () => {
      const customId = 'slide-123';
      const slide = createSlide({
        id: customId,
        type: 'title',
        title: 'Introduction',
        content: [createSlideNode({ type: 'text', value: 'Slide body' })],
        notes: 'Speaker notes here',
        layoutOverride: 'bullets',
      });

      expect(slide.id).toBe(customId);
      expect(slide.type).toBe('title');
      expect(slide.title).toBe('Introduction');
      expect(slide.content).toHaveLength(1);
      expect(slide.content[0].value).toBe('Slide body');
      expect(slide.notes).toBe('Speaker notes here');
      expect(slide.layoutOverride).toBe('bullets');
    });
  });

  describe('extractTextFromNode', () => {
    test('extracts direct text value', () => {
      const node = { type: 'text', value: 'hello' };
      expect(extractTextFromNode(node)).toBe('hello');
    });

    test('extracts nested text values recursively', () => {
      const node = {
        type: 'paragraph',
        children: [
          { type: 'text', value: 'hello ' },
          {
            type: 'emphasis',
            children: [{ type: 'text', value: 'world' }],
          },
          { type: 'text', value: '!' },
        ],
      };
      expect(extractTextFromNode(node)).toBe('hello  world !');
    });

    test('returns empty string if no value or children', () => {
      const node = { type: 'image' };
      expect(extractTextFromNode(node)).toBe('');
    });
  });
});
