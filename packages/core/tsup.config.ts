import { defineConfig } from 'tsup';
import { baseConfig } from '../../tsup.config.base';

export default defineConfig({
  ...baseConfig,
  entry: ['src/index.ts'],
  external: [
    'gray-matter',
    'mdast-util-to-string',
    'remark-gfm',
    'remark-parse',
    'unified',
    '@mindfiredigital/mdslide-shared',
  ],
});
