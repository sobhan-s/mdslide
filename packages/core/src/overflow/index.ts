import type { Slide, SlideNode } from '@mindfiredigital/mdslide-shared';
import { extractTextLength } from '../utils/index.js';

function calculateNodeHeight(node: SlideNode): number {
  let baseHeight = 0;

  if (node.type === 'code') {
    const lines = (node.value || '').split('\n').length;
    baseHeight = 40 + lines * 16;
  } else if (node.type === 'table') {
    const rows = node.children ? node.children.length : 0;
    baseHeight = 20 + rows * 26;
  } else if (node.type === 'list') {
    baseHeight = 15;
  } else if (node.type === 'listItem') {
    const textLen = extractTextLength(node);
    const wrapLines = Math.ceil(textLen / 70);
    baseHeight = Math.max(22, wrapLines * 20);
  } else if (node.type === 'image') {
    baseHeight = 300;
  } else if (node.type === 'blockquote') {
    const textLen = extractTextLength(node);
    const wrapLines = Math.ceil(textLen / 75);
    baseHeight = 20 + wrapLines * 20;
  } else {
    const textLen = extractTextLength(node);
    const wrapLines = Math.ceil(textLen / 80);
    baseHeight = wrapLines * 20 + 8;
  }

  if (node.children && node.type !== 'table') {
    for (const child of node.children) {
      if (
        child.type === 'image' ||
        child.type === 'list' ||
        child.type === 'listItem' ||
        child.type === 'blockquote' ||
        child.type === 'paragraph' ||
        child.type === 'code' ||
        child.type === 'table'
      ) {
        baseHeight += calculateNodeHeight(child);
      }
    }
  }

  return baseHeight;
}
