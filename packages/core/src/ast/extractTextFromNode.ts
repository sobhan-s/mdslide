// Recursively traverse the all childrent and extract the text and join them and return to us as a sting
export function extractTextFromNode(node: any): string {
  if (node.value != undefined) {
    return String(node.value);
  }

  if (node.children && Array.isArray(node.children)) {
    return node.children.map(extractTextFromNode).join('');
  }
  return '';
}
