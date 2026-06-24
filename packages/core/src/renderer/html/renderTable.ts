import type { SlideNode } from '@mindfiredigital/mdslide-shared';

export function renderTable(node: SlideNode, renderChildren: (node: SlideNode) => string): string {
  return `<table>${renderChildren(node)}</table>`;
}

export function renderTableRow(
  node: SlideNode,
  renderChildren: (node: SlideNode) => string
): string {
  return `<tr>${renderChildren(node)}</tr>`;
}

export function renderTableCell(
  node: SlideNode,
  renderChildren: (node: SlideNode) => string
): string {
  const cellTag = node.header ? 'th' : 'td';
  return `<${cellTag}>${renderChildren(node)}</${cellTag}>`;
}
