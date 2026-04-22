import { Alert, Button, Card, Form, Input, Space, Typography } from 'antd';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { useAdminAuth } from '../../app/admin-auth-context';

type LoginFormValues = {
  email: string;
  password: string;
};

type RouteState = {
  from?: {
    pathname?: string;
  };
};

export function AdminLoginPage() {
  const { authError, isLoading, login, logoutError, session } = useAdminAuth();
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
      setSubmitError(
        error instanceof Error ? error.message : '管理员登录失败，请稍后重试。',
      );
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
            使用管理员邮箱和密码进入账号、订单、退款与运营页面。
          </Typography.Paragraph>
        </Space>

        {authError ? (
          <Alert
            description={authError}
            showIcon
            style={{ marginBottom: 16 }}
            type='warning'
            message='管理员会话加载失败'
          />
        ) : null}

        {logoutError ? (
          <Alert
            description={logoutError}
            showIcon
            style={{ marginBottom: 16 }}
            type='info'
            message='已退出本地会话'
          />
        ) : null}

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
            <Input autoComplete='email' placeholder='请输入管理员邮箱' />
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
