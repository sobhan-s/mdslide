import { RootContent } from 'mdast';
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

export function parseBackgroundImage(nodes: RootContent[]): {
  backgroundImage: string | undefined;
  filteredNodes: RootContent[];
} {
  let backgroundImage: string | undefined;
  const filteredNodes: RootContent[] = [];

  for (const node of nodes) {
    if (node.type === 'html') {
      const val = node.value.trim();
      const bgMatch = val.match(/^<!--\s*background-?image:\s*(.+?)\s*-->$/i);
      if (bgMatch) {
        let bgUrl = bgMatch[1].trim();
        const urlWrapMatch = bgUrl.match(/^url\((['"]?)(.+?)\1\)$/i);
        if (urlWrapMatch) {
          bgUrl = urlWrapMatch[2];
        }
        backgroundImage = bgUrl;
        continue;
      }
    }
    filteredNodes.push(node);
  }
  return {
    backgroundImage,
    filteredNodes,
  };
}

export function parseTitlePositioning(nodes: RootContent[]): {
  titleAlign: string | undefined;
  titlePosition: string | undefined;
  filteredNodes: RootContent[];
} {
  let titleAlign: string | undefined;
  let titlePosition: string | undefined;
  const filteredNodes: RootContent[] = [];

  for (const node of nodes) {
    if (node.type === 'html') {
      const val = node.value.trim();
      const alignMatch = val.match(/^<!--\s*titleAlign:\s*(\w+)\s*-->$/i);
      if (alignMatch) {
        titleAlign = alignMatch[1].toLowerCase();
        continue;
      }
      const positionMatch = val.match(/^<!--\s*titlePosition:\s*(\w+)\s*-->$/i);
      if (positionMatch) {
        const pos = positionMatch[1].toLowerCase();
        if (pos === 'buttom') {
          titlePosition = 'bottom';
        } else if (pos === 'middle') {
          titlePosition = 'center';
        } else {
          titlePosition = pos;
        }
        continue;
      }
    }
    filteredNodes.push(node);
  }
  return {
    titleAlign,
    titlePosition,
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
