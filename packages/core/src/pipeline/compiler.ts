import { type SlideDeck, parseFrontmatter } from '@mindfiredigital/mdslide-shared';
import { parseMarkdown } from '../parser/index.js';
import { normalizeSlides } from '../normalizer/mdAstToSlideBasedAst.js';
import { runTransforms } from '../transformers/index.js';
import { processOverflow } from '../overflow/index.js';
import { renderDeck } from '../renderer/html/index.js';
import { CompileOptions, CompileResult } from '../interfaces/index.js';

// Safe Formatter Parser
function safeParseFrontmatter(markdown: string): ReturnType<typeof parseFrontmatter> {
  try {
    return parseFrontmatter(markdown);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(
      `[mdslide] Warning: Failed to parse frontmatter   falling back to defaults.\n` +
        `  Reason: ${message}\n` +
        `  Tip: Check your YAML block between the --- markers at the top of the file.`
    );
    const stripped = markdown.replace(/^---[\r\n][\s\S]*?[\r\n]---[\r\n]?/, '');
    return { meta: {}, content: stripped };
  }
}

// Compiler
export class Compiler {
  compile(markdown: string, options: CompileOptions = {}): CompileResult {
    // Parse frontmatter with error boundary   never crashes on bad YAML
    const { meta, content } = safeParseFrontmatter(markdown);

    // Parse Markdown string to MDAST and group by slide dividers
    const { slides: rawBlocks } = parseMarkdown(content);

    // Transform generic MDAST slide blocks to presentation Slide AST
    const normalizedSlides = normalizeSlides(rawBlocks, meta);

    // Run AST transforms
    const transformedSlides = runTransforms(normalizedSlides);

    // Process Visual Overflow & Auto-Splitting
    const slides = processOverflow(transformedSlides);

    // Render Slide AST model into completed HTML
    const deck: SlideDeck = { meta, slides };
    const html = renderDeck(deck, options);

    return { meta, slides, html };
  }
}
