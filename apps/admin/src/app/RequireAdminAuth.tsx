import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Spin } from 'antd';

import { useAdminAuth } from './admin-auth-context';

export function RequireAdminAuth() {
  const location = useLocation();
  const { isLoading, session } = useAdminAuth();

  if (isLoading) {
    return <Spin fullscreen size='large' tip='正在加载管理员会话' />;
  }

  if (!session) {
    return <Navigate replace state={{ from: location }} to='/login' />;
  }

  return <Outlet />;
}
