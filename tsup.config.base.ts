import { defineConfig } from 'tsup';

export const baseConfig = defineConfig({
  format: ['esm'],
  clean: true,
  minify: true,
  dts: true,
  sourcemap: false,
  splitting: false,
});
