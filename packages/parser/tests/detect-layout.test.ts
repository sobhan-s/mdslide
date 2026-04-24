import { describe, it, expect } from 'vitest';
import { detectLayout } from '../src/detect-layout.js';
import { Slide } from '@mindfiredigital/mdslide-shared';

describe('detectLayout', () => {
  it('should detect bullets layout', () => {
    const slide: Slide = {
      id: '1',
      type: 'content',
      content: [{ type: 'list' }],
    };
    const result = detectLayout(slide);
    expect(result.type).toBe('bullets');
  });

  it('detects title layout', () => {
    const slide: Slide = {
      id: '2',
      type: 'content',
      title: 'Title-only',
      content: [],
    };
    const result = detectLayout(slide);
    expect(result.type).toBe('title');
  });

  it('should return the slide if there is no layout', () => {
    const slide: Slide = {
      id: '3',
      type: 'content',
      content: [{ type: 'text' }],
    };
    const result = detectLayout(slide);
    expect(result.type).toBe('content');
  });

  it('should follow layoutOverride even when content would auto-detect differently', () => {
    const slide: Slide = {
      id: '4',
      type: 'content',
      title: 'My Slide',
      content: [{ type: 'list' }],
      layoutOverride: 'content',
    };
    const result = detectLayout(slide);
    expect(result.type).toBe('content');
  });

  it('should set type from layoutOverride on a title-only slide', () => {
    const slide: Slide = {
      id: '5',
      type: 'content',
      title: 'Override Me',
      content: [],
      layoutOverride: 'bullets',
    };
    const result = detectLayout(slide);
    expect(result.type).toBe('bullets');
  });
});
