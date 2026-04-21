import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const schema = readFileSync('apps/api/prisma/schema.prisma', 'utf8');

describe('admin ops prisma schema', () => {
  it('declares admin session and audit log models', () => {
    expect(schema).toContain('model AdminSession');
    expect(schema).toContain('model AdminAuditLog');
  });

  it('adds enabled state to users', () => {
    expect(schema).toContain('enabled       Boolean');
  });

  it('upgrades ticket tiers for regional ticketing', () => {
    expect(schema).toMatch(/purchaseLimit\s+Int/);
    expect(schema).toMatch(/requiresRealName\s+Boolean/);
    expect(schema).toMatch(/refundable\s+Boolean/);
    expect(schema).toMatch(/refundDeadlineAt\s+DateTime\?/);
    expect(schema).toMatch(/sortOrder\s+Int/);
  });

  it('adds admin handling fields to refund requests', () => {
    expect(schema).toMatch(/reviewedByUserId\s+String\?/);
    expect(schema).toMatch(/reviewNote\s+String\?/);
    expect(schema).toMatch(/rejectionReason\s+String\?/);
    expect(schema).toMatch(/processedByUserId\s+String\?/);
    expect(schema).toMatch(/lastHandledAt\s+DateTime\?/);
  });

  it('declares order note and order flag models', () => {
    expect(schema).toContain('model OrderNote');
    expect(schema).toContain('model OrderFlag');
  });
});
