import { BUILT_IN_THEMES } from './builtInThemes.js';

export const BUILT_IN_THEME_NAMES = Object.keys(BUILT_IN_THEMES) as Array<
  keyof typeof BUILT_IN_THEMES
>;

export class ThemeEngine {
  // Returns clean base layout CSS injected regardless of theme
  getBaseCSS(): string {
    return `
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: var(--slide-font);
  background: var(--slide-bg);
  color: var(--slide-text);
  height: 100vh;
  overflow: hidden;
}

.deck {
  width: 100%;
  height: 100%;
  position: relative;
}

.slide {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  height: 100vh;
  padding: 3rem 5rem;
  gap: 1.5rem;
  opacity: 0;
  pointer-events: none;
  transform: translateX(40px);
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease-out;
}

.slide.active {
  opacity: 1;
  pointer-events: auto;
  transform: translateX(0);
}

.slide.past {
  opacity: 0;
  pointer-events: none;
  transform: translateX(-40px);
}

.slide[data-type="title"] {
  align-items: center;
  text-align: center;
  justify-content: center;
}

.slide[data-type="statement"] {
  align-items: center;
  text-align: center;
  justify-content: center;
}

.slide[data-type="visual"] {
  align-items: flex-start;
  justify-content: flex-start;
}

.slide[data-type="visual"] .slideContent {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  width: 100%;
}

.slide[data-type="visual"] .slideContent p {
  width: 100%;
  height: 100%;
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
  padding: 1rem;
}

.slide[data-type="visual"] img {
  width: 100%;
  height: 100%;
  max-height: 95%;
  max-width: 95%;
  object-fit: contain;
  box-shadow: var(--slide-shadow);
  border-radius: var(--slide-radius);
  margin: 0 auto;
}



.slideTitle {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--slide-text);
  line-height: 1.2;
}

.slide[data-type="title"] .slideTitle {
  font-size: 3rem;
}

.slideContent {
  width: 100%;
  font-size: 1.15rem;
  line-height: 1.7;
  color: var(--slide-text);
}

.slideContent p { margin-bottom: 0.75rem; }

.slideContent ul,
.slideContent ol {
  padding-left: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.slideContent li { font-size: 1.1rem; }

.slideContent pre {
  background: rgba(0,0,0,0.05);
  border-radius: var(--slide-radius);
  padding: 1.25rem 1.5rem;
  overflow-x: auto;
  font-family: var(--slide-mono);
  font-size: 0.95rem;
  line-height: 1.5;
  border: 1px solid rgba(0,0,0,0.06);
}

.slideContent code {
  font-family: var(--slide-mono);
  font-size: 0.9em;
  background: rgba(0,0,0,0.06);
  padding: 0.1em 0.35em;
  border-radius: 3px;
}

.slideContent pre code {
  background: none;
  padding: 0;
}

.slideContent blockquote {
  border-left: 4px solid var(--slide-accent);
  padding-left: 1.25rem;
  color: var(--slide-muted);
  font-style: italic;
}

.slideContent table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1rem;
}

.slideContent td,
.slideContent th {
  border: 1px solid var(--slide-muted);
  padding: 0.5rem 0.75rem;
  text-align: left;
}

.slideContent img {
  max-width: 100%;
  max-height: 60vh;
  border-radius: var(--slide-radius);
}

.slideContent li img {
  display: block;
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
  max-height: 40vh;
  box-shadow: var(--slide-shadow);
}

.splitLayout {
  display: flex;
  flex-direction: row;
  width: 100%;
  flex-grow: 1;
  gap: 3.5rem;
  align-items: flex-start;
  margin-top: 1rem;
}

.splitColumn {
  flex: 1;
  width: 50%;
}

.splitColumn.textColumn {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 1.5rem;
  padding-top: 0.5rem; /* visual optical baseline alignment */
}

.splitColumn.rightColumn {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 1.5rem;
  padding-top: 0.5rem;
}

.splitColumn.imageColumn {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.splitColumn.imageColumn img {
  width: 100%;
  height: auto;
  max-height: 65vh;
  object-fit: cover;
  border-radius: var(--slide-radius);
  box-shadow: var(--slide-shadow);
}

.notes { display: none; }

/* Dynamic Floating dok & Progress Bar dok details */
.progressBarContainer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: var(--progress-bg, rgba(0, 0, 0, 0.05));
  z-index: 101;
}

.progressBar {
  height: 100%;
  width: 0%;
  background: var(--slide-accent);
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.dokContainer {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%) translateY(80px);
  background: var(--dok-bg, rgba(255, 255, 255, 0.75));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--dok-border, rgba(255, 255, 255, 0.4));
  border-radius: 30px;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  z-index: 100;
  opacity: 0;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease-out;
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
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: background 0.2s, opacity 0.2s;
}

.dokBtn:hover {
  background: rgba(0, 0, 0, 0.05);
  opacity: 1;
}

.dokCounter {
  font-family: var(--slide-mono);
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0 0.5rem;
  color: var(--slide-text);
}
`;
  }

  //   Resolves the name or custom CSS string to built-in stylesheets
  resolveTheme(themeName: string): string {
    return BUILT_IN_THEMES[themeName] ?? themeName;
  }
}
