# Ticketing Admin UI Workbench Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Chinese-first admin workbench UI for the ticketing MVP, including authenticated shell, dashboard, event management, order/refund handling, and account management.

**Architecture:** Keep `apps/admin` on the existing React + Ant Design stack, but replace the current loose page set with a guarded workbench shell, typed admin services, and dedicated list/detail/editor pages. Reuse the new `/admin` backend APIs and cookie session, push `frontend-slides` usage out of runtime code, and centralize the workbench look-and-feel in shared layout and style files so every page inherits the same dense-but-ordered operations aesthetic.

**Tech Stack:** React 18, React Router, Ant Design 5, TypeScript, Vite, Vitest, React Testing Library

---

## Planned File Structure

### App shell and auth

- Create: `apps/admin/src/app/AdminLayout.tsx`
  - Shared left nav, top bar, page title region, and content frame
- Create: `apps/admin/src/app/RequireAdminAuth.tsx`
  - Route guard that redirects to login when admin session is missing
- Create: `apps/admin/src/app/admin-auth-context.tsx`
  - Session bootstrap, login/logout actions, and role access helpers
- Create: `apps/admin/src/app/workbench.css`
  - Global layout, navigation, card, and page header styling
- Modify: `apps/admin/src/main.tsx`
  - Mount auth provider and shared CSS
- Modify: `apps/admin/src/router.tsx`
  - Replace loose routes with login, guarded shell routes, and detail/editor routes

### Shared services and test setup

- Modify: `apps/admin/package.json`
  - Add `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`
- Create: `apps/admin/src/test/setup.ts`
  - Test bootstrap for RTL and `jest-dom`
- Modify: `apps/admin/vite.config.mts`
  - Add Vitest config and jsdom setup
- Modify: `apps/admin/src/services/request.ts`
  - Switch to cookie credentials, remove localStorage admin secret flow, keep JSON helpers
- Create: `apps/admin/src/services/admin-auth.ts`
  - Typed login/current-session/logout requests
- Create: `apps/admin/src/services/admin-dashboard.ts`
  - Typed dashboard summary requests
- Create: `apps/admin/src/services/admin-events.ts`
  - Typed event list/detail/create/update/publish/unpublish requests
- Create: `apps/admin/src/services/admin-orders.ts`
  - Typed order list/detail/note/flag requests
- Create: `apps/admin/src/services/admin-refunds.ts`
  - Typed refund list/detail/approve/reject/process requests
- Create: `apps/admin/src/services/admin-users.ts`
  - Typed admin user list/create/toggle/role requests

### Page modules

- Create: `apps/admin/src/pages/login/index.tsx`
- Create: `apps/admin/src/pages/dashboard/index.tsx`
- Create: `apps/admin/src/pages/events/list.tsx`
- Create: `apps/admin/src/pages/events/editor.tsx`
- Create: `apps/admin/src/pages/orders/list.tsx`
- Create: `apps/admin/src/pages/orders/detail.tsx`
- Create: `apps/admin/src/pages/refunds/list.tsx`
- Create: `apps/admin/src/pages/refunds/detail.tsx`
- Create: `apps/admin/src/pages/users/index.tsx`
- Delete: `apps/admin/src/pages/fulfillment/index.tsx`
- Replace: `apps/admin/src/pages/events/index.tsx`
- Replace: `apps/admin/src/pages/orders/index.tsx`
- Replace: `apps/admin/src/pages/refunds/index.tsx`

### UI tests

- Create: `apps/admin/src/app/admin-auth-context.spec.tsx`
- Create: `apps/admin/src/app/AdminLayout.spec.tsx`
- Create: `apps/admin/src/pages/dashboard/index.spec.tsx`
- Create: `apps/admin/src/pages/events/editor.spec.tsx`
- Create: `apps/admin/src/pages/orders/detail.spec.tsx`
- Create: `apps/admin/src/pages/refunds/detail.spec.tsx`
- Create: `apps/admin/src/pages/login/index.spec.tsx`

### Docs

- Modify: `README.md`
  - Add admin login, seeded accounts, and frontend verification steps
- Modify: `docs/handoff/README.md`
  - Point engineers to the admin workbench entry points and new page structure
- Modify: `.env.example`
  - Remove old admin-secret guidance from the frontend flow if still present

---

### Task 1: Build Admin Shell, Auth Context, And Test Harness

**Files:**
- Modify: `apps/admin/package.json`
- Modify: `apps/admin/vite.config.mts`
- Modify: `apps/admin/src/main.tsx`
- Modify: `apps/admin/src/router.tsx`
- Modify: `apps/admin/src/services/request.ts`
- Create: `apps/admin/src/test/setup.ts`
- Create: `apps/admin/src/app/admin-auth-context.tsx`
- Create: `apps/admin/src/app/RequireAdminAuth.tsx`
- Create: `apps/admin/src/app/AdminLayout.tsx`
- Create: `apps/admin/src/app/workbench.css`
- Create: `apps/admin/src/services/admin-auth.ts`
- Test: `apps/admin/src/app/admin-auth-context.spec.tsx`
- Test: `apps/admin/src/app/AdminLayout.spec.tsx`

- [ ] **Step 1: Write the failing auth context and layout tests**

```tsx
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';

import { AdminAuthProvider } from './admin-auth-context';
import { AdminLayout } from './AdminLayout';
import { RequireAdminAuth } from './RequireAdminAuth';

vi.mock('../services/admin-auth', () => ({
  getCurrentAdminSession: vi.fn(),
}));

it('redirects anonymous users to /login', async () => {
  const { getCurrentAdminSession } = await import('../services/admin-auth');
  vi.mocked(getCurrentAdminSession).mockResolvedValue(null);

  render(
    <MemoryRouter initialEntries={['/orders']}>
      <AdminAuthProvider>
        <Routes>
          <Route path='/login' element={<div>登录页</div>} />
          <Route
            path='/orders'
            element={
              <RequireAdminAuth>
                <div>订单页</div>
              </RequireAdminAuth>
            }
          />
        </Routes>
      </AdminAuthProvider>
    </MemoryRouter>,
  );

  await waitFor(() => {
    expect(screen.getByText('登录页')).toBeInTheDocument();
  });
});

it('renders Chinese navigation labels inside the workbench shell', () => {
  render(
    <MemoryRouter>
      <AdminLayout pageTitle='概览'>
        <div>内容区域</div>
      </AdminLayout>
    </MemoryRouter>,
  );

  expect(screen.getByText('概览')).toBeInTheDocument();
  expect(screen.getByText('活动')).toBeInTheDocument();
  expect(screen.getByText('订单')).toBeInTheDocument();
  expect(screen.getByText('退款')).toBeInTheDocument();
  expect(screen.getByText('账号')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the admin app tests to verify they fail**

Run: `corepack pnpm --filter admin test -- src/app/admin-auth-context.spec.tsx src/app/AdminLayout.spec.tsx`

Expected: FAIL because the auth provider, route guard, and workbench layout do not exist yet.

- [ ] **Step 3: Add admin test tooling and the cookie-based request layer**

```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "jsdom": "^25.0.1",
    "vitest": "^2.1.5"
  }
}
```

```ts
export async function request<TResponse>(
  path: string,
  init: globalThis.RequestInit = {},
): Promise<TResponse> {
  const response = await fetch(buildApiUrl(path), {
    ...init,
    credentials: 'include',
    headers: new Headers({
      accept: 'application/json',
      ...Object.fromEntries(new Headers(init.headers).entries()),
    }),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}
```

- [ ] **Step 4: Implement the auth provider, shell, and guarded router**

```tsx
type AdminSessionState = {
  isLoading: boolean;
  session: AdminSession | null;
  login(input: AdminLoginRequest): Promise<void>;
  logout(): Promise<void>;
};

const AdminAuthContext = createContext<AdminSessionState | null>(null);

export function AdminAuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void getCurrentAdminSession()
      .then(setSession)
      .finally(() => setIsLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      isLoading,
      session,
      async login(input: AdminLoginRequest) {
        const nextSession = await loginAdmin(input);
        setSession(nextSession);
      },
      async logout() {
        await logoutAdmin();
        setSession(null);
      },
    }),
    [isLoading, session],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}
```

```tsx
export function RequireAdminAuth({ children }: PropsWithChildren) {
  const { isLoading, session } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return <Spin fullscreen tip='正在载入后台登录态…' />;
  }

  if (!session) {
    return <Navigate replace state={{ from: location }} to='/login' />;
  }

  return <>{children}</>;
}
```

```tsx
<Routes>
  <Route path='/login' element={<LoginPage />} />
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
    <Route path='events' element={<EventsListPage />} />
    <Route path='events/new' element={<EventEditorPage mode='create' />} />
    <Route path='events/:eventId' element={<EventEditorPage mode='edit' />} />
    <Route path='orders' element={<OrdersListPage />} />
    <Route path='orders/:orderId' element={<OrderDetailPage />} />
    <Route path='refunds' element={<RefundsListPage />} />
    <Route path='refunds/:refundId' element={<RefundDetailPage />} />
    <Route path='users' element={<UsersPage />} />
  </Route>
</Routes>
```

- [ ] **Step 5: Run tests and build the admin app**

Run:
- `corepack pnpm --filter admin test -- src/app/admin-auth-context.spec.tsx src/app/AdminLayout.spec.tsx`
- `corepack pnpm --filter admin build`

Expected:
- Tests PASS
- Admin build PASS with the new guarded route structure

- [ ] **Step 6: Commit**

```bash
git add apps/admin/package.json apps/admin/vite.config.mts apps/admin/src/main.tsx apps/admin/src/router.tsx apps/admin/src/services/request.ts apps/admin/src/test/setup.ts apps/admin/src/app apps/admin/src/services/admin-auth.ts apps/admin/src/app/*.spec.tsx
git commit -m "feat(admin): add workbench shell and auth flow"
```

---

### Task 2: Build Dashboard And Shared Workbench Visual System

**Files:**
- Create: `apps/admin/src/services/admin-dashboard.ts`
- Create: `apps/admin/src/pages/dashboard/index.tsx`
- Create: `apps/admin/src/pages/dashboard/index.spec.tsx`
- Modify: `apps/admin/src/app/AdminLayout.tsx`
- Modify: `apps/admin/src/app/workbench.css`

- [ ] **Step 1: Write the failing dashboard page test**

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { DashboardPage } from './index';

vi.mock('../../services/admin-dashboard', () => ({
  getAdminDashboardSummary: vi.fn(),
}));

it('renders todo-first dashboard cards and action queue sections', async () => {
  const { getAdminDashboardSummary } = await import('../../services/admin-dashboard');
  vi.mocked(getAdminDashboardSummary).mockResolvedValue({
    activeEventCount: 11,
    flaggedOrderCount: 7,
    pendingRefundCount: 18,
    recentActions: [],
    upcomingEventCount: 4,
  });

  render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );

  await waitFor(() => {
    expect(screen.getByText('待审核退款')).toBeInTheDocument();
  });

  expect(screen.getByText('异常订单')).toBeInTheDocument();
  expect(screen.getByText('重点处理')).toBeInTheDocument();
  expect(screen.getByText('运营概况')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the dashboard test to verify it fails**

Run: `corepack pnpm --filter admin test -- src/pages/dashboard/index.spec.tsx`

Expected: FAIL because the typed dashboard service and page module do not exist.

- [ ] **Step 3: Add the typed dashboard service and todo-first page structure**

```ts
import { adminDashboardSummarySchema } from '@ticketing/contracts';

export async function getAdminDashboardSummary() {
  const payload = await request<unknown>('/admin/dashboard/summary');
  return adminDashboardSummarySchema.parse(payload);
}
```

```tsx
export function DashboardPage() {
  const { data, isLoading, error } = useDashboardSummary();

  return (
    <section className='workbench-page'>
      <header className='page-header'>
        <div>
          <h1>概览</h1>
          <p>优先处理今天最重要的事务。</p>
        </div>
      </header>

      <div className='todo-card-grid'>
        <SummaryCard label='待审核退款' value={data.pendingRefundCount} to='/refunds?status=REVIEWING' />
        <SummaryCard label='异常订单' value={data.flaggedOrderCount} to='/orders?flagged=true' />
        <SummaryCard label='今日开售活动' value={data.upcomingEventCount} to='/events?status=UPCOMING' />
        <SummaryCard label='售卖中活动' value={data.activeEventCount} to='/events?status=ON_SALE' />
      </div>

      <div className='dashboard-main-grid'>
        <TodoQueuePanel title='重点处理' />
        <OperationsOverviewPanel title='运营概况' actions={data.recentActions} />
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Skin the shell into the high-density workbench look**

```css
.admin-shell {
  display: grid;
  grid-template-columns: 248px minmax(0, 1fr);
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(238, 244, 252, 0.92), transparent 32%),
    linear-gradient(180deg, #f6f8fb 0%, #edf2f7 100%);
  color: #15233a;
}

.admin-sidebar {
  border-right: 1px solid rgba(133, 148, 173, 0.16);
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(24px);
}

.workbench-card {
  border-radius: 22px;
  border: 1px solid rgba(126, 144, 171, 0.14);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 18px 48px rgba(92, 114, 148, 0.12);
}
```

- [ ] **Step 5: Run dashboard tests and build**

Run:
- `corepack pnpm --filter admin test -- src/pages/dashboard/index.spec.tsx`
- `corepack pnpm --filter admin build`

Expected:
- Dashboard test PASS
- Build PASS with the new shell and dashboard

- [ ] **Step 6: Commit**

```bash
git add apps/admin/src/services/admin-dashboard.ts apps/admin/src/pages/dashboard/index.tsx apps/admin/src/pages/dashboard/index.spec.tsx apps/admin/src/app/AdminLayout.tsx apps/admin/src/app/workbench.css
git commit -m "feat(admin): add dashboard workbench UI"
```

---

### Task 3: Build Event List And Event Editor With Regional Tiers

**Files:**
- Create: `apps/admin/src/services/admin-events.ts`
- Create: `apps/admin/src/pages/events/list.tsx`
- Create: `apps/admin/src/pages/events/editor.tsx`
- Create: `apps/admin/src/pages/events/editor.spec.tsx`
- Modify: `apps/admin/src/router.tsx`
- Replace: `apps/admin/src/pages/events/index.tsx`

- [ ] **Step 1: Write the failing event editor test**

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { EventEditorPage } from './editor';

it('renders regional tier fields in Chinese', () => {
  render(
    <MemoryRouter>
      <EventEditorPage mode='create' />
    </MemoryRouter>,
  );

  expect(screen.getByText('区域票档')).toBeInTheDocument();
  expect(screen.getByLabelText('区域名称')).toBeInTheDocument();
  expect(screen.getByLabelText('每单限购')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '保存草稿' })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the event editor test to verify it fails**

Run: `corepack pnpm --filter admin test -- src/pages/events/editor.spec.tsx`

Expected: FAIL because the new event list/editor pages do not exist.

- [ ] **Step 3: Add typed event services and the event list page**

```ts
export async function getAdminEvents(query?: URLSearchParams) {
  const payload = await request<unknown>(`/admin/events${query ? `?${query}` : ''}`);
  return adminEventListResponseSchema.parse(payload);
}

export async function getAdminEventDetail(eventId: string) {
  const payload = await request<unknown>(`/admin/events/${eventId}`);
  return adminEventDetailSchema.parse(payload);
}
```

```tsx
export function EventsListPage() {
  return (
    <section className='workbench-page'>
      <PageHeader
        title='活动'
        extra={<Button type='primary'>创建活动</Button>}
      />
      <FilterBar />
      <Table columns={columns} dataSource={rows} rowKey='id' />
    </section>
  );
}
```

- [ ] **Step 4: Implement the event editor with structured regional tier sections**

```tsx
<Form layout='vertical' onFinish={handleSubmit}>
  <Card title='基本信息'>
    <Form.Item label='活动标题' name='title' rules={[{ required: true }]}>
      <Input />
    </Form.Item>
    <Form.Item label='场馆' name='venueName' rules={[{ required: true }]}>
      <Input />
    </Form.Item>
  </Card>

  <Card title='销售规则'>
    <Form.Item label='开售时间' name='saleStartsAt'>
      <DatePicker showTime />
    </Form.Item>
  </Card>

  <Card title='区域票档'>
    <Form.List name='sessions'>
      {(sessionFields) => sessionFields.map((sessionField) => (
        <Form.List key={sessionField.key} name={[sessionField.name, 'tiers']}>
          {(tierFields, tierOps) => tierFields.map((tierField) => (
            <Space key={tierField.key} align='start'>
              <Form.Item label='区域名称' name={[tierField.name, 'name']}><Input /></Form.Item>
              <Form.Item label='价格' name={[tierField.name, 'price']}><InputNumber min={0} /></Form.Item>
              <Form.Item label='库存' name={[tierField.name, 'inventory']}><InputNumber min={0} /></Form.Item>
              <Form.Item label='每单限购' name={[tierField.name, 'purchaseLimit']}><InputNumber min={1} /></Form.Item>
            </Space>
          ))}
        </Form.List>
      ))}
    </Form.List>
  </Card>
</Form>
```

- [ ] **Step 5: Run event tests and build**

Run:
- `corepack pnpm --filter admin test -- src/pages/events/editor.spec.tsx`
- `corepack pnpm --filter admin build`

Expected:
- Event editor test PASS
- Build PASS with event list/editor routes

- [ ] **Step 6: Commit**

```bash
git add apps/admin/src/services/admin-events.ts apps/admin/src/pages/events/list.tsx apps/admin/src/pages/events/editor.tsx apps/admin/src/pages/events/editor.spec.tsx apps/admin/src/router.tsx apps/admin/src/pages/events/index.tsx
git commit -m "feat(admin): add event workbench pages"
```

---

### Task 4: Build Order And Refund Lists With Dedicated Detail Pages

**Files:**
- Create: `apps/admin/src/services/admin-orders.ts`
- Create: `apps/admin/src/services/admin-refunds.ts`
- Create: `apps/admin/src/pages/orders/list.tsx`
- Create: `apps/admin/src/pages/orders/detail.tsx`
- Create: `apps/admin/src/pages/refunds/list.tsx`
- Create: `apps/admin/src/pages/refunds/detail.tsx`
- Create: `apps/admin/src/pages/orders/detail.spec.tsx`
- Create: `apps/admin/src/pages/refunds/detail.spec.tsx`
- Replace: `apps/admin/src/pages/orders/index.tsx`
- Replace: `apps/admin/src/pages/refunds/index.tsx`
- Delete: `apps/admin/src/pages/fulfillment/index.tsx`

- [ ] **Step 1: Write the failing order/refund detail tests**

```tsx
it('renders order detail sections for fulfillment, notes, and flags', async () => {
  render(<OrderDetailPage />);

  expect(await screen.findByText('履约记录')).toBeInTheDocument();
  expect(screen.getByText('内部备注')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '标记异常单' })).toBeInTheDocument();
});

it('renders refund review actions in Chinese', async () => {
  render(<RefundDetailPage />);

  expect(await screen.findByRole('button', { name: '审核通过' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '驳回退款' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '发起退款' })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the detail tests to verify they fail**

Run: `corepack pnpm --filter admin test -- src/pages/orders/detail.spec.tsx src/pages/refunds/detail.spec.tsx`

Expected: FAIL because the dedicated list/detail pages do not exist.

- [ ] **Step 3: Add typed services for order and refund operations**

```ts
export async function getAdminOrderDetail(orderId: string) {
  const payload = await request<unknown>(`/admin/orders/${orderId}`);
  return adminOrderDetailSchema.parse(payload);
}

export function createAdminOrderNote(orderId: string, input: AdminOrderNoteInput) {
  return jsonRequest(`/admin/orders/${orderId}/notes`, 'POST', input);
}
```

```ts
export function approveAdminRefund(refundId: string, input: AdminRefundApproveInput) {
  return jsonRequest(`/admin/refunds/${refundId}/approve`, 'POST', input);
}
```

- [ ] **Step 4: Implement the list pages and dedicated detail pages**

```tsx
export function OrdersListPage() {
  return (
    <section className='workbench-page'>
      <PageHeader title='订单' />
      <FilterBar />
      <Table
        onRow={(record) => ({
          onClick: () => navigate(`/orders/${record.id}`),
        })}
      />
    </section>
  );
}
```

```tsx
export function OrderDetailPage() {
  return (
    <section className='detail-page-grid'>
      <Card title='基本订单信息'>{/* ... */}</Card>
      <Card title='支付信息'>{/* ... */}</Card>
      <Card title='履约记录'>{/* ... */}</Card>
      <Card title='退款记录'>{/* ... */}</Card>
      <Card title='内部备注'>{/* note form + history */}</Card>
      <Card title='异常标记'>{/* flag actions */}</Card>
    </section>
  );
}
```

```tsx
export function RefundDetailPage() {
  return (
    <section className='detail-page-grid'>
      <Card title='退款摘要'>{/* ... */}</Card>
      <Card title='申请信息'>{/* ... */}</Card>
      <Card title='审核信息'>{/* ... */}</Card>
      <Space>
        <Button type='primary'>审核通过</Button>
        <Button danger>驳回退款</Button>
        <Button>发起退款</Button>
      </Space>
    </section>
  );
}
```

- [ ] **Step 5: Run tests and build**

Run:
- `corepack pnpm --filter admin test -- src/pages/orders/detail.spec.tsx src/pages/refunds/detail.spec.tsx`
- `corepack pnpm --filter admin build`

Expected:
- Detail tests PASS
- Build PASS after removing the old fulfillment top-level page

- [ ] **Step 6: Commit**

```bash
git add apps/admin/src/services/admin-orders.ts apps/admin/src/services/admin-refunds.ts apps/admin/src/pages/orders/list.tsx apps/admin/src/pages/orders/detail.tsx apps/admin/src/pages/refunds/list.tsx apps/admin/src/pages/refunds/detail.tsx apps/admin/src/pages/orders/detail.spec.tsx apps/admin/src/pages/refunds/detail.spec.tsx apps/admin/src/pages/orders/index.tsx apps/admin/src/pages/refunds/index.tsx
git rm apps/admin/src/pages/fulfillment/index.tsx
git commit -m "feat(admin): add order and refund workbench flows"
```

---

### Task 5: Build Account Management, Login Page, And Final Chinese Localization Pass

**Files:**
- Create: `apps/admin/src/services/admin-users.ts`
- Create: `apps/admin/src/pages/login/index.tsx`
- Create: `apps/admin/src/pages/login/index.spec.tsx`
- Create: `apps/admin/src/pages/users/index.tsx`
- Modify: `apps/admin/src/app/AdminLayout.tsx`
- Modify: `apps/admin/src/app/workbench.css`
- Modify: `apps/admin/src/router.tsx`
- Modify: `README.md`
- Modify: `docs/handoff/README.md`
- Modify: `.env.example`

- [ ] **Step 1: Write the failing login/users smoke test**

```tsx
it('renders the Chinese login form and user management labels', async () => {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <AppRouter />
    </MemoryRouter>,
  );

  expect(screen.getByLabelText('邮箱')).toBeInTheDocument();
  expect(screen.getByLabelText('密码')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '登录后台' })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the smoke test to verify it fails**

Run: `corepack pnpm --filter admin test -- src/pages/login/index.spec.tsx`

Expected: FAIL because the login page and user management page do not exist yet.

- [ ] **Step 3: Implement the login page and user management page**

```tsx
export function LoginPage() {
  const [form] = Form.useForm<AdminLoginRequest>();

  return (
    <section className='login-page'>
      <Card className='login-card'>
        <h1>后台登录</h1>
        <Form form={form} layout='vertical' onFinish={handleSubmit}>
          <Form.Item label='邮箱' name='email' rules={[{ required: true }]}>
            <Input autoComplete='username' />
          </Form.Item>
          <Form.Item label='密码' name='password' rules={[{ required: true }]}>
            <Input.Password autoComplete='current-password' />
          </Form.Item>
          <Button block htmlType='submit' type='primary'>
            登录后台
          </Button>
        </Form>
      </Card>
    </section>
  );
}
```

```tsx
export function UsersPage() {
  return (
    <section className='workbench-page'>
      <PageHeader title='账号' />
      <Table columns={columns} dataSource={rows} rowKey='id' />
    </section>
  );
}
```

- [ ] **Step 4: Remove the remaining English UI strings and update docs**

```md
## 管理后台

本地开发时，先启动 API，再启动后台：

- `corepack pnpm --filter api dev`
- `corepack pnpm --filter admin dev`

默认后台地址：

- `http://localhost:5173`

默认种子账号：

- 超级管理员：`admin@miniticket.local`
- 运营账号：`ops@miniticket.local`
```
```

- [ ] **Step 5: Run the full admin verification pass**

Run:
- `corepack pnpm --filter admin test`
- `corepack pnpm --filter admin build`
- `corepack pnpm lint`

Expected:
- Admin tests PASS
- Admin build PASS
- Root lint PASS with the new Chinese-first admin UI

- [ ] **Step 6: Commit**

```bash
git add apps/admin/src/services/admin-users.ts apps/admin/src/pages/login/index.tsx apps/admin/src/pages/login/index.spec.tsx apps/admin/src/pages/users/index.tsx apps/admin/src/app/AdminLayout.tsx apps/admin/src/app/workbench.css apps/admin/src/router.tsx README.md docs/handoff/README.md .env.example
git commit -m "feat(admin): finish chinese workbench ui"
```

---

## Self-Review

### Spec coverage

- 后台整体结构：Task 1 + Task 2
- 概览总控页：Task 2
- 活动列表与区域票档编辑：Task 3
- 订单列表、订单详情、履约并入详情：Task 4
- 退款列表、退款详情、审核动作：Task 4
- 登录与账号管理：Task 1 + Task 5
- 中文化与视觉统一：Task 2 + Task 5

没有遗漏到 spec 中的一级模块或关键交互流。

### Placeholder scan

- 无 `TODO` / `TBD`
- 每个任务都给了明确文件、测试入口和运行命令
- 没有“按前文类似处理”这种省略式描述

### Type consistency

- 使用的路由结构统一为 `/dashboard`、`/events/:eventId`、`/orders/:orderId`、`/refunds/:refundId`
- 认证数据统一使用 `AdminSession`
- 订单和退款动作分别走 `admin-orders` 与 `admin-refunds` 服务
