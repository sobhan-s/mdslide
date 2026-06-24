import { SlideNode } from '@mindfiredigital/mdslide-shared';

function extractTextLength(node: SlideNode): number {
  let len = node.value ? node.value.length : 0;
  if (node.children) {
    for (const child of node.children) {
      if (
        child.type !== 'list' &&
        child.type !== 'table' &&
        child.type !== 'code' &&
        child.type !== 'image' &&
        child.type !== 'blockquote'
      ) {
        len += extractTextLength(child);
      }
    }
  }
  return len;
}

export { extractTextLength };
