import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { Logger } from '../logger/index.js';
import { Spinner } from '../ui/spinner.js';
import {
  InputNotFoundError,
  InvalidFormatError,
  ChromeNotFoundError,
  CompileError,
} from '../middleware/errors.js';
import type { CompileOptions, OutputFormat } from '../types/index.js';
import { RELOAD_SCRIPT } from '../script/reloadScript.js';
import { COMPILE_CONFIG, COMPILE_MESSAGES } from '../constants/index.js';

// fixme: Chrome binary detection , current for testin purpost i use only chrome linux paths , in future add all hardcore path and add --browserpath "path"
function findChromeBinary(): string {
  // Used systemic candidate collection constant here
  for (const bin of COMPILE_CONFIG.CHROME_CANDIDATES) {
    try {
      execSync(`which ${bin} > /dev/null 2>&1`);
      return bin;
    } catch {
      // not found
    }
  }
  throw new ChromeNotFoundError();
}

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
): Promise<{ html: string; slideCount: number; warnings: string[] }> {
  if (!fs.existsSync(inputFile)) throw new InputNotFoundError(inputFile);

  let Compiler: any;
  try {
    const core = await import('@mindfiredigital/mdslide-core');
    Compiler = core.Compiler;
  } catch {
    throw new CompileError(COMPILE_MESSAGES.CORE_NOT_FOUND, {});
  }

  const markdown = fs.readFileSync(inputFile, 'utf8');
  let result: any;

  try {
    const compiler = new Compiler();
    result = compiler.compile(markdown, { theme: opts.theme });
  } catch (err: any) {
    throw new CompileError(err.message, { file: inputFile });
  }

  let html: string = result.html;
  if (options?.injectReload) {
    html = html.replace('</body>', `${RELOAD_SCRIPT}\n</body>`);
  }

  const slideCount = result.slides?.length ?? 0;
  const warnings = result.warnings ?? [];

  return { html, slideCount, warnings };
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

  try {
    ({ html, slideCount, warnings } = await runCompile(absInput, opts, log));
  } catch (err) {
    spinner.fail();
    log.error(err);
    process.exit(1);
  }

  try {
    if (format === 'html') {
      fs.mkdirSync(path.dirname(absOutput), { recursive: true });
      fs.writeFileSync(absOutput, html);
    } else if (format === 'pdf') {
      const tempPath = path.join(path.dirname(absOutput), `.mdslide-tmp-${Date.now()}.html`);
      fs.writeFileSync(tempPath, html);

      try {
        const chrome = findChromeBinary();
        spinner.update(COMPILE_MESSAGES.SPINNER_LAUNCHING_CHROME);
        // Used unified binary invocation flags constant here
        execSync(
          `"${chrome}" ${COMPILE_CONFIG.CHROME_FLAGS} ` +
            `--print-to-pdf="${absOutput}" "${tempPath}"`,
          { stdio: 'ignore' }
        );
      } finally {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      }
    }
  } catch (err) {
    spinner.fail();
    log.error(err);
    process.exit(1);
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
