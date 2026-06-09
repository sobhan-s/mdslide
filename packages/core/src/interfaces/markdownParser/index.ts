import { Root, RootContent } from 'mdast';

export interface RawSlideBlock {
  id: string;
  nodes: RootContent[];
}

export interface ParseMarkdownResult {
  root: Root;
  slides: RawSlideBlock[];
}
