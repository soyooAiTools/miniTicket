# Ticketing Admin Ops MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-like admin operations MVP with login, role-based access, event publishing with regional price tiers, order notes and flags, refund handling, and basic account management.

**Architecture:** Keep the existing monorepo and current NestJS/React foundations, but move admin concerns behind dedicated `/admin` APIs and a cookie-backed admin session. Reuse the current `Event -> EventSession -> TicketTier` model by upgrading `TicketTier` into a “regional ticket tier”, then layer focused admin modules on top for auth, dashboard, events, orders, refunds, and users. On the frontend, replace the current loose table pages with a guarded Chinese-first operations workbench that uses a shared layout, typed request services, and focused list/detail/editor pages.

**Tech Stack:** Prisma + PostgreSQL, NestJS 11, React 18, Ant Design 5, React Router, Vitest, Jest, Zod, Vite

---

## Planned File Structure

### Shared contracts

- Create: `packages/contracts/src/admin-auth.ts`
  - Admin login request/response, current-session payload, role schema
- Create: `packages/contracts/src/admin-dashboard.ts`
  - Dashboard summary cards and recent audit items
- Create: `packages/contracts/src/admin-event.ts`
  - Event list rows, event editor payload, session draft, regional tier draft
- Create: `packages/contracts/src/admin-order.ts`
  - Admin order list/detail payloads, notes, flags
- Create: `packages/contracts/src/admin-refund.ts`
  - Refund queue/detail payloads, approve/reject/process requests
- Create: `packages/contracts/src/admin-user.ts`
  - User list rows, create/update payloads
- Modify: `packages/contracts/src/event.ts`
  - Extend public event tier contract with regional-tier rule fields
- Modify: `packages/contracts/src/index.ts`
  - Re-export all new admin contracts
- Modify: `packages/contracts/src/contracts.spec.ts`
  - Contract coverage for admin payloads and upgraded tier shape

### Database and seed

- Modify: `apps/api/prisma/schema.prisma`
  - Add admin sessions, audit logs, order notes, order flags, refund workflow fields, regional-tier fields
- Create: `apps/api/prisma/migrations/20260421143000_admin_ops_mvp/migration.sql`
  - SQL for all admin MVP schema changes
- Modify: `apps/api/prisma/seed-data.ts`
  - Seed realistic regional ticket tiers and seeded admin users
- Modify: `apps/api/prisma/seed.ts`
  - Hash admin passwords and upsert users, tiers, and richer event data
- Create: `tests/workspace/admin-schema.spec.ts`
  - Guards against schema drift for the admin MVP tables and fields

### API backend

- Create: `apps/api/src/common/auth/admin-session.guard.ts`
  - Resolve the current admin from an HTTP-only cookie session
- Create: `apps/api/src/common/auth/current-admin.decorator.ts`
  - Inject the authenticated admin principal into controllers
- Create: `apps/api/src/common/auth/admin-cookie.ts`
  - Cookie name, TTL, and parsing helpers
- Create: `apps/api/src/common/admin/admin-audit.service.ts`
  - Central service for writing audit log rows
- Create: `apps/api/src/modules/admin-auth/*`
  - Login, logout, current-session endpoints and password verification
- Create: `apps/api/src/modules/admin-dashboard/*`
  - Summary cards and recent audit feed
- Create: `apps/api/src/modules/admin-events/*`
  - Event list, detail, create, update, publish, unpublish
- Create: `apps/api/src/modules/admin-orders/*`
  - Order list, detail, note creation, flag creation
- Create: `apps/api/src/modules/admin-refunds/*`
  - Queue/detail endpoints plus approve/reject/process actions
- Create: `apps/api/src/modules/admin-users/*`
  - User list, create, enable/disable, role update
- Modify: `apps/api/src/app.module.ts`
  - Register new admin modules
- Modify: `apps/api/src/modules/catalog/catalog.service.ts`
  - Include new tier fields in public event detail
- Modify: `apps/api/src/modules/checkout/checkout.service.ts`
  - Enforce regional-tier purchase limit and preserve tier semantics
- Modify: `apps/api/src/modules/refunds/refunds.service.ts`
  - Change customer refund requests to stop at REVIEWING until admin action

### Admin frontend

- Modify: `apps/admin/package.json`
  - Add React Testing Library + jsdom for admin UI tests
- Create: `apps/admin/src/test/setup.ts`
  - Test bootstrap for RTL and `jest-dom`
- Create: `apps/admin/src/app/AdminLayout.tsx`
  - Shared navigation shell and top bar
- Create: `apps/admin/src/app/RequireAdminAuth.tsx`
  - Route protection and role-aware redirects
- Create: `apps/admin/src/app/admin-auth-context.tsx`
  - Session bootstrap and auth actions
- Create: `apps/admin/src/pages/login/index.tsx`
  - Admin login screen
- Create: `apps/admin/src/pages/dashboard/index.tsx`
  - Operations dashboard summary
- Create: `apps/admin/src/pages/events/list.tsx`
  - Event list and route entry
- Create: `apps/admin/src/pages/events/editor.tsx`
  - Multi-section event editor with regional tiers
- Create: `apps/admin/src/pages/orders/list.tsx`
  - Order queue
- Create: `apps/admin/src/pages/orders/detail.tsx`
  - Order detail + notes/flags
- Create: `apps/admin/src/pages/refunds/list.tsx`
  - Refund queue
- Create: `apps/admin/src/pages/refunds/detail.tsx`
  - Refund handling screen
- Create: `apps/admin/src/pages/users/index.tsx`
  - User management page
- Create: `apps/admin/src/services/admin-auth.ts`
  - Typed auth requests
- Create: `apps/admin/src/services/admin-dashboard.ts`
  - Typed dashboard requests
- Create: `apps/admin/src/services/admin-events.ts`
  - Typed event requests
- Create: `apps/admin/src/services/admin-orders.ts`
  - Typed order requests
- Create: `apps/admin/src/services/admin-refunds.ts`
  - Typed refund requests
- Create: `apps/admin/src/services/admin-users.ts`
  - Typed user requests
- Modify: `apps/admin/src/services/request.ts`
  - Switch to cookie credentials and drop browser-stored admin secret
- Modify: `apps/admin/src/router.tsx`
  - Replace loose routes with guarded app routes
- Delete: `apps/admin/src/pages/fulfillment/index.tsx`
  - Fulfillment is folded into order detail, not a top-level module
- Replace: `apps/admin/src/pages/events/index.tsx`
- Replace: `apps/admin/src/pages/orders/index.tsx`
- Replace: `apps/admin/src/pages/refunds/index.tsx`

### Docs

- Modify: `README.md`
  - Add admin login and local verification instructions
- Modify: `docs/handoff/README.md`
  - Point developers to the admin MVP flow and default seeded accounts
- Modify: `.env.example`
  - Remove legacy admin-secret guidance once the frontend no longer uses it

---

### Task 1: Extend Shared Contracts For Admin MVP

**Files:**
- Create: `packages/contracts/src/admin-auth.ts`
- Create: `packages/contracts/src/admin-dashboard.ts`
- Create: `packages/contracts/src/admin-event.ts`
- Create: `packages/contracts/src/admin-order.ts`
- Create: `packages/contracts/src/admin-refund.ts`
- Create: `packages/contracts/src/admin-user.ts`
- Modify: `packages/contracts/src/event.ts`
- Modify: `packages/contracts/src/index.ts`
- Modify: `packages/contracts/src/contracts.spec.ts`

- [ ] **Step 1: Write the failing contract tests**

```ts
import {
  adminDashboardSummarySchema,
  adminEventDraftSchema,
  adminOrderDetailSchema,
  adminSessionSchema,
  adminUserListItemSchema,
  ticketTierSummarySchema,
} from './index';

it('validates an admin session payload', () => {
  expect(
    adminSessionSchema.parse({
      user: {
        email: 'ops@miniticket.local',
        id: 'user_ops_001',
        name: '现场运营',
        role: 'OPERATIONS',
      },
    }),
  ).toMatchObject({
    user: {
      role: 'OPERATIONS',
    },
  });
});

it('validates a dashboard summary payload', () => {
  expect(
    adminDashboardSummarySchema.parse({
      activeEventCount: 3,
      upcomingEventCount: 2,
      pendingRefundCount: 4,
      flaggedOrderCount: 6,
      recentActions: [
        {
          action: 'EVENT_PUBLISHED',
          actorName: '超级管理员',
          createdAt: '2026-04-21T08:30:00.000Z',
          targetId: 'evt_shanghai_001',
          targetType: 'EVENT',
        },
      ],
    }),
  ).toMatchObject({
    pendingRefundCount: 4,
  });
});

it('validates an admin event draft with regional tiers', () => {
  expect(
    adminEventDraftSchema.parse({
      city: '上海',
      coverImageUrl: 'https://example.com/poster.jpg',
      description: '大型演唱会预售场',
      sessions: [
        {
          endsAt: '2026-05-01T14:30:00.000Z',
          name: '2026-05-01 19:30',
          saleEndsAt: '2026-05-01T10:00:00.000Z',
          saleStartsAt: '2026-04-28T02:00:00.000Z',
          startsAt: '2026-05-01T11:30:00.000Z',
          tiers: [
            {
              inventory: 200,
              name: '内场 A 区',
              price: 128000,
              purchaseLimit: 4,
              refundable: true,
              refundDeadlineAt: '2026-04-29T16:00:00.000Z',
              requiresRealName: true,
              sortOrder: 1,
              ticketType: 'E_TICKET',
            },
          ],
        },
      ],
      title: 'Aurora Arena 巡回演唱会 上海站',
      venueAddress: '上海市浦东新区世博大道 1200 号',
      venueName: '上海世博体育馆',
    }),
  ).toMatchObject({
    sessions: [
      {
        tiers: [
          {
            purchaseLimit: 4,
            requiresRealName: true,
          },
        ],
      },
    ],
  });
});

it('validates admin order detail notes and flags', () => {
  expect(
    adminOrderDetailSchema.parse({
      currency: 'CNY',
      id: 'ord_001',
      notes: [
        {
          content: '用户来电确认身份证尾号',
          createdAt: '2026-04-21T08:00:00.000Z',
          createdByName: '现场运营',
          id: 'note_001',
        },
      ],
      flags: [
        {
          createdAt: '2026-04-21T08:15:00.000Z',
          createdByName: '现场运营',
          id: 'flag_001',
          note: '支付成功后长时间未出票',
          type: '异常单',
        },
      ],
      orderNumber: 'AT202604210001',
      status: 'PAID_PENDING_FULFILLMENT',
      ticketType: 'E_TICKET',
      totalAmount: 256000,
    }),
  ).toMatchObject({
    flags: [{ type: '异常单' }],
    notes: [{ createdByName: '现场运营' }],
  });
});

it('extends public ticket tiers with regional rule fields', () => {
  expect(
    ticketTierSummarySchema.parse({
      id: 'tier_inner_a',
      inventory: 200,
      name: '内场 A 区',
      price: 128000,
      purchaseLimit: 4,
      refundable: true,
      refundDeadlineAt: '2026-04-29T16:00:00.000Z',
      requiresRealName: true,
      sortOrder: 1,
      ticketType: 'E_TICKET',
    }),
  ).toMatchObject({
    purchaseLimit: 4,
    refundable: true,
    requiresRealName: true,
  });
});

it('validates admin user list items', () => {
  expect(
    adminUserListItemSchema.parse({
      createdAt: '2026-04-20T08:00:00.000Z',
      email: 'admin@miniticket.local',
      enabled: true,
      id: 'user_admin_001',
      name: '超级管理员',
      role: 'ADMIN',
      updatedAt: '2026-04-21T08:00:00.000Z',
    }),
  ).toMatchObject({
    enabled: true,
    role: 'ADMIN',
  });
});
```

- [ ] **Step 2: Run contract tests to verify they fail**

Run: `corepack pnpm --filter @ticketing/contracts test`

Expected: `FAIL` with missing exports such as `adminSessionSchema`, `adminDashboardSummarySchema`, and the new regional-tier fields on `ticketTierSummarySchema`.

- [ ] **Step 3: Implement the admin contracts and upgraded tier schema**

```ts
// packages/contracts/src/admin-auth.ts
import { z } from 'zod';

export const adminRoleSchema = z.enum(['ADMIN', 'OPERATIONS']);

export const adminSessionUserSchema = z
  .object({
    email: z.string().email(),
    id: z.string().min(1),
    name: z.string().min(1),
    role: adminRoleSchema,
  })
  .strict();

export const adminLoginRequestSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
  })
  .strict();

export const adminSessionSchema = z
  .object({
    user: adminSessionUserSchema,
  })
  .strict();
```

```ts
// packages/contracts/src/admin-event.ts
import { z } from 'zod';

export const adminRegionalTierDraftSchema = z
  .object({
    id: z.string().min(1).optional(),
    inventory: z.number().int().nonnegative(),
    name: z.string().min(1),
    price: z.number().int().positive(),
    purchaseLimit: z.number().int().positive(),
    refundable: z.boolean(),
    refundDeadlineAt: z.string().datetime().optional(),
    requiresRealName: z.boolean(),
    sortOrder: z.number().int().nonnegative(),
    ticketType: z.enum(['E_TICKET', 'PAPER_TICKET']),
  })
  .strict();

export const adminEventSessionDraftSchema = z
  .object({
    id: z.string().min(1).optional(),
    endsAt: z.string().datetime().optional(),
    name: z.string().min(1),
    saleEndsAt: z.string().datetime().optional(),
    saleStartsAt: z.string().datetime().optional(),
    startsAt: z.string().datetime(),
    tiers: z.array(adminRegionalTierDraftSchema).min(1),
  })
  .strict();

export const adminEventDraftSchema = z
  .object({
    city: z.string().min(1),
    coverImageUrl: z.string().url().optional(),
    description: z.string().min(1).optional(),
    id: z.string().min(1).optional(),
    published: z.boolean().optional(),
    sessions: z.array(adminEventSessionDraftSchema).min(1),
    title: z.string().min(1),
    venueAddress: z.string().min(1),
    venueName: z.string().min(1),
  })
  .strict();
```

```ts
// packages/contracts/src/event.ts
export const ticketTierSummarySchema = z
  .object({
    id: z.string().min(1),
    inventory: z.number().int().nonnegative(),
    name: z.string().min(1),
    price: z.number().int().nonnegative(),
    purchaseLimit: z.number().int().positive(),
    refundable: z.boolean(),
    refundDeadlineAt: z.string().datetime().optional(),
    requiresRealName: z.boolean(),
    sortOrder: z.number().int().nonnegative(),
    ticketType: z.enum(['E_TICKET', 'PAPER_TICKET']),
  })
  .strict();
```

```ts
// packages/contracts/src/index.ts
export * from './admin-auth';
export * from './admin-dashboard';
export * from './admin-event';
export * from './admin-order';
export * from './admin-refund';
export * from './admin-user';
```

- [ ] **Step 4: Run the contract tests again**

Run: `corepack pnpm --filter @ticketing/contracts test`

Expected: `PASS` for the new admin contract tests and the existing shared contract suite.

- [ ] **Step 5: Commit the contract work**

```bash
git add packages/contracts/src packages/contracts/package.json
git commit -m "feat: add admin ops shared contracts"
```

### Task 2: Add Prisma Models, Migration, And Seed Data

**Files:**
- Modify: `apps/api/prisma/schema.prisma`
- Create: `apps/api/prisma/migrations/20260421143000_admin_ops_mvp/migration.sql`
- Modify: `apps/api/prisma/seed-data.ts`
- Modify: `apps/api/prisma/seed.ts`
- Create: `tests/workspace/admin-schema.spec.ts`

- [ ] **Step 1: Write the failing schema guard test**

```ts
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('admin ops prisma schema', () => {
  const schema = readFileSync('apps/api/prisma/schema.prisma', 'utf8');

  it('declares admin session and audit models', () => {
    expect(schema).toContain('model AdminSession');
    expect(schema).toContain('model AdminAuditLog');
  });

  it('upgrades admin users with enabled state', () => {
    expect(schema).toContain('enabled        Boolean');
  });

  it('declares order note and order flag models', () => {
    expect(schema).toContain('model OrderNote');
    expect(schema).toContain('model OrderFlag');
  });

  it('upgrades ticket tiers to regional tiers', () => {
    expect(schema).toContain('purchaseLimit   Int');
    expect(schema).toContain('requiresRealName Boolean');
    expect(schema).toContain('refundable      Boolean');
    expect(schema).toContain('refundDeadlineAt DateTime?');
    expect(schema).toContain('sortOrder       Int');
  });

  it('adds admin-handled refund fields', () => {
    expect(schema).toContain('reviewedByUserId String?');
    expect(schema).toContain('reviewNote      String?');
    expect(schema).toContain('rejectionReason String?');
    expect(schema).toContain('processedByUserId String?');
    expect(schema).toContain('lastHandledAt   DateTime?');
  });
});
```

- [ ] **Step 2: Run the workspace schema test to verify it fails**

Run: `corepack pnpm exec vitest run tests/workspace/admin-schema.spec.ts`

Expected: `FAIL` because `schema.prisma` does not yet contain the new models or regional-tier fields.

- [ ] **Step 3: Implement the Prisma schema, migration, and seed updates**

```prisma
// apps/api/prisma/schema.prisma
model User {
  id            String         @id @default(cuid())
  email         String         @unique
  name          String
  role          UserRole
  enabled       Boolean        @default(true)
  passwordHash  String
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  adminSessions AdminSession[]
  auditLogs     AdminAuditLog[]
  orderFlags    OrderFlag[]
  orderNotes    OrderNote[]
}

model AdminSession {
  id        String   @id @default(cuid())
  userId    String
  tokenHash String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, expiresAt])
}

model AdminAuditLog {
  id         String   @id @default(cuid())
  userId     String
  action     String
  targetType String
  targetId   String
  payload    Json?
  createdAt  DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([targetType, targetId, createdAt])
  @@index([userId, createdAt])
}

model OrderNote {
  id              String   @id @default(cuid())
  orderId         String
  content         String
  createdByUserId String
  createdAt       DateTime @default(now())
  order           Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  createdBy       User     @relation(fields: [createdByUserId], references: [id], onDelete: Restrict)

  @@index([orderId, createdAt])
}

model OrderFlag {
  id              String   @id @default(cuid())
  orderId         String
  type            String
  note            String?
  createdByUserId String
  createdAt       DateTime @default(now())
  order           Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  createdBy       User     @relation(fields: [createdByUserId], references: [id], onDelete: Restrict)

  @@index([orderId, createdAt])
}

model Order {
  id             String             @id @default(cuid())
  orderNumber    String             @unique
  userId         String
  status         OrderStatus        @default(PENDING_PAYMENT)
  ticketType     TicketType
  totalAmount    Int
  currency       String             @default("CNY")
  createdAt      DateTime           @default(now())
  updatedAt      DateTime           @updatedAt
  items          OrderItem[]
  payments       Payment[]
  fulfillments   FulfillmentEvent[]
  refundRequests RefundRequest[]
  notes          OrderNote[]
  flags          OrderFlag[]

  @@index([userId, createdAt])
}

model TicketTier {
  id               String       @id @default(cuid())
  sessionId        String
  name             String
  price            Int
  inventory        Int
  purchaseLimit    Int          @default(4)
  requiresRealName Boolean      @default(true)
  refundable       Boolean      @default(false)
  refundDeadlineAt DateTime?
  sortOrder        Int          @default(0)
  ticketType       TicketType
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt
  session          EventSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  orderItems       OrderItem[]

  @@index([sessionId])
}

model RefundRequest {
  id                String       @id @default(cuid())
  orderId           String
  refundNo          String       @unique
  reason            String
  status            RefundStatus @default(REVIEWING)
  requestedAmount   Int
  serviceFee        Int
  refundAmount      Int
  requestedBy       String?
  requestedAt       DateTime     @default(now())
  processedAt       DateTime?
  reviewedByUserId  String?
  reviewNote        String?
  rejectionReason   String?
  processedByUserId String?
  lastHandledAt     DateTime?
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt
  order             Order        @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@index([orderId, requestedAt])
}
```

```sql
-- apps/api/prisma/migrations/20260421143000_admin_ops_mvp/migration.sql
ALTER TABLE "User"
  ADD COLUMN "enabled" BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE "TicketTier"
  ADD COLUMN "purchaseLimit" INTEGER NOT NULL DEFAULT 4,
  ADD COLUMN "requiresRealName" BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN "refundable" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN "refundDeadlineAt" TIMESTAMP(3),
  ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "RefundRequest"
  ADD COLUMN "reviewedByUserId" TEXT,
  ADD COLUMN "reviewNote" TEXT,
  ADD COLUMN "rejectionReason" TEXT,
  ADD COLUMN "processedByUserId" TEXT,
  ADD COLUMN "lastHandledAt" TIMESTAMP(3);

CREATE TABLE "AdminSession" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AdminSession_tokenHash_key" ON "AdminSession"("tokenHash");
CREATE INDEX "AdminSession_userId_expiresAt_idx" ON "AdminSession"("userId", "expiresAt");

CREATE TABLE "AdminAuditLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrderNote" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdByUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrderNote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrderFlag" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "note" TEXT,
  "createdByUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrderFlag_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OrderNote_orderId_createdAt_idx" ON "OrderNote"("orderId", "createdAt");
CREATE INDEX "OrderFlag_orderId_createdAt_idx" ON "OrderFlag"("orderId", "createdAt");
CREATE INDEX "AdminAuditLog_targetType_targetId_createdAt_idx" ON "AdminAuditLog"("targetType", "targetId", "createdAt");
CREATE INDEX "AdminAuditLog_userId_createdAt_idx" ON "AdminAuditLog"("userId", "createdAt");

ALTER TABLE "AdminSession"
  ADD CONSTRAINT "AdminSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdminAuditLog"
  ADD CONSTRAINT "AdminAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderNote"
  ADD CONSTRAINT "OrderNote_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderNote"
  ADD CONSTRAINT "OrderNote_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrderFlag"
  ADD CONSTRAINT "OrderFlag_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderFlag"
  ADD CONSTRAINT "OrderFlag_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

```ts
// apps/api/prisma/seed-data.ts
export const adminUserSeed = [
  {
    email: 'admin@miniticket.local',
    id: 'seed-admin-super',
    name: '超级管理员',
    password: 'Admin123!',
    role: 'ADMIN',
  },
  {
    email: 'ops@miniticket.local',
    id: 'seed-admin-ops',
    name: '现场运营',
    password: 'Ops12345!',
    role: 'OPERATIONS',
  },
] as const;

export const ticketingDemoSeed = {
  event: {
    city: 'Shanghai',
    coverImageUrl:
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
    description: 'Admin ops MVP 本地联调用演唱会数据。',
    id: 'seed-event-aurora-shanghai',
    minPrice: 68000,
    published: true,
    refundEntryEnabled: true,
    saleStatus: SaleStatus.ON_SALE,
    title: 'Aurora Arena 巡回演唱会 上海站',
    venueAddress: 'No. 1200 Shibo Avenue, Pudong New Area, Shanghai',
    venueName: 'Expo Arena',
  },
  sessions: [
    {
      endsAt: new Date('2026-05-01T14:30:00.000Z'),
      eventId: 'seed-event-aurora-shanghai',
      id: 'seed-session-aurora-night-1',
      name: '2026-05-01 19:30',
      saleEndsAt: new Date('2026-05-01T10:00:00.000Z'),
      saleStartsAt: new Date('2026-04-28T02:00:00.000Z'),
      startsAt: new Date('2026-05-01T11:30:00.000Z'),
    },
  ],
  ticketTiers: [
    {
      id: 'seed-tier-inner-a',
      inventory: 180,
      name: '内场 A 区',
      price: 128000,
      purchaseLimit: 4,
      refundable: true,
      refundDeadlineAt: new Date('2026-04-29T16:00:00.000Z'),
      requiresRealName: true,
      sessionId: 'seed-session-beta-night-1',
      sortOrder: 1,
      ticketType: TicketType.E_TICKET,
    },
    {
      id: 'seed-tier-stand-1',
      inventory: 360,
      name: '看台一区',
      price: 68000,
      purchaseLimit: 4,
      refundable: false,
      refundDeadlineAt: undefined,
      requiresRealName: true,
      sessionId: 'seed-session-beta-night-1',
      sortOrder: 2,
      ticketType: TicketType.E_TICKET,
    },
  ],
} as const;
```

```ts
// apps/api/prisma/seed.ts
import { randomBytes, scryptSync } from 'node:crypto';

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

for (const user of adminUserSeed) {
  await prisma.user.upsert({
    where: { email: user.email },
    create: {
      email: user.email,
      id: user.id,
      name: user.name,
      passwordHash: hashPassword(user.password),
      role: user.role,
    },
    update: {
      name: user.name,
      passwordHash: hashPassword(user.password),
      role: user.role,
    },
  });
}
```

- [ ] **Step 4: Verify the schema test and bootstrap flow**

Run: `corepack pnpm exec vitest run tests/workspace/admin-schema.spec.ts && corepack pnpm bootstrap:local`

Expected:
- `PASS` for `tests/workspace/admin-schema.spec.ts`
- Prisma migration applies cleanly
- seed logs the admin users and regional tiers being upserted

- [ ] **Step 5: Commit the schema work**

```bash
git add apps/api/prisma tests/workspace/admin-schema.spec.ts
git commit -m "feat: add admin ops data model and seed"
```

### Task 3: Build Admin Auth And Account Management APIs

**Files:**
- Create: `apps/api/src/common/auth/admin-cookie.ts`
- Create: `apps/api/src/common/auth/admin-session.guard.ts`
- Create: `apps/api/src/common/auth/current-admin.decorator.ts`
- Create: `apps/api/src/modules/admin-auth/admin-auth.module.ts`
- Create: `apps/api/src/modules/admin-auth/admin-auth.controller.ts`
- Create: `apps/api/src/modules/admin-auth/admin-auth.service.ts`
- Create: `apps/api/src/modules/admin-auth/admin-auth.service.spec.ts`
- Create: `apps/api/src/modules/admin-users/admin-users.module.ts`
- Create: `apps/api/src/modules/admin-users/admin-users.controller.ts`
- Create: `apps/api/src/modules/admin-users/admin-users.service.ts`
- Create: `apps/api/src/modules/admin-users/admin-users.service.spec.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Write failing Jest specs for admin auth and user management**

```ts
// apps/api/src/modules/admin-auth/admin-auth.service.spec.ts
import { UnauthorizedException } from '@nestjs/common';

import { AdminAuthService } from './admin-auth.service';

describe('AdminAuthService', () => {
  const prismaMock = {
    adminSession: {
      create: jest.fn(),
      deleteMany: jest.fn(),
      findFirst: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  } as never;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates an admin session for valid credentials', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      email: 'ops@miniticket.local',
      id: 'seed-admin-ops',
      name: '现场运营',
      passwordHash: 'salt:hash',
      role: 'OPERATIONS',
    });
    prismaMock.adminSession.create.mockResolvedValue({
      id: 'admin_session_001',
      tokenHash: 'hashed-token',
    });

    const service = new AdminAuthService(prismaMock);

    jest.spyOn(service as never, 'verifyPassword').mockResolvedValue(true);

    await expect(
      service.login({
        email: 'ops@miniticket.local',
        password: 'Ops12345!',
      }),
    ).resolves.toMatchObject({
      sessionToken: expect.any(String),
      user: {
        role: 'OPERATIONS',
      },
    });
  });

  it('rejects invalid credentials', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const service = new AdminAuthService(prismaMock);

    await expect(
      service.login({
        email: 'missing@miniticket.local',
        password: 'bad-password',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
```

```ts
// apps/api/src/modules/admin-users/admin-users.service.spec.ts
import { ConflictException } from '@nestjs/common';

import { AdminUsersService } from './admin-users.service';

describe('AdminUsersService', () => {
  const prismaMock = {
    user: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  } as never;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates an enabled operations user with a hashed password', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      createdAt: new Date('2026-04-21T08:00:00.000Z'),
      email: 'ops2@miniticket.local',
      enabled: true,
      id: 'user_ops_002',
      name: '票务运营 B',
      role: 'OPERATIONS',
      updatedAt: new Date('2026-04-21T08:00:00.000Z'),
    });

    const service = new AdminUsersService(prismaMock);

    await expect(
      service.createUser({
        email: 'ops2@miniticket.local',
        name: '票务运营 B',
        password: 'OpsOps123!',
        role: 'OPERATIONS',
      }),
    ).resolves.toMatchObject({
      email: 'ops2@miniticket.local',
      role: 'OPERATIONS',
    });
  });

  it('rejects duplicate emails', async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      id: 'existing',
    });

    const service = new AdminUsersService(prismaMock);

    await expect(
      service.createUser({
        email: 'admin@miniticket.local',
        name: '重复邮箱',
        password: 'Admin123!',
        role: 'ADMIN',
      }),
    ).rejects.toThrow(ConflictException);
  });
});
```

- [ ] **Step 2: Run the new auth and users tests**

Run: `corepack pnpm --filter api test -- src/modules/admin-auth/admin-auth.service.spec.ts src/modules/admin-users/admin-users.service.spec.ts`

Expected: `FAIL` because the admin auth and users modules do not exist yet.

- [ ] **Step 3: Implement admin session auth and user management**

```ts
// apps/api/src/common/auth/admin-cookie.ts
import { createHash, randomBytes } from 'node:crypto';

export const ADMIN_SESSION_COOKIE_NAME = 'mini_ticket_admin_session';
export const ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 12;

export function createSessionToken() {
  return randomBytes(32).toString('hex');
}

export function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function parseCookie(header: string | undefined, key: string) {
  if (!header) {
    return undefined;
  }

  return header
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${key}=`))
    ?.slice(key.length + 1);
}
```

```ts
// apps/api/src/common/auth/admin-session.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import {
  ADMIN_SESSION_COOKIE_NAME,
  hashSessionToken,
  parseCookie,
} from './admin-cookie';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminSessionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{
      adminUser?: unknown;
      headers: { cookie?: string };
    }>();
    const token = parseCookie(
      request.headers.cookie,
      ADMIN_SESSION_COOKIE_NAME,
    );

    if (!token) {
      throw new UnauthorizedException('管理员登录已失效。');
    }

    const session = await this.prisma.adminSession.findFirst({
      select: {
        expiresAt: true,
        user: {
          select: {
            email: true,
            id: true,
            name: true,
            role: true,
          },
        },
      },
      where: {
        expiresAt: {
          gt: new Date(),
        },
        tokenHash: hashSessionToken(token),
      },
    });

    if (!session) {
      throw new UnauthorizedException('管理员登录已失效。');
    }

    request.adminUser = session.user;
    return true;
  }
}
```

```ts
// apps/api/src/common/auth/current-admin.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentAdmin = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<{ adminUser?: unknown }>();
    return request.adminUser;
  },
);
```

```ts
// apps/api/src/modules/admin-auth/admin-auth.service.ts
import { UnauthorizedException } from '@nestjs/common';
import { scryptSync, timingSafeEqual } from 'node:crypto';

import {
  ADMIN_SESSION_TTL_MS,
  createSessionToken,
  hashSessionToken,
} from '../../common/auth/admin-cookie';
import { PrismaService } from '../../common/prisma/prisma.service';

export class AdminAuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(input: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: input.email,
      },
    });

    if (!user || !user.enabled || !this.verifyPassword(input.password, user.passwordHash)) {
      throw new UnauthorizedException('邮箱或密码错误。');
    }

    const sessionToken = createSessionToken();

    await this.prisma.adminSession.create({
      data: {
        expiresAt: new Date(Date.now() + ADMIN_SESSION_TTL_MS),
        tokenHash: hashSessionToken(sessionToken),
        userId: user.id,
      },
    });

    return {
      sessionToken,
      user: {
        email: user.email,
        id: user.id,
        name: user.name,
        role: user.role,
      },
    };
  }

  async logout(userId: string) {
    await this.prisma.adminSession.deleteMany({
      where: { userId },
    });
  }

  verifyPassword(password: string, passwordHash: string) {
    const [salt, storedHash] = passwordHash.split(':');
    const computedHash = scryptSync(password, salt, 64);
    return timingSafeEqual(computedHash, Buffer.from(storedHash, 'hex'));
  }
}
```

```ts
// apps/api/src/modules/admin-auth/admin-auth.controller.ts
import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';

import { adminLoginRequestSchema } from '../../../../../packages/contracts/src';
import { AdminSessionGuard } from '../../common/auth/admin-session.guard';
import { CurrentAdmin } from '../../common/auth/current-admin.decorator';
import {
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_SESSION_TTL_MS,
} from '../../common/auth/admin-cookie';
import { AdminAuthService } from './admin-auth.service';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  async login(@Body() body: unknown, @Res({ passthrough: true }) res: Response) {
    const payload = adminLoginRequestSchema.parse(body);
    const result = await this.adminAuthService.login(payload);

    res.cookie(ADMIN_SESSION_COOKIE_NAME, result.sessionToken, {
      httpOnly: true,
      maxAge: ADMIN_SESSION_TTL_MS,
      sameSite: 'lax',
    });

    return {
      user: result.user,
    };
  }

  @Post('logout')
  @UseGuards(AdminSessionGuard)
  async logout(
    @CurrentAdmin() admin: { id: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.adminAuthService.logout(admin.id);
    res.clearCookie(ADMIN_SESSION_COOKIE_NAME);
    return { ok: true };
  }

  @Get('me')
  @UseGuards(AdminSessionGuard)
  getMe(@CurrentAdmin() admin: unknown) {
    return { user: admin };
  }
}
```

```ts
// apps/api/src/modules/admin-users/admin-users.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes, scryptSync } from 'node:crypto';

import { PrismaService } from '../../common/prisma/prisma.service';

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        createdAt: true,
        email: true,
        enabled: true,
        id: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });
  }

  async createUser(input: {
    email: string;
    name: string;
    password: string;
    role: 'ADMIN' | 'OPERATIONS';
  }) {
    const existing = await this.prisma.user.findFirst({
      where: { email: input.email },
    });

    if (existing) {
      throw new ConflictException('邮箱已存在。');
    }

    return this.prisma.user.create({
      data: {
        email: input.email,
        enabled: true,
        name: input.name,
        passwordHash: hashPassword(input.password),
        role: input.role,
      },
      select: {
        createdAt: true,
        email: true,
        enabled: true,
        id: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });
  }

  async setEnabled(userId: string, enabled: boolean) {
    try {
      return await this.prisma.user.update({
        data: { enabled },
        select: {
          createdAt: true,
          email: true,
          enabled: true,
          id: true,
          name: true,
          role: true,
          updatedAt: true,
        },
        where: { id: userId },
      });
    } catch {
      throw new NotFoundException('后台账号不存在。');
    }
  }
}
```

- [ ] **Step 4: Run the auth and users tests again**

Run: `corepack pnpm --filter api test -- src/modules/admin-auth/admin-auth.service.spec.ts src/modules/admin-users/admin-users.service.spec.ts`

Expected: `PASS` for login, session lookup, duplicate-email rejection, and enabled/disabled account operations.

- [ ] **Step 5: Commit the auth and users backend**

```bash
git add apps/api/src/common/auth apps/api/src/modules/admin-auth apps/api/src/modules/admin-users apps/api/src/app.module.ts
git commit -m "feat: add admin auth and account management apis"
```

### Task 4: Add Admin Audit Logging And Dashboard Summary

**Files:**
- Create: `apps/api/src/common/admin/admin-audit.service.ts`
- Create: `apps/api/src/common/admin/admin-audit.service.spec.ts`
- Create: `apps/api/src/modules/admin-dashboard/admin-dashboard.module.ts`
- Create: `apps/api/src/modules/admin-dashboard/admin-dashboard.controller.ts`
- Create: `apps/api/src/modules/admin-dashboard/admin-dashboard.service.ts`
- Create: `apps/api/src/modules/admin-dashboard/admin-dashboard.service.spec.ts`
- Modify: `apps/api/src/modules/admin-auth/admin-auth.service.ts`
- Modify: `apps/api/src/modules/admin-users/admin-users.service.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Write failing tests for the audit service and dashboard**

```ts
// apps/api/src/common/admin/admin-audit.service.spec.ts
import { AdminAuditService } from './admin-audit.service';

describe('AdminAuditService', () => {
  it('writes an admin audit log row', async () => {
    const prismaMock = {
      adminAuditLog: {
        create: jest.fn().mockResolvedValue({ id: 'audit_001' }),
      },
    } as never;

    const service = new AdminAuditService(prismaMock);

    await service.record({
      action: 'EVENT_PUBLISHED',
      payload: { published: true },
      targetId: 'event_001',
      targetType: 'EVENT',
      userId: 'seed-admin-super',
    });

    expect(prismaMock.adminAuditLog.create).toHaveBeenCalledWith({
      data: {
        action: 'EVENT_PUBLISHED',
        payload: { published: true },
        targetId: 'event_001',
        targetType: 'EVENT',
        userId: 'seed-admin-super',
      },
    });
  });
});
```

```ts
// apps/api/src/modules/admin-dashboard/admin-dashboard.service.spec.ts
import { AdminDashboardService } from './admin-dashboard.service';

describe('AdminDashboardService', () => {
  it('aggregates refund, flagged-order, active-event, and recent action counts', async () => {
    const prismaMock = {
      adminAuditLog: {
        findMany: jest.fn().mockResolvedValue([
          {
            action: 'EVENT_PUBLISHED',
            createdAt: new Date('2026-04-21T08:30:00.000Z'),
            targetId: 'evt_001',
            targetType: 'EVENT',
            user: { name: '超级管理员' },
          },
        ]),
      },
      event: {
        count: jest
          .fn()
          .mockResolvedValueOnce(3)
          .mockResolvedValueOnce(2),
      },
      orderFlag: {
        count: jest.fn().mockResolvedValue(6),
      },
      refundRequest: {
        count: jest.fn().mockResolvedValue(4),
      },
    } as never;

    const service = new AdminDashboardService(prismaMock);

    await expect(service.getSummary()).resolves.toEqual({
      activeEventCount: 3,
      flaggedOrderCount: 6,
      pendingRefundCount: 4,
      recentActions: [
        {
          action: 'EVENT_PUBLISHED',
          actorName: '超级管理员',
          createdAt: '2026-04-21T08:30:00.000Z',
          targetId: 'evt_001',
          targetType: 'EVENT',
        },
      ],
      upcomingEventCount: 2,
    });
  });
});
```

- [ ] **Step 2: Run the dashboard and audit tests**

Run: `corepack pnpm --filter api test -- admin-audit.service.spec.ts admin-dashboard.service.spec.ts`

Expected: `FAIL` because the new audit service and dashboard module do not exist yet.

- [ ] **Step 3: Implement audit logging and dashboard summary**

```ts
// apps/api/src/common/admin/admin-audit.service.ts
import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminAuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: {
    action: string;
    payload?: Record<string, unknown>;
    targetId: string;
    targetType: string;
    userId: string;
  }) {
    await this.prisma.adminAuditLog.create({
      data: {
        action: input.action,
        payload: input.payload,
        targetId: input.targetId,
        targetType: input.targetType,
        userId: input.userId,
      },
    });
  }
}
```

```ts
// apps/api/src/modules/admin-dashboard/admin-dashboard.service.ts
import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const [
      activeEventCount,
      upcomingEventCount,
      pendingRefundCount,
      flaggedOrderCount,
      recentActions,
    ] = await Promise.all([
      this.prisma.event.count({ where: { published: true, saleStatus: 'ON_SALE' } }),
      this.prisma.event.count({ where: { published: true, saleStatus: 'UPCOMING' } }),
      this.prisma.refundRequest.count({ where: { status: 'REVIEWING' } }),
      this.prisma.orderFlag.count(),
      this.prisma.adminAuditLog.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          action: true,
          createdAt: true,
          targetId: true,
          targetType: true,
          user: {
            select: {
              name: true,
            },
          },
        },
        take: 10,
      }),
    ]);

    return {
      activeEventCount,
      flaggedOrderCount,
      pendingRefundCount,
      recentActions: recentActions.map((item) => ({
        action: item.action,
        actorName: item.user.name,
        createdAt: item.createdAt.toISOString(),
        targetId: item.targetId,
        targetType: item.targetType,
      })),
      upcomingEventCount,
    };
  }
}
```

```ts
// admin-auth.service.ts / admin-users.service.ts (insert after success paths)
await this.adminAuditService.record({
  action: 'ADMIN_LOGIN',
  payload: { email: user.email },
  targetId: user.id,
  targetType: 'USER',
  userId: user.id,
});

await this.adminAuditService.record({
  action: enabled ? 'ADMIN_USER_ENABLED' : 'ADMIN_USER_DISABLED',
  targetId: userId,
  targetType: 'USER',
  userId: actorUserId,
});
```

- [ ] **Step 4: Run the new tests and existing auth tests**

Run: `corepack pnpm --filter api test -- admin-audit.service.spec.ts admin-dashboard.service.spec.ts admin-auth.service.spec.ts admin-users.service.spec.ts`

Expected: `PASS` for the dashboard aggregation and audit-log write coverage, with existing auth and users tests still green.

- [ ] **Step 5: Commit the dashboard and audit work**

```bash
git add apps/api/src/common/admin apps/api/src/modules/admin-dashboard apps/api/src/modules/admin-auth apps/api/src/modules/admin-users apps/api/src/app.module.ts
git commit -m "feat: add admin dashboard and audit logging"
```

### Task 5: Implement Admin Event Management With Regional Tiers

**Files:**
- Create: `apps/api/src/modules/admin-events/admin-events.module.ts`
- Create: `apps/api/src/modules/admin-events/admin-events.controller.ts`
- Create: `apps/api/src/modules/admin-events/admin-events.service.ts`
- Create: `apps/api/src/modules/admin-events/admin-events.service.spec.ts`
- Modify: `apps/api/src/app.module.ts`
- Modify: `apps/api/src/modules/catalog/catalog.service.ts`
- Modify: `apps/api/src/modules/catalog/catalog.service.spec.ts`
- Modify: `apps/api/src/modules/checkout/checkout.service.ts`
- Modify: `apps/api/src/modules/checkout/checkout.service.spec.ts`

- [ ] **Step 1: Write failing tests for admin event CRUD and purchase-limit enforcement**

```ts
// apps/api/src/modules/admin-events/admin-events.service.spec.ts
import { AdminEventsService } from './admin-events.service';

describe('AdminEventsService', () => {
  const prismaMock = {
    event: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  } as never;

  it('creates an event with sessions and regional tiers', async () => {
    prismaMock.event.create.mockResolvedValue({
      id: 'evt_001',
      sessions: [
        {
          id: 'session_001',
          ticketTiers: [{ id: 'tier_inner_a', name: '内场 A 区' }],
        },
      ],
      title: 'Aurora Arena 巡回演唱会 上海站',
    });

    const service = new AdminEventsService(prismaMock);

    await expect(
      service.createEvent({
        city: '上海',
        sessions: [
          {
            name: '2026-05-01 19:30',
            startsAt: '2026-05-01T11:30:00.000Z',
            tiers: [
              {
                inventory: 200,
                name: '内场 A 区',
                price: 128000,
                purchaseLimit: 4,
                refundable: true,
                requiresRealName: true,
                sortOrder: 1,
                ticketType: 'E_TICKET',
              },
            ],
          },
        ],
        title: 'Aurora Arena 巡回演唱会 上海站',
        venueAddress: '上海市浦东新区世博大道 1200 号',
        venueName: '上海世博体育馆',
      }),
    ).resolves.toMatchObject({
      title: 'Aurora Arena 巡回演唱会 上海站',
    });
  });
});
```

```ts
// apps/api/src/modules/checkout/checkout.service.spec.ts (append)
it('rejects draft orders that exceed the regional tier purchase limit', async () => {
  prismaMock.ticketTier.findUnique.mockResolvedValue({
    id: 'tier_inner_a',
    inventory: 20,
    price: 128000,
    purchaseLimit: 2,
    session: {
      event: {
        id: 'evt_001',
        published: true,
      },
    },
  });

  await expect(
    service.createDraftOrder({
      quantity: 3,
      ticketType: 'E_TICKET',
      tierId: 'tier_inner_a',
      userId: 'cust_001',
      viewerIds: ['viewer_1', 'viewer_2', 'viewer_3'],
    }),
  ).rejects.toThrow('quantity exceeds purchase limit for this tier.');
});
```

- [ ] **Step 2: Run the event and checkout tests to verify they fail**

Run: `corepack pnpm --filter api test -- src/modules/admin-events/admin-events.service.spec.ts src/modules/checkout/checkout.service.spec.ts src/modules/catalog/catalog.service.spec.ts`

Expected: `FAIL` because the admin events service does not exist and checkout does not yet enforce the new tier fields.

- [ ] **Step 3: Implement event CRUD, publish flow, and tier-aware public reads**

```ts
// apps/api/src/modules/admin-events/admin-events.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import type { AdminEventDraft } from '../../../../../packages/contracts/src';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AdminEventsService {
  constructor(private readonly prisma: PrismaService) {}

  async listEvents() {
    return this.prisma.event.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        city: true,
        id: true,
        minPrice: true,
        published: true,
        saleStatus: true,
        title: true,
        updatedAt: true,
        venueName: true,
      },
    });
  }

  async createEvent(input: AdminEventDraft) {
    if (input.sessions.some((session) => session.tiers.length === 0)) {
      throw new BadRequestException('每个场次至少需要一个区域票档。');
    }

    return this.prisma.event.create({
      data: {
        city: input.city,
        coverImageUrl: input.coverImageUrl,
        description: input.description,
        minPrice: Math.min(...input.sessions.flatMap((session) => session.tiers.map((tier) => tier.price))),
        published: false,
        refundEntryEnabled: input.sessions.some((session) =>
          session.tiers.some((tier) => tier.refundable),
        ),
        saleStatus: 'UPCOMING',
        sessions: {
          create: input.sessions.map((session) => ({
            endsAt: session.endsAt ? new Date(session.endsAt) : undefined,
            name: session.name,
            saleEndsAt: session.saleEndsAt ? new Date(session.saleEndsAt) : undefined,
            saleStartsAt: session.saleStartsAt ? new Date(session.saleStartsAt) : undefined,
            startsAt: new Date(session.startsAt),
            ticketTiers: {
              create: session.tiers.map((tier) => ({
                inventory: tier.inventory,
                name: tier.name,
                price: tier.price,
                purchaseLimit: tier.purchaseLimit,
                refundable: tier.refundable,
                refundDeadlineAt: tier.refundDeadlineAt ? new Date(tier.refundDeadlineAt) : undefined,
                requiresRealName: tier.requiresRealName,
                sortOrder: tier.sortOrder,
                ticketType: tier.ticketType,
              })),
            },
          })),
        },
        title: input.title,
        venueAddress: input.venueAddress,
        venueName: input.venueName,
      },
      include: {
        sessions: {
          include: {
            ticketTiers: true,
          },
        },
      },
    });
  }

  async updateEvent(eventId: string, input: AdminEventDraft) {
    const existing = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existing) {
      throw new NotFoundException('活动不存在。');
    }

    await this.prisma.eventSession.deleteMany({
      where: { eventId },
    });

    return this.prisma.event.update({
      data: {
        city: input.city,
        coverImageUrl: input.coverImageUrl,
        description: input.description,
        minPrice: Math.min(...input.sessions.flatMap((session) => session.tiers.map((tier) => tier.price))),
        refundEntryEnabled: input.sessions.some((session) => session.tiers.some((tier) => tier.refundable)),
        sessions: {
          create: input.sessions.map((session) => ({
            endsAt: session.endsAt ? new Date(session.endsAt) : undefined,
            name: session.name,
            saleEndsAt: session.saleEndsAt ? new Date(session.saleEndsAt) : undefined,
            saleStartsAt: session.saleStartsAt ? new Date(session.saleStartsAt) : undefined,
            startsAt: new Date(session.startsAt),
            ticketTiers: {
              create: session.tiers.map((tier) => ({
                inventory: tier.inventory,
                name: tier.name,
                price: tier.price,
                purchaseLimit: tier.purchaseLimit,
                refundable: tier.refundable,
                refundDeadlineAt: tier.refundDeadlineAt ? new Date(tier.refundDeadlineAt) : undefined,
                requiresRealName: tier.requiresRealName,
                sortOrder: tier.sortOrder,
                ticketType: tier.ticketType,
              })),
            },
          })),
        },
        title: input.title,
        venueAddress: input.venueAddress,
        venueName: input.venueName,
      },
      include: {
        sessions: {
          include: {
            ticketTiers: true,
          },
        },
      },
      where: { id: eventId },
    });
  }

  async publishEvent(eventId: string) {
    return this.prisma.event.update({
      data: { published: true },
      where: { id: eventId },
    });
  }

  async unpublishEvent(eventId: string) {
    return this.prisma.event.update({
      data: { published: false },
      where: { id: eventId },
    });
  }
}
```

```ts
// apps/api/src/modules/catalog/catalog.service.ts (extend tier select)
ticketTiers: {
  orderBy: [{ sortOrder: 'asc' }, { price: 'asc' }],
  select: {
    id: true,
    inventory: true,
    name: true,
    price: true,
    purchaseLimit: true,
    refundable: true,
    refundDeadlineAt: true,
    requiresRealName: true,
    sortOrder: true,
    ticketType: true,
  },
},
```

```ts
// apps/api/src/modules/checkout/checkout.service.ts (insert before order creation)
if (tier.purchaseLimit > 0 && input.quantity > tier.purchaseLimit) {
  throw new BadRequestException(
    'quantity exceeds purchase limit for this tier.',
  );
}
```

- [ ] **Step 4: Run the admin events, catalog, and checkout tests**

Run: `corepack pnpm --filter api test -- src/modules/admin-events/admin-events.service.spec.ts src/modules/checkout/checkout.service.spec.ts src/modules/catalog/catalog.service.spec.ts`

Expected: `PASS` for event creation, public catalog normalization, and purchase-limit enforcement.

- [ ] **Step 5: Commit the event management backend**

```bash
git add apps/api/src/modules/admin-events apps/api/src/modules/catalog apps/api/src/modules/checkout apps/api/src/app.module.ts
git commit -m "feat: add admin event management and regional tiers"
```

### Task 6: Implement Admin Order And Refund Operations

**Files:**
- Create: `apps/api/src/modules/admin-orders/admin-orders.module.ts`
- Create: `apps/api/src/modules/admin-orders/admin-orders.controller.ts`
- Create: `apps/api/src/modules/admin-orders/admin-orders.service.ts`
- Create: `apps/api/src/modules/admin-orders/admin-orders.service.spec.ts`
- Create: `apps/api/src/modules/admin-refunds/admin-refunds.module.ts`
- Create: `apps/api/src/modules/admin-refunds/admin-refunds.controller.ts`
- Create: `apps/api/src/modules/admin-refunds/admin-refunds.service.ts`
- Create: `apps/api/src/modules/admin-refunds/admin-refunds.service.spec.ts`
- Modify: `apps/api/src/modules/refunds/refunds.service.ts`
- Modify: `apps/api/src/modules/refunds/refunds.service.spec.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Write failing tests for order notes/flags and admin refund actions**

```ts
// apps/api/src/modules/admin-orders/admin-orders.service.spec.ts
import { AdminOrdersService } from './admin-orders.service';

describe('AdminOrdersService', () => {
  const prismaMock = {
    order: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    orderFlag: {
      create: jest.fn(),
    },
    orderNote: {
      create: jest.fn(),
    },
  } as never;

  it('adds an internal note to an order', async () => {
    prismaMock.orderNote.create.mockResolvedValue({
      content: '联系用户确认观演人信息',
      createdAt: new Date('2026-04-21T09:00:00.000Z'),
      id: 'note_001',
    });

    const service = new AdminOrdersService(prismaMock);

    await expect(
      service.addNote('ord_001', 'seed-admin-ops', '联系用户确认观演人信息'),
    ).resolves.toMatchObject({
      content: '联系用户确认观演人信息',
    });
  });

  it('flags an order as abnormal', async () => {
    prismaMock.orderFlag.create.mockResolvedValue({
      id: 'flag_001',
      type: '异常单',
    });

    const service = new AdminOrdersService(prismaMock);

    await expect(
      service.addFlag('ord_001', 'seed-admin-ops', {
        note: '支付成功后 30 分钟未出票',
        type: '异常单',
      }),
    ).resolves.toMatchObject({
      type: '异常单',
    });
  });
});
```

```ts
// apps/api/src/modules/admin-refunds/admin-refunds.service.spec.ts
import { AdminRefundsService } from './admin-refunds.service';

describe('AdminRefundsService', () => {
  const prismaMock = {
    order: {
      updateMany: jest.fn(),
    },
    refundRequest: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  } as never;
  const upstreamGatewayMock = {
    submitRefund: jest.fn(),
  } as never;

  it('approves a reviewing refund request', async () => {
    prismaMock.refundRequest.findUnique.mockResolvedValue({
      id: 'refund_001',
      refundNo: 'RFD-001',
      status: 'REVIEWING',
    });
    prismaMock.refundRequest.update.mockResolvedValue({
      id: 'refund_001',
      status: 'APPROVED',
    });

    const service = new AdminRefundsService(prismaMock, upstreamGatewayMock);

    await expect(
      service.approve('refund_001', 'seed-admin-ops', '实名信息核验通过'),
    ).resolves.toMatchObject({
      status: 'APPROVED',
    });
  });

  it('processes an approved refund upstream', async () => {
    prismaMock.refundRequest.findUnique.mockResolvedValue({
      id: 'refund_001',
      orderId: 'ord_001',
      refundAmount: 68000,
      refundNo: 'RFD-001',
      status: 'APPROVED',
    });
    prismaMock.refundRequest.update.mockResolvedValue({
      id: 'refund_001',
      status: 'PROCESSING',
    });
    upstreamGatewayMock.submitRefund.mockResolvedValue({
      externalRef: 'vendor_refund_001',
    });

    const service = new AdminRefundsService(prismaMock, upstreamGatewayMock);

    await expect(
      service.process('refund_001', 'seed-admin-ops'),
    ).resolves.toMatchObject({
      status: 'PROCESSING',
    });
  });
});
```

```ts
// apps/api/src/modules/refunds/refunds.service.spec.ts (append)
it('keeps customer refund requests in REVIEWING until admin action', async () => {
  txPrismaMock.order.findUnique.mockResolvedValue({
    id: 'order_123',
    status: ORDER_STATUS.TICKET_ISSUED,
    totalAmount: 100000,
    userId: 'cust_123',
  });
  txPrismaMock.refundRequest.create.mockResolvedValue({
    refundAmount: 80000,
    refundNo: 'RFD-001',
    serviceFee: 20000,
    status: 'REVIEWING',
  });
  txPrismaMock.order.updateMany.mockResolvedValue({ count: 1 });

  const result = await service.requestRefund({
    customerId: 'cust_123',
    orderId: 'order_123',
    reasonCode: 'OTHER',
    daysBeforeStart: 5,
  });

  expect(upstreamGatewayMock.submitRefund).not.toHaveBeenCalled();
  expect(result).toEqual({
    refundAmount: 80000,
    refundNo: 'RFD-001',
    serviceFee: 20000,
    status: 'REVIEWING',
  });
});
```

- [ ] **Step 2: Run the order and refund tests**

Run: `corepack pnpm --filter api test -- src/modules/admin-orders/admin-orders.service.spec.ts src/modules/admin-refunds/admin-refunds.service.spec.ts src/modules/refunds/refunds.service.spec.ts`

Expected: `FAIL` because the admin order/refund modules do not exist and `RefundsService` still auto-submits upstream.

- [ ] **Step 3: Implement order notes/flags and admin refund actions**

```ts
// apps/api/src/modules/admin-orders/admin-orders.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AdminOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async listOrders() {
    return this.prisma.order.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        createdAt: true,
        id: true,
        orderNumber: true,
        status: true,
        totalAmount: true,
      },
    });
  }

  async getOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      include: {
        flags: {
          include: {
            createdBy: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        notes: {
          include: {
            createdBy: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('订单不存在。');
    }

    return order;
  }

  addNote(orderId: string, userId: string, content: string) {
    return this.prisma.orderNote.create({
      data: {
        content,
        createdByUserId: userId,
        orderId,
      },
    });
  }

  addFlag(orderId: string, userId: string, input: { note?: string; type: string }) {
    return this.prisma.orderFlag.create({
      data: {
        createdByUserId: userId,
        note: input.note,
        orderId,
        type: input.type,
      },
    });
  }
}
```

```ts
// apps/api/src/modules/admin-refunds/admin-refunds.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';
import { UpstreamTicketingGateway } from '../../common/vendors/upstream-ticketing.gateway';

@Injectable()
export class AdminRefundsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly upstreamGateway: UpstreamTicketingGateway,
  ) {}

  async approve(refundId: string, userId: string, reviewNote: string) {
    const refund = await this.prisma.refundRequest.findUnique({
      where: { id: refundId },
    });

    if (!refund) {
      throw new NotFoundException('退款申请不存在。');
    }

    if (refund.status !== 'REVIEWING') {
      throw new BadRequestException('当前退款申请不可审核通过。');
    }

    return this.prisma.refundRequest.update({
      data: {
        lastHandledAt: new Date(),
        reviewNote,
        reviewedByUserId: userId,
        status: 'APPROVED',
      },
      where: { id: refundId },
    });
  }

  async reject(refundId: string, userId: string, rejectionReason: string) {
    const refund = await this.prisma.refundRequest.findUnique({
      where: { id: refundId },
    });

    if (!refund || refund.status !== 'REVIEWING') {
      throw new BadRequestException('当前退款申请不可驳回。');
    }

    return this.prisma.refundRequest.update({
      data: {
        lastHandledAt: new Date(),
        processedByUserId: userId,
        rejectionReason,
        status: 'REJECTED',
      },
      where: { id: refundId },
    });
  }

  async process(refundId: string, userId: string) {
    const refund = await this.prisma.refundRequest.findUnique({
      where: { id: refundId },
    });

    if (!refund || refund.status !== 'APPROVED') {
      throw new BadRequestException('当前退款申请不可发起退款。');
    }

    await this.upstreamGateway.submitRefund({
      amount: refund.refundAmount,
      orderId: refund.orderId,
      refundNo: refund.refundNo,
    });

    await this.prisma.order.updateMany({
      data: {
        status: 'REFUND_PROCESSING',
      },
      where: {
        id: refund.orderId,
      },
    });

    return this.prisma.refundRequest.update({
      data: {
        lastHandledAt: new Date(),
        processedByUserId: userId,
        status: 'PROCESSING',
      },
      where: {
        id: refundId,
      },
    });
  }
}
```

```ts
// apps/api/src/modules/refunds/refunds.service.ts (replace requestRefund success tail)
const createdRefund = await tx.refundRequest.create({
  data: {
    orderId: input.orderId,
    reason: input.reasonCode,
    refundAmount,
    refundNo,
    requestedAmount: order.totalAmount,
    serviceFee,
    status: 'REVIEWING',
  },
  select: {
    refundAmount: true,
    refundNo: true,
    serviceFee: true,
    status: true,
  },
});

await tx.order.updateMany({
  data: {
    status: ORDER_STATUS.REFUND_REVIEWING,
  },
  where: {
    id: input.orderId,
    status: {
      in: [
        ORDER_STATUS.PAID_PENDING_FULFILLMENT,
        ORDER_STATUS.SUBMITTED_TO_VENDOR,
        ORDER_STATUS.TICKET_ISSUED,
        ORDER_STATUS.TICKET_FAILED,
      ],
    },
  },
});

return createdRefund;
```

- [ ] **Step 4: Run the order and refund test suite again**

Run: `corepack pnpm --filter api test -- src/modules/admin-orders/admin-orders.service.spec.ts src/modules/admin-refunds/admin-refunds.service.spec.ts src/modules/refunds/refunds.service.spec.ts`

Expected: `PASS` for notes, flags, approve/reject/process actions, and the updated customer refund-review flow.

- [ ] **Step 5: Commit the order and refund backend**

```bash
git add apps/api/src/modules/admin-orders apps/api/src/modules/admin-refunds apps/api/src/modules/refunds apps/api/src/app.module.ts
git commit -m "feat: add admin order and refund operations"
```

### Task 7: Rebuild The Admin Frontend Foundation And Auth Flow

**Files:**
- Modify: `apps/admin/package.json`
- Create: `apps/admin/src/test/setup.ts`
- Create: `apps/admin/src/app/admin-auth-context.tsx`
- Create: `apps/admin/src/app/RequireAdminAuth.tsx`
- Create: `apps/admin/src/app/AdminLayout.tsx`
- Create: `apps/admin/src/pages/login/index.tsx`
- Create: `apps/admin/src/pages/login/index.spec.tsx`
- Create: `apps/admin/src/router.spec.tsx`
- Create: `apps/admin/src/services/admin-auth.ts`
- Modify: `apps/admin/src/services/request.ts`
- Modify: `apps/admin/src/router.tsx`
- Modify: `apps/admin/src/main.tsx`

- [ ] **Step 1: Write failing admin auth and router tests**

```tsx
// apps/admin/src/pages/login/index.spec.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { LoginPage } from './index';

it('submits email and password through the login action', async () => {
  const onSubmit = vi.fn().mockResolvedValue(undefined);

  render(<LoginPage onSubmit={onSubmit} submitting={false} />);

  fireEvent.change(screen.getByLabelText('邮箱'), {
    target: { value: 'ops@miniticket.local' },
  });
  fireEvent.change(screen.getByLabelText('密码'), {
    target: { value: 'Ops12345!' },
  });
  fireEvent.click(screen.getByRole('button', { name: '登录后台' }));

  expect(onSubmit).toHaveBeenCalledWith({
    email: 'ops@miniticket.local',
    password: 'Ops12345!',
  });
});
```

```tsx
// apps/admin/src/router.spec.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { AppRouter } from './router';

it('redirects anonymous users to the login page', async () => {
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <AppRouter />
    </MemoryRouter>,
  );

  expect(await screen.findByText('管理员登录')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the admin tests to verify they fail**

Run: `corepack pnpm --filter admin test`

Expected: `FAIL` because the login page, auth context, test setup, and route guard do not exist yet.

- [ ] **Step 3: Implement the admin auth context, guarded router, and request layer**

```json
// apps/admin/package.json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "jsdom": "^25.0.1"
  }
}
```

```ts
// apps/admin/src/services/request.ts
const DEFAULT_API_BASE_URL = '/api';
const API_BASE_URL_STORAGE_KEY = 'ticketing.admin.apiBaseUrl';

export async function request<TResponse>(
  path: string,
  init: RequestInit = {},
): Promise<TResponse> {
  const response = await fetch(buildApiUrl(path), {
    ...init,
    credentials: 'include',
    headers: {
      accept: 'application/json',
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.status === 204 ? (undefined as TResponse) : ((await response.json()) as TResponse);
}
```

```tsx
// apps/admin/src/app/admin-auth-context.tsx
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { getAdminSession, loginAdmin, logoutAdmin } from '../services/admin-auth';

const AdminAuthContext = createContext<{
  loading: boolean;
  login: typeof loginAdmin;
  logout: () => Promise<void>;
  user?: {
    email: string;
    id: string;
    name: string;
    role: 'ADMIN' | 'OPERATIONS';
  };
}>({
  loading: true,
  login: loginAdmin,
  logout: async () => {},
});

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{
    email: string;
    id: string;
    name: string;
    role: 'ADMIN' | 'OPERATIONS';
  }>();

  useEffect(() => {
    void getAdminSession()
      .then((payload) => setUser(payload.user))
      .catch(() => setUser(undefined))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      loading,
      login: async (input: { email: string; password: string }) => {
        const session = await loginAdmin(input);
        setUser(session.user);
      },
      logout: async () => {
        await logoutAdmin();
        setUser(undefined);
      },
      user,
    }),
    [loading, user],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
```

```tsx
// apps/admin/src/router.tsx
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AdminAuthProvider } from './app/admin-auth-context';
import { AdminLayout } from './app/AdminLayout';
import { RequireAdminAuth } from './app/RequireAdminAuth';
import { DashboardPage } from './pages/dashboard';
import { LoginRoute } from './pages/login';

export function AppRouter() {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <AdminAuthProvider>
          <Routes>
            <Route path='/login' element={<LoginRoute />} />
            <Route
              path='/'
              element={
                <RequireAdminAuth>
                  <AdminLayout />
                </RequireAdminAuth>
              }
            >
              <Route index element={<Navigate replace to='/dashboard' />} />
              <Route path='dashboard' element={<DashboardPage />} />
            </Route>
          </Routes>
        </AdminAuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}
```

- [ ] **Step 4: Run the admin tests and build**

Run: `corepack pnpm --filter admin test && corepack pnpm --filter admin build`

Expected: `PASS` for the login/router tests and a successful Vite production build.

- [ ] **Step 5: Commit the frontend foundation**

```bash
git add apps/admin/package.json apps/admin/src
git commit -m "feat: add admin frontend auth shell"
```

### Task 8: Build The Dashboard And Event Editor UI

**Files:**
- Create: `apps/admin/src/pages/dashboard/index.tsx`
- Create: `apps/admin/src/pages/dashboard/index.spec.tsx`
- Create: `apps/admin/src/pages/events/list.tsx`
- Create: `apps/admin/src/pages/events/editor.tsx`
- Create: `apps/admin/src/pages/events/editor.spec.tsx`
- Create: `apps/admin/src/services/admin-dashboard.ts`
- Create: `apps/admin/src/services/admin-events.ts`
- Modify: `apps/admin/src/router.tsx`
- Replace: `apps/admin/src/pages/events/index.tsx`

- [ ] **Step 1: Write failing dashboard and event-editor tests**

```tsx
// apps/admin/src/pages/dashboard/index.spec.tsx
import { render, screen } from '@testing-library/react';

import { DashboardPage } from './index';

it('renders the four summary cards and recent actions', async () => {
  render(
    <DashboardPage
      data={{
        activeEventCount: 3,
        flaggedOrderCount: 6,
        pendingRefundCount: 4,
        recentActions: [
          {
            action: 'EVENT_PUBLISHED',
            actorName: '超级管理员',
            createdAt: '2026-04-21T08:30:00.000Z',
            targetId: 'evt_001',
            targetType: 'EVENT',
          },
        ],
        upcomingEventCount: 2,
      }}
      loading={false}
      onRefresh={async () => {}}
    />,
  );

  expect(screen.getByText('待处理退款')).toBeInTheDocument();
  expect(screen.getByText('异常订单')).toBeInTheDocument();
  expect(screen.getByText('即将开售')).toBeInTheDocument();
  expect(screen.getByText('售卖中活动')).toBeInTheDocument();
});
```

```tsx
// apps/admin/src/pages/events/editor.spec.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { EventEditorPage } from './editor';

it('submits regional tiers from the event editor form', async () => {
  const onSubmit = vi.fn().mockResolvedValue(undefined);

  render(<EventEditorPage initialValue={undefined} onSubmit={onSubmit} submitting={false} />);

  fireEvent.change(screen.getByLabelText('活动标题'), {
    target: { value: 'Aurora Arena 巡回演唱会 上海站' },
  });
  fireEvent.change(screen.getByLabelText('城市'), {
    target: { value: '上海' },
  });
  fireEvent.click(screen.getByRole('button', { name: '新增区域票档' }));
  fireEvent.change(screen.getByLabelText('区域名称'), {
    target: { value: '内场 A 区' },
  });
  fireEvent.change(screen.getByLabelText('售价（分）'), {
    target: { value: '128000' },
  });

  fireEvent.click(screen.getByRole('button', { name: '保存草稿' }));

  expect(onSubmit).toHaveBeenCalled();
});
```

- [ ] **Step 2: Run the dashboard and event page tests**

Run: `corepack pnpm --filter admin test -- src/pages/dashboard/index.spec.tsx src/pages/events/editor.spec.tsx`

Expected: `FAIL` because the dashboard summary page and the event editor with regional-tier fields do not exist yet.

- [ ] **Step 3: Implement the dashboard and event management pages**

```tsx
// apps/admin/src/pages/dashboard/index.tsx
import { Button, Card, Col, List, Row, Space, Typography } from 'antd';

export function DashboardPage({
  data,
  loading,
  onRefresh,
}: {
  data: AdminDashboardSummary;
  loading: boolean;
  onRefresh: () => Promise<void>;
}) {
  return (
    <Space direction='vertical' size={24} style={{ display: 'flex' }}>
      <div>
        <Typography.Title level={3}>概览</Typography.Title>
        <Typography.Text type='secondary'>今天优先处理待办和风险单。</Typography.Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={6}><Card title='待处理退款'>{data.pendingRefundCount}</Card></Col>
        <Col span={6}><Card title='异常订单'>{data.flaggedOrderCount}</Card></Col>
        <Col span={6}><Card title='即将开售'>{data.upcomingEventCount}</Card></Col>
        <Col span={6}><Card title='售卖中活动'>{data.activeEventCount}</Card></Col>
      </Row>

      <Card
        extra={<Button loading={loading} onClick={() => void onRefresh()}>刷新</Button>}
        title='最近操作'
      >
        <List
          dataSource={data.recentActions}
          renderItem={(item) => (
            <List.Item>
              <Space direction='vertical' size={0}>
                <Typography.Text strong>{item.action}</Typography.Text>
                <Typography.Text type='secondary'>
                  {item.actorName} · {new Date(item.createdAt).toLocaleString('zh-CN', { hour12: false })}
                </Typography.Text>
              </Space>
            </List.Item>
          )}
        />
      </Card>
    </Space>
  );
}
```

```tsx
// apps/admin/src/pages/events/editor.tsx
import { Button, Card, Form, Input, InputNumber, Select, Space, Switch } from 'antd';

export function EventEditorPage({
  initialValue,
  onSubmit,
  submitting,
}: {
  initialValue?: AdminEventDraft;
  onSubmit: (value: AdminEventDraft) => Promise<void>;
  submitting: boolean;
}) {
  const [form] = Form.useForm<AdminEventDraft>();

  return (
    <Form
      form={form}
      initialValues={initialValue}
      layout='vertical'
      onFinish={(value) => void onSubmit(value)}
    >
      <Card title='基本信息'>
        <Form.Item label='活动标题' name='title' rules={[{ required: true, message: '请填写活动标题' }]}>
          <Input />
        </Form.Item>
        <Form.Item label='城市' name='city' rules={[{ required: true, message: '请填写城市' }]}>
          <Input />
        </Form.Item>
        <Form.Item label='场馆名称' name='venueName' rules={[{ required: true, message: '请填写场馆名称' }]}>
          <Input />
        </Form.Item>
        <Form.Item label='场馆地址' name='venueAddress' rules={[{ required: true, message: '请填写场馆地址' }]}>
          <Input />
        </Form.Item>
      </Card>

      <Card style={{ marginTop: 16 }} title='场次与区域票档'>
        <Form.List name='sessions'>
          {(sessionFields, { add: addSession }) => (
            <Space direction='vertical' size={16} style={{ display: 'flex' }}>
              {sessionFields.map((sessionField) => (
                <Card key={sessionField.key} size='small' title={`场次 ${sessionField.name + 1}`}>
                  <Form.Item label='场次名称' name={[sessionField.name, 'name']} rules={[{ required: true, message: '请填写场次名称' }]}>
                    <Input />
                  </Form.Item>
                  <Form.List name={[sessionField.name, 'tiers']}>
                    {(tierFields, { add: addTier }) => (
                      <Space direction='vertical' size={12} style={{ display: 'flex' }}>
                        {tierFields.map((tierField) => (
                          <Card key={tierField.key} size='small' title='区域票档'>
                            <Form.Item label='区域名称' name={[tierField.name, 'name']} rules={[{ required: true, message: '请填写区域名称' }]}>
                              <Input />
                            </Form.Item>
                            <Form.Item label='售价（分）' name={[tierField.name, 'price']} rules={[{ required: true, message: '请填写售价' }]}>
                              <InputNumber min={1} style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item label='库存' name={[tierField.name, 'inventory']} rules={[{ required: true, message: '请填写库存' }]}>
                              <InputNumber min={0} style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item label='每单限购' name={[tierField.name, 'purchaseLimit']} rules={[{ required: true, message: '请填写限购数量' }]}>
                              <InputNumber min={1} style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item label='票种' name={[tierField.name, 'ticketType']} initialValue='E_TICKET'>
                              <Select options={[{ label: '电子票', value: 'E_TICKET' }, { label: '纸质票', value: 'PAPER_TICKET' }]} />
                            </Form.Item>
                            <Form.Item label='实名购票' name={[tierField.name, 'requiresRealName']} valuePropName='checked' initialValue>
                              <Switch checkedChildren='是' unCheckedChildren='否' />
                            </Form.Item>
                            <Form.Item label='支持退款' name={[tierField.name, 'refundable']} valuePropName='checked' initialValue={false}>
                              <Switch checkedChildren='是' unCheckedChildren='否' />
                            </Form.Item>
                          </Card>
                        ))}
                        <Button onClick={() => addTier({ purchaseLimit: 4, refundable: false, requiresRealName: true, sortOrder: tierFields.length + 1, ticketType: 'E_TICKET' })}>
                          新增区域票档
                        </Button>
                      </Space>
                    )}
                  </Form.List>
                </Card>
              ))}
              <Button onClick={() => addSession({ tiers: [{ purchaseLimit: 4, refundable: false, requiresRealName: true, sortOrder: 1, ticketType: 'E_TICKET' }] })}>
                新增场次
              </Button>
            </Space>
          )}
        </Form.List>
      </Card>

      <Space style={{ marginTop: 24 }}>
        <Button htmlType='submit' loading={submitting} type='primary'>保存草稿</Button>
        <Button loading={submitting}>发布活动</Button>
      </Space>
    </Form>
  );
}
```

- [ ] **Step 4: Run the admin page tests and build**

Run: `corepack pnpm --filter admin test && corepack pnpm --filter admin build`

Expected: `PASS` for dashboard and event editor coverage, with the admin build still succeeding.

- [ ] **Step 5: Commit the dashboard and event pages**

```bash
git add apps/admin/src/pages/dashboard apps/admin/src/pages/events apps/admin/src/services/admin-dashboard.ts apps/admin/src/services/admin-events.ts apps/admin/src/router.tsx
git commit -m "feat: add admin dashboard and event editor ui"
```

### Task 9: Build Orders, Refunds, Users Pages And Finish Verification

**Files:**
- Create: `apps/admin/src/pages/orders/list.tsx`
- Create: `apps/admin/src/pages/orders/detail.tsx`
- Create: `apps/admin/src/pages/orders/detail.spec.tsx`
- Create: `apps/admin/src/pages/refunds/list.tsx`
- Create: `apps/admin/src/pages/refunds/detail.tsx`
- Create: `apps/admin/src/pages/refunds/detail.spec.tsx`
- Create: `apps/admin/src/pages/users/index.tsx`
- Create: `apps/admin/src/pages/users/index.spec.tsx`
- Create: `apps/admin/src/services/admin-orders.ts`
- Create: `apps/admin/src/services/admin-refunds.ts`
- Create: `apps/admin/src/services/admin-users.ts`
- Modify: `apps/admin/src/router.tsx`
- Delete: `apps/admin/src/pages/fulfillment/index.tsx`
- Replace: `apps/admin/src/pages/orders/index.tsx`
- Replace: `apps/admin/src/pages/refunds/index.tsx`
- Modify: `README.md`
- Modify: `docs/handoff/README.md`
- Modify: `.env.example`

- [ ] **Step 1: Write failing tests for order detail, refund detail, and users page**

```tsx
// apps/admin/src/pages/orders/detail.spec.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { OrderDetailPage } from './detail';

it('adds a note and a flag from the order detail operation rail', async () => {
  const onCreateNote = vi.fn().mockResolvedValue(undefined);
  const onCreateFlag = vi.fn().mockResolvedValue(undefined);

  render(
    <OrderDetailPage
      data={{
        flags: [],
        id: 'ord_001',
        notes: [],
        orderNumber: 'AT202604210001',
        status: 'PAID_PENDING_FULFILLMENT',
      } as never}
      onCreateFlag={onCreateFlag}
      onCreateNote={onCreateNote}
    />,
  );

  fireEvent.change(screen.getByLabelText('内部备注'), {
    target: { value: '联系用户确认实名信息' },
  });
  fireEvent.click(screen.getByRole('button', { name: '添加备注' }));

  expect(onCreateNote).toHaveBeenCalledWith('联系用户确认实名信息');
});
```

```tsx
// apps/admin/src/pages/refunds/detail.spec.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { RefundDetailPage } from './detail';

it('approves a reviewing refund request', async () => {
  const onApprove = vi.fn().mockResolvedValue(undefined);

  render(
    <RefundDetailPage
      data={{
        id: 'refund_001',
        reviewNote: '',
        status: 'REVIEWING',
      } as never}
      onApprove={onApprove}
      onProcess={vi.fn()}
      onReject={vi.fn()}
    />,
  );

  fireEvent.change(screen.getByLabelText('审核备注'), {
    target: { value: '实名问题已核验' },
  });
  fireEvent.click(screen.getByRole('button', { name: '审核通过' }));

  expect(onApprove).toHaveBeenCalledWith('实名问题已核验');
});
```

```tsx
// apps/admin/src/pages/users/index.spec.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { UsersPage } from './index';

it('creates a new operations account', async () => {
  const onCreate = vi.fn().mockResolvedValue(undefined);

  render(<UsersPage items={[]} onCreate={onCreate} onToggleEnabled={vi.fn()} onUpdateRole={vi.fn()} />);

  fireEvent.change(screen.getByLabelText('姓名'), {
    target: { value: '票务运营 B' },
  });
  fireEvent.change(screen.getByLabelText('邮箱'), {
    target: { value: 'ops2@miniticket.local' },
  });
  fireEvent.change(screen.getByLabelText('初始密码'), {
    target: { value: 'OpsOps123!' },
  });
  fireEvent.mouseDown(screen.getByLabelText('角色'));
  fireEvent.click(screen.getByText('运营'));
  fireEvent.click(screen.getByRole('button', { name: '创建账号' }));

  expect(onCreate).toHaveBeenCalledWith({
    email: 'ops2@miniticket.local',
    name: '票务运营 B',
    password: 'OpsOps123!',
    role: 'OPERATIONS',
  });
});
```

- [ ] **Step 2: Run the full admin test suite to verify these pages fail**

Run: `corepack pnpm --filter admin test`

Expected: `FAIL` because the new order detail, refund detail, and users page components do not exist yet.

- [ ] **Step 3: Implement the remaining admin pages, route map, and docs**

```tsx
// apps/admin/src/pages/orders/detail.tsx
import { Button, Card, Form, Input, List, Select, Space, Tag, Typography } from 'antd';
import { useState } from 'react';

export function OrderDetailPage({
  data,
  onCreateFlag,
  onCreateNote,
}: {
  data: AdminOrderDetail;
  onCreateFlag: (input: { note?: string; type: '异常单' | '待人工核查' | '用户争议' }) => Promise<void>;
  onCreateNote: (content: string) => Promise<void>;
}) {
  const [note, setNote] = useState('');
  const [flagType, setFlagType] = useState<'异常单' | '待人工核查' | '用户争议'>('异常单');
  const [flagNote, setFlagNote] = useState('');

  return (
    <Space align='start' size={24} style={{ display: 'flex' }}>
      <Card style={{ flex: 1 }} title={data.orderNumber}>
        <Typography.Paragraph>订单状态：{data.status}</Typography.Paragraph>
        <List
          dataSource={data.notes}
          header='内部备注'
          renderItem={(item) => (
            <List.Item>
              <Space direction='vertical' size={0}>
                <Typography.Text>{item.content}</Typography.Text>
                <Typography.Text type='secondary'>{item.createdByName}</Typography.Text>
              </Space>
            </List.Item>
          )}
        />
      </Card>
      <Card style={{ width: 360 }} title='运营操作'>
        <Form layout='vertical'>
          <Form.Item label='内部备注'>
            <Input.TextArea rows={4} value={note} onChange={(event) => setNote(event.target.value)} />
          </Form.Item>
          <Button onClick={() => void onCreateNote(note)} type='primary'>添加备注</Button>

          <Form.Item label='异常标记' style={{ marginTop: 16 }}>
            <Select value={flagType} onChange={(value) => setFlagType(value)}>
              <Select.Option value='异常单'>异常单</Select.Option>
              <Select.Option value='待人工核查'>待人工核查</Select.Option>
              <Select.Option value='用户争议'>用户争议</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label='标记说明'>
            <Input.TextArea rows={3} value={flagNote} onChange={(event) => setFlagNote(event.target.value)} />
          </Form.Item>
          <Button onClick={() => void onCreateFlag({ note: flagNote, type: flagType })}>标记异常</Button>
        </Form>
      </Card>
    </Space>
  );
}
```

```tsx
// apps/admin/src/pages/refunds/detail.tsx
import { Button, Card, Form, Input, Space, Typography } from 'antd';
import { useState } from 'react';

export function RefundDetailPage({
  data,
  onApprove,
  onProcess,
  onReject,
}: {
  data: AdminRefundDetail;
  onApprove: (note: string) => Promise<void>;
  onProcess: () => Promise<void>;
  onReject: (reason: string) => Promise<void>;
}) {
  const [note, setNote] = useState(data.reviewNote ?? '');
  const [rejectReason, setRejectReason] = useState('');

  return (
    <Card title={data.refundNo}>
      <Space direction='vertical' size={16} style={{ display: 'flex' }}>
        <Typography.Text>退款状态：{data.status}</Typography.Text>
        <Form layout='vertical'>
          <Form.Item label='审核备注'>
            <Input.TextArea rows={4} value={note} onChange={(event) => setNote(event.target.value)} />
          </Form.Item>
          <Space>
            <Button onClick={() => void onApprove(note)} type='primary'>审核通过</Button>
            <Button onClick={() => void onProcess()}>发起退款</Button>
          </Space>
          <Form.Item label='驳回原因' style={{ marginTop: 16 }}>
            <Input.TextArea rows={4} value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} />
          </Form.Item>
          <Button danger onClick={() => void onReject(rejectReason)}>驳回申请</Button>
        </Form>
      </Space>
    </Card>
  );
}
```

```tsx
// apps/admin/src/router.tsx (final route tree)
<Route
  path='/'
  element={
    <RequireAdminAuth>
      <AdminLayout />
    </RequireAdminAuth>
  }
>
  <Route index element={<Navigate replace to='/dashboard' />} />
  <Route path='dashboard' element={<DashboardRoute />} />
  <Route path='events' element={<EventsListRoute />} />
  <Route path='events/new' element={<EventEditorRoute />} />
  <Route path='events/:eventId' element={<EventEditorRoute />} />
  <Route path='orders' element={<OrdersListRoute />} />
  <Route path='orders/:orderId' element={<OrderDetailRoute />} />
  <Route path='refunds' element={<RefundsListRoute />} />
  <Route path='refunds/:refundId' element={<RefundDetailRoute />} />
  <Route path='users' element={<UsersRoute />} />
</Route>
```

```tsx
// apps/admin/src/pages/users/index.tsx
import { Button, Form, Input, Select, Space, Switch, Table, Typography } from 'antd';

export function UsersPage({
  items,
  onCreate,
  onToggleEnabled,
  onUpdateRole,
}: {
  items: AdminUserListItem[];
  onCreate: (input: { email: string; name: string; password: string; role: 'ADMIN' | 'OPERATIONS' }) => Promise<void>;
  onToggleEnabled: (userId: string, enabled: boolean) => Promise<void>;
  onUpdateRole: (userId: string, role: 'ADMIN' | 'OPERATIONS') => Promise<void>;
}) {
  const [form] = Form.useForm();

  return (
    <Space direction='vertical' size={24} style={{ display: 'flex' }}>
      <Typography.Title level={3}>账号</Typography.Title>

      <Form form={form} layout='vertical' onFinish={(value) => void onCreate(value)}>
        <Form.Item label='姓名' name='name' rules={[{ required: true, message: '请填写姓名' }]}>
          <Input />
        </Form.Item>
        <Form.Item label='邮箱' name='email' rules={[{ required: true, message: '请填写邮箱' }]}>
          <Input />
        </Form.Item>
        <Form.Item label='初始密码' name='password' rules={[{ required: true, message: '请填写初始密码' }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item label='角色' name='role' initialValue='OPERATIONS'>
          <Select
            options={[
              { label: '超级管理员', value: 'ADMIN' },
              { label: '运营', value: 'OPERATIONS' },
            ]}
          />
        </Form.Item>
        <Button htmlType='submit' type='primary'>创建账号</Button>
      </Form>

      <Table
        columns={[
          { dataIndex: 'name', key: 'name', title: '姓名' },
          { dataIndex: 'email', key: 'email', title: '邮箱' },
          {
            dataIndex: 'role',
            key: 'role',
            title: '角色',
            render: (value: 'ADMIN' | 'OPERATIONS', record: AdminUserListItem) => (
              <Select
                onChange={(nextRole) => void onUpdateRole(record.id, nextRole)}
                options={[
                  { label: '超级管理员', value: 'ADMIN' },
                  { label: '运营', value: 'OPERATIONS' },
                ]}
                value={value}
              />
            ),
          },
          {
            dataIndex: 'enabled',
            key: 'enabled',
            title: '启用状态',
            render: (value: boolean, record: AdminUserListItem) => (
              <Switch checked={value} onChange={(checked) => void onToggleEnabled(record.id, checked)} />
            ),
          },
        ]}
        dataSource={items}
        rowKey='id'
      />
    </Space>
  );
}
```

```md
<!-- README.md -->
## 后台运营管理系统（开发态）

1. 运行 `corepack pnpm bootstrap:local`
2. 运行 `corepack pnpm dev:api`
3. 运行 `corepack pnpm dev:admin`
4. 浏览器打开后台开发地址
5. 使用种子账号登录：
   - 超级管理员：`admin@miniticket.local / Admin123!`
   - 运营：`ops@miniticket.local / Ops12345!`
```

- [ ] **Step 4: Run full verification**

Run:

```bash
corepack pnpm lint
corepack pnpm test
corepack pnpm --filter admin build
corepack pnpm --filter api test -- src/modules/admin-auth/admin-auth.service.spec.ts src/modules/admin-dashboard/admin-dashboard.service.spec.ts src/modules/admin-events/admin-events.service.spec.ts src/modules/admin-orders/admin-orders.service.spec.ts src/modules/admin-refunds/admin-refunds.service.spec.ts src/modules/admin-users/admin-users.service.spec.ts
corepack pnpm bootstrap:local
```

Expected:
- repository lint passes
- contracts, workspace, admin, and api tests all pass
- admin production build succeeds
- local bootstrap succeeds with seeded admin users and regional tiers

- [ ] **Step 5: Commit the remaining admin UI and docs**

```bash
git add apps/admin/src README.md docs/handoff/README.md .env.example
git commit -m "feat: finish admin ops mvp workbench"
```
