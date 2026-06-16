export const SAMPLE_CONFIG = `import { defineConfig } from '@mindfiredigital/markdown-cli';

export default defineConfig({
  theme:  'light',
  output: 'dist/deck.html',
  watch: {
    port: 3500,
    open: true,
  },
});
`;
