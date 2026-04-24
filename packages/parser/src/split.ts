import type { Root, RootContent, Heading } from 'mdast';
import type { Slide, SlideNode } from '@mindfiredigital/mdslide-shared';

// converts the mdast content to a plane slidenode
function toNode(node: RootContent): SlideNode {
  return {
    type: node.type,
    value: 'value' in node ? String(node.value) : undefined,
    children:
      'children' in node ? node.children.map((child: RootContent) => toNode(child)) : undefined,
  };
}

// extract text plain text
function extractText(node: RootContent): string {
  if ('value' in node) return String(node.value);
  if ('children' in node) return node.children.map(extractText).join(' ');
  return '';
}

// extract plain text from a heading node
function headingText(node: Heading): string {
  return node.children.length > 0 && 'value' in node.children[0]
    ? String(node.children[0].value)
    : '';
}

// start with new slide
function freshSlide(title?: string): Slide {
  return {
    id: globalThis.crypto.randomUUID(),
    type: 'content',
    content: [],
    ...(title && { title }),
  };
}

export function splitSlides(tree: Root): Slide[] {
  if (!tree.children || tree.children.length === 0) return [];

  const slides: Slide[] = [];
  let current: Slide = freshSlide();
  let inNotes = false;

  try {
    for (const node of tree.children) {
      // For thematic break '***' stop present slide go to new one
      if (node.type === 'thematicBreak') {
        slides.push(current);
        current = freshSlide();
        inNotes = false;
        continue;
      }

      // html comments, notes and layout override
      if (node.type === 'html') {
        const val = node.value.trim();

        if (val === '<!-- notes -->') {
          inNotes = true;
          continue;
        }

        if (val === '<!-- /notes -->') {
          inNotes = false;
          continue;
        }

        const layoutMatch = val.match(/^<!--\s*layout:\s*(\w+)\s*-->$/);
        if (layoutMatch) {
          current.layoutOverride = layoutMatch[1];
          continue;
        }
      }

      // collect text into notes field while inside a notes block
      if (inNotes) {
        const text = extractText(node).trim();
        if (text) {
          current.notes = current.notes ? `${current.notes}\n${text}` : text;
        }
        continue;
      }

      // headings control slide boundaries and titles
      if (node.type === 'heading') {
        const text = headingText(node);

        // ## for H2
        if (node.depth === 2) {
          slides.push(current);
          current = freshSlide(text);
          continue;
        }

        // # for H1
        if (node.depth === 1) {
          current.title = text;
          continue;
        }
      }

      current.content.push(toNode(node));
    }
  } catch (err) {
    throw new Error(`Failed to split slides: ${err instanceof Error ? err.message : String(err)}`);
  }

  slides.push(current);
  return slides.filter((s) => s.title !== undefined || s.content.length > 0);
}
