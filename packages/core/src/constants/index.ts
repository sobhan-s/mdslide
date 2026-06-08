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

export const SLIDE_CREATION_CONSTRAION = {
  MAX_SLIDE_HEIGHT: 800,
  BASE_SLIDE_PADDING: 150,
};

export const MAX_CONTENT_HEIGHT =
  SLIDE_CREATION_CONSTRAION.MAX_SLIDE_HEIGHT - SLIDE_CREATION_CONSTRAION.BASE_SLIDE_PADDING;

export const SUPPORTED_LANGS = [
  'javascript',
  'js',
  'typescript',
  'ts',
  'html',
  'css',
  'json',
  'rust',
  'go',
  'python',
  'bash',
  'sh',
  'c',
  'cpp',
  'java',
  'sql',
  'yaml',
  'yml',
];
