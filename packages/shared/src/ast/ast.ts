import { Slide } from '../types/types.js';

export function createSlide(partial: Partial<Slide>): Slide {
  return {
    id: globalThis.crypto.randomUUID(),
    type: 'content',
    content: [],
    ...partial,
  };
}
