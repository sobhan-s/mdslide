import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import type { Root } from 'mdast';
import type { SlideDeck } from '@mindfiredigital/mdslide-shared';
import { parseFrontmatter } from '@mindfiredigital/mdslide-shared';

import { splitSlides } from './split.js';
import { detectLayout } from './detect-layout.js';

export function parse(markdown: string): SlideDeck {
  const { meta, content } = parseFrontmatter(markdown);
  const tree = unified().use(remarkParse).use(remarkGfm).parse(content) as Root;
  const slides = splitSlides(tree).map(detectLayout);
  return { meta, slides };
}
