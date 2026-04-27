import type { Slide, SlideNode, SlideDeck } from '@mindfiredigital/mdslide-shared';
import { resolveTheme, baseCSS } from './theme.js';
import { NAV_SCRIPT, DEFAULT_THEME, DEFAULT_TITLE } from './constants/html.constants.js';

export interface RenderOptions {
  theme?: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function nodeToHtml(node: SlideNode): string {
  switch (node.type) {
    case 'paragraph':
      return `<p>${childrenToHtml(node)}</p>`;

    case 'text':
      return escapeHtml(node.value ?? '');

    case 'strong':
      return `<strong>${childrenToHtml(node)}</strong>`;

    case 'emphasis':
      return `<em>${childrenToHtml(node)}</em>`;

    case 'inlineCode':
      return `<code>${escapeHtml(node.value ?? '')}</code>`;

    case 'code':
      return `<pre><code class="language-${node.lang ?? ''}">${escapeHtml(node.value ?? '')}</code></pre>`;

    case 'list':
      const tag = node.ordered ? 'ol' : 'ul';
      return `<${tag}>${childrenToHtml(node)}</${tag}>`;

    case 'listItem':
      return `<li>${childrenToHtml(node)}</li>`;

    case 'blockquote':
      return `<blockquote>${childrenToHtml(node)}</blockquote>`;

    case 'image':
      return `<img src="${escapeHtml(node.url ?? node.value ?? '')}" alt="${escapeHtml(node.alt ?? '')}" />`;

    case 'link':
      return `<a href="${escapeHtml(node.url ?? node.value ?? '')}">${childrenToHtml(node)}</a>`;

    case 'table':
      return `<table>${childrenToHtml(node)}</table>`;

    case 'tableHeader':
      return `<thead>${childrenToHtml(node)}</thead>`;

    case 'tableBody':
      return `<tbody>${childrenToHtml(node)}</tbody>`;

    case 'tableRow':
      return `<tr>${childrenToHtml(node)}</tr>`;

    case 'tableCell':
      const cellTag = node.header ? 'th' : 'td';
      return `<${cellTag}>${childrenToHtml(node)}</${cellTag}>`;

    case 'break':
      return '<br />';

    case 'html':
      return '';

    default:
      if (node.value) return escapeHtml(node.value);
      if (node.children?.length) return childrenToHtml(node);
      return '';
  }
}

function childrenToHtml(node: SlideNode): string {
  return (node.children ?? []).map(nodeToHtml).join('');
}

function renderNotes(notes: string | undefined): string {
  if (!notes) return '';
  return `<aside class="notes" hidden>${escapeHtml(notes)}</aside>`;
}

export function renderSlide(slide: Slide): string {
  const titleHtml = slide.title ? `<h2 class="slide-title">${escapeHtml(slide.title)}</h2>` : '';

  const contentHtml = slide.content.map(nodeToHtml).join('\n');
  const notesHtml = renderNotes(slide.notes);

  return `<section class="slide" data-type="${slide.type}" data-id="${slide.id}">
  ${titleHtml}
  <div class="slide-content">
    ${contentHtml}
  </div>
  ${notesHtml}
</section>`;
}

export function renderDeck(result: SlideDeck, options: RenderOptions = {}): string {
  const theme = options.theme ?? String(result.meta?.theme ?? DEFAULT_THEME);
  const title = String(result.meta?.title ?? DEFAULT_TITLE);
  const slidesHtml = result.slides.map(renderSlide).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <style id="mdslide-base">${baseCSS()}</style>
  <style id="mdslide-theme">${resolveTheme(theme)}</style>
</head>
<body>
  <div class="deck">
${slidesHtml}
  </div>
  <div id="slide-counter" class="slide-counter"></div>
  ${NAV_SCRIPT}
</body>
</html>`;
}
