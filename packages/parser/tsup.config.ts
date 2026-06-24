import { defineConfig } from 'tsup';
import { baseConfig } from '../../tsup.config.base';

export default defineConfig({
  ...baseConfig,
  entry: ['src/index.ts', 'src/cli.ts'],
  external: ['remark-gfm', 'remark-parse', 'unified'],
  dts: true,
});
