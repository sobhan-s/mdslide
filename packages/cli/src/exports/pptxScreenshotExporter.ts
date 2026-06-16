import fs from 'fs';
import path from 'path';
import http from 'http';
import net from 'net';
import os from 'os';
import { spawn } from 'child_process';
import pptxgen from 'pptxgenjs';
import { findChromeBinary } from './pdfExports.js';
import { ScreenshotPptxOptions } from '../types/index.js';

function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.listen(0, () => {
      const addr = s.address() as net.AddressInfo;
      s.close(() => resolve(addr.port));
    });
    s.on('error', reject);
  });
}

// Local HTTP server for serving slide HTML and its static assets
function serveHtml(html: string, port: number, baseDir: string): Promise<() => void> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const urlPath = req.url ? req.url.split('?')[0] : '/';

      if (urlPath === '/' || urlPath === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
      }

      // Try serving static files relative to baseDir
      const filePath = path.join(baseDir, decodeURIComponent(urlPath));
      fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
          return;
        }

        let contentType = 'application/octet-stream';
        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.css') contentType = 'text/css';
        else if (ext === '.js') contentType = 'application/javascript';
        else if (ext === '.json') contentType = 'application/json';
        else if (ext === '.png') contentType = 'image/png';
        else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.gif') contentType = 'image/gif';
        else if (ext === '.svg') contentType = 'image/svg+xml';
        else if (ext === '.woff') contentType = 'font/woff';
        else if (ext === '.woff2') contentType = 'font/woff2';
        else if (ext === '.ttf') contentType = 'font/ttf';

        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
      });
    });

    server.listen(port, '127.0.0.1', () => {
      resolve(() => server.close());
    });
    server.once('error', reject);
  });
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
      '--virtual-time-budget=5000',
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

    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0 && fs.existsSync(outputPng)) {
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
  const chromeBin = opts.chromePath ?? findChromeBinary();
  if (!chromeBin) {
    throw new Error(
      'Screenshot PPTX export requires Google Chrome or Chromium.\n' +
        '  → Install Chrome/Chromium, or set CHROME_PATH environment variable.'
    );
  }
  const timeoutMs = opts.timeoutMs ?? 15_000;
  const width = opts.width ?? 1920;
  const height = opts.height ?? 1080;

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mdslide-pptx-'));
  const cleanup = () => {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  };

  try {
    const modifiedHtml = injectSlideSelector(html);

    // Start local HTTP server directly out of system RAM memory
    const serverPort = await getFreePort();
    const stopServer = await serveHtml(modifiedHtml, serverPort, opts.baseDir ?? process.cwd());
    const baseUrl = `http://127.0.0.1:${serverPort}`;

    const pngPaths: string[] = [];

    // Screenshot each slide sequentially to avoid CPU/resource overload
    for (let i = 0; i < slideCount; i++) {
      const pngPath = path.join(tmpDir, `slide-${i}.png`);
      const url = `${baseUrl}/?slide=${i}`;
      pngPaths.push(pngPath);

      await screenshotSlide(chromeBin, url, pngPath, width, height, timeoutMs);
    }

    stopServer();

    // Build PPTX with screenshots as full-bleed images
    const pptx = new (pptxgen as any)();
    pptx.layout = 'LAYOUT_WIDE';

    for (let i = 0; i < pngPaths.length; i++) {
      const pngPath = pngPaths[i]!;
      if (!fs.existsSync(pngPath)) continue;

      const slide = pptx.addSlide();
      slide.addImage({
        path: pngPath,
        x: 0,
        y: 0,
        w: '100%',
        h: '100%',
      });
    }

    fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
    await pptx.writeFile({ fileName: path.resolve(outputPath) });
  } finally {
    cleanup();
  }
}
