export const BUILT_IN_THEMES: Record<string, string> = {
  light: `
:root {
  --slide-bg: #ffffff;
  --slide-text: #1a1a1a;
  --slide-accent: #2563eb;
  --slide-muted: #6b7280;
  --slide-font: 'Georgia', serif;
  --slide-mono: 'Courier New', monospace;
  --slide-radius: 6px;
  --slide-shadow: 0 2px 12px rgba(0,0,0,0.08);
}`,

  dark: `
:root {
  --slide-bg: #0f0f0f;
  --slide-text: #e5e5e5;
  --slide-accent: #818cf8;
  --slide-muted: #9ca3af;
  --slide-font: 'Georgia', serif;
  --slide-mono: 'Courier New', monospace;
  --slide-radius: 6px;
  --slide-shadow: 0 2px 12px rgba(0,0,0,0.4);
}`,

  notion: `
:root {
  --slide-bg: #f7f6f3;
  --slide-text: #37352f;
  --slide-accent: #2eaadc;
  --slide-muted: #9b9a97;
  --slide-font: ui-sans-serif, system-ui, sans-serif;
  --slide-mono: 'SFMono-Regular', monospace;
  --slide-radius: 3px;
  --slide-shadow: none;
}`,

  terminal: `
:root {
  --slide-bg: #0d0d0d;
  --slide-text: #00ff41;
  --slide-accent: #00ff41;
  --slide-muted: #005f1a;
  --slide-font: 'Courier New', monospace;
  --slide-mono: 'Courier New', monospace;
  --slide-radius: 0px;
  --slide-shadow: 0 0 20px rgba(0,255,65,0.15);
}`,

  gradient: `
:root {
  --slide-bg: #1e1b4b;
  --slide-text: #f0f0ff;
  --slide-accent: #a78bfa;
  --slide-muted: #c4b5fd;
  --slide-font: 'Georgia', serif;
  --slide-mono: 'Courier New', monospace;
  --slide-radius: 8px;
  --slide-shadow: 0 4px 24px rgba(0,0,0,0.3);
}`,
};

export const BUILT_IN_THEME_NAMES = Object.keys(BUILT_IN_THEMES) as Array<
  keyof typeof BUILT_IN_THEMES
>;

export const FALLBACK_THEME = 'light';
