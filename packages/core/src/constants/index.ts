import { SlideType } from '@mindfiredigital/mdslide-shared';

export const MAX_SLIDE_SCORE = 8;

export const VALID_SLIDE_TYPES = new Set<SlideType>([
  'title',
  'bullets',
  'content',
  'code',
  'visual',
  'table',
  'quote',
  'statement',
]);
