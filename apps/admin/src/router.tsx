import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Space,
  Tag,
  Typography,
} from 'antd';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';

import { AdminLayout } from './app/AdminLayout';
import { RequireAdminAuth } from './app/RequireAdminAuth';
import { useAdminAuth } from './app/admin-auth-context';

type LoginFormValues = {
  email: string;
  password: string;
};

type RouteState = {
  from?: {
    pathname?: string;
  };
};

function PageShell({
  description,
  tag,
  title,
}: {
  description: string;
  tag?: string;
  title: string;
}) {
  return (
    <div className='admin-page'>
      <header className='admin-page__header'>
        <div>
          <Typography.Title className='admin-page__title' level={2}>
            {title}
          </Typography.Title>
          <Typography.Paragraph className='admin-page__subtitle'>
            {description}
          </Typography.Paragraph>
        </div>
        {tag ? <Tag color='blue'>{tag}</Tag> : null}
      </header>

      <section className='admin-page__empty'>
        这里先保留一个轻量占位页，后续可以在这个路由入口继续接入真实业务视图。
      </section>
    </div>
  );
}

function DashboardPage() {
  return (
    <PageShell
      description='快速查看运营概况、关键告警和最近操作。'
      tag='概览'
      title='运营概览'
    />
  );
}

function ListPage({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return <PageShell description={description} title={title} />;
}

function DetailPage({
  kind,
  mode,
}: {
  kind: string;
  mode: 'detail' | 'editor';
}) {
  const params = useParams();
  const id = params.eventId ?? params.orderId ?? params.refundId ?? params.userId ?? '未命名';
  const title = mode === 'editor' ? `${kind}编辑器` : `${kind}详情`;

  return (
    <PageShell
      description={`当前 ${kind} 编号：${id}，此处先保留后续编辑/详情页面入口。`}
      tag={mode === 'editor' ? '编辑器' : '详情'}
      title={title}
    />
  );
}

function LoginPage() {
  const { isLoading, login, session } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const from = (location.state as RouteState | null)?.from?.pathname ?? '/dashboard';

  if (!isLoading && session) {
    return <Navigate replace to={from} />;
  }

  async function handleSubmit(values: LoginFormValues) {
    setSubmitError(null);
    setSubmitting(true);

    try {
      await login(values);
      navigate(from, { replace: true });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '管理员登录失败');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className='admin-auth'>
      <Card className='admin-auth__card' variant='borderless'>
        <Space direction='vertical' size={8} style={{ width: '100%' }}>
          <Typography.Text className='admin-shell__brand-eyebrow'>
            管理员入口
          </Typography.Text>
          <Typography.Title level={2} style={{ margin: 0 }}>
            管理员登录
          </Typography.Title>
          <Typography.Paragraph className='admin-auth__hint'>
            使用管理员账号登录后即可进入高密度工作台。
          </Typography.Paragraph>
        </Space>

        {submitError ? (
          <Alert
            banner
            showIcon
            style={{ marginBottom: 16 }}
            type='error'
            message={submitError}
          />
        ) : null}

        <Form<LoginFormValues> layout='vertical' onFinish={handleSubmit}>
          <Form.Item
            label='管理员邮箱'
            name='email'
            rules={[
              { required: true, message: '请输入管理员邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input autoComplete='email' placeholder='admin@example.com' />
          </Form.Item>

          <Form.Item
            label='密码'
            name='password'
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password autoComplete='current-password' placeholder='请输入密码' />
          </Form.Item>

          <Button block htmlType='submit' loading={submitting} type='primary'>
            登录
          </Button>
        </Form>
      </Card>
    </div>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<LoginPage />} path='/login' />
      <Route element={<RequireAdminAuth />}>
        <Route element={<AdminLayout />} path='/'>
          <Route index element={<Navigate replace to='/dashboard' />} />
          <Route element={<DashboardPage />} path='dashboard' />
          <Route
            element={
              <ListPage
                description='活动列表、上下架状态、票档管理和排期入口。'
                title='活动'
              />
            }
            path='events'
          />
          <Route
            element={<DetailPage kind='活动' mode='detail' />}
            path='events/:eventId'
          />
          <Route
            element={<DetailPage kind='活动' mode='editor' />}
            path='events/:eventId/edit'
          />
          <Route
            element={
              <ListPage
                description='订单查询、人工介入、核销和备注入口。'
                title='订单'
              />
            }
            path='orders'
          />
          <Route
            element={<DetailPage kind='订单' mode='detail' />}
            path='orders/:orderId'
          />
          <Route
            element={<DetailPage kind='订单' mode='editor' />}
            path='orders/:orderId/edit'
          />
          <Route
            element={
              <ListPage
                description='退款队列、审批、驳回和处理入口。'
                title='退款'
              />
            }
            path='refunds'
          />
          <Route
            element={<DetailPage kind='退款' mode='detail' />}
            path='refunds/:refundId'
          />
          <Route
            element={<DetailPage kind='退款' mode='editor' />}
            path='refunds/:refundId/edit'
          />
          <Route
            element={
              <ListPage
                description='管理员账号、权限和启用状态管理入口。'
                title='账号'
              />
            }
            path='users'
          />
          <Route
            element={<DetailPage kind='账号' mode='detail' />}
            path='users/:userId'
          />
          <Route
            element={<DetailPage kind='账号' mode='editor' />}
            path='users/:userId/edit'
          />
          <Route element={<Navigate replace to='/dashboard' />} path='*' />
        </Route>
      </Route>
    </Routes>
  );
}
