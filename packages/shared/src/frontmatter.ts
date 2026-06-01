import matter from 'gray-matter';
import { FrontmatterResult } from './interface/index.js';

export function parseFrontmatter(markdown: string): FrontmatterResult {
  try {
    const { data, content } = matter(markdown);
    return {
      meta: data || {},
      content,
    };
  } catch (err) {
    throw new Error(
      `Failed to parse frontmatter: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}
