import type { Slide, SlideNode } from '@mindfiredigital/mdslide-shared';
import { countImages } from '../utils/index.js';

// FInd the split index and if is it present and then give the postion and if not then return the -1
export function findSplitIndex(nodes: SlideNode[]): number {
  return nodes.findIndex((node) => {
    if (node.type === 'paragraph' && node.children && node.children.length === 1) {
      const child = node.children[0];
      return child.type === 'text' && child.value?.trim() === '::split::';
    }
    return false;
  });
}

function hasMeaningfulText(nodes: SlideNode[]): boolean {
  for (const node of nodes) {
    if (node.type === 'image') {
      continue;
    }
    if (node.type === 'text' && node.value && node.value.trim().length > 0) {
      return true;
    }
    if (node.children && hasMeaningfulText(node.children)) {
      return true;
    }
  }
  return false;
}

// Slidebased AST transforms engine - allows modifying slides , merge node , auto layout detections
export function runTransforms(slides: Slide[]): Slide[] {
  return slides.map((slide) => {
    if (slide.type === 'title' || slide.type === 'statement') {
      return slide;
    }

    // Check for manual split separator first (takes precedence!)
    const splitIndex = findSplitIndex(slide.content);
    if (splitIndex !== -1) {
      const leftNodes = slide.content.slice(0, splitIndex);
      const rightNodes = slide.content.slice(splitIndex + 1);
      return {
        ...slide,
        type: 'split',
        content: [
          { type: 'column', children: leftNodes },
          { type: 'column', children: rightNodes },
        ],
      };
    }

    // Fallback to auto-split detection (exactly 1 image alongside meaningful text)
    const imageCount = countImages(slide.content);

    if (imageCount === 1 && hasMeaningfulText(slide.content)) {
      return {
        ...slide,
        type: 'split',
      };
    }

    // If it has only one image and no meaningful text, change type to visual
    if (imageCount === 1 && !hasMeaningfulText(slide.content)) {
      return {
        ...slide,
        type: 'visual',
      };
    }

    return slide;
  });
}
