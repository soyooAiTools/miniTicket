import { Navigate, Route, Routes } from 'react-router-dom';

import { AdminLayout } from './app/AdminLayout';
import { AdminLoginPage } from './pages/login';
import { RequireAdminAuth } from './app/RequireAdminAuth';
import { DashboardPage } from './pages/dashboard';
import { EventDetailPage, EventEditorPage } from './pages/events/editor';
import { EventsPage } from './pages/events';
import { OrdersDetailPage } from './pages/orders/detail';
import { OrdersListPage } from './pages/orders/list';
import { RefundDetailPage } from './pages/refunds/detail';
import { RefundsListPage } from './pages/refunds/list';
import { UsersPage } from './pages/users';

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
          <Route element={<UsersPage />} path='users' />
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
