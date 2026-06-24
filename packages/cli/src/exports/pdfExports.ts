import fs from 'fs';
import path from 'path';
import { spawn, execFile } from 'child_process';
import { promisify } from 'util';
import { PdfExportOptions } from '../types/index.js';
import { PDF_CONFIG, PDF_MESSAGES } from '../constants/index.js';
import { createStaticServer, getFreePort } from '../utils/index.js';

const execFilePromise = promisify(execFile);

export async function findChromeBinary(): Promise<string | null> {
  for (const bin of PDF_CONFIG.CHROME_CANDIDATES) {
    try {
      await execFilePromise(bin, ['--version']);
      return bin;
    } catch {}
  }
  return null;
}

export async function exportToPdf(
  url: string,
  outputPath: string,
  opts: PdfExportOptions = {}
): Promise<void> {
  const timeoutMs = opts.timeoutMs ?? PDF_CONFIG.DEFAULT_TIMEOUT_MS;
  const chromeBin = opts.chromePath ?? (await findChromeBinary());

  if (!chromeBin) {
    throw new Error(PDF_MESSAGES.CHROME_NOT_FOUND);
  }

  const args = PDF_CONFIG.CHROME_ARGS(outputPath, url);

  return new Promise((resolve, reject) => {
    const child = spawn(chromeBin, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    const stderr: Buffer[] = [];

    child.stderr?.on('data', (chunk: Buffer) => stderr.push(chunk));

    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error(PDF_MESSAGES.TIMEOUT_ERROR(timeoutMs)));
    }, timeoutMs);

    child.on('close', async (code) => {
      clearTimeout(timer);

      if (code === 0) {
        try {
          const stats = await fs.promises.stat(outputPath);
          if (stats.size === 0) {
            reject(new Error(PDF_MESSAGES.EMPTY_OUTPUT_ERROR(outputPath)));
            return;
          }
        } catch {
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
  const baseDir = opts.baseDir ?? path.dirname(path.resolve(outputPath));
  const port = await getFreePort();

  const server = createStaticServer(() => html, baseDir);

  await new Promise<void>((resolve, reject) => {
    server.listen(port, '127.0.0.1', () => resolve());
    server.once('error', reject);
  });

  const url = `http://127.0.0.1:${port}/`;

  try {
    await exportToPdf(url, path.resolve(outputPath), opts);
  } finally {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  }
}
