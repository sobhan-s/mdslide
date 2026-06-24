export const BUILT_IN_THEMES: Record<string, string> = {
  // Light
  light: `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --slide-bg:       #ffffff;
  --slide-surface:  #f4f4f5;
  --slide-text:     #18181b;
  --slide-muted:    #71717a;
  --slide-accent:   #6366f1;
  --slide-accent2:  #a5b4fc;
  --slide-border:   #e4e4e7;
  --slide-font:     'Inter', system-ui, sans-serif;
  --slide-mono:     'JetBrains Mono', monospace;
  --slide-radius:   6px;
  --slide-shadow:   0 2px 16px rgba(0,0,0,0.07);
  --title-size:     3.6rem;
  --h2-size:        2.6rem;
  --h3-size:        1.8rem;
  --body-size:      1.35rem;
  --li-size:        1.3rem;
  --code-size:      1.1rem;
  --dok-bg:         rgba(255,255,255,0.88);
  --dok-border:     rgba(0,0,0,0.1);
  --progress-bg:    #e4e4e7;
}
body { background: #f4f4f5; }
.slide { background: #ffffff; }
.slide[data-type="title"] {
  background: linear-gradient(135deg, #eef2ff 0%, #ffffff 50%, #f0fdf4 100%);
}
.slide[data-type="title"] .slideTitle {
  font-size: 4rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.slideTitle::after {
  content: '';
  display: block;
  width: 3rem;
  height: 4px;
  background: var(--slide-accent);
  border-radius: 2px;
  margin-top: 1rem;
}
.slide[data-type="title"] .slideTitle::after { display: none; }
`,

  // DARK
  dark: `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --slide-bg:       #09090b;
  --slide-surface:  #18181b;
  --slide-text:     #fafafa;
  --slide-muted:    #a1a1aa;
  --slide-accent:   #818cf8;
  --slide-accent2:  #4f46e5;
  --slide-border:   #27272a;
  --slide-font:     'Inter', system-ui, sans-serif;
  --slide-mono:     'JetBrains Mono', monospace;
  --slide-radius:   6px;
  --slide-shadow:   0 4px 32px rgba(0,0,0,0.5);
  --title-size:     3.6rem;
  --h2-size:        2.6rem;
  --h3-size:        1.8rem;
  --body-size:      1.35rem;
  --li-size:        1.3rem;
  --code-size:      1.1rem;
  --dok-bg:         rgba(24,24,27,0.9);
  --dok-border:     rgba(255,255,255,0.1);
  --progress-bg:    rgba(255,255,255,0.1);
}
body { background: #000000; }
.slide { background: #09090b; }
.slide[data-type="title"] {
  background: radial-gradient(ellipse at 30% 40%, #1e1b4b 0%, #09090b 65%);
}
.slide[data-type="title"] .slideTitle {
  background: linear-gradient(135deg, #818cf8 0%, #c4b5fd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 4rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
}
.slideTitle::after {
  content: '';
  display: block;
  width: 3rem;
  height: 4px;
  background: var(--slide-accent);
  border-radius: 2px;
  margin-top: 1rem;
}
.slide[data-type="title"] .slideTitle::after { display: none; }
`,

  //  NOTION
  notion: `
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,700;1,400&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap');

:root {
  --slide-bg:       #ffffff;
  --slide-surface:  #f7f6f3;
  --slide-text:     #37352f;
  --slide-muted:    #9b9a97;
  --slide-accent:   #2eaadc;
  --slide-accent2:  #0b6e99;
  --slide-border:   #e9e9e7;
  --slide-font:     'Lora', Georgia, serif;
  --slide-mono:     'JetBrains Mono', monospace;
  --slide-radius:   3px;
  --slide-shadow:   none;
  --title-size:     3.6rem;
  --h2-size:        2.6rem;
  --h3-size:        1.8rem;
  --body-size:      1.35rem;
  --li-size:        1.3rem;
  --code-size:      1.05rem;
  --dok-bg:         rgba(255,255,255,0.9);
  --dok-border:     rgba(55,53,47,0.12);
  --progress-bg:    rgba(55,53,47,0.08);
}
body { background: #f7f6f3; }
.slide { background: #ffffff; border-left: none; }
.slide[data-type="title"] { background: #ffffff; }
.slideTitle {
  font-family: 'Lora', Georgia, serif;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.slideTitle::after {
  content: '';
  display: block;
  width: 2.5rem;
  height: 3px;
  background: var(--slide-accent);
  margin-top: 0.875rem;
}
.slide[data-type="title"] .slideTitle::after { display: none; }
.slideContent li::marker { color: var(--slide-accent); }
`,

  //  TERMINAL
  terminal: `
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');

:root {
  --slide-bg:       #0d0d0d;
  --slide-surface:  #161616;
  --slide-text:     #00ff41;
  --slide-muted:    #22c55e;
  --slide-accent:   #00ff41;
  --slide-accent2:  #00b32d;
  --slide-border:   rgba(0,255,65,0.15);
  --slide-font:     'JetBrains Mono', 'Courier New', monospace;
  --slide-mono:     'JetBrains Mono', 'Courier New', monospace;
  --slide-radius:   0px;
  --slide-shadow:   0 0 0 1px rgba(0,255,65,0.1);
  --title-size:     3.4rem;
  --h2-size:        2.4rem;
  --h3-size:        1.7rem;
  --body-size:      1.3rem;
  --li-size:        1.25rem;
  --code-size:      1.1rem;
  --dok-bg:         rgba(13,13,13,0.95);
  --dok-border:     rgba(0,255,65,0.2);
  --progress-bg:    rgba(0,255,65,0.08);
}
body {
  background: #0a0a0a;
  background-image: repeating-linear-gradient(
    0deg, transparent, transparent 2px,
    rgba(0,255,65,0.012) 2px, rgba(0,255,65,0.012) 4px
  );
}
.slide { background: #0d0d0d; }
.slide[data-type="title"] { background: #0d0d0d; }
.slideTitle {
  font-weight: 700;
  letter-spacing: 0.05em;
  text-shadow: 0 0 30px rgba(0,255,65,0.4);
}
.slideTitle::before { content: '> '; opacity: 0.5; }
.slideTitle::after { display: none; }
.slideContent li::before { color: var(--slide-accent); }
.slideContent a { color: var(--slide-accent); }
`,

  // gradient
  gradient: `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --slide-bg:       #0f0c29;
  --slide-surface:  #1a1548;
  --slide-text:     #f0eeff;
  --slide-muted:    #c4b5fd;
  --slide-accent:   #a78bfa;
  --slide-accent2:  #60a5fa;
  --slide-border:   rgba(167,139,250,0.2);
  --slide-font:     'Plus Jakarta Sans', system-ui, sans-serif;
  --slide-mono:     'JetBrains Mono', monospace;
  --slide-radius:   10px;
  --slide-shadow:   0 8px 40px rgba(99,102,241,0.25);
  --title-size:     3.6rem;
  --h2-size:        2.6rem;
  --h3-size:        1.8rem;
  --body-size:      1.35rem;
  --li-size:        1.3rem;
  --code-size:      1.1rem;
  --dok-bg:         rgba(15,12,41,0.8);
  --dok-border:     rgba(167,139,250,0.25);
  --progress-bg:    rgba(255,255,255,0.1);
}
body { background: #080617; }
.slide {
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #1a0533 100%);
}
.slide[data-type="title"] {
  background: linear-gradient(135deg, #0f0c29 0%, #1e1a5e 40%, #0f0c29 100%);
}
.slide[data-type="title"] .slideTitle {
  background: linear-gradient(135deg, #a78bfa 0%, #60a5fa 50%, #f0abfc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 4rem;
  font-weight: 800;
}
.slideTitle {
  font-weight: 700;
  background: linear-gradient(90deg, #a78bfa, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.slideTitle::after {
  content: '';
  display: block;
  width: 3rem;
  height: 4px;
  background: linear-gradient(90deg, #a78bfa, #60a5fa);
  border-radius: 2px;
  margin-top: 1rem;
}
.slide[data-type="title"] .slideTitle::after { display: none; }
`,

  // corporate
  corporate: `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400&display=swap');

:root {
  --slide-bg:       #ffffff;
  --slide-surface:  #f8fafc;
  --slide-text:     #0f172a;
  --slide-muted:    #64748b;
  --slide-accent:   #0ea5e9;
  --slide-accent2:  #0284c7;
  --slide-border:   #e2e8f0;
  --slide-font:     'Inter', system-ui, sans-serif;
  --slide-mono:     'JetBrains Mono', monospace;
  --slide-radius:   4px;
  --slide-shadow:   0 1px 8px rgba(0,0,0,0.06);
  --title-size:     3.4rem;
  --h2-size:        2.4rem;
  --h3-size:        1.7rem;
  --body-size:      1.35rem;
  --li-size:        1.3rem;
  --code-size:      1.05rem;
  --dok-bg:         rgba(255,255,255,0.92);
  --dok-border:     rgba(0,0,0,0.08);
  --progress-bg:    #e2e8f0;
}
body { background: #f1f5f9; }
.slide { background: #ffffff; }
.slide[data-type="title"] {
  background: linear-gradient(160deg, #0f172a 0%, #1e3a5f 100%);
  color: #ffffff;
}
.slide[data-type="title"] .slideTitle,
.slide[data-type="title"] .slideContent,
.slide[data-type="title"] .slideContent p {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
}
.slide[data-type="title"] .slideTitle {
  font-size: 3.8rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}
.slideTitle {
  font-weight: 700;
  letter-spacing: -0.02em;
  border-bottom: 3px solid var(--slide-accent);
  padding-bottom: 0.75rem;
}
.slideTitle::after { display: none; }
.slideContent li::marker { color: var(--slide-accent); }
`,

  // solarized
  solarized: `
@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,wght@0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@400&display=swap');

:root {
  --slide-bg:       #fdf6e3;
  --slide-surface:  #eee8d5;
  --slide-text:     #073642;
  --slide-muted:    #657b83;
  --slide-accent:   #268bd2;
  --slide-accent2:  #2aa198;
  --slide-border:   #d7ceb2;
  --slide-font:     'Source Serif 4', Georgia, serif;
  --slide-mono:     'JetBrains Mono', monospace;
  --slide-radius:   5px;
  --slide-shadow:   0 2px 12px rgba(7,54,66,0.08);
  --title-size:     3.4rem;
  --h2-size:        2.4rem;
  --h3-size:        1.7rem;
  --body-size:      1.35rem;
  --li-size:        1.3rem;
  --code-size:      1.05rem;
  --dok-bg:         rgba(253,246,227,0.9);
  --dok-border:     rgba(7,54,66,0.12);
  --progress-bg:    rgba(7,54,66,0.08);
}
body { background: #eee8d5; }
.slide { background: #fdf6e3; }
.slide[data-type="title"] { background: #073642; }
.slide[data-type="title"] .slideTitle {
  color: #fdf6e3 !important;
  -webkit-text-fill-color: #fdf6e3 !important;
  font-size: 3.8rem;
}
.slide[data-type="title"] .slideContent,
.slide[data-type="title"] .slideContent p {
  color: #93a1a1 !important;
}
.slideTitle {
  font-weight: 700;
  letter-spacing: -0.01em;
}
.slideTitle::after {
  content: '';
  display: block;
  width: 2.5rem;
  height: 3px;
  background: var(--slide-accent);
  margin-top: 0.875rem;
}
.slide[data-type="title"] .slideTitle::after {
  background: #586e75;
}
`,
};
