import { Navigate, Route, Routes } from 'react-router-dom';

import { AdminLayout } from './app/AdminLayout';
import { AdminLoginPage } from './app/AdminLoginPage';
import { RequireAdminAuth } from './app/RequireAdminAuth';
import { AdminDetailPage, AdminSectionPage } from './app/admin-workspace-pages';
import { DashboardPage } from './pages/dashboard';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AdminLoginPage />} path='/login' />
      <Route element={<RequireAdminAuth />}>
        <Route element={<AdminLayout />} path='/'>
          <Route index element={<Navigate replace to='/dashboard' />} />
          <Route element={<DashboardPage />} path='dashboard' />
          <Route
            element={
              <AdminSectionPage
                description='活动列表、上下架状态、票档管理和排期入口。'
                title='活动'
              />
            }
            path='events'
          />
          <Route
            element={
              <AdminDetailPage kind='活动' mode='detail' paramKey='eventId' />
            }
            path='events/:eventId'
          />
          <Route
            element={
              <AdminDetailPage kind='活动' mode='editor' paramKey='eventId' />
            }
            path='events/:eventId/edit'
          />
          <Route
            element={
              <AdminSectionPage
                description='订单查询、人工介入、核销和备注入口。'
                title='订单'
              />
            }
            path='orders'
          />
          <Route
            element={
              <AdminDetailPage kind='订单' mode='detail' paramKey='orderId' />
            }
            path='orders/:orderId'
          />
          <Route
            element={
              <AdminDetailPage kind='订单' mode='editor' paramKey='orderId' />
            }
            path='orders/:orderId/edit'
          />
          <Route
            element={
              <AdminSectionPage
                description='退款队列、审批、驳回和处理入口。'
                title='退款'
              />
            }
            path='refunds'
          />
          <Route
            element={
              <AdminDetailPage kind='退款' mode='detail' paramKey='refundId' />
            }
            path='refunds/:refundId'
          />
          <Route
            element={
              <AdminDetailPage kind='退款' mode='editor' paramKey='refundId' />
            }
            path='refunds/:refundId/edit'
          />
          <Route
            element={
              <AdminSectionPage
                description='管理员账号、权限和启用状态管理入口。'
                title='账号'
              />
            }
            path='users'
          />
          <Route
            element={
              <AdminDetailPage kind='账号' mode='detail' paramKey='userId' />
            }
            path='users/:userId'
          />
          <Route
            element={
              <AdminDetailPage kind='账号' mode='editor' paramKey='userId' />
            }
            path='users/:userId/edit'
          />
          <Route element={<Navigate replace to='/dashboard' />} path='*' />
        </Route>
      </Route>
    </Routes>
  );
}
