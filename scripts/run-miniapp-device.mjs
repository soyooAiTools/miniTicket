import { spawn } from 'node:child_process';

import { resolveLanIp } from './resolve-lan-ip.mjs';

const operation = process.argv[2] === 'build' ? 'build' : 'dev';
const deviceHost = process.env.TARO_APP_DEVICE_HOST ?? resolveLanIp();
const apiPort = process.env.TARO_APP_DEVICE_API_PORT ?? '3100';
const apiBaseUrl =
  process.env.TARO_APP_API_BASE_URL ?? `http://${deviceHost}:${apiPort}/api`;
const command = process.platform === 'win32' ? 'cmd.exe' : 'corepack';

console.log(`[device] Using API base URL: ${apiBaseUrl}`);
console.log('[device] Make sure the phone and this computer are on the same LAN.');

const corepackArgs = ['pnpm', '--filter', 'miniapp', 'exec', 'taro', 'build', '--type', 'weapp'];

if (operation === 'dev') {
  corepackArgs.push('--watch');
}

corepackArgs.push('--mode', 'development');

const args =
  process.platform === 'win32'
    ? ['/d', '/s', '/c', 'corepack', ...corepackArgs]
    : corepackArgs;

const child = spawn(command, args, {
  cwd: process.cwd(),
  env: {
    ...process.env,
    NODE_ENV: 'development',
    TARO_APP_API_BASE_URL: apiBaseUrl,
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
