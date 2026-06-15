import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { execFileSync } from 'child_process';
import { PdfExportOptions } from '../types/index.js';
import { PDF_CONFIG, PDF_MESSAGES } from '../constants/index.js';

export function findChromeBinary(): string | null {
  for (const bin of PDF_CONFIG.CHROME_CANDIDATES) {
    try {
      execFileSync(bin, ['--version'], { stdio: 'ignore' });
      return bin;
    } catch {}
  }
  return null;
}

export function exportToPdf(
  htmlPath: string,
  outputPath: string,
  opts: PdfExportOptions = {}
): Promise<void> {
  const timeoutMs = opts.timeoutMs ?? PDF_CONFIG.DEFAULT_TIMEOUT_MS;
  const chromeBin = opts.chromePath ?? findChromeBinary();

  if (!chromeBin) {
    return Promise.reject(new Error(PDF_MESSAGES.CHROME_NOT_FOUND));
  }

  const args = PDF_CONFIG.CHROME_ARGS(outputPath, htmlPath);

  return new Promise((resolve, reject) => {
    const child = spawn(chromeBin, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    const stderr: Buffer[] = [];

    child.stderr?.on('data', (chunk: Buffer) => stderr.push(chunk));

    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(PDF_MESSAGES.TIMEOUT_ERROR(timeoutMs)));
    }, timeoutMs);

    child.on('close', (code) => {
      clearTimeout(timer);

      if (code === 0) {
        if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
          reject(new Error(PDF_MESSAGES.EMPTY_OUTPUT_ERROR(outputPath)));
          return;
        }
        resolve();
        return;
      }

      const stderrText = Buffer.concat(stderr).toString().trim();
      reject(new Error(PDF_MESSAGES.CHROME_EXIT_ERROR(code, stderrText)));
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      reject(new Error(PDF_MESSAGES.START_FAILURE_ERROR(err.message, chromeBin)));
    });
  });
}

export async function compileToPdf(
  html: string,
  outputPath: string,
  opts: PdfExportOptions = {}
): Promise<void> {
  const dir = path.dirname(path.resolve(outputPath));
  const tempPath = path.join(dir, `.mdslide-tmp-${Date.now()}.html`);

  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(tempPath, html, 'utf8');

  try {
    await exportToPdf(tempPath, path.resolve(outputPath), opts);
  } finally {
    try {
      fs.unlinkSync(tempPath);
    } catch {}
  }
}
