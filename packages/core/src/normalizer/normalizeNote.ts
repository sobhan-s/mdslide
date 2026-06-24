import type { RootContent } from 'mdast';
import { extractTextFromNode } from '../ast/extractTextFromNode.js';
import type { ParseNotesResult } from '../interfaces/index.js';

export function extractSlideNotes(nodes: RootContent[]): ParseNotesResult {
  let notes: string | undefined = '';

  const remainingNodes: RootContent[] = [];
  let isNote = false;

  for (const node of nodes) {
    if (node.type == 'html') {
      const val = node.value.trim();
      if (val == '<!-- notes -->') {
        isNote = true;
        continue;
      }
      if (val == '<!-- /notes -->') {
        isNote = false;
        continue;
      }
    }

    if (isNote) {
      const text = extractTextFromNode(node);
      if (text) {
        notes = notes ? `${notes}\n${text}` : text;
      }
    } else {
      remainingNodes.push(node);
    }
  }

  return {
    notes: notes || undefined,
    remainingNodes,
  };
}
