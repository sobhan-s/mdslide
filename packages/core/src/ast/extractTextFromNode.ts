// Recursively traverse the all childrent and extract the text and join them and return to us as a sting
export function extractTextFromNode(node: any): string {
  if (typeof node.value === 'string') {
    return node.value;
  }

  if (node.type === 'image') {
    return node.alt ?? '';
  }

  if (Array.isArray(node.children) && node.children.length > 0) {
    const BLOCK_TYPES = new Set([
      'paragraph',
      'heading',
      'listItem',
      'blockquote',
      'tableCell',
      'tableRow',
    ]);

    return node.children
      .map(extractTextFromNode)
      .reduce((acc: string[], text: string, i: number) => {
        if (!text) return acc;
        const child = node.children![i];
        if (acc.length > 0 && child && BLOCK_TYPES.has(child.type)) {
          acc.push('\n' + text);
        } else if (acc.length > 0) {
          acc.push(' ' + text);
        } else {
          acc.push(text);
        }
        return acc;
      }, [])
      .join('');
  }

  return '';
}
