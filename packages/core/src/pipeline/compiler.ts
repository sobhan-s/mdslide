import { type SlideDeck, parseFrontmatter } from '@mindfiredigital/mdslide-shared';
import { parseMarkdown } from '../parser/index.js';
import { normalizeSlides } from '../normalizer/mdAstToSlideBasedAst.js';
import { runTransforms } from '../transformers/index.js';
import { processOverflow } from '../overflow/index.js';
import { renderDeck } from '../renderer/html/index.js';
import { CompileOptions, CompileResult } from '../interfaces/index.js';

export class Compiler {
  compile(markdown: string, options: CompileOptions = {}): CompileResult {
    // Parse Markdown metadata frontmatter
    const { meta, content } = parseFrontmatter(markdown);

    // Parse Markdown string to MDAST and group by slide dividers
    const { slides: rawBlocks } = parseMarkdown(content);

    // Transform generic MDAST slide blocks to presentation Slide AST
    const normalizedSlides = normalizeSlides(rawBlocks);

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
