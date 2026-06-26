import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import type { Root } from 'mdast';

export type ParsedAST = Root;

export function stripPositions(node: any): any {
  if (!node || typeof node !== 'object') {
    return node;
  }

  if (Array.isArray(node)) {
    return node.map(stripPositions);
  }

  const { position, ...rest } = node;
  const cleaned: any = {};
  for (const key in rest) {
    if (Object.prototype.hasOwnProperty.call(rest, key)) {
      cleaned[key] = stripPositions(rest[key]);
    }
  }

  return cleaned;
}

export function parseMarkdownToAST(markdown: string, options?: { clean?: boolean }): ParsedAST {
  const root = unified().use(remarkParse).use(remarkGfm).use(remarkMath).parse(markdown) as Root;

  if (options?.clean) {
    return stripPositions(root);
  }

  return root;
}

export function cleanAST(ast: Root): Root {
  return stripPositions(ast);
}

export interface ParserInterface {
  (markdown: string, options?: { clean?: boolean }): ParsedAST;
  (): {
    parse(markdown: string, options?: { clean?: boolean }): ParsedAST;
    clean(markdown: string): ParsedAST;
    strip(ast: Root): Root;
  };
  clean(markdown: string): ParsedAST;
  strip(ast: Root): Root;
}

const parser: ParserInterface = function (markdown?: string, options?: { clean?: boolean }): any {
  if (typeof markdown === 'string') {
    return parseMarkdownToAST(markdown, options);
  }

  return {
    parse(md: string, opts?: { clean?: boolean }) {
      return parseMarkdownToAST(md, opts);
    },
    clean(md: string) {
      return parseMarkdownToAST(md, { clean: true });
    },
    strip(ast: Root) {
      return stripPositions(ast);
    },
  };
} as any;

parser.clean = function (markdown: string) {
  return parseMarkdownToAST(markdown, { clean: true });
};

parser.strip = function (ast: Root) {
  return stripPositions(ast);
};

export default parser;
