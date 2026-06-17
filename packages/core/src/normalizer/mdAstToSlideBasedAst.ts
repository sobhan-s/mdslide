import { RootContent, Heading } from 'mdast';
import { type Slide, type SlideNode } from '@mindfiredigital/mdslide-shared';
import { createSlide, createSlideNode } from '../ast/index.js';
import { RawSlideBlock } from '../interfaces/index.js';
import { isHeading } from '../parser/index.js';
import { normalizeHeading } from './normalizeHeading.js';
import { extractSlideNotes } from './normalizeNote.js';
import { parseLayoutOveride, resolveSlideLayout, parseBackgroundImage } from './normalizeLayout.js';

// Converts generic MDAST node into Slide AST Node
export function toSlideAstNode(node: RootContent, isTableHeader = false): SlideNode {
  if (node.type == 'table') {
    // Table custom mappings to distinguish th vs td
    const children = (node.children || []).map((row: any, rowIndex: number) => {
      const rowChildren = (row.children || []).map((cell: any) => {
        // *
        return toSlideAstNode(cell, rowIndex === 0);
      });
      return createSlideNode({
        type: 'tableRow',
        children: rowChildren,
      });
    });
    return createSlideNode({
      type: 'table',
      children,
    });
  }

  return createSlideNode({
    type: node.type,
    value: 'value' in node ? String(node.value) : undefined,
    children:
      'children' in node
        ? (node.children as any[]).map((child) => toSlideAstNode(child, isTableHeader))
        : undefined,
    lang: 'lang' in node ? String(node.lang) : undefined,
    ordered: 'ordered' in node ? Boolean(node.ordered) : undefined,
    url: 'url' in node ? String(node.url) : undefined,
    alt: 'alt' in node ? String(node.alt) : undefined,
    header: isTableHeader || ('header' in node ? Boolean(node.header) : undefined),
  });
}

export function normalizeSlide(rawBlock: RawSlideBlock): Slide {
  const { notes, remainingNodes: nodesWithoutNotes } = extractSlideNotes(rawBlock.nodes);

  const { layoutOverride, filteredNodes: nodesWithoutLayout } =
    parseLayoutOveride(nodesWithoutNotes);

  const { backgroundImage, filteredNodes: nodesWithoutBg } =
    parseBackgroundImage(nodesWithoutLayout);

  let slideTitle: string | undefined;
  const slideContent: SlideNode[] = [];

  for (const node of nodesWithoutBg) {
    if (isHeading(node)) {
      const headingNode = node as Heading;
      const normalized = normalizeHeading(headingNode);

      if (headingNode.depth === 1) {
        slideTitle = normalized.text;
        continue;
      }

      if (headingNode.depth === 2) {
        slideTitle = slideTitle ?? normalized.text;
        continue;
      }
    }

    slideContent.push(toSlideAstNode(node));
  }

  const resolvedType = resolveSlideLayout(slideContent, slideTitle !== undefined, layoutOverride);

  return createSlide({
    id: rawBlock.id,
    type: resolvedType,
    title: slideTitle,
    content: slideContent,
    notes,
    layoutOverride,
    backgroundImage,
  });
}

export function normalizeSlides(rawBlocks: RawSlideBlock[]): Slide[] {
  return rawBlocks.map(normalizeSlide).filter((s) => s.title !== undefined || s.content.length > 0);
}
