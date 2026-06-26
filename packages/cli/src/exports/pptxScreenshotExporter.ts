import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import pptxgen from 'pptxgenjs';
import { findChromeBinary } from './pdfExports.js';
import { ScreenshotPptxOptions } from '../types/index.js';
import { createStaticServer, getFreePort } from '../utils/index.js';

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.promises.access(p);
    return true;
  } catch {
    return false;
  }
}

function screenshotSlide(
  chromeBin: string,
  url: string,
  outputPng: string,
  width: number,
  height: number,
  timeoutMs: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--hide-scrollbars',
      '--run-all-compositor-stages-before-draw',
      '--virtual-time-budget=10000',
      `--window-size=${width},${height}`,
      `--screenshot=${outputPng}`,
      url,
    ];

    const child = spawn(chromeBin, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    const stderr: Buffer[] = [];

    child.stderr?.on('data', (d: Buffer) => stderr.push(d));

    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(`Screenshot timed out for: ${url}`));
    }, timeoutMs);

    child.on('close', async (code) => {
      clearTimeout(timer);
      const exists = code === 0 && (await fileExists(outputPng));
      if (exists) {
        resolve();
      } else {
        reject(
          new Error(
            `Chrome screenshot failed (code ${code}) for ${url}\n` +
              Buffer.concat(stderr).toString().slice(0, 500)
          )
        );
      }
    });

    child.on('error', (e) => {
      clearTimeout(timer);
      reject(e);
    });
  });
}

// inject slide selector script into the HTML
function injectSlideSelector(html: string): string {
  const css = `
<style>
  /* Disable all animations, transitions, and hide controls for screenshot mode */
  *, *::before, *::after {
    transition: none !important;
    animation: none !important;
    transition-duration: 0s !important;
    animation-duration: 0s !important;
  }
  .dokContainer, .progressBarContainer {
    display: none !important;
  }
  /* Ensure the active slide is instantly visible and positioned at 0,0 */
  .slide.active {
    opacity: 1 !important;
    transform: none !important;
    display: flex !important;
  }
  .slide:not(.active) {
    opacity: 0 !important;
    display: none !important;
  }
  /* Enforce fragment visibility in screenshots */
  .fragment {
    opacity: 1 !important;
  }
</style>
`;

  const script = `
<script>
(function() {
  var idx = parseInt(new URLSearchParams(location.search).get('slide') || '0', 10);
  
  function activate() {
    var slides = document.querySelectorAll('.slide');
    if (!slides.length) return;
    idx = Math.max(0, Math.min(idx, slides.length - 1));
    slides.forEach(function(s, i) {
      if (i === idx) {
        s.classList.add('active');
        s.classList.remove('past');
      } else {
        s.classList.remove('active');
        s.classList.add('past');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activate);
  } else {
    activate();
  }
})();
</script>`;

  // Inject right before </head>
  return html.replace('</head>', `${css}\n${script}\n</head>`);
}

export async function compileToScreenshotPptx(
  html: string,
  slideCount: number,
  outputPath: string,
  opts: ScreenshotPptxOptions = {}
): Promise<void> {
  const chromeBin = opts.chromePath ?? (await findChromeBinary());
  if (!chromeBin) {
    throw new Error(
      'Screenshot PPTX export requires Google Chrome or Chromium.\n' +
        '  → Install Chrome/Chromium, or set CHROME_PATH environment variable.'
    );
  }
  const timeoutMs = opts.timeoutMs ?? 15_000;
  const width = opts.width ?? 1920;
  const height = opts.height ?? 1080;

  const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'mdslide-pptx-'));
  const cleanup = async () => {
    try {
      await fs.promises.rm(tmpDir, { recursive: true, force: true });
    } catch {}
  };

  const modifiedHtml = injectSlideSelector(html);

  // Start local HTTP server directly out of system RAM memory
  const serverPort = await getFreePort();
  const server = createStaticServer(() => modifiedHtml, opts.baseDir ?? process.cwd());

  await new Promise<void>((resolve, reject) => {
    server.listen(serverPort, '127.0.0.1', () => resolve());
    server.once('error', reject);
  });

  const baseUrl = `http://127.0.0.1:${serverPort}`;
  const pngPaths: string[] = [];

  try {
    // Screenshot each slide sequentially to avoid CPU/resource overload
    for (let i = 0; i < slideCount; i++) {
      const pngPath = path.join(tmpDir, `slide-${i}.png`);
      const url = `${baseUrl}/?slide=${i}`;
      pngPaths.push(pngPath);

      await screenshotSlide(chromeBin, url, pngPath, width, height, timeoutMs);
    }
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }

  try {
    // Build PPTX with screenshots as full-bleed images
    const pptx = new (pptxgen as any)();
    pptx.layout = 'LAYOUT_WIDE';

    for (let i = 0; i < pngPaths.length; i++) {
      const pngPath = pngPaths[i]!;
      if (!(await fileExists(pngPath))) continue;

      const slide = pptx.addSlide();
      slide.addImage({
        path: pngPath,
        x: 0,
        y: 0,
        w: '100%',
        h: '100%',
      });
    }

    await fs.promises.mkdir(path.dirname(path.resolve(outputPath)), { recursive: true });
    await pptx.writeFile({ fileName: path.resolve(outputPath) });
  } finally {
    await cleanup();
  }
}
