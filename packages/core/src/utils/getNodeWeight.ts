import { RootContent } from 'mdast';
import { isHeading } from '../parser/lexer.js';
import { toString } from 'mdast-util-to-string';

function getNodeWeight(node: RootContent): number {
  if (isHeading(node)) return 2;

  switch (node.type) {
    case 'paragraph':
      return Math.max(1, Math.ceil(toString(node).split(/\s+/).length / 20));

    case 'list':
      return node.children?.length ?? 0;

    case 'table':
      return 4;

    case 'code':
      return Math.max(1, Math.ceil((node.value || '').split('\n').length / 5));

    default:
      return 1;
  }
}

export { getNodeWeight };
