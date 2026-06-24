import http from 'http';
import fs from 'fs';
import path from 'path';
import net from 'net';

export function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.listen(0, () => {
      const addr = s.address() as net.AddressInfo;
      s.close(() => resolve(addr.port));
    });
    s.on('error', reject);
  });
}

export function createStaticServer(
  getHtml: () => string,
  baseDir: string,
  liveReloadPath?: string,
  liveReloadHandler?: (req: http.IncomingMessage, res: http.ServerResponse) => void
): http.Server {
  return http.createServer((req, res) => {
    const urlPath = req.url ? req.url.split('?')[0] : '/';

    // Handshake for live reload SSE
    if (liveReloadPath && urlPath === liveReloadPath && liveReloadHandler) {
      liveReloadHandler(req, res);
      return;
    }

    // Default route
    if (urlPath === '/' || urlPath === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(getHtml());
      return;
    }

    // Delay route to hold back Chrome's load event for PDF/PPTX capture of async components
    if (urlPath === '/delay-load-event.png') {
      setTimeout(() => {
        const buf = Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
          'base64'
        );
        res.writeHead(200, {
          'Content-Type': 'image/png',
          'Content-Length': buf.length.toString(),
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        });
        res.end(buf);
      }, 3000); // 3 seconds delay
      return;
    }

    // Resolve static files safely to prevent path traversal
    const safeBaseDir = path.resolve(baseDir);
    const decodedUrl = decodeURIComponent(urlPath);
    const filePath = path.join(safeBaseDir, decodedUrl);

    // Strict path boundary validation to block traversal (e.g. ../../etc/passwd)
    if (!filePath.startsWith(safeBaseDir)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden');
      return;
    }

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
}
