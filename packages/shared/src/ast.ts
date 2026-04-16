import { Slide } from './types.js';

export function createSlide(partial: Partial<Slide>): Slide {
  return {
    id: crypto.randomUUID(),
    type: 'content',
    content: [],
    ...partial,
  };
}
