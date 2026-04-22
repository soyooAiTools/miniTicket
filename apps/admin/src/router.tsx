import { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';

import { AdminLayout } from './app/AdminLayout';
import { useAdminAuth } from './app/admin-auth-context';
import { RequireAdminAuth } from './app/RequireAdminAuth';
import { RouteLoading } from './app/RouteLoading';

const AdminLoginPage = lazy(async () =>
  import('./pages/login').then((module) => ({ default: module.AdminLoginPage })),
);

const DashboardPage = lazy(async () =>
  import('./pages/dashboard').then((module) => ({ default: module.DashboardPage })),
);

const EventsPage = lazy(async () =>
  import('./pages/events').then((module) => ({ default: module.EventsPage })),
);

const EventEditorPage = lazy(async () =>
  import('./pages/events/editor').then((module) => ({
    default: module.EventEditorPage,
  })),
);

const EventDetailPage = lazy(async () =>
  import('./pages/events/editor').then((module) => ({
    default: module.EventDetailPage,
  })),
);

const UsersPage = lazy(async () =>
  import('./pages/users').then((module) => ({ default: module.UsersPage })),
);

const OrdersListPage = lazy(async () =>
  import('./pages/orders/list').then((module) => ({ default: module.OrdersListPage })),
);

const OrdersDetailPage = lazy(async () =>
  import('./pages/orders/detail').then((module) => ({
    default: module.OrdersDetailPage,
  })),
);

const RefundsListPage = lazy(async () =>
  import('./pages/refunds/list').then((module) => ({
    default: module.RefundsListPage,
  })),
);

const RefundDetailPage = lazy(async () =>
  import('./pages/refunds/detail').then((module) => ({
    default: module.RefundDetailPage,
  })),
);

type LoginRouteState = {
  from?: {
    pathname?: string;
  };
};

function LoginRoute() {
  const location = useLocation();
  const { isLoading, session } = useAdminAuth();
  const from =
    (location.state as LoginRouteState | null)?.from?.pathname ?? '/dashboard';

  if (isLoading) {
    return <RouteLoading fullscreen />;
  }

  if (session) {
    return <Navigate replace to={from} />;
  }

  return (
    <Suspense fallback={<RouteLoading fullscreen />}>
      <AdminLoginPage />
    </Suspense>
  );
}

function AppShellRoute() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Outlet />
    </Suspense>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<LoginRoute />} path='/login' />
      <Route element={<RequireAdminAuth />}>
        <Route element={<AdminLayout />} path='/'>
          <Route element={<AppShellRoute />}>
            <Route index element={<Navigate replace to='/dashboard' />} />
            <Route element={<DashboardPage />} path='dashboard' />
            <Route element={<EventsPage />} path='events' />
            <Route element={<EventEditorPage mode='create' />} path='events/new' />
            <Route element={<EventDetailPage />} path='events/:eventId' />
            <Route
              element={<EventEditorPage mode='edit' />}
              path='events/:eventId/edit'
            />
            <Route element={<UsersPage />} path='users' />
            <Route element={<OrdersListPage />} path='orders' />
            <Route element={<OrdersDetailPage />} path='orders/:orderId' />
            <Route element={<RefundsListPage />} path='refunds' />
            <Route element={<RefundDetailPage />} path='refunds/:refundId' />
            <Route element={<Navigate replace to='/dashboard' />} path='*' />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
