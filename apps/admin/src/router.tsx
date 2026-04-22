import { Navigate, Route, Routes } from 'react-router-dom';

import { AdminLayout } from './app/AdminLayout';
import { AdminLoginPage } from './app/AdminLoginPage';
import { RequireAdminAuth } from './app/RequireAdminAuth';
import { AdminDetailPage, AdminSectionPage } from './app/admin-workspace-pages';
import { DashboardPage } from './pages/dashboard';
import { EventDetailPage, EventEditorPage } from './pages/events/editor';
import { EventsPage } from './pages/events';
import { OrdersDetailPage } from './pages/orders/detail';
import { OrdersListPage } from './pages/orders/list';
import { RefundDetailPage } from './pages/refunds/detail';
import { RefundsListPage } from './pages/refunds/list';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AdminLoginPage />} path='/login' />
      <Route element={<RequireAdminAuth />}>
        <Route element={<AdminLayout />} path='/'>
          <Route index element={<Navigate replace to='/dashboard' />} />
          <Route element={<DashboardPage />} path='dashboard' />
          <Route element={<EventsPage />} path='events' />
          <Route element={<EventEditorPage mode='create' />} path='events/new' />
          <Route element={<EventDetailPage />} path='events/:eventId' />
          <Route element={<EventEditorPage mode='edit' />} path='events/:eventId/edit' />
          <Route
            element={
              <AdminSectionPage
                description='管理账号、权限和启用状态的统一入口。'
                title='账号'
              />
            }
            path='users'
          />
          <Route
            element={<AdminDetailPage kind='账号' mode='detail' paramKey='userId' />}
            path='users/:userId'
          />
          <Route
            element={<AdminDetailPage kind='账号' mode='editor' paramKey='userId' />}
            path='users/:userId/edit'
          />
          <Route element={<OrdersListPage />} path='orders' />
          <Route element={<OrdersDetailPage />} path='orders/:orderId' />
          <Route element={<RefundsListPage />} path='refunds' />
          <Route element={<RefundDetailPage />} path='refunds/:refundId' />
          <Route element={<Navigate replace to='/dashboard' />} path='*' />
        </Route>
      </Route>
    </Routes>
  );
}
