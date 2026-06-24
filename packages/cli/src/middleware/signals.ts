type Cleanup = () => void | Promise<void>;

const handlers: Cleanup[] = [];
let registered = false;

export function onShutdown(fn: Cleanup): void {
  handlers.push(fn);
  if (!registered) {
    registered = true;
    const run = async (signal: string) => {
      process.stdout.write('\n');
      for (const h of handlers) {
        try {
          await h();
        } catch {
          /* ignore cleanup errors */
        }
      }
      process.exit(signal === 'SIGINT' ? 130 : 143);
    };
    process.on('SIGINT', () => run('SIGINT'));
    process.on('SIGTERM', () => run('SIGTERM'));
  }
}
