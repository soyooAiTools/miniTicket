import {
  Alert,
  Button,
  Layout,
  Menu,
  Space,
  Tag,
  Typography,
} from 'antd';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useAdminAuth } from './admin-auth-context';
import { DashboardPage } from '../pages/dashboard';

const { Content, Header, Sider } = Layout;

type NavEntry = {
  key: string;
  label: string;
  path: string;
};

const navEntries: NavEntry[] = [
  { key: 'dashboard', label: '概览', path: '/dashboard' },
  { key: 'events', label: '活动', path: '/events' },
  { key: 'orders', label: '订单', path: '/orders' },
  { key: 'refunds', label: '退款', path: '/refunds' },
  { key: 'users', label: '账号', path: '/users' },
];

function getSectionKey(pathname: string) {
  const match = navEntries.find(
    (entry) => pathname === entry.path || pathname.startsWith(`${entry.path}/`),
  );

  return match?.key ?? 'dashboard';
}

function getSectionLabel(pathname: string) {
  return navEntries.find((entry) => entry.key === getSectionKey(pathname))?.label ?? '概览';
}

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { authError, logout, session } = useAdminAuth();
  const selectedKey = getSectionKey(location.pathname);
  const sectionLabel = getSectionLabel(location.pathname);
  const userLabel = session?.user.name ?? (authError ? '会话降级' : '未命名管理员');

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <Layout className='admin-shell'>
      <Sider className='admin-shell__sider' width={260}>
        <div className='admin-shell__brand'>
          <Typography.Text className='admin-shell__brand-eyebrow'>
            管理后台
          </Typography.Text>
          <Typography.Title className='admin-shell__brand-title' level={4}>
            Mini Ticket
          </Typography.Title>
          <Typography.Text className='admin-shell__brand-subtitle'>
            轻量运营工作台
          </Typography.Text>
        </div>

        <Menu
          className='admin-shell__menu'
          items={navEntries.map((entry) => ({
            key: entry.key,
            label: (
              <NavLink className='admin-shell__menu-link' to={entry.path}>
                {entry.label}
              </NavLink>
            ),
          }))}
          mode='inline'
          selectedKeys={[selectedKey]}
        />
      </Sider>

      <Layout className='admin-shell__main'>
        <Header className='admin-shell__header'>
          <div>
            <Typography.Text className='admin-shell__header-eyebrow'>
              {sectionLabel}
            </Typography.Text>
            <Typography.Title className='admin-shell__header-title' level={3}>
              {sectionLabel}
            </Typography.Title>
          </div>

          <Space size={12}>
            <Tag className='admin-shell__header-tag' color={authError ? 'gold' : 'blue'}>
              {userLabel}
            </Tag>
            {session ? (
              <Button onClick={handleLogout} type='text'>
                退出登录
              </Button>
            ) : null}
          </Space>
        </Header>

        <Content className='admin-shell__content'>
          <div className='admin-shell__surface'>
            {authError ? (
              <Alert
                description={authError}
                showIcon
                style={{ marginBottom: 16 }}
                type='warning'
                message='管理员会话加载失败'
              />
            ) : null}
            {location.pathname === '/dashboard' ? <DashboardPage /> : <Outlet />}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
