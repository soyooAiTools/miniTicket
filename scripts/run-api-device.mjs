import { spawn } from 'node:child_process';

const host = process.env.HOST ?? '0.0.0.0';
const port = process.env.PORT ?? '3100';
const corepackArgs = ['pnpm', '--filter', 'api', 'dev'];
const command = process.platform === 'win32' ? 'cmd.exe' : 'corepack';
const args =
  process.platform === 'win32' ? ['/d', '/s', '/c', 'corepack', ...corepackArgs] : corepackArgs;

console.log(`[device] Starting API on ${host}:${port}`);

const child = spawn(command, args, {
  cwd: process.cwd(),
  env: {
    ...process.env,
    HOST: host,
    PORT: port,
  },
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
