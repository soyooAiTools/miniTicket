import { join } from 'path';

import { loadRuntimeEnv } from './runtime-env';

describe('loadRuntimeEnv', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = {};
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('loads the workspace .env before prisma/.env and keeps existing env values', () => {
    const cwd = 'D:/miniTicket';
    const envPath = join(cwd, '.env');
    const prismaEnvPath = join(cwd, 'apps/api/prisma/.env');
    const readFileSync = jest.fn((targetPath: string) => {
      if (targetPath === envPath) {
        return [
          'JWT_SECRET=root-secret',
          'WECHAT_DEV_LOGIN_OPEN_ID="dev-openid"',
          'WECHAT_PLATFORM_PUBLIC_KEY_PEM="line-1\\nline-2"',
        ].join('\n');
      }

      if (targetPath === prismaEnvPath) {
        return [
          'DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ticketing_dev',
          'JWT_SECRET=prisma-secret',
        ].join('\n');
      }

      throw new Error(`Unexpected path ${targetPath}`);
    });
    const existsSync = jest.fn((targetPath: string) =>
      targetPath === envPath || targetPath === prismaEnvPath,
    );

    process.env.JWT_SECRET = 'preset-secret';

    const result = loadRuntimeEnv({
      cwd,
      existsSync,
      readFileSync,
    });

    expect(result).toEqual([envPath, prismaEnvPath]);
    expect(process.env.JWT_SECRET).toBe('preset-secret');
    expect(process.env.DATABASE_URL).toBe(
      'postgresql://postgres:postgres@localhost:5432/ticketing_dev',
    );
    expect(process.env.WECHAT_DEV_LOGIN_OPEN_ID).toBe('dev-openid');
    expect(process.env.WECHAT_PLATFORM_PUBLIC_KEY_PEM).toBe('line-1\nline-2');
  });

  it('falls back to prisma/.env when the workspace .env does not exist', () => {
    const cwd = 'D:/miniTicket/apps/api';
    const prismaEnvPath = join(cwd, 'prisma/.env');

    const result = loadRuntimeEnv({
      cwd,
      existsSync: (targetPath) => targetPath === prismaEnvPath,
      readFileSync: () => 'DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ticketing_dev',
    });

    expect(result).toEqual([prismaEnvPath]);
    expect(process.env.DATABASE_URL).toBe(
      'postgresql://postgres:postgres@localhost:5432/ticketing_dev',
    );
  });
});
