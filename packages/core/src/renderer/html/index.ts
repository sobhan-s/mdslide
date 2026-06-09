import type { SlideDeck } from '@mindfiredigital/mdslide-shared';
import { renderSlide } from './renderSlide.js';
import { sanitizeHtml } from '../../utils/html.js';
import { script } from './script.js';
import { RenderDeckOptions } from '../../interfaces/index.js';
import { DEFAULT_THEME, DEFAULT_TITLE } from '../../constants/index.js';
import { ThemeEngine } from '../../themes/themeEngine.js';
export * from './renderSlide.js';

export function renderDeck(deck: SlideDeck, options: RenderDeckOptions = {}): string {
  const themeEngine = new ThemeEngine();

  const theme = options.theme ?? String(deck.meta?.theme ?? DEFAULT_THEME);
  const title = String(deck.meta?.title ?? DEFAULT_TITLE);
  const slidesHtml = deck.slides.map(renderSlide).join('\n');

  const isDarkTheme = ['dark', 'terminal', 'gradient'].includes(theme);
  const prismThemeUrl = isDarkTheme
    ? 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css'
    : 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css';

  return `<!DOCTYPE html>
<html lang="en" data-theme="${sanitizeHtml(theme)}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${sanitizeHtml(title)}</title>
  <style id="mdslideBase">${themeEngine.getBaseCSS()}</style>
  <style id="mdslideTheme">${themeEngine.resolveTheme(theme)}</style>
  <link rel="stylesheet" href="${prismThemeUrl}" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.css" />
  <style>
    /* Custom Prism overrides to match slide styling perfectly */
    pre[class*="language-"] {
      margin: 0;
      padding: 1.25rem 1.5rem !important;
      background: rgba(0, 0, 0, 0.04) !important;
      border-radius: var(--slide-radius);
      border: 1px solid rgba(0, 0, 0, 0.08) !important;
    }
    
    [data-theme="dark"] pre[class*="language-"],
    [data-theme="terminal"] pre[class*="language-"],
    [data-theme="gradient"] pre[class*="language-"] {
      background: rgba(255, 255, 255, 0.05) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
    }

    :not(pre) > code {
      font-family: var(--slide-mono) !important;
      font-size: 0.9em !important;
      background: rgba(0, 0, 0, 0.06);
      color: var(--slide-text) !important;
      padding: 0.15em 0.35em;
      border-radius: 4px;
      border: 1px solid rgba(0, 0, 0, 0.04);
    }
    
    [data-theme="dark"] :not(pre) > code,
    [data-theme="terminal"] :not(pre) > code,
    [data-theme="gradient"] :not(pre) > code {
      background: rgba(255, 255, 255, 0.08);
      color: var(--slide-text) !important;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    pre code[class*="language-"] {
      font-family: var(--slide-mono) !important;
      text-shadow: none !important;
      font-size: 0.9rem !important;
    }
    
    .line-numbers-rows {
      border-right: 1px solid rgba(0,0,0,0.1) !important;
      padding: 1.25rem 0 !important;
    }
    
    [data-theme="dark"] .line-numbers-rows,
    [data-theme="terminal"] .line-numbers-rows,
    [data-theme="gradient"] .line-numbers-rows {
      border-right: 1px solid rgba(255,255,255,0.15) !important;
    }
  </style>
</head>
<body>
  <div class="deck">
${slidesHtml}
  </div>

  <!-- Progress Bar -->
  <div class="progressBarContainer">
    <div id="progressBar" class="progressBar"></div>
  </div>

  <!-- DOK Control bar -->
  <div class="dokContainer">
    <button id="dokPrev" class="dokBtn" title="Previous Slide">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
    </button>
    <span id="dokCounter" class="dokCounter">1 / 1</span>
    <button id="dokNext" class="dokBtn" title="Next Slide">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
    </button>
    
    <button id="dokFullscreen" class="dokBtn" title="Toggle Fullscreen (F)">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
    </button>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.js"></script>
  ${script}
</body>
</html>`;
}
