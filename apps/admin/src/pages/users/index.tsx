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
import { useEffect, useMemo, useRef, useState } from 'react';

import { useAdminAuth } from '../../app/admin-auth-context';
import {
  createAdminUser,
  getAdminUsers,
  setAdminUserEnabled,
  updateAdminUserRole,
  type AdminUserCreateRequest,
  type AdminUserListItem,
} from '../../services/admin-users';

type CreateUserFormValues = AdminUserCreateRequest;

type ActionState = {
  disabled: boolean;
  label: string;
};

type RoleActionState = ActionState & {
  nextRole: AdminUserListItem['role'];
};

const roleMeta: Record<AdminUserListItem['role'], { label: string }> = {
  ADMIN: {
    label: '管理员',
  },
  OPERATIONS: {
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

function getRoleActionState(
  row: AdminUserListItem,
  currentUserId: string | undefined,
  enabledAdminCount: number,
  isAccountMutationPending: boolean,
  canManageAccounts: boolean,
): RoleActionState {
  if (!canManageAccounts) {
    return {
      disabled: true,
      label: '仅管理员可操作',
      nextRole: row.role === 'ADMIN' ? 'OPERATIONS' : 'ADMIN',
    };
  }

  if (row.role === 'OPERATIONS') {
    return {
      disabled: isAccountMutationPending,
      label: '改为管理员',
      nextRole: 'ADMIN',
    };
  }

  if (row.id === currentUserId) {
    return {
      disabled: true,
      label: '不能降级自己',
      nextRole: 'OPERATIONS',
    };
  }

  if (row.enabled && enabledAdminCount <= 1) {
    return {
      disabled: true,
      label: '保留最后启用管理员',
      nextRole: 'OPERATIONS',
    };
  }

  return {
    disabled: isAccountMutationPending,
    label: '改为运营',
    nextRole: 'OPERATIONS',
  };
}

function getEnabledActionState(
  row: AdminUserListItem,
  currentUserId: string | undefined,
  enabledAdminCount: number,
  isAccountMutationPending: boolean,
  canManageAccounts: boolean,
): ActionState {
  if (!canManageAccounts) {
    return {
      disabled: true,
      label: '仅管理员可操作',
    };
  }

  if (!row.enabled) {
    return {
      disabled: isAccountMutationPending,
      label: '启用',
    };
  }

  if (row.id === currentUserId) {
    return {
      disabled: true,
      label: '不能停用自己',
    };
  }

  if (row.role === 'ADMIN' && enabledAdminCount <= 1) {
    return {
      disabled: true,
      label: '保留最后启用管理员',
    };
  }

  return {
    disabled: isAccountMutationPending,
    label: '停用',
  };
}

export function UsersPage() {
  const { session } = useAdminAuth();
  const [form] = Form.useForm<CreateUserFormValues>();
  const [rows, setRows] = useState<AdminUserListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const accountMutationLockRef = useRef(false);

  const canManageAccounts = session?.user.role === 'ADMIN';

  const summary = useMemo(() => {
    const adminCount = rows.filter((row) => row.role === 'ADMIN').length;
    const operationsCount = rows.filter((row) => row.role === 'OPERATIONS').length;
    const enabledCount = rows.filter((row) => row.enabled).length;
    const enabledAdminCount = rows.filter(
      (row) => row.enabled && row.role === 'ADMIN',
    ).length;

    return {
      adminCount,
      enabledAdminCount,
      enabledCount,
      operationsCount,
      total: rows.length,
    };
  }, [rows]);

  const isAccountMutationPending = busyUserId !== null;

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
    if (!canManageAccounts) {
      return;
    }

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

  async function runAccountMutation(
    rowId: string,
    mutation: () => Promise<void>,
    fallbackMessage: string,
  ) {
    if (accountMutationLockRef.current || !canManageAccounts) {
      return;
    }

    accountMutationLockRef.current = true;
    setBusyUserId(rowId);

    try {
      await mutation();
      await loadUsers();
    } catch (mutationError) {
      setError(formatErrorMessage(mutationError, fallbackMessage));
    } finally {
      accountMutationLockRef.current = false;
      setBusyUserId(null);
    }
  }

  async function handleToggleEnabled(row: AdminUserListItem) {
    const enabledAction = getEnabledActionState(
      row,
      session?.user.id,
      summary.enabledAdminCount,
      isAccountMutationPending,
      canManageAccounts,
    );

    if (enabledAction.disabled) {
      return;
    }

    await runAccountMutation(
      row.id,
      async () => {
        await setAdminUserEnabled(row.id, !row.enabled);
      },
      '更新账号状态失败，请稍后重试。',
    );
  }

  async function handleToggleRole(
    row: AdminUserListItem,
    nextRole: AdminUserListItem['role'],
  ) {
    const roleAction = getRoleActionState(
      row,
      session?.user.id,
      summary.enabledAdminCount,
      isAccountMutationPending,
      canManageAccounts,
    );

    if (roleAction.disabled || roleAction.nextRole !== nextRole) {
      return;
    }

    await runAccountMutation(
      row.id,
      async () => {
        await updateAdminUserRole(row.id, nextRole);
      },
      '更新账号角色失败，请稍后重试。',
    );
  }

  return (
    <div className='admin-users'>
      <header className='admin-page__header'>
        <div>
          <Typography.Title className='admin-page__title' level={2}>
            账号管理
          </Typography.Title>
          <Typography.Paragraph className='admin-page__subtitle'>
            在这里维护后台账号的创建、启停和角色信息。
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
      {!canManageAccounts ? (
        <Alert message='仅管理员可管理账号' showIcon type='info' />
      ) : null}

      <Card className='admin-users__panel' variant='borderless'>
        <div className='admin-users__panel-head'>
          <div>
            <Typography.Title className='admin-users__panel-title' level={4}>
              新增账号
            </Typography.Title>
            <Typography.Text className='admin-users__panel-subtitle'>
              创建时可以直接指定角色，后续可改角色、启停。
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
              <Input disabled={!canManageAccounts} placeholder='请输入邮箱地址' />
            </Form.Item>

            <Form.Item
              label='姓名'
              name='name'
              rules={[{ required: true, message: '请输入姓名' }]}
            >
              <Input disabled={!canManageAccounts} placeholder='超级管理员' />
            </Form.Item>

            <Form.Item
              label='初始密码'
              name='password'
              rules={[
                { required: true, message: '请输入初始密码' },
                { min: 8, message: '密码至少 8 位' },
              ]}
            >
              <Input.Password disabled={!canManageAccounts} placeholder='请输入初始密码' />
            </Form.Item>

            <Form.Item
              label='账号角色'
              name='role'
              rules={[{ required: true, message: '请选择账号角色' }]}
            >
              <Radio.Group
                disabled={!canManageAccounts}
                options={[
                  { label: '管理员账号', value: 'ADMIN' },
                  { label: '运营账号', value: 'OPERATIONS' },
                ]}
              />
            </Form.Item>
          </div>

          <Space className='admin-users__form-actions' wrap>
            <Button
              disabled={!canManageAccounts}
              htmlType='submit'
              loading={isSubmitting}
              type='primary'
            >
              创建账号
            </Button>
            <Button disabled={!canManageAccounts} onClick={() => form.resetFields()}>
              清空表单
            </Button>
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
              这里可查看角色，并直接切换角色或启停账号。
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
              render: (_value: AdminUserListItem['role'], record) => {
                const roleAction = getRoleActionState(
                  record,
                  session?.user.id,
                  summary.enabledAdminCount,
                  isAccountMutationPending,
                  canManageAccounts,
                );

                return (
                  <Space direction='vertical' size={0}>
                    <Tag color={record.role === 'ADMIN' ? 'blue' : 'geekblue'}>
                      {roleMeta[record.role].label}
                    </Tag>
                    <Button
                      disabled={roleAction.disabled}
                      loading={busyUserId === record.id}
                      onClick={() => void handleToggleRole(record, roleAction.nextRole)}
                      type='link'
                    >
                      {roleAction.label}
                    </Button>
                  </Space>
                );
              },
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
              render: (_value: unknown, record) => {
                const enabledAction = getEnabledActionState(
                  record,
                  session?.user.id,
                  summary.enabledAdminCount,
                  isAccountMutationPending,
                  canManageAccounts,
                );

                return (
                  <Button
                    danger={record.enabled}
                    disabled={enabledAction.disabled}
                    loading={busyUserId === record.id}
                    onClick={() => void handleToggleEnabled(record)}
                    type='link'
                  >
                    {enabledAction.label}
                  </Button>
                );
              },
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
