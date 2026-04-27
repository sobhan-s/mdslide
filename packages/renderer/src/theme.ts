import { BUILT_IN_THEMES } from './constants/theme.constants.js';

// returns invariant base layout CSS and it always injected regardless of theme
export function baseCSS(): string {
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
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  height: 100vh;
  padding: 4rem 6rem;
  gap: 1.5rem;
}

.slide[data-type="title"] {
  align-items: center;
  text-align: center;
}

.slide[data-type="statement"] {
  align-items: center;
  text-align: center;
}

.slide-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--slide-text);
  line-height: 1.2;
}

.slide[data-type="title"] .slide-title {
  font-size: 3rem;
}

.slide-content {
  width: 100%;
  font-size: 1.15rem;
  line-height: 1.7;
  color: var(--slide-text);
}

.slide-content p { margin-bottom: 0.75rem; }

.slide-content ul,
.slide-content ol {
  padding-left: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.slide-content li { font-size: 1.1rem; }

.slide-content pre {
  background: rgba(0,0,0,0.08);
  border-radius: var(--slide-radius);
  padding: 1.25rem 1.5rem;
  overflow-x: auto;
  font-family: var(--slide-mono);
  font-size: 0.95rem;
  line-height: 1.5;
}

.slide-content code {
  font-family: var(--slide-mono);
  font-size: 0.9em;
  background: rgba(0,0,0,0.06);
  padding: 0.1em 0.35em;
  border-radius: 3px;
}

.slide-content pre code {
  background: none;
  padding: 0;
}

.slide-content blockquote {
  border-left: 4px solid var(--slide-accent);
  padding-left: 1.25rem;
  color: var(--slide-muted);
  font-style: italic;
}

.slide-content table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1rem;
}

.slide-content td,
.slide-content th {
  border: 1px solid var(--slide-muted);
  padding: 0.5rem 0.75rem;
  text-align: left;
}

.slide-content img {
  max-width: 100%;
  max-height: 60vh;
  border-radius: var(--slide-radius);
}
[data-theme="light"] {
  --slide-bg: #ffffff;
  --slide-text: #1a1a1a;
  --slide-accent: #2563eb;
  --slide-muted: #6b7280;
}  

[data-theme="dark"] {
  --slide-bg: #0f0f0f;
  --slide-text: #e5e5e5;
  --slide-accent: #818cf8;
  --slide-muted: #9ca3af;
}
  
[data-theme="notion"] {
  --slide-bg: #f7f6f3;
  --slide-text: #37352f;
  --slide-accent: #2eaadc;
  --slide-muted: #9b9a97;
}

[data-theme="terminal"] {
  --slide-bg: #0d0d0d;
  --slide-text: #00ff41;
  --slide-accent: #00ff41;
  --slide-muted: #005f1a;
}
 

[data-theme="gradient"] {
  --slide-bg: #1e1b4b;
  --slide-text: #f0f0ff;
  --slide-accent: #a78bfa;
  --slide-muted: #c4b5fd;
}

.slide-counter {
  position: fixed;
  bottom: 1.5rem;
  right: 2rem;
  font-family: var(--slide-mono);
  font-size: 0.8rem;
  color: var(--slide-muted);
  z-index: 100;
}

.notes { display: none; }
`;
}

export function resolveTheme(nameOrCss: string): string {
  return BUILT_IN_THEMES[nameOrCss] ?? nameOrCss;
}
