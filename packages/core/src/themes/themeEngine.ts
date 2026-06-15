import { BUILT_IN_THEMES } from './builtInThemes.js';

export const BUILT_IN_THEME_NAMES = Object.keys(BUILT_IN_THEMES) as Array<
  keyof typeof BUILT_IN_THEMES
>;

export class ThemeEngine {
  getBaseCSS(): string {
    return `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: var(--slide-font, 'Inter', system-ui, sans-serif);
  background: var(--slide-bg);
  color: var(--slide-text);
  height: 100vh;
  overflow: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

/* Deck Container */
.deck {
  width: 100%;
  height: 100%;
  position: relative;
}

/* Slide base */
.slide {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  height: 100vh;
  padding: 4.5rem 6.5rem;
  gap: 0;
  opacity: 0;
  pointer-events: none;
  transform: translateX(60px);
  transition:
    transform 0.45s cubic-bezier(0.16, 1, 0.3, 1),
    opacity   0.45s ease-out;
  overflow: hidden;
}

.slide.active {
  opacity: 1;
  pointer-events: auto;
  transform: translateX(0);
}

.slide.past {
  opacity: 0;
  pointer-events: none;
  transform: translateX(-60px);
}

/* Layout variants */
.slide[data-type="title"] {
  align-items: flex-start;
  justify-content: center;
  padding: 5rem 7rem;
}

.slide[data-type="statement"] {
  align-items: center;
  text-align: center;
  justify-content: center;
  padding: 5rem 8rem;
}

/* Title (h1 / h2 on title slides) */
.slideTitle {
  font-size: var(--title-size, 3.4rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: var(--slide-text);
  margin-bottom: 2rem;
  width: 100%;
  text-align: left;
}

.slide[data-type="title"] .slideTitle {
  text-align: center;
  width: 100%;
}

/* Content area */
.slideContent {
  width: 100%;
  flex: 1;
  font-size: var(--body-size, 1.35rem);
  line-height: 1.7;
  color: var(--slide-text);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow: hidden;
}

/* Headings inside content */
.slideContent h1 {
  font-size: var(--title-size, 3.4rem);
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.1;
  margin-bottom: 1.25rem;
}

.slideContent h2 {
  font-size: var(--h2-size, 2.4rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.15;
  margin-bottom: 1rem;
  color: var(--slide-text);
}

.slideContent h3 {
  font-size: var(--h3-size, 1.7rem);
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.2;
  margin-bottom: 0.75rem;
  color: var(--slide-muted);
}

.slideContent h4, .slideContent h5, .slideContent h6 {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

/* Paragraph */
.slideContent p {
  font-size: var(--body-size, 1.35rem);
  line-height: 1.7;
  margin-bottom: 0.6rem;
  max-width: 75ch;
}

.slide[data-type="statement"] .slideContent p {
  font-size: 2rem;
  line-height: 1.5;
  font-weight: 500;
  max-width: 22ch;
}

/* Lists */
.slideContent ul,
.slideContent ol {
  padding-left: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 0.5rem;
}

.slideContent li {
  font-size: var(--li-size, 1.3rem);
  line-height: 1.55;
  padding-left: 0.25rem;
}

.slideContent li::marker {
  color: var(--slide-accent);
  font-weight: 600;
}

.slideContent ul li { list-style-type: disc; }
.slideContent ul li li { list-style-type: circle; font-size: 1.15rem; }
.slideContent ol li { list-style-type: decimal; }

/* Blockquote */
.slideContent blockquote {
  border-left: 5px solid var(--slide-accent);
  padding: 1.25rem 2rem;
  margin: 0.5rem 0;
  background: rgba(128,128,128,0.05);
  border-radius: 0 var(--slide-radius) var(--slide-radius) 0;
  font-size: 1.5rem;
  font-style: italic;
  line-height: 1.55;
  color: var(--slide-muted);
}

/* Code blocks */
.slideContent pre {
  background: rgba(0,0,0,0.05);
  border-radius: var(--slide-radius);
  padding: 1.5rem 2rem;
  overflow-x: auto;
  font-family: var(--slide-mono);
  font-size: var(--code-size, 1.05rem);
  line-height: 1.6;
  border: 1px solid var(--slide-border, rgba(0,0,0,0.08));
  width: 100%;
}

.slideContent code {
  font-family: var(--slide-mono);
  font-size: 0.875em;
  background: rgba(128,128,128,0.12);
  padding: 0.15em 0.4em;
  border-radius: 4px;
}

.slideContent pre code {
  background: none;
  padding: 0;
  font-size: 1em;
}

/* Strong / em */
.slideContent strong {
  font-weight: 700;
  color: var(--slide-text);
}

.slideContent em {
  font-style: italic;
  color: var(--slide-muted);
}

/* Links */
.slideContent a {
  color: var(--slide-accent);
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
}

/* Tables */
.slideContent table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1.1rem;
  margin-top: 0.5rem;
}

.slideContent th {
  font-weight: 600;
  font-size: 1rem;
  text-align: left;
  padding: 0.75rem 1rem;
  border-bottom: 2px solid var(--slide-accent);
  color: var(--slide-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 0.85rem;
}

.slideContent td {
  padding: 0.7rem 1rem;
  border-bottom: 1px solid var(--slide-border, rgba(128,128,128,0.15));
  font-size: 1.1rem;
  line-height: 1.5;
}

.slideContent tr:last-child td { border-bottom: none; }
.slideContent tr:hover td { background: rgba(128,128,128,0.04); }

/* Images */
.slideContent img {
  max-width: 100%;
  max-height: 55vh;
  border-radius: var(--slide-radius);
  object-fit: contain;
  display: block;
}

/* Images extracted from list items rendered as a row below the list */
.inlineImageGrid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1.25rem;
  width: 100%;
}

.inlineImageGrid img {
  flex: 1 1 0;
  min-width: 0;
  max-height: 34vh;
  width: auto;
  object-fit: cover;
  border-radius: var(--slide-radius);
  border: 1px solid var(--slide-border, rgba(128,128,128,0.12));
}

.slide[data-type="visual"] {
  align-items: flex-start;
  justify-content: flex-start;
}

.slide[data-type="visual"] .slideContent {
  flex: 1;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.slide[data-type="visual"] img {
  max-width: 100%;
  max-height: 72vh;
  object-fit: contain;
  border-radius: var(--slide-radius);
}

/* Split layout */
.splitLayout {
  display: flex;
  flex-direction: row;
  width: 100%;
  flex: 1;
  gap: 4rem;
  align-items: flex-start;
}

.splitColumn {
  flex: 1;
  min-width: 0;
}

.splitColumn.textColumn {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 1rem;
}

.splitColumn.imageColumn,
.splitColumn.rightColumn {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.splitColumn.imageColumn img {
  width: 100%;
  height: auto;
  max-height: 62vh;
  object-fit: cover;
  border-radius: var(--slide-radius);
}

/* Speaker notes */
.notes { display: none; }

/* Progress bar */
.progressBarContainer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: var(--progress-bg, rgba(0,0,0,0.06));
  z-index: 200;
}

.progressBar {
  height: 100%;
  width: 0%;
  background: var(--slide-accent);
  transition: width 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

/* DOK control bar */
.dokContainer {
  position: fixed;
  bottom: 1.75rem;
  left: 50%;
  transform: translateX(-50%) translateY(72px);
  background: var(--dok-bg, rgba(255,255,255,0.85));
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--dok-border, rgba(0,0,0,0.1));
  border-radius: 100px;
  padding: 0.5rem 1.125rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 199;
  opacity: 0;
  transition:
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    opacity   0.35s ease-out;
}

body.showDok .dokContainer,
.dokContainer:hover {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}

.dokBtn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--slide-text);
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.65;
  transition: background 0.15s, opacity 0.15s;
  flex-shrink: 0;
}

.dokBtn:hover {
  background: rgba(128,128,128,0.12);
  opacity: 1;
}

.dokCounter {
  font-family: var(--slide-mono);
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0 0.625rem;
  color: var(--slide-text);
  opacity: 0.8;
  min-width: 3.5rem;
  text-align: center;
}

/* Print PDF */
@media print {
  @page { size: 1920px 1080px; margin: 0; }

  body {
    background: var(--slide-bg) !important;
    color: var(--slide-text) !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    overflow: visible !important;
    height: auto !important;
  }

  .deck { height: auto !important; overflow: visible !important; }

  .slide {
    position: relative !important;
    display: flex !important;
    opacity: 1 !important;
    pointer-events: auto !important;
    transform: none !important;
    page-break-after: always !important;
    break-after: page !important;
    height: 1080px !important;
    width: 1920px !important;
    margin: 0 !important;
    border: none !important;
  }

  .dokContainer, .progressBarContainer { display: none !important; }
}
`;
  }

  resolveTheme(themeName: string): string {
    return BUILT_IN_THEMES[themeName] ?? themeName;
  }
}
