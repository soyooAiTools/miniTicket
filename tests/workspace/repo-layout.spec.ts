import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

describe('repo layout', () => {
  it('declares the ticketing-only monorepo workspace and package scripts', () => {
    expect(existsSync('package.json')).toBe(true);
    expect(existsSync('pnpm-workspace.yaml')).toBe(true);
    expect(existsSync('tsconfig.base.json')).toBe(true);
    expect(existsSync('.gitignore')).toBe(true);
    expect(existsSync('.env.example')).toBe(true);
    expect(existsSync('docker-compose.yml')).toBe(true);
    expect(existsSync('apps/api/package.json')).toBe(true);
    expect(existsSync('apps/admin/package.json')).toBe(true);
    expect(existsSync('apps/miniapp/package.json')).toBe(true);
    expect(existsSync('apps/miniapp/config/dev.js')).toBe(true);
    expect(existsSync('apps/miniapp/config/prod.js')).toBe(true);
    expect(existsSync('apps/miniapp/project.config.json')).toBe(true);
    expect(existsSync('packages/contracts/package.json')).toBe(true);
    expect(existsSync('apps/load-control/package.json')).toBe(false);
    expect(existsSync('packages/contracts/src/load-testing.ts')).toBe(false);
    expect(existsSync('tests/perf')).toBe(false);

    const rootPackage = readJson<{
      name: string;
      packageManager: string;
      scripts?: Record<string, string>;
    }>('package.json');

    expect(rootPackage.name).toBe('authorized-ticketing-platform');
    expect(rootPackage.packageManager).toMatch(/^pnpm@\d+\.\d+\.\d+$/);
    expect(rootPackage.scripts).toEqual(
      expect.objectContaining({
        'bootstrap:local': expect.stringContaining('pnpm --filter api prisma:seed'),
        'dev:api': expect.stringContaining('pnpm --filter api dev'),
        'dev:api:device': expect.stringContaining('scripts/run-api-device.mjs'),
        'dev:admin': expect.stringContaining('pnpm --filter admin dev'),
        'dev:infra': expect.stringContaining('docker compose up -d'),
        'dev:miniapp': expect.stringContaining('pnpm --filter miniapp dev:weapp'),
        'dev:miniapp:device': expect.stringContaining('pnpm --filter miniapp dev:weapp:device'),
        lint: expect.stringContaining('eslint tests'),
      }),
    );
    expect(rootPackage.scripts).not.toHaveProperty('dev:load-control');
    expect(rootPackage.scripts?.test).not.toContain('pnpm --filter load-control test');
    expect(rootPackage.scripts?.test).not.toContain('pnpm --filter load-control test:e2e');
    expect(rootPackage.scripts?.test).not.toContain(
      'pnpm exec vitest run tests/perf/load-testing-fixtures.spec.ts',
    );
    expect(rootPackage.scripts?.test).toContain('@ticketing/contracts');
    expect(rootPackage.scripts?.test).toContain('tests/workspace/repo-layout.spec.ts');

    const tsconfig = readJson<{
      compilerOptions: {
        target: string;
        module: string;
        moduleResolution: string;
        strict: boolean;
        skipLibCheck: boolean;
        resolveJsonModule: boolean;
        esModuleInterop: boolean;
        forceConsistentCasingInFileNames: boolean;
        baseUrl: string;
      };
    }>('tsconfig.base.json');

    expect(tsconfig.compilerOptions).toEqual({
      target: 'ES2022',
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      strict: true,
      skipLibCheck: true,
      resolveJsonModule: true,
      esModuleInterop: true,
      forceConsistentCasingInFileNames: true,
      baseUrl: '.',
    });

    expect(readJson<{ scripts: Record<string, string> }>('apps/api/package.json').scripts).toEqual(
      expect.objectContaining({
        build: 'tsc -p tsconfig.build.json',
        dev: 'ts-node --transpile-only src/main.ts',
        'start:prod': 'node dist/apps/api/src/main.js',
        test: 'jest',
        'test:e2e': 'jest --config test/jest-e2e.json',
        'prisma:generate': 'prisma generate',
        'prisma:migrate': 'prisma migrate dev',
        'prisma:seed': expect.stringContaining('prisma/seed.ts'),
        lint: 'eslint src --ext .ts',
      }),
    );

    expect(readJson<{ scripts: Record<string, string> }>('apps/admin/package.json').scripts).toEqual({
      dev: 'vite',
      build: 'tsc -b && vite build',
      test: 'vitest run --passWithNoTests',
      lint: 'eslint src --ext .ts,.tsx',
    });

    const miniappPackage = readJson<{
      scripts: Record<string, string>;
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    }>('apps/miniapp/package.json');

    expect(miniappPackage.scripts).toEqual({
      'dev:weapp': 'taro build --type weapp --watch',
      'dev:weapp:device': 'node ../../scripts/run-miniapp-device.mjs dev',
      'build:weapp': 'taro build --type weapp',
      'build:weapp:device': 'node ../../scripts/run-miniapp-device.mjs build',
      test: 'vitest run',
      lint: 'eslint src --ext .ts,.tsx',
    });
    expect(miniappPackage.dependencies).toEqual(
      expect.objectContaining({
        '@tarojs/shared': expect.any(String),
      }),
    );
    expect(
      readJson<{
        miniprogramRoot: string;
        projectname: string;
        compileType: string;
        setting?: {
          urlCheck?: boolean;
        };
      }>('apps/miniapp/project.config.json'),
    ).toEqual(
      expect.objectContaining({
        miniprogramRoot: './dist',
        projectname: 'miniapp',
        compileType: 'miniprogram',
        setting: expect.objectContaining({
          urlCheck: false,
        }),
      }),
    );

    const miniappConfigIndex = readFileSync('apps/miniapp/config/index.js', 'utf8');
    expect(miniappConfigIndex).toContain("require('./dev')");
    expect(miniappConfigIndex).toContain("require('./prod')");

    const apiMain = readFileSync('apps/api/src/main.ts', 'utf8');
    expect(apiMain).toContain('process.env.HOST');
    expect(apiMain).toContain("register-runtime-env");

    const readme = readFileSync('README.md', 'utf8');
    expect(readme).toContain('dev:api:device');
    expect(readme).toContain('dev:miniapp:device');
    expect(readme).toContain('VENDOR_DEV_MOCK');

    expect(readJson<{ scripts: Record<string, string> }>('packages/contracts/package.json').scripts).toEqual({
      test: 'vitest run',
      lint: 'eslint src --ext .ts',
    });

    const workspace = readFileSync('pnpm-workspace.yaml', 'utf8');
    expect(workspace).toContain('apps/*');
    expect(workspace).toContain('packages/*');
    expect(workspace).toContain('tests/*');
  });

  it('keeps shared contracts focused on ticketing flows', () => {
    const contractsIndex = readFileSync('packages/contracts/src/index.ts', 'utf8');

    expect(contractsIndex).not.toContain("./load-testing");
    expect(contractsIndex).toContain("./auth");
    expect(contractsIndex).toContain("./event");
    expect(contractsIndex).toContain("./order");
    expect(contractsIndex).toContain("./payment");
    expect(contractsIndex).toContain("./viewer");
  });
});
