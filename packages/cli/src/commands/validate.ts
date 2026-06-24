import fs from 'fs';
import path from 'path';
import { Logger } from '../logger/index.js';
import { InputNotFoundError, ValidationError } from '../middleware/errors.js';
import type { ValidateOptions, ValidationIssue } from '../types/index.js';
import {
  COLORS,
  STYLES,
  VALIDATION_MESSAGES,
  VALIDATION_RULES,
  VALID_THEMES,
  VALID_LAYOUTS,
  SUPPORTED_LANGS,
} from '../constants/index.js';
import { ICONS } from '../utils/index.js';
import { parseFrontmatter } from '@mindfiredigital/mdslide-shared';

// Rules for the validate slides
async function validateSlides(markdown: string, filePath?: string): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];

  // 1. Parse Frontmatter
  let frontmatterContent = markdown;
  let defaultOverflow: string | undefined;
  try {
    const { meta, content } = parseFrontmatter(markdown);
    frontmatterContent = content;
    if (meta.overflow && typeof meta.overflow === 'string') {
      defaultOverflow = meta.overflow.toLowerCase();
    }

    // Validate Frontmatter keys
    if (meta.theme !== undefined) {
      if (typeof meta.theme !== 'string') {
        issues.push({
          type: 'warning',
          ...VALIDATION_MESSAGES.INVALID_THEME(''),
        });
      } else {
        const themeLower = meta.theme.toLowerCase();
        if (!(VALID_THEMES as readonly string[]).includes(themeLower)) {
          issues.push({
            type: 'warning',
            ...VALIDATION_MESSAGES.INVALID_THEME(meta.theme),
          });
        }
      }
    }
  } catch (err: any) {
    issues.push({
      type: 'error',
      ...VALIDATION_MESSAGES.INVALID_FRONTMATTER(
        err.message || 'Check your YAML syntax in the frontmatter block.'
      ),
    });
    // Strip frontmatter manually to continue validation of slides
    frontmatterContent = markdown.replace(/^---[\r\n][\s\S]*?[\r\n]---[\r\n]?/, '');
  }

  // 2. Split into slides
  const slides = frontmatterContent.split(/\n---\n/);

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
    const hasOverflowSplit =
      defaultOverflow === 'split' ||
      lines.some((l) => /^<!--\s*overflow:\s*split\s*-->$/i.test(l.trim()));

    if (!hasOverflowSplit && lines.length > VALIDATION_RULES.MAX_LINES_PER_SLIDE) {
      issues.push({
        type: 'warning',
        slide: slideNo,
        ...VALIDATION_MESSAGES.OVERFLOW(lines.length),
      });
    }

    // Code fence checks (counting and language validation)
    const codeFences = (slide.match(/^```/gm) ?? []).length;
    if (codeFences % 2 !== 0) {
      issues.push({
        type: 'error',
        slide: slideNo,
        ...VALIDATION_MESSAGES.UNCLOSED_CODE_FENCE,
      });
    }

    let inCodeBlock = false;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        if (inCodeBlock) {
          const lang = trimmed.slice(3).trim();
          if (lang !== '') {
            // Check if language tag is supported
            if (!(SUPPORTED_LANGS as readonly string[]).includes(lang.toLowerCase())) {
              issues.push({
                type: 'warning',
                slide: slideNo,
                ...VALIDATION_MESSAGES.UNSUPPORTED_LANG(lang),
              });
            }
          }
        }
      }
    }

    // Speaker notes validation
    let isInsideNotes = false;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === '<!-- notes -->') {
        if (isInsideNotes) {
          issues.push({
            type: 'warning',
            slide: slideNo,
            ...VALIDATION_MESSAGES.NESTED_NOTES,
          });
        }
        isInsideNotes = true;
      } else if (trimmed === '<!-- /notes -->') {
        if (!isInsideNotes) {
          issues.push({
            type: 'warning',
            slide: slideNo,
            ...VALIDATION_MESSAGES.STRAY_NOTES_CLOSE,
          });
        }
        isInsideNotes = false;
      }
    }
    if (isInsideNotes) {
      issues.push({
        type: 'warning',
        slide: slideNo,
        ...VALIDATION_MESSAGES.UNCLOSED_NOTES,
      });
    }

    // Layout override validation
    let layoutOverrideCount = 0;
    for (const line of lines) {
      const trimmed = line.trim();
      const layoutMatch = trimmed.match(/^<!--\s*layout:\s*(.*?)\s*-->$/);
      if (layoutMatch) {
        layoutOverrideCount++;
        if (layoutOverrideCount > 1) {
          issues.push({
            type: 'warning',
            slide: slideNo,
            ...VALIDATION_MESSAGES.MULTIPLE_LAYOUTS,
          });
        } else {
          const layoutName = layoutMatch[1]!.trim();
          if (!(VALID_LAYOUTS as readonly string[]).includes(layoutName)) {
            issues.push({
              type: 'warning',
              slide: slideNo,
              ...VALIDATION_MESSAGES.INVALID_LAYOUT(layoutName),
            });
          }
        }
      }
    }

    // Split layout validation
    const splitLines = lines.map((l) => l.trim());
    const splitIndices: number[] = [];
    for (let idx = 0; idx < splitLines.length; idx++) {
      if (splitLines[idx] === '::split::') {
        splitIndices.push(idx);
      }
    }
    if (splitIndices.length > 1) {
      issues.push({
        type: 'warning',
        slide: slideNo,
        ...VALIDATION_MESSAGES.MULTIPLE_SPLITS,
      });
    } else if (splitIndices.length === 1) {
      // Check for empty column: if there are no non-empty lines before or after split
      const beforeSplit = splitLines.slice(0, splitIndices[0]).filter((l) => l !== '');
      const afterSplit = splitLines.slice(splitIndices[0] + 1).filter((l) => l !== '');
      if (beforeSplit.length === 0 || afterSplit.length === 0) {
        issues.push({
          type: 'warning',
          slide: slideNo,
          ...VALIDATION_MESSAGES.EMPTY_SPLIT_COLUMN,
        });
      }
    }

    // Heading count check
    const h1Count = lines.filter((l) => /^#\s/.test(l.trim())).length;
    if (h1Count > 1) {
      issues.push({
        type: 'warning',
        slide: slideNo,
        ...VALIDATION_MESSAGES.MULTIPLE_H1,
      });
    }

    // Local image reference validation
    const imageRegex = /!\[.*?\]\(([^) ]+)(?:\s+".*?")?\)/g;
    let match;
    while ((match = imageRegex.exec(slide)) !== null) {
      const imgUrl = match[1]!;
      const isExternal = /^(https?:|data:|ftp:|\/\/)/i.test(imgUrl);
      if (!isExternal) {
        const baseDir = filePath ? path.dirname(path.resolve(filePath)) : process.cwd();
        const resolvedPath = path.resolve(baseDir, imgUrl);
        try {
          await fs.promises.access(resolvedPath);
        } catch {
          issues.push({
            type: 'warning',
            slide: slideNo,
            ...VALIDATION_MESSAGES.BROKEN_IMAGE(imgUrl),
          });
        }
      }
    }
  }

  return issues;
}

// Validate orchastrator
export async function validateCommand(inputFile: string, opts: ValidateOptions): Promise<void> {
  const log = new Logger(opts.logLevel ?? 'info');
  const absInput = path.resolve(inputFile);

  try {
    await fs.promises.access(absInput);
  } catch {
    const err = new InputNotFoundError(absInput);
    log.error(err);
    throw err;
  }

  const markdown = await fs.promises.readFile(absInput, 'utf8');
  const issues = await validateSlides(markdown, absInput);

  const errors = issues.filter((i) => i.type === 'error');
  const warnings = issues.filter((i) => i.type === 'warning');

  let strippedContent = markdown;
  try {
    const { content } = parseFrontmatter(markdown);
    strippedContent = content;
  } catch {
    strippedContent = markdown.replace(/^---[\r\n][\s\S]*?[\r\n]---[\r\n]?/, '');
  }
  const slideCount = strippedContent.split(/\n---\n/).length;

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
    throw new ValidationError();
  }
}
