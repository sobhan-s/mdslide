import type { SlideNode } from '@mindfiredigital/mdslide-shared';
import { SUPPORTED_LANGS } from '../../constants/index.js';
import { sanitizeHtml } from '../../utils/index.js';

export function renderCodeBlock(node: SlideNode): string {
  const lang = (node.lang ?? '').toLowerCase();
  const value = node.value ?? '';

  if (lang && SUPPORTED_LANGS.includes(lang)) {
    return `<pre class="lineNumbers language-${sanitizeHtml(lang)}"><code class="language-${sanitizeHtml(lang)}">${sanitizeHtml(value)}</code></pre>`;
  }

  return `<pre><code>${sanitizeHtml(value)}</code></pre>`;
}

export function renderInlineCode(node: SlideNode): string {
  const value = node.value ?? '';
  return `<code>${sanitizeHtml(value)}</code>`;
}
