import { RootContent } from 'mdast';
import { extractTextFromNode } from '../ast/extractTextFromNode.js';
import { VALID_SLIDE_TYPES } from '../constants/index.js';
import { SlideNode, SlideType } from '@mindfiredigital/mdslide-shared';

// Detects manual layout override comments e.g., <!-- layout: dark --> and clear out
export function parseLayoutOveride(nodes: RootContent[]): {
  layoutOverride: string | undefined;
  filteredNodes: RootContent[];
} {
  let layoutOverride: string | undefined;
  const filteredNodes: RootContent[] = [];

  for (const node of nodes) {
    if (node.type == 'html') {
      const val = node.value.trim();
      const layoutMatch = val.match(/^<!--\s*layout:\s*(\w+)\s*-->$/);
      if (layoutMatch) {
        layoutOverride = layoutMatch[1];
        continue;
      }
    }
    filteredNodes.push(node);
  }
  return {
    layoutOverride,
    filteredNodes,
  };
}

export function resolveSlideLayout(
  nodes: SlideNode[],
  hasTitle: boolean,
  layoutOverride?: string
): SlideType {
  if (layoutOverride) {
    if (VALID_SLIDE_TYPES.has(layoutOverride as SlideType)) {
      return layoutOverride as SlideType;
    }
    console.warn(
      `[mdslide compiler] Warning: Invalid layout override "${layoutOverride}". Falling back to auto-detection.`
    );
  }

  // Title Slide layout: Main Slide Title checker
  if (hasTitle && nodes.length === 0) {
    return 'title';
  }

  // Bullets layout: Has list nodes
  const hasList = nodes.some((item) => item.type === 'list');
  if (hasList) {
    return 'bullets';
  }

  // Code layout: Contains only code blocks or single pre-formatted element
  const hasCode = nodes.some((item) => item.type === 'code');
  if (hasCode && nodes.length === 1) {
    return 'code';
  }

  // Quote layout: Contains blockquotes
  const hasQuote = nodes.some((item) => item.type === 'blockquote');
  if (hasQuote && nodes.length === 1) {
    return 'quote';
  }

  // Visual layout: Contains images
  const hasImage = nodes.some(
    (item) =>
      item.type === 'image' ||
      (item.children && item.children.some((c: SlideNode) => c.type === 'image'))
  );
  if (hasImage && nodes.length <= 2) {
    return 'visual';
  }

  // Table layout
  const hasTable = nodes.some((item) => item.type === 'table');
  if (hasTable) {
    return 'table';
  }

  return 'content';
}
