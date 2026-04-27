export const BUILT_IN_THEMES: Record<string, string> = {
  light: `
:root {
  --slide-bg: #f8f7f4;
  --slide-text: #1c1917;
  --slide-accent: #2563eb;
  --slide-muted: #78716c;
  --slide-font: 'Georgia', 'Times New Roman', serif;
  --slide-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
  --slide-radius: 8px;
  --slide-shadow: 0 4px 24px rgba(0,0,0,0.06);
}
body {
  background: radial-gradient(ellipse at top left, #eef2ff 0%, #f8f7f4 50%, #fdf4ef 100%);
  background-attachment: fixed;
}`,

  dark: `
:root {
  --slide-bg: #09090b;
  --slide-text: #fafafa;
  --slide-accent: #6366f1;
  --slide-muted: #71717a;
  --slide-font: 'Georgia', serif;
  --slide-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
  --slide-radius: 8px;
  --slide-shadow: 0 4px 32px rgba(99,102,241,0.15);
}
body {
  background: radial-gradient(ellipse at top, #18181b 0%, #09090b 70%);
  background-attachment: fixed;
}`,

  notion: `
:root {
  --slide-bg: #ffffff;
  --slide-text: #37352f;
  --slide-accent: #0f7b6c;
  --slide-muted: #9b9a97;
  --slide-font: ui-sans-serif, -apple-system, BlinkMacSystemFont, sans-serif;
  --slide-mono: 'SFMono-Regular', 'Fira Code', monospace;
  --slide-radius: 4px;
  --slide-shadow: none;
}
body {
  background: linear-gradient(160deg, #f7fffe 0%, #ffffff 40%, #f9f9f8 100%);
  background-attachment: fixed;
}
.slide { border-left: none; }
.slide-title { font-weight: 700; letter-spacing: -0.02em; }`,

  terminal: `
:root {
  --slide-bg: #0a0a0a;
  --slide-text: #00ff41;
  --slide-accent: #00ff41;
  --slide-muted: #21a545;
  --slide-font: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
  --slide-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
  --slide-radius: 0px;
  --slide-shadow: 0 0 40px rgba(0,255,65,0.08);
}
body {
  background: radial-gradient(ellipse at top, #0d1a0f 0%, #0a0a0a 60%, #050a06 100%);
  background-attachment: fixed;
  background-image:
    radial-gradient(ellipse at top, #0d1a0f 0%, #0a0a0a 60%, #050a06 100%),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,255,65,0.015) 2px,
      rgba(0,255,65,0.015) 4px
    );
  background-blend-mode: normal;
}
.slide-title { text-shadow: 0 0 20px rgba(0,255,65,0.6); }
.slide-content pre { border: 1px solid rgba(0,255,65,0.2); }`,

  gradient: `
:root {
  --slide-bg: #0f0c29;
  --slide-text: #f0f0ff;
  --slide-accent: #a78bfa;
  --slide-muted: #c4b5fd;
  --slide-font: 'Georgia', serif;
  --slide-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --slide-radius: 12px;
  --slide-shadow: 0 8px 32px rgba(167,139,250,0.2);
}
body {
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  background-attachment: fixed;
}
.slide-title {
  background: linear-gradient(90deg, #a78bfa, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.slide-content pre { background: rgba(255,255,255,0.05); border: 1px solid rgba(167,139,250,0.2); }
.slide-content blockquote { border-left-color: #a78bfa; }`,
};

export const BUILT_IN_THEME_NAMES = Object.keys(BUILT_IN_THEMES) as Array<
  keyof typeof BUILT_IN_THEMES
>;
export const FALLBACK_THEME = 'light';
