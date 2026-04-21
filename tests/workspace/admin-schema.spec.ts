import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const schema = readFileSync('apps/api/prisma/schema.prisma', 'utf8');
const migration = readFileSync(
  'apps/api/prisma/migrations/20260421143000_admin_ops_mvp/migration.sql',
  'utf8',
);
const seedData = readFileSync('apps/api/prisma/seed-data.ts', 'utf8');
const seed = readFileSync('apps/api/prisma/seed.ts', 'utf8');

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

  it('wires refund reviewer and processor relations through user and refund request models', () => {
    expect(schema).toContain(
      'reviewedRefundRequests RefundRequest[] @relation("RefundReviewedBy")',
    );
    expect(schema).toContain(
      'processedRefundRequests RefundRequest[] @relation("RefundProcessedBy")',
    );
    expect(schema).toContain(
      'reviewedBy        User?        @relation("RefundReviewedBy", fields: [reviewedByUserId], references: [id], onDelete: SetNull)',
    );
    expect(schema).toContain(
      'processedBy       User?        @relation("RefundProcessedBy", fields: [processedByUserId], references: [id], onDelete: SetNull)',
    );
  });

  it('keeps refund queue indexes and foreign keys in the migration', () => {
    expect(migration).toContain(
      'CREATE INDEX "RefundRequest_status_requestedAt_idx" ON "RefundRequest"("status", "requestedAt");',
    );
    expect(migration).toContain(
      'CREATE INDEX "RefundRequest_reviewedByUserId_idx" ON "RefundRequest"("reviewedByUserId");',
    );
    expect(migration).toContain(
      'CREATE INDEX "RefundRequest_processedByUserId_idx" ON "RefundRequest"("processedByUserId");',
    );
    expect(migration).toContain(
      'ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;',
    );
    expect(migration).toContain(
      'ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_processedByUserId_fkey" FOREIGN KEY ("processedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;',
    );
  });

  it('declares order note and order flag models', () => {
    expect(schema).toContain('model OrderNote');
    expect(schema).toContain('model OrderFlag');
  });

  it('clears non-refundable tier deadlines and hashes admin passwords with scrypt', () => {
    expect(seedData).toContain('refundDeadlineAt: null');
    expect(seed).toContain('scryptSync(password, salt, 64)');
    expect(seed).toContain('return `${salt}:${hash}`;');
  });
});
