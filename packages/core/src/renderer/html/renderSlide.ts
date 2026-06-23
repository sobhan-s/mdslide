import type { Slide, SlideNode } from '@mindfiredigital/mdslide-shared';
import katex from 'katex';
import { renderCodeBlock, renderInlineCode } from './renderCode.js';
import { renderTable, renderTableRow, renderTableCell } from './renderTable.js';
import { sanitizeHtml, sanitizeUrl } from '../../utils/index.js';

let globalFragmentCounter = 0;

function renderMath(formula: string, displayMode: boolean): string {
  try {
    return katex.renderToString(formula, {
      displayMode,
      throwOnError: false,
    });
  } catch (err) {
    return sanitizeHtml(formula);
  }
}

// Extract all image node from tree and return them separately
function extractImages(nodes: SlideNode[]): {
  clean: SlideNode[];
  images: SlideNode[];
} {
  const images: SlideNode[] = [];

  function stripImages(node: SlideNode): SlideNode | null {
    if (node.type === 'image') {
      images.push(node);
      return null;
    }
    // paragraph that contains only images
    if (
      node.type === 'paragraph' &&
      node.children &&
      node.children.every(
        (c) => c.type === 'image' || (c.type === 'text' && c.value?.trim() === '')
      )
    ) {
      node.children.forEach((c) => {
        if (c.type === 'image') images.push(c);
      });
      return null;
    }
    if (node.children && node.children.length > 0) {
      const cleanChildren = node.children
        .map(stripImages)
        .filter((c): c is SlideNode => c !== null);
      return { ...node, children: cleanChildren };
    }
    return node;
  }

  const clean = nodes.map(stripImages).filter((n): n is SlideNode => n !== null);

  return { clean, images };
}

// checker for if any image is there inside of list items.
function listItemHasImage(node: SlideNode): boolean {
  if (node.type === 'image') return true;
  if (node.children) return node.children.some(listItemHasImage);
  return false;
}

// Render a listItem's text content only
export function renderListItemText(node: SlideNode): string {
  if (node.type === 'image') return '';
  if (node.type === 'text') return sanitizeHtml(node.value ?? '');
  if (node.children) {
    return node.children.map(renderListItemText).join('');
  }
  return '';
}

// node to html
export function childrenToHtml(node: SlideNode, animation?: string): string {
  return (node.children ?? []).map((c) => nodeToHtml(c, animation)).join('');
}

export function nodeToHtml(node: SlideNode, animation?: string): string {
  switch (node.type) {
    case 'paragraph': {
      // Paragraph that is purely image(s)   render as figure, not <p>
      const onlyImages =
        node.children &&
        node.children.length > 0 &&
        node.children.every((c) => c.type === 'image' || (c.type === 'text' && !c.value?.trim()));
      if (onlyImages) {
        return (node.children ?? [])
          .filter((c) => c.type === 'image')
          .map((img) => nodeToHtml(img, animation))
          .join('');
      }
      return `<p>${childrenToHtml(node, animation)}</p>`;
    }

    case 'heading': {
      const depth = node.depth ?? 3;
      return `<h${depth}>${childrenToHtml(node, animation)}</h${depth}>`;
    }

    case 'text':
      return sanitizeHtml(node.value ?? '');

    case 'strong':
      return `<strong>${childrenToHtml(node, animation)}</strong>`;

    case 'emphasis':
      return `<em>${childrenToHtml(node, animation)}</em>`;

    case 'inlineCode':
      return renderInlineCode(node);

    case 'code':
      return renderCodeBlock(node);

    case 'list': {
      // Extract images that ended up inside list items
      const tag = node.ordered ? 'ol' : 'ul';

      // Check if any list item carries an image
      const hasNestedImages = (node.children ?? []).some(listItemHasImage);

      if (!hasNestedImages) {
        return `<${tag}>${childrenToHtml(node, animation)}</${tag}>`;
      }

      // Render list items text-only, collect images
      const collectedImages: SlideNode[] = [];
      const itemsHtml = (node.children ?? [])
        .map((item) => {
          if (!listItemHasImage(item)) {
            if (animation) {
              globalFragmentCounter++;
              return `<li class="fragment" data-animation="${animation}" id="frag-${globalFragmentCounter}">${childrenToHtml(item, animation)}</li>`;
            }
            return `<li>${childrenToHtml(item, animation)}</li>`;
          }
          // Extract images from this item
          const { clean, images } = extractImages(item.children ?? []);
          collectedImages.push(...images);
          const textContent = clean.map((c) => nodeToHtml(c, animation)).join('');
          if (animation) {
            globalFragmentCounter++;
            return `<li class="fragment" data-animation="${animation}" id="frag-${globalFragmentCounter}">${textContent}</li>`;
          }
          return `<li>${textContent}</li>`;
        })
        .join('');

      // Render collected images in a grid below the list
      const imagesHtml =
        collectedImages.length > 0
          ? `<div class="inlineImageGrid">${collectedImages.map((c) => nodeToHtml(c, animation)).join('')}</div>`
          : '';

      return `<${tag}>${itemsHtml}</${tag}>${imagesHtml}`;
    }

    case 'listItem': {
      if (animation) {
        globalFragmentCounter++;
        return `<li class="fragment" data-animation="${animation}" id="frag-${globalFragmentCounter}">${childrenToHtml(node, animation)}</li>`;
      }
      return `<li>${childrenToHtml(node, animation)}</li>`;
    }

    case 'blockquote':
      return `<blockquote>${childrenToHtml(node, animation)}</blockquote>`;

    case 'image': {
      const src = node.url ?? node.value ?? '';
      const alt = node.alt ?? '';
      if (animation) {
        globalFragmentCounter++;
        return `<img src="${sanitizeUrl(src, true)}" alt="${sanitizeHtml(alt)}" class="fragment" data-animation="${animation}" id="frag-${globalFragmentCounter}" loading="lazy" />`;
      }
      return `<img src="${sanitizeUrl(src, true)}" alt="${sanitizeHtml(alt)}" loading="lazy" />`;
    }

    case 'link': {
      const href = node.url ?? node.value ?? '';
      return `<a href="${sanitizeUrl(href, false)}">${childrenToHtml(node, animation)}</a>`;
    }

    case 'table':
      return renderTable(node, (n) => childrenToHtml(n, animation));

    case 'tableRow':
      return renderTableRow(node, (n) => childrenToHtml(n, animation));

    case 'tableCell':
      return renderTableCell(node, (n) => childrenToHtml(n, animation));

    case 'break':
      return '<br />';

    case 'html':
      // Strip HTML comments and raw HTML nodes
      return '';

    case 'math':
      return `<div class="math mathDisplay">${renderMath(node.value ?? '', true)}</div>`;

    case 'inlineMath':
      return `<span class="math mathInline">${renderMath(node.value ?? '', false)}</span>`;

    case 'column':
      return childrenToHtml(node, animation);

    default:
      if (node.value) return sanitizeHtml(node.value);
      if (node.children?.length) return childrenToHtml(node, animation);
      return '';
  }
}

//  Notes
export function renderNotes(notes: string | undefined): string {
  if (!notes) return '';
  return `<aside class="notes" hidden>${sanitizeHtml(notes)}</aside>`;
}

// Image helpers for split layout
function findImageNode(nodes: SlideNode[]): SlideNode | null {
  for (const node of nodes) {
    if (node.type === 'image') return node;
    if (node.children) {
      const img = findImageNode(node.children);
      if (img) return img;
    }
  }
  return null;
}

function removeImageNode(nodes: SlideNode[]): SlideNode[] {
  return nodes
    .map((node) => {
      if (node.type === 'image') return null;
      if (node.children) return { ...node, children: removeImageNode(node.children) };
      return node;
    })
    .filter((n): n is SlideNode => n !== null);
}

// Slide renderer

// Count total images anywhere in a node tree
function countImagesInTree(nodes: SlideNode[]): number {
  let count = 0;
  function walk(node: SlideNode) {
    if (node.type === 'image') count++;
    if (node.children) node.children.forEach(walk);
  }
  nodes.forEach(walk);
  return count;
}

export function renderSlide(slide: Slide): string {
  const titleHtml = slide.title ? `<h2 class="slideTitle">${sanitizeHtml(slide.title)}</h2>` : '';
  const notesHtml = renderNotes(slide.notes);

  let contentHtml = '';

  if (slide.type === 'split') {
    const isManualSplit =
      slide.content.length === 2 &&
      slide.content[0]!.type === 'column' &&
      slide.content[1]!.type === 'column';

    if (isManualSplit) {
      // Manual ::split::
      contentHtml = `
        <div class="splitLayout">
          <div class="splitColumn textColumn">${nodeToHtml(slide.content[0]!, slide.animation)}</div>
          <div class="splitColumn rightColumn">${nodeToHtml(slide.content[1]!, slide.animation)}</div>
        </div>`;
    } else {
      // Auto-split: only do text+image split when there is EXACTLY one image
      const totalImages = countImagesInTree(slide.content);
      if (totalImages === 1) {
        const imageNode = findImageNode(slide.content);
        const textNodes = removeImageNode(slide.content);
        contentHtml = `
          <div class="splitLayout">
            <div class="splitColumn textColumn">${textNodes.map((n) => nodeToHtml(n, slide.animation)).join('\n')}</div>
            <div class="splitColumn imageColumn">${nodeToHtml(imageNode!, slide.animation)}</div>
          </div>`;
      } else {
        // 0 or 2+ images   render normally, let the list handler show images in a grid
        contentHtml = slide.content.map((n) => nodeToHtml(n, slide.animation)).join('\n');
      }
    }
  } else {
    contentHtml = slide.content.map((n) => nodeToHtml(n, slide.animation)).join('\n');
  }

  let bgAttr = '';
  let bgStyle = '';
  if (slide.backgroundImage) {
    const cleanUrl = slide.backgroundImage.replace(/\s+(dark|light)$/i, '').trim();
    bgAttr = ` data-background-image="${sanitizeHtml(slide.backgroundImage)}"`;
    bgStyle = ` style="background-image: url('${sanitizeHtml(cleanUrl)}') !important; background-size: cover !important; background-position: center !important; background-repeat: no-repeat !important;"`;
  }

  let alignAttr = '';
  if (slide.titleAlign) {
    alignAttr = ` data-title-align="${sanitizeHtml(slide.titleAlign)}"`;
  }
  let posAttr = '';
  if (slide.titlePosition) {
    posAttr = ` data-title-position="${sanitizeHtml(slide.titlePosition)}"`;
  }
  let animAttr = '';
  if (slide.animation) {
    animAttr = ` data-animation="${sanitizeHtml(slide.animation)}"`;
  }
  let fontSizeAttr = '';
  if (slide.fontSize) {
    fontSizeAttr = ` data-font-size="${sanitizeHtml(slide.fontSize)}"`;
  }

  return `<section class="slide"${bgAttr}${bgStyle}${alignAttr}${posAttr}${animAttr}${fontSizeAttr} data-type="${slide.type}" data-id="${slide.id}">
  ${titleHtml}
  <div class="slideContent">
    ${contentHtml}
  </div>
  ${notesHtml}
</section>`;
}
