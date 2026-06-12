import { MdSlideConfig } from './types/index.js';
export { compileCommand } from './commands/compile.js';
export { watchCommand } from './commands/watch.js';
export { initCommand } from './commands/init.js';
export { validateCommand } from './commands/validate.js';
export { Logger } from './logger/index.js';
export { Spinner } from './ui/spinner.js';

export {
  MdSlideError,
  InputNotFoundError,
  InvalidFormatError,
  ChromeNotFoundError,
  PortInUseError,
  CompileError,
} from './middleware/errors.js';

export type {
  OutputFormat,
  LogLevel,
  CompileOptions,
  WatchOptions,
  InitOptions,
  ValidateOptions,
  CompileResult,
} from './types/index.js';

export function defineConfig(config: MdSlideConfig): MdSlideConfig {
  return config;
}
