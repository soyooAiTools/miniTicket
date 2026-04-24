import { existsSync as defaultExistsSync, readFileSync as defaultReadFileSync } from 'fs';
import { join, resolve } from 'path';

type LoadRuntimeEnvOptions = {
  cwd?: string;
  existsSync?: (path: string) => boolean;
  readFileSync?: (path: string, encoding: 'utf8') => string;
};

function parseEnvValue(rawValue: string) {
  const trimmedValue = rawValue.trim();

  if (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) {
    return trimmedValue.slice(1, -1).replace(/\\n/g, '\n').replace(/\\r/g, '\r');
  }

  if (trimmedValue.startsWith("'") && trimmedValue.endsWith("'")) {
    return trimmedValue.slice(1, -1);
  }

  return trimmedValue;
}

function parseEnvContent(content: string) {
  const entries = new Map<string, string>();

  for (const rawLine of content.split(/\r?\n/)) {
    const trimmedLine = rawLine.trim();

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }

    const normalizedLine = trimmedLine.startsWith('export ')
      ? trimmedLine.slice('export '.length)
      : trimmedLine;
    const separatorIndex = normalizedLine.indexOf('=');

    if (separatorIndex <= 0) {
      continue;
    }

    const key = normalizedLine.slice(0, separatorIndex).trim();
    const value = normalizedLine.slice(separatorIndex + 1);

    if (!key) {
      continue;
    }

    entries.set(key, parseEnvValue(value));
  }

  return entries;
}

function buildCandidatePaths(cwd: string) {
  const nodeEnv = process.env.NODE_ENV;
  const envSuffix = nodeEnv === 'production' ? 'prod' : 'dev';

  return [
    join(cwd, `.env.${envSuffix}`),
    join(cwd, '.env'),
    join(cwd, `apps/api/.env.${envSuffix}`),
    join(cwd, 'apps/api/.env'),
    join(cwd, 'apps/api/prisma/.env'),
    join(cwd, 'prisma/.env'),
    resolve(cwd, `../.env.${envSuffix}`),
    resolve(cwd, '../.env'),
    resolve(cwd, `../../.env.${envSuffix}`),
    resolve(cwd, '../../.env'),
  ];
}

export function loadRuntimeEnv({
  cwd = process.cwd(),
  existsSync = defaultExistsSync,
  readFileSync = defaultReadFileSync,
}: LoadRuntimeEnvOptions = {}) {
  const loadedPaths: string[] = [];

  for (const candidatePath of buildCandidatePaths(cwd)) {
    if (!existsSync(candidatePath) || loadedPaths.includes(candidatePath)) {
      continue;
    }

    const content = readFileSync(candidatePath, 'utf8');
    const entries = parseEnvContent(content);

    for (const [key, value] of entries) {
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }

    loadedPaths.push(candidatePath);
  }

  return loadedPaths;
}
