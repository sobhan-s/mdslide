import fs from 'fs';
import path from 'path';
import { Logger } from '../logger/index.js';
import { InputNotFoundError } from '../middleware/errors.js';
import type { ValidateOptions, ValidationIssue } from '../types/index.js';
import { COLORS, STYLES, VALIDATION_MESSAGES, VALIDATION_RULES } from '../constants/index.js';
import { ICONS } from '../utils/index.js';

// Rules for the validate slides
function validateSlides(markdown: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const slides = markdown.split(/\n---\n/);

  if (slides.length === 1) {
    issues.push({
      type: 'warning',
      ...VALIDATION_MESSAGES.NO_SEPARATORS,
    });
  }

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i]!;
    const slideNo = i + 1;
    const lines = slide.trim().split('\n');

    if (slide.trim() === '') {
      issues.push({
        type: 'warning',
        slide: slideNo,
        ...VALIDATION_MESSAGES.EMPTY_SLIDE,
      });
    }

    const hasHeading = lines.some((l) => /^#{1,6}\s/.test(l));
    if (!hasHeading && slide.trim() !== '') {
      issues.push({
        type: 'warning',
        slide: slideNo,
        ...VALIDATION_MESSAGES.NO_HEADING,
      });
    }

    // Used rule limit constant here
    if (lines.length > VALIDATION_RULES.MAX_LINES_PER_SLIDE) {
      issues.push({
        type: 'warning',
        slide: slideNo,
        ...VALIDATION_MESSAGES.OVERFLOW(lines.length),
      });
    }

    const codeFences = (slide.match(/^```/gm) ?? []).length;
    if (codeFences % 2 !== 0) {
      issues.push({
        type: 'error',
        slide: slideNo,
        ...VALIDATION_MESSAGES.UNCLOSED_CODE_FENCE,
      });
    }
  }

  return issues;
}

// Validate orchastrator
export async function validateCommand(inputFile: string, opts: ValidateOptions): Promise<void> {
  const log = new Logger(opts.logLevel ?? 'info');
  const absInput = path.resolve(inputFile);

  if (!fs.existsSync(absInput)) {
    log.error(new InputNotFoundError(absInput));
    process.exit(1);
  }

  const markdown = fs.readFileSync(absInput, 'utf8');
  const issues = validateSlides(markdown);

  const errors = issues.filter((i) => i.type === 'error');
  const warnings = issues.filter((i) => i.type === 'warning');

  const slideCount = markdown.split(/\n---\n/).length;

  log.raw('');

  if (issues.length === 0) {
    log.success(VALIDATION_MESSAGES.LOG_SUCCESS(path.basename(absInput), slideCount));
    log.raw('');
    return;
  }

  for (const issue of issues) {
    const loc = issue.slide != null ? `  (slide ${issue.slide})` : '';
    if (issue.type === 'error') {
      log.raw(
        `  ${ICONS.error}  ${STYLES.bold}${issue.message}${STYLES.reset}${COLORS.grey}${loc}${STYLES.reset}`
      );
    } else {
      log.raw(`  ${ICONS.warn}  ${issue.message}${COLORS.grey}${loc}${STYLES.reset}`);
    }
    if (issue.hint) {
      log.raw(`     ${ICONS.step} ${COLORS.cyan}${issue.hint}${STYLES.reset}`);
    }
  }

  log.raw('');
  log.raw(
    `  ${COLORS.grey}${slideCount} slides - ${errors.length} error${errors.length !== 1 ? 's' : ''}, ${warnings.length} warning${warnings.length !== 1 ? 's' : ''}${STYLES.reset}`
  );
  log.raw('');

  if (errors.length > 0 || (opts.strict && warnings.length > 0)) {
    process.exit(1);
  }
}
