import fs from 'fs';
import path from 'path';
import { Logger } from '../logger/index.js';
import { Spinner } from '../ui/spinner.js';
import { InputNotFoundError, InvalidFormatError, CompileError } from '../middleware/errors.js';
import type { CompileOptions, OutputFormat } from '../types/index.js';
import { RELOAD_SCRIPT } from '../script/reloadScript.js';
import { COMPILE_CONFIG, COMPILE_MESSAGES } from '../constants/index.js';
import { compileToPdf } from '../exports/pdfExports.js';
import { compileToScreenshotPptx, compileToEditablePptx } from '../exports/pptxExports.js';
import type { Compiler as CompilerType, CompileResult } from '@mindfiredigital/mdslide-core';
import type { Slide } from '@mindfiredigital/mdslide-shared';

// format detection (pdf, pptx, html)
function detectFormat(
  outputFile: string | undefined,
  formatFlag: string | undefined
): OutputFormat {
  if (formatFlag) {
    const f = formatFlag.toLowerCase() as OutputFormat;
    if (!COMPILE_CONFIG.SUPPORTED_FORMATS.includes(f)) throw new InvalidFormatError(formatFlag);
    return f;
  }
  if (outputFile) {
    const ext = path.extname(outputFile).toLowerCase();
    if (ext === '.pdf') return 'pdf';
    if (ext === '.pptx') return 'pptx';
  }
  return COMPILE_CONFIG.DEFAULT_FORMAT;
}

// Core compile
export async function runCompile(
  inputFile: string,
  opts: CompileOptions,
  log: Logger,
  options?: { injectReload?: boolean }
): Promise<{
  html: string;
  slideCount: number;
  warnings: string[];
  slides: Slide[];
  meta: Record<string, unknown>;
}> {
  try {
    await fs.promises.access(inputFile);
  } catch {
    throw new InputNotFoundError(inputFile);
  }

  let compilerInstance: CompilerType;
  try {
    const core = await import('@mindfiredigital/mdslide-core');
    compilerInstance = new core.Compiler();
  } catch {
    throw new CompileError(COMPILE_MESSAGES.CORE_NOT_FOUND, {});
  }

  const markdown = await fs.promises.readFile(inputFile, 'utf8');
  let result: CompileResult;

  try {
    result = compilerInstance.compile(markdown, { theme: opts.theme });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new CompileError(message, { file: inputFile });
  }

  let html: string = result.html;
  if (options?.injectReload) {
    html = html.replace('</body>', `${RELOAD_SCRIPT}\n</body>`);
  }

  const slides = result.slides ?? [];
  const meta = result.meta ?? {};
  const slideCount = result.slides?.length ?? 0;
  const warnings = (result as any).warnings ?? [];

  return { html, meta, slides, slideCount, warnings };
}

// Compiler the commands
export async function compileCommand(inputFile: string, opts: CompileOptions): Promise<void> {
  const log = new Logger(opts.logLevel ?? 'info');
  const spinner = new Spinner(log);

  const format = detectFormat(opts.output, opts.format);
  const outputFile = opts.output ?? `output.${format}`;
  const absInput = path.resolve(inputFile);
  const absOutput = path.resolve(outputFile);

  spinner.start(COMPILE_MESSAGES.SPINNER_START(path.basename(absInput), format));

  let html: string;
  let slideCount: number;
  let warnings: string[];
  let deck: { slides: Slide[]; meta: Record<string, unknown> };

  try {
    const compileResult = await runCompile(absInput, opts, log);
    html = compileResult.html;
    slideCount = compileResult.slideCount;
    warnings = compileResult.warnings;
    deck = { slides: compileResult.slides, meta: compileResult.meta };
  } catch (err) {
    spinner.fail();
    log.error(err);
    throw err;
  }

  try {
    if (format === 'html') {
      await fs.promises.mkdir(path.dirname(absOutput), { recursive: true });
      await fs.promises.writeFile(absOutput, html);
    } else if (format === 'pdf') {
      spinner.update('Launching Chrome for PDF export...');
      await compileToPdf(html, absOutput, {
        chromePath: process.env['CHROME_PATH'],
        timeoutMs: opts.pdfTimeoutMs ?? 30_000,
        baseDir: path.dirname(path.resolve(inputFile)),
      });
    } else if (format === 'pptx') {
      const pptxMode = opts.pptxMode ?? 'screenshot';
      spinner.update(`Building PPTX (${pptxMode} mode)...`);
      await fs.promises.mkdir(path.dirname(absOutput), { recursive: true });
      if (pptxMode === 'editable') {
        await compileToEditablePptx(deck, absOutput, {
          theme: opts.theme,
          baseDir: path.dirname(path.resolve(inputFile)),
        });
      } else {
        await compileToScreenshotPptx(html, slideCount, absOutput, {
          theme: opts.theme,
          baseDir: path.dirname(path.resolve(inputFile)),
        });
      }
    }
  } catch (err) {
    spinner.fail();
    log.error(err);
    throw err;
  }

  spinner.succeed(
    COMPILE_MESSAGES.SUCCESS_SUMMARY(
      path.relative(process.cwd(), absOutput),
      slideCount,
      warnings.length
    )
  );

  if (warnings.length) {
    for (const w of warnings) log.warn(w);
  }

  if (opts.open) {
    const { default: open } = await import('open').catch(() => ({ default: null }));
    if (open) open(absOutput).catch(() => {});
  }
}
