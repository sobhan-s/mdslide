export const WATCH_CONFIG = {
  PORT_SCAN_RANGE: 20,
  DEBOUNCE_DELAY_MS: 80,
  SSE_HEARTBEAT_INTERVAL_MS: 15_000,
  LIVE_RELOAD_PATH: '/~live-reload',
  PORT: 3500,
} as const;

export const WATCH_MESSAGES = {
  SPINNER_START: (filename: string) => `Compiling ${filename}`,
  SPINNER_READY: 'Ready',
  SPINNER_FAIL: 'Compilation failed — showing error overlay',
  SERVER_STOPPED: 'Server stopped.',
  CHANGE_DETECTED: 'Change detected — recompiling...',
  RECOMPILE_SUCCESS: (slideCount: number) =>
    `Recompiled — ${slideCount} slide${slideCount !== 1 ? 's' : ''}`,
  WATCHING_FILE: (relativePath: string) => `Watching ${relativePath}`,
} as const;

export const ERROR_OVERLAY_TEMPLATE = (
  escapedMessage: string,
  hint?: string
) => `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: ui-monospace, monospace;
    background: #0f0f0f; color: #f5f5f5;
    display: flex; align-items: center; justify-content: center;
    min-height: 100vh; padding: 2rem;
  }
  .card {
    background: #1a1a1a; border: 1px solid #e05252;
    border-radius: 10px; padding: 2rem; max-width: 680px; width: 100%;
  }
  .title { color: #e05252; font-size: 1rem; font-weight: 600; margin-bottom: .75rem; }
  .message { color: #f0f0f0; font-size: .9rem; line-height: 1.6; }
  .hint { color: #9ca3af; font-size: .85rem; margin-top: 1rem; }
  .hint span { color: #60b4ff; }
</style>
</head><body>
<div class="card">
  <div class="title">⚠ Compilation Error</div>
  <div class="message">${escapedMessage}</div>
  ${hint ? `<div class="hint">→ <span>${hint}</span></div>` : ''}
</div>
<script>
const es = new EventSource('${WATCH_CONFIG.LIVE_RELOAD_PATH}');
es.onmessage = (e) => { if (e.data === 'reload') location.reload(); };
</script>
</body></html>`;
