# 后台补齐项 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 补齐 `admin` 后台的 3 个收尾项：前端分包、账号角色修改、团队快速接手文档。

**Architecture:** 保持当前 `admin workbench` 信息架构不变，只在现有模块上做最小增量。后端继续通过 `packages/contracts` 做 schema 校验并写审计日志；前端通过路由懒加载和 `vite manualChunks` 缓解首屏包体；文档通过新增两份 handoff 文档并补 README 入口完成收口。

**Tech Stack:** React 19、React Router、Ant Design、Vite、Vitest、NestJS、Prisma、Zod、pnpm

---

## 文件结构与职责

- `packages/contracts/src/admin-user.ts`
  - 新增最小角色修改请求 schema，避免后端和前端各自手写 payload。
- `packages/contracts/src/contracts.spec.ts`
  - 为新 schema 补 contracts 层回归测试。
- `packages/contracts/src/index.ts`
  - 导出新的账号角色修改 schema / type。
- `apps/api/src/modules/admin-users/admin-users.controller.ts`
  - 新增后台账号角色修改入口并复用 contracts 校验。
- `apps/api/src/modules/admin-users/admin-users.service.ts`
  - 落地角色修改事务、审计日志和返回值。
- `apps/api/src/modules/admin-users/admin-users.controller.spec.ts`
  - 覆盖 controller 对角色修改 payload 的校验和委托。
- `apps/api/src/modules/admin-users/admin-users.service.spec.ts`
  - 覆盖角色修改成功、审计日志和异常路径。
- `apps/admin/src/services/admin-users.ts`
  - 新增角色修改请求方法。
- `apps/admin/src/pages/users/index.tsx`
  - 在账号列表中补角色修改交互。
- `apps/admin/src/pages/users/index.spec.tsx`
  - 覆盖角色修改交互和调用。
- `apps/admin/src/router.tsx`
  - 改成按路由懒加载页面组件。
- `apps/admin/src/main.tsx`
  - 提供统一 Suspense fallback。
- `apps/admin/src/app/RouteLoading.tsx`
  - 抽出共享的路由加载占位组件，方便复用与测试。
- `apps/admin/src/app/workbench.css`
  - 加载中占位样式。
- `apps/admin/src/router.spec.tsx`
  - 覆盖路由懒加载 fallback。
- `apps/admin/vite.config.mts`
  - 新增 `build.rollupOptions.output.manualChunks`。
- `README.md`
  - 新增“10 分钟接手”与版本说明入口。
- `docs/handoff/README.md`
  - 把新文档补进 handoff 阅读顺序。
- `docs/handoff/10-minute-onboarding.md`
  - 新同事 10 分钟快速上手说明。
- `docs/handoff/release-notes-admin-workbench.md`
  - 记录本轮后台工作台合并的范围、边界和后续事项。
- `tests/workspace/repo-layout.spec.ts`
  - 为 handoff 入口文档补最小存在性断言。

### Task 1: 后端补齐账号角色修改

**Files:**
- Modify: `packages/contracts/src/admin-user.ts`
- Modify: `packages/contracts/src/contracts.spec.ts`
- Modify: `packages/contracts/src/index.ts`
- Modify: `apps/api/src/modules/admin-users/admin-users.controller.ts`
- Modify: `apps/api/src/modules/admin-users/admin-users.service.ts`
- Modify: `apps/api/src/modules/admin-users/admin-users.controller.spec.ts`
- Modify: `apps/api/src/modules/admin-users/admin-users.service.spec.ts`

- [ ] **Step 1: 先写 contracts 与 controller 的失败用例**

```ts
// packages/contracts/src/contracts.spec.ts
expect(() =>
  adminUserRoleUpdateRequestSchema.parse({ role: 'VIEWER' }),
).toThrow();

// apps/api/src/modules/admin-users/admin-users.controller.spec.ts
it('rejects role update payloads with unsupported roles', async () => {
  const controller = new AdminUsersController(adminUsersServiceMock);

  await expect(
    controller.updateRole(
      { id: 'admin_001' },
      'admin_002',
      { role: 'VIEWER' } as unknown as { role: 'ADMIN' | 'OPERATIONS' },
    ),
  ).rejects.toBeInstanceOf(BadRequestException);

  expect(adminUsersServiceMock.updateRole).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: 运行失败用例，确认当前没有角色修改实现**

Run:

```bash
corepack pnpm --filter api test -- src/modules/admin-users/admin-users.controller.spec.ts src/modules/admin-users/admin-users.service.spec.ts
corepack pnpm --filter @ticketing/contracts test -- src/contracts.spec.ts
```

Expected:

```text
FAIL ... Property 'updateRole' does not exist on type 'AdminUsersService'
FAIL ... controller.updateRole is not a function
FAIL ... adminUserRoleUpdateRequestSchema is not defined
```

- [ ] **Step 3: 写 service 的失败用例，锁定事务与审计日志**

```ts
it('updates an admin user role and records an audit log', async () => {
  const txMock = {
    adminAuditLog: {
      create: jest.fn().mockResolvedValue({ id: 'audit_003' }),
    },
    user: {
      findFirst: jest.fn().mockResolvedValue({
        createdAt: new Date('2026-04-21T08:00:00.000Z'),
        email: 'ops2@miniticket.local',
        enabled: true,
        id: 'user_ops_002',
        name: 'Ops B',
        role: 'ADMIN',
        updatedAt: new Date('2026-04-22T08:00:00.000Z'),
      }),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
  } as never;

  (prismaMock.$transaction as jest.Mock).mockImplementation(
    async (callback: (transaction: never) => Promise<never>) => callback(txMock),
  );

  const service = new AdminUsersService(prismaMock);
  const result = await service.updateRole(
    'user_ops_002',
    'ADMIN',
    'seed-admin-super',
  );

  expect(result.role).toBe('ADMIN');
  expect(txMock.user.updateMany).toHaveBeenCalledWith({
    data: { role: 'ADMIN' },
    where: {
      id: 'user_ops_002',
      role: { in: ['ADMIN', 'OPERATIONS'] },
    },
  });
  expect(txMock.adminAuditLog.create).toHaveBeenCalledWith({
    data: {
      action: 'ADMIN_USER_ROLE_UPDATED',
      payload: {
        nextRole: 'ADMIN',
        previousRole: 'OPERATIONS',
      },
      targetId: 'user_ops_002',
      targetType: 'ADMIN_USER',
      userId: 'seed-admin-super',
    },
  });
});
```

- [ ] **Step 4: 落地 contracts 与后端最小实现**

```ts
// packages/contracts/src/admin-user.ts
export const adminUserRoleUpdateRequestSchema = z
  .object({
    role: adminRoleSchema,
  })
  .strict();

export type AdminUserRoleUpdateRequest = z.infer<
  typeof adminUserRoleUpdateRequestSchema
>;

// packages/contracts/src/index.ts
export {
  adminUserListItemSchema,
  adminUserCreateRequestSchema,
  adminUserUpdateRequestSchema,
  adminUserRoleUpdateRequestSchema,
  type AdminUserListItem,
  type AdminUserCreateRequest,
  type AdminUserUpdateRequest,
  type AdminUserRoleUpdateRequest,
} from './admin-user';

// apps/api/src/modules/admin-users/admin-users.controller.ts
import {
  adminUserCreateRequestSchema,
  adminUserRoleUpdateRequestSchema,
} from '../../../../../packages/contracts/src';

type UpdateAdminUserRoleBody = {
  role: 'ADMIN' | 'OPERATIONS';
};

function parseUpdateRoleBody(body: unknown): UpdateAdminUserRoleBody {
  const parsed = adminUserRoleUpdateRequestSchema.safeParse(body);

  if (!parsed.success) {
    throw new BadRequestException('账号角色不正确，请重新选择。');
  }

  return parsed.data;
}

@Patch(':userId')
updateRole(
  @CurrentAdmin() admin: { id: string },
  @Param('userId') userId: string,
  @Body() body: unknown,
) {
  const payload = parseUpdateRoleBody(body);
  return this.adminUsersService.updateRole(userId, payload.role, admin.id);
}

// apps/api/src/modules/admin-users/admin-users.service.ts
async updateRole(
  userId: string,
  role: AdminUserRole,
  actorUserId: string,
): Promise<AdminUserListItem> {
  const user = await this.prisma.$transaction(async (tx) => {
    const previousUser = await tx.user.findFirst({
      select: {
        createdAt: true,
        email: true,
        enabled: true,
        id: true,
        name: true,
        role: true,
        updatedAt: true,
      },
      where: {
        id: userId,
        role: {
          in: ['ADMIN', 'OPERATIONS'],
        },
      },
    });

    if (!previousUser) {
      throw new NotFoundException('后台账号不存在。');
    }

    await tx.user.updateMany({
      data: { role },
      where: {
        id: userId,
        role: {
          in: ['ADMIN', 'OPERATIONS'],
        },
      },
    });

    const updatedUser = await tx.user.findFirst({
      select: {
        createdAt: true,
        email: true,
        enabled: true,
        id: true,
        name: true,
        role: true,
        updatedAt: true,
      },
      where: {
        id: userId,
        role: {
          in: ['ADMIN', 'OPERATIONS'],
        },
      },
    });

    if (!updatedUser) {
      throw new NotFoundException('后台账号不存在。');
    }

    await tx.adminAuditLog.create({
      data: {
        action: 'ADMIN_USER_ROLE_UPDATED',
        payload: {
          nextRole: updatedUser.role,
          previousRole: previousUser.role,
        },
        targetId: updatedUser.id,
        targetType: 'ADMIN_USER',
        userId: actorUserId,
      },
    });

    return updatedUser;
  });

  return user as AdminUserListItem;
}
```

- [ ] **Step 5: 运行后端测试，确认角色修改可用**

Run:

```bash
corepack pnpm --filter api test -- src/modules/admin-users/admin-users.controller.spec.ts src/modules/admin-users/admin-users.service.spec.ts
```

Expected:

```text
PASS src/modules/admin-users/admin-users.controller.spec.ts
PASS src/modules/admin-users/admin-users.service.spec.ts
```

- [ ] **Step 6: 提交后端角色修改**

```bash
git add packages/contracts/src/admin-user.ts packages/contracts/src/contracts.spec.ts packages/contracts/src/index.ts apps/api/src/modules/admin-users/admin-users.controller.ts apps/api/src/modules/admin-users/admin-users.service.ts apps/api/src/modules/admin-users/admin-users.controller.spec.ts apps/api/src/modules/admin-users/admin-users.service.spec.ts
git commit -m "feat: support admin user role updates"
```

### Task 2: 前端账号页补角色修改交互

**Files:**
- Modify: `apps/admin/src/services/admin-users.ts`
- Modify: `apps/admin/src/pages/users/index.tsx`
- Modify: `apps/admin/src/pages/users/index.spec.tsx`
- Test: `apps/admin/src/services/admin-users.spec.ts`

- [ ] **Step 1: 先写前端服务与页面的失败用例**

```ts
// apps/admin/src/services/admin-users.spec.ts
it('updates a user role through the admin API', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
    new Response(
      JSON.stringify({
        createdAt: '2026-04-22T08:00:00.000Z',
        email: 'ops@miniticket.local',
        enabled: true,
        id: 'admin_002',
        name: '运营二号',
        role: 'ADMIN',
        updatedAt: '2026-04-22T09:00:00.000Z',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    ),
  );

  const result = await updateAdminUserRole('admin_002', 'ADMIN');

  expect(result.role).toBe('ADMIN');
});

// apps/admin/src/pages/users/index.spec.tsx
it('updates a user role from the table', async () => {
  const user = userEvent.setup();
  vi.mocked(getAdminUsers).mockResolvedValue([
    {
      createdAt: '2026-04-20T08:00:00.000Z',
      email: 'ops@miniticket.local',
      enabled: true,
      id: 'admin_002',
      name: '运营二号',
      role: 'OPERATIONS',
      updatedAt: '2026-04-22T08:00:00.000Z',
    },
  ]);
  vi.mocked(updateAdminUserRole).mockResolvedValue({
    createdAt: '2026-04-20T08:00:00.000Z',
    email: 'ops@miniticket.local',
    enabled: true,
    id: 'admin_002',
    name: '运营二号',
    role: 'ADMIN',
    updatedAt: '2026-04-22T09:00:00.000Z',
  });

  render(<UsersPage />);

  await screen.findByText('运营二号');
  await user.click(screen.getByRole('combobox', { name: '账号角色-admin_002' }));
  await user.click(screen.getByTitle('管理员'));

  await waitFor(() => {
    expect(updateAdminUserRole).toHaveBeenCalledWith('admin_002', 'ADMIN');
  });
});
```

- [ ] **Step 2: 运行前端测试，确认当前缺少更新能力**

Run:

```bash
corepack pnpm --filter admin test -- src/services/admin-users.spec.ts src/pages/users/index.spec.tsx
```

Expected:

```text
FAIL ... updateAdminUserRole is not exported
FAIL ... updateAdminUserRole is not defined
```

- [ ] **Step 3: 落地服务函数与页面交互**

```ts
// apps/admin/src/services/admin-users.ts
import {
  adminUserListItemSchema,
  adminUserRoleUpdateRequestSchema,
  type AdminUserRole,
} from '@ticketing/contracts';

export async function updateAdminUserRole(
  userId: string,
  role: AdminUserRole,
): Promise<AdminUserListItem> {
  const payload = await jsonRequest<unknown>(
    `/admin/users/${userId}`,
    'PATCH',
    adminUserRoleUpdateRequestSchema.parse({ role }),
  );

  return adminUserListItemSchema.parse(payload);
}

// apps/admin/src/pages/users/index.tsx
import { Select } from 'antd';
import { updateAdminUserRole } from '../../services/admin-users';

async function handleRoleChange(
  row: AdminUserListItem,
  nextRole: AdminUserListItem['role'],
) {
  setBusyUserIds((current) =>
    current.includes(row.id) ? current : [...current, row.id],
  );

  try {
    await updateAdminUserRole(row.id, nextRole);
    await loadUsers();
  } catch (roleError) {
    setError(formatErrorMessage(roleError, '更新账号角色失败，请稍后重试。'));
  } finally {
    setBusyUserIds((current) => current.filter((id) => id !== row.id));
  }
}

{
  dataIndex: 'role',
  key: 'role',
  title: '角色',
  render: (_value, record) => (
    <Select
      aria-label={`账号角色-${record.id}`}
      disabled={busyUserIds.includes(record.id)}
      onChange={(nextRole: AdminUserListItem['role']) =>
        void handleRoleChange(record, nextRole)
      }
      options={[
        { label: '管理员', value: 'ADMIN' },
        { label: '运营', value: 'OPERATIONS' },
      ]}
      size='small'
      value={record.role}
      variant='borderless'
    />
  ),
}
```

- [ ] **Step 4: 运行前端测试，确认角色修改交互通过**

Run:

```bash
corepack pnpm --filter admin test -- src/services/admin-users.spec.ts src/pages/users/index.spec.tsx
```

Expected:

```text
PASS src/services/admin-users.spec.ts
PASS src/pages/users/index.spec.tsx
```

- [ ] **Step 5: 提交前端账号页补齐**

```bash
git add apps/admin/src/services/admin-users.ts apps/admin/src/services/admin-users.spec.ts apps/admin/src/pages/users/index.tsx apps/admin/src/pages/users/index.spec.tsx
git commit -m "feat: allow admin role changes from users table"
```

### Task 3: `admin` 路由懒加载与 Vite 初步分包

**Files:**
- Modify: `apps/admin/src/router.tsx`
- Modify: `apps/admin/src/main.tsx`
- Create: `apps/admin/src/app/RouteLoading.tsx`
- Modify: `apps/admin/src/app/workbench.css`
- Modify: `apps/admin/vite.config.mts`
- Create: `apps/admin/src/router.spec.tsx`

- [ ] **Step 1: 先写懒加载 fallback 的失败用例**

```tsx
// apps/admin/src/router.spec.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { describe, expect, it } from 'vitest';

import { RouteLoading } from './app/RouteLoading';

describe('RouteLoading', () => {
  it('shows a shared loading fallback while lazy routes resolve', () => {
    const DeferredPage = lazy(
      () =>
        new Promise<{ default: () => JSX.Element }>(() => {
          // keep pending on purpose
        }),
    );

    render(
      <MemoryRouter>
        <Suspense fallback={<RouteLoading />}>
          <DeferredPage />
        </Suspense>
      </MemoryRouter>,
    );

    expect(screen.getByText('页面加载中…')).toBeVisible();
  });
});
```

- [ ] **Step 2: 运行测试，确认当前还没有统一 fallback**

Run:

```bash
corepack pnpm --filter admin test -- src/router.spec.tsx
```

Expected:

```text
FAIL src/router.spec.tsx
```

- [ ] **Step 3: 把 router 改成懒加载并补 manualChunks**

```tsx
// apps/admin/src/router.tsx
import { lazy } from 'react';

const AdminLoginPage = lazy(() =>
  import('./pages/login').then((module) => ({
    default: module.AdminLoginPage,
  })),
);
const DashboardPage = lazy(() =>
  import('./pages/dashboard').then((module) => ({
    default: module.DashboardPage,
  })),
);
const EventsPage = lazy(() =>
  import('./pages/events').then((module) => ({
    default: module.EventsPage,
  })),
);
const EventEditorPage = lazy(() =>
  import('./pages/events/editor').then((module) => ({
    default: module.EventEditorPage,
  })),
);
const EventDetailPage = lazy(() =>
  import('./pages/events/editor').then((module) => ({
    default: module.EventDetailPage,
  })),
);
const UsersPage = lazy(() =>
  import('./pages/users').then((module) => ({
    default: module.UsersPage,
  })),
);
const OrdersListPage = lazy(() =>
  import('./pages/orders/list').then((module) => ({
    default: module.OrdersListPage,
  })),
);
const OrdersDetailPage = lazy(() =>
  import('./pages/orders/detail').then((module) => ({
    default: module.OrdersDetailPage,
  })),
);
const RefundsListPage = lazy(() =>
  import('./pages/refunds/list').then((module) => ({
    default: module.RefundsListPage,
  })),
);
const RefundDetailPage = lazy(() =>
  import('./pages/refunds/detail').then((module) => ({
    default: module.RefundDetailPage,
  })),
);

// apps/admin/src/main.tsx
import { Suspense } from 'react';
import { RouteLoading } from './app/RouteLoading';

// apps/admin/src/app/RouteLoading.tsx
export function RouteLoading() {
  return (
    <div className='admin-route-fallback'>
      <span className='admin-route-fallback__eyebrow'>管理后台</span>
      <strong>页面加载中…</strong>
    </div>
  );
}

<BrowserRouter>
  <AdminAuthProvider>
    <Suspense fallback={<RouteLoading />}>
      <AppRouter />
    </Suspense>
  </AdminAuthProvider>
</BrowserRouter>

// apps/admin/vite.config.mts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/antd') || id.includes('@ant-design')) {
            return 'antd-vendor';
          }

          if (
            id.includes('node_modules/react') ||
            id.includes('react-router-dom') ||
            id.includes('scheduler')
          ) {
            return 'react-vendor';
          }

          if (id.includes('/src/pages/')) {
            return 'admin-pages';
          }
        },
      },
    },
  },
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});

/* apps/admin/src/app/workbench.css */
.admin-route-fallback {
  min-height: 40vh;
  display: grid;
  place-content: center;
  gap: 8px;
  text-align: center;
  color: #52607a;
}

.admin-route-fallback__eyebrow {
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #8fa1c5;
}
```

- [ ] **Step 4: 运行测试和构建，确认分包生效**

Run:

```bash
corepack pnpm --filter admin test -- src/router.spec.tsx
corepack pnpm --filter admin build
```

Expected:

```text
PASS src/router.spec.tsx
vite v... building for production...
✓ built in ...
```

And verify the build output lists split chunks similar to:

```text
dist/assets/react-vendor-*.js
dist/assets/antd-vendor-*.js
dist/assets/admin-pages-*.js
```

- [ ] **Step 5: 提交 `admin` 分包**

```bash
git add apps/admin/src/router.tsx apps/admin/src/main.tsx apps/admin/src/app/RouteLoading.tsx apps/admin/src/app/workbench.css apps/admin/src/router.spec.tsx apps/admin/vite.config.mts
git commit -m "perf: split admin bundles by route and vendor"
```

### Task 4: 新增快速接手文档与版本说明

**Files:**
- Create: `docs/handoff/10-minute-onboarding.md`
- Create: `docs/handoff/release-notes-admin-workbench.md`
- Modify: `README.md`
- Modify: `docs/handoff/README.md`
- Modify: `tests/workspace/repo-layout.spec.ts`

- [ ] **Step 1: 先写文档入口的失败断言**

```ts
// tests/workspace/repo-layout.spec.ts
import { readFileSync } from 'node:fs';

const readme = readFileSync('README.md', 'utf8');
const handoffReadme = readFileSync('docs/handoff/README.md', 'utf8');

expect(readme).toContain('10 分钟接手');
expect(readme).toContain('后台工作台版本说明');
expect(handoffReadme).toContain('10-minute-onboarding.md');
expect(handoffReadme).toContain('release-notes-admin-workbench.md');
```

- [ ] **Step 2: 运行文档断言，确认入口还不存在**

Run:

```bash
corepack pnpm exec vitest run tests/workspace/repo-layout.spec.ts
```

Expected:

```text
FAIL ... expected README to contain 10 分钟接手
```

- [ ] **Step 3: 写文档与入口链接**

```md
<!-- docs/handoff/10-minute-onboarding.md -->
# 10 分钟接手指南

## 这个项目是什么

- `apps/api`：票务 API
- `apps/miniapp`：微信小程序
- `apps/admin`：运营后台
- `packages/contracts`：前后端共享 schema

## 本地 10 分钟怎么跑起来

1. `corepack pnpm install`
2. 复制 `.env.example` 为 `.env`
3. 启动数据库与 Redis
4. `corepack pnpm bootstrap:local`
5. 分别运行 `corepack pnpm dev:api`、`corepack pnpm dev:admin`

## 先看哪些代码

- `apps/admin/src/router.tsx`
- `apps/admin/src/pages/dashboard/index.tsx`
- `apps/admin/src/pages/users/index.tsx`
- `apps/api/src/modules/admin-users`
- `packages/contracts/src/admin-user.ts`

## 当前最重要的未完成项

- 真实微信登录 / 支付联调
- 上游出票 / 退款联调
- Linux 预发部署与彩排

<!-- docs/handoff/release-notes-admin-workbench.md -->
# 后台工作台版本说明

## 本次合并范围

- 新增后台登录与会话校验
- 新增概览、活动、订单、退款、账号五个主模块
- 新增区域票档活动编辑流
- 新增订单备注、异常标记、退款审核流
- 新增账号创建、启停与角色修改

## 关键路由与入口

- `/dashboard`
- `/events`
- `/orders`
- `/refunds`
- `/users`

## 已知边界

- 仍然是 MVP，不含细粒度权限树
- 仍使用同站 cookie，会话不支持任意跨域直连
- 真实微信 / 上游 vendor 还需要环境联调
```

- [ ] **Step 4: 更新 README 与 handoff 总入口**

```md
<!-- README.md -->
## 交接文档

- [docs/handoff/README.md](docs/handoff/README.md)
- [docs/handoff/10-minute-onboarding.md](docs/handoff/10-minute-onboarding.md) - 开发团队 10 分钟接手指南
- [docs/handoff/release-notes-admin-workbench.md](docs/handoff/release-notes-admin-workbench.md) - 后台工作台版本说明

<!-- docs/handoff/README.md -->
## 建议阅读顺序

1. [10 分钟接手指南](./10-minute-onboarding.md)
2. [需求摘要](./requirements-summary.md)
3. [开发交接](./development-handoff.md)
4. [项目现状和下一步](./project-status-and-next-steps.md)
5. [后台工作台版本说明](./release-notes-admin-workbench.md)
6. [团队交接清单](./team-handoff-checklist.md)
```

- [ ] **Step 5: 跑总验证，确认文档与构建都通过**

Run:

```bash
corepack pnpm lint
corepack pnpm --filter admin test
corepack pnpm --filter admin build
corepack pnpm --filter api test -- src/modules/admin-users
```

Expected:

```text
PASS lint
PASS admin test
PASS admin build
PASS api admin-users tests
```

- [ ] **Step 6: 提交文档收尾**

```bash
git add README.md docs/handoff/README.md docs/handoff/10-minute-onboarding.md docs/handoff/release-notes-admin-workbench.md tests/workspace/repo-layout.spec.ts
git commit -m "docs: add admin onboarding and release notes"
```
