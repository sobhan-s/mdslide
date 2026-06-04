import { SlideNode } from '@mindfiredigital/mdslide-shared';

function countImages(nodes: SlideNode[]): number {
  let count = 0;
  for (const node of nodes) {
    if (node.type === 'image') {
      count++;
    }
    if (node.children) {
      count += countImages(node.children);
    }
  }

  return count;
}

export { countImages };
