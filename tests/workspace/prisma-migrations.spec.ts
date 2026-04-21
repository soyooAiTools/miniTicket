import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const migrationsRoot = join(
  process.cwd(),
  'apps',
  'api',
  'prisma',
  'migrations',
);

function collectSqlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      return collectSqlFiles(fullPath);
    }

    return fullPath.endsWith('.sql') ? [fullPath] : [];
  });
}

describe('prisma migrations', () => {
  it('stores sql files without a utf-8 bom prefix', () => {
    const sqlFiles = collectSqlFiles(migrationsRoot);

    expect(sqlFiles.length).toBeGreaterThan(0);

    for (const sqlFile of sqlFiles) {
      const bytes = readFileSync(sqlFile);
      const hasUtf8Bom =
        bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf;

      expect(hasUtf8Bom, `${sqlFile} should not start with a UTF-8 BOM`).toBe(
        false,
      );
    }
  });
});
