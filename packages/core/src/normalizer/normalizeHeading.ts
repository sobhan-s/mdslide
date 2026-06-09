import type { Heading } from 'mdast';
import { extractTextFromNode } from '../ast/extractTextFromNode.js';
import type { NormalizedHeading } from '../interfaces/index.js';

export function normalizeHeading(node: Heading): NormalizedHeading {
  return {
    depth: node.depth,
    text: extractTextFromNode(node).trim(),
  };
}
