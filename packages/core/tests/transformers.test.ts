import { describe, test, expect } from 'vitest';
import { findSplitIndex, runTransforms } from '../src/transformers/index.ts';
import { createSlide, createSlideNode } from '../src/ast/createSlideNode.ts';

describe('AST Transformers', () => {
  describe('findSplitIndex', () => {
    test('returns correct index when ::split:: paragraph is present', () => {
      const nodes = [
        createSlideNode({
          type: 'paragraph',
          children: [createSlideNode({ type: 'text', value: 'Left content' })],
        }),
        createSlideNode({
          type: 'paragraph',
          children: [createSlideNode({ type: 'text', value: '::split::' })],
        }),
        createSlideNode({
          type: 'paragraph',
          children: [createSlideNode({ type: 'text', value: 'Right content' })],
        }),
      ];
      expect(findSplitIndex(nodes)).toBe(1);
    });

    test('returns -1 if ::split:: is not present', () => {
      const nodes = [
        createSlideNode({
          type: 'paragraph',
          children: [createSlideNode({ type: 'text', value: 'No split tag here' })],
        }),
      ];
      expect(findSplitIndex(nodes)).toBe(-1);
    });
  });

  describe('runTransforms', () => {
    test('skips slides of type title or statement', () => {
      const slide = createSlide({
        type: 'title',
        content: [
          createSlideNode({
            type: 'paragraph',
            children: [createSlideNode({ type: 'text', value: '::split::' })],
          }),
        ],
      });
      const [transformed] = runTransforms([slide]);
      expect(transformed.type).toBe('title');
      // Should not split
      expect(transformed.content).toHaveLength(1);
    });

    test('performs manual split when ::split:: is present', () => {
      const slide = createSlide({
        type: 'content',
        content: [
          createSlideNode({
            type: 'paragraph',
            children: [createSlideNode({ type: 'text', value: 'Left' })],
          }),
          createSlideNode({
            type: 'paragraph',
            children: [createSlideNode({ type: 'text', value: '::split::' })],
          }),
          createSlideNode({
            type: 'paragraph',
            children: [createSlideNode({ type: 'text', value: 'Right' })],
          }),
        ],
      });

      const [transformed] = runTransforms([slide]);
      expect(transformed.type).toBe('split');
      expect(transformed.content).toHaveLength(2);
      expect(transformed.content[0].type).toBe('column');
      expect(transformed.content[0].children?.[0].children?.[0].value).toBe('Left');
      expect(transformed.content[1].type).toBe('column');
      expect(transformed.content[1].children?.[0].children?.[0].value).toBe('Right');
    });

    test('auto-splits when slide has exactly 1 image and meaningful text', () => {
      const slide = createSlide({
        type: 'content',
        content: [
          createSlideNode({
            type: 'paragraph',
            children: [createSlideNode({ type: 'text', value: 'Meaningful text explanation' })],
          }),
          createSlideNode({ type: 'image', url: 'img.png' }),
        ],
      });

      const [transformed] = runTransforms([slide]);
      expect(transformed.type).toBe('split');
    });

    test('changes type to visual when slide has 1 image but no meaningful text', () => {
      const slide = createSlide({
        type: 'content',
        content: [createSlideNode({ type: 'image', url: 'img.png' })],
      });

      const [transformed] = runTransforms([slide]);
      expect(transformed.type).toBe('visual');
    });
  });
});
