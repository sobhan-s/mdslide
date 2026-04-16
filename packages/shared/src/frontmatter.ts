import matter from 'gray-matter';

export function parseFrontmatter(md: string) {
  const { data, content } = matter(md);

  return {
    meta: data || {},
    content,
  };
}
