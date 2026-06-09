import { SlideNode } from '@mindfiredigital/mdslide-shared';

function extractTextLength(node: SlideNode): number {
  let len = node.value ? node.value.length : 0;
  if (node.children) {
    for (const child of node.children) {
      len += extractTextLength(child);
    }
  }
  return len;
}

export { extractTextLength };
