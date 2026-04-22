import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Radio,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';

import {
  createAdminUser,
  getAdminUsers,
  setAdminUserEnabled,
  type AdminUserCreateRequest,
  type AdminUserListItem,
} from '../../services/admin-users';

type CreateUserFormValues = AdminUserCreateRequest;

const roleMeta: Record<
  AdminUserListItem['role'],
  { color: string; label: string }
> = {
  ADMIN: {
    color: 'blue',
    label: '管理员',
  },
  OPERATIONS: {
    color: 'geekblue',
    label: '运营',
  },
};

const enabledMeta = {
  false: {
    color: 'default',
    label: '已停用',
  },
  true: {
    color: 'green',
    label: '已启用',
  },
} as const;

const dateTimeFormatter = new Intl.DateTimeFormat('zh-CN', {
  dateStyle: 'medium',
  hour12: false,
  timeStyle: 'short',
});

function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

function formatErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function getEnabledMeta(enabled: boolean) {
  return enabledMeta[enabled ? 'true' : 'false'];
}

export function UsersPage() {
  const [form] = Form.useForm<CreateUserFormValues>();
  const [rows, setRows] = useState<AdminUserListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyUserIds, setBusyUserIds] = useState<string[]>([]);

  async function loadUsers() {
    setIsLoading(true);
    setError(null);

    try {
      setRows(await getAdminUsers());
    } catch (loadError) {
      setError(formatErrorMessage(loadError, '账号列表加载失败，请稍后重试。'));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  async function handleCreate(values: CreateUserFormValues) {
    setIsSubmitting(true);

    try {
      await createAdminUser(values);
      form.resetFields();
      form.setFieldsValue({ role: 'ADMIN' });
      await loadUsers();
    } catch (createError) {
      setError(formatErrorMessage(createError, '创建账号失败，请稍后重试。'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleEnabled(row: AdminUserListItem) {
    const nextEnabled = !row.enabled;

    setBusyUserIds((current) =>
      current.includes(row.id) ? current : [...current, row.id],
    );

    try {
      await setAdminUserEnabled(row.id, nextEnabled);
      await loadUsers();
    } catch (toggleError) {
      setError(formatErrorMessage(toggleError, '更新账号状态失败，请稍后重试。'));
    } finally {
      setBusyUserIds((current) => current.filter((id) => id !== row.id));
    }
  }

  const summary = useMemo(() => {
    const adminCount = rows.filter((row) => row.role === 'ADMIN').length;
    const operationsCount = rows.filter((row) => row.role === 'OPERATIONS').length;
    const enabledCount = rows.filter((row) => row.enabled).length;

    return {
      adminCount,
      enabledCount,
      operationsCount,
      total: rows.length,
    };
  }, [rows]);

  return (
    <div className='admin-users'>
      <header className='admin-page__header'>
        <div>
          <Typography.Title className='admin-page__title' level={2}>
            账号管理
          </Typography.Title>
          <Typography.Paragraph className='admin-page__subtitle'>
            在这里维护后台账号的创建、启停和角色可见信息。
          </Typography.Paragraph>
        </div>

        <Space wrap>
          <Tag color='blue'>{summary.total} 个账号</Tag>
          <Tag color='green'>{summary.enabledCount} 个启用</Tag>
          <Tag color='geekblue'>管理员 {summary.adminCount}</Tag>
          <Tag color='cyan'>运营 {summary.operationsCount}</Tag>
          <Button loading={isLoading} onClick={() => void loadUsers()}>
            刷新
          </Button>
        </Space>
      </header>

      {error ? <Alert message={error} showIcon type='error' /> : null}

      <Card className='admin-users__panel' variant='borderless'>
        <div className='admin-users__panel-head'>
          <div>
            <Typography.Title className='admin-users__panel-title' level={4}>
              新增账号
            </Typography.Title>
            <Typography.Text className='admin-users__panel-subtitle'>
              创建时可以直接指定角色，后续只保留启用/停用操作。
            </Typography.Text>
          </div>
        </div>

        <Form<CreateUserFormValues>
          form={form}
          initialValues={{ role: 'ADMIN' }}
          layout='vertical'
          onFinish={handleCreate}
        >
          <div className='admin-users__form-grid'>
            <Form.Item
              label='邮箱'
              name='email'
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            >
              <Input placeholder='请输入邮箱地址' />
            </Form.Item>

            <Form.Item
              label='姓名'
              name='name'
              rules={[{ required: true, message: '请输入姓名' }]}
            >
              <Input placeholder='超级管理员' />
            </Form.Item>

            <Form.Item
              label='初始密码'
              name='password'
              rules={[
                { required: true, message: '请输入初始密码' },
                { min: 8, message: '密码至少 8 位' },
              ]}
            >
              <Input.Password placeholder='请输入初始密码' />
            </Form.Item>

            <Form.Item
              label='账号角色'
              name='role'
              rules={[{ required: true, message: '请选择账号角色' }]}
            >
              <Radio.Group
                options={[
                  { label: '管理员账号', value: 'ADMIN' },
                  { label: '运营账号', value: 'OPERATIONS' },
                ]}
              />
            </Form.Item>
          </div>

          <Space className='admin-users__form-actions' wrap>
            <Button htmlType='submit' loading={isSubmitting} type='primary'>
              创建账号
            </Button>
            <Button onClick={() => form.resetFields()}>清空表单</Button>
          </Space>
        </Form>
      </Card>

      <Card className='admin-users__panel' variant='borderless'>
        <div className='admin-users__panel-head'>
          <div>
            <Typography.Title className='admin-users__panel-title' level={4}>
              账号列表
            </Typography.Title>
            <Typography.Text className='admin-users__panel-subtitle'>
              这里只保留最小可用的管理动作：查看角色、启用和停用。
            </Typography.Text>
          </div>
        </div>

        <Table<AdminUserListItem>
          className='admin-users__table'
          columns={[
            {
              key: 'profile',
              title: '账号',
              render: (_value, record) => (
                <Space direction='vertical' size={0}>
                  <Typography.Text strong>{record.name}</Typography.Text>
                  <Typography.Text type='secondary'>{record.email}</Typography.Text>
                </Space>
              ),
            },
            {
              dataIndex: 'role',
              key: 'role',
              title: '角色',
              render: (_value: AdminUserListItem['role'], record) => (
                <Tag color={roleMeta[record.role].color}>
                  {roleMeta[record.role].label}
                </Tag>
              ),
            },
            {
              dataIndex: 'enabled',
              key: 'enabled',
              title: '状态',
              render: (_value: boolean, record) => (
                <Tag color={getEnabledMeta(record.enabled).color}>
                  {getEnabledMeta(record.enabled).label}
                </Tag>
              ),
            },
            {
              dataIndex: 'createdAt',
              key: 'createdAt',
              title: '创建时间',
              render: (_value: string, record) => formatDateTime(record.createdAt),
            },
            {
              dataIndex: 'updatedAt',
              key: 'updatedAt',
              title: '更新时间',
              render: (_value: string, record) => formatDateTime(record.updatedAt),
            },
            {
              key: 'actions',
              title: '操作',
              render: (_value: unknown, record) => (
                <Button
                  danger={record.enabled}
                  loading={busyUserIds.includes(record.id)}
                  onClick={() => void handleToggleEnabled(record)}
                  type='link'
                >
                  {record.enabled ? '停用' : '启用'}
                </Button>
              ),
            },
          ]}
          dataSource={rows}
          loading={isLoading}
          locale={{ emptyText: '暂无账号数据' }}
          rowKey='id'
        />
      </Card>
    </div>
  );
}
