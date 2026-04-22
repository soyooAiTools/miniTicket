import {
  Alert,
  Button,
  Card,
  Descriptions,
  Divider,
  Form,
  Input,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  addAdminOrderFlag,
  addAdminOrderNote,
  getAdminOrderDetail,
  type AdminOrderDetail,
  type AdminOrderFlag,
  type AdminOrderNote,
} from '../../services/admin-orders';

const orderStatusMeta: Record<string, { color: string; label: string }> = {
  CLOSED: { color: 'default', label: '已关闭' },
  COMPLETED: { color: 'green', label: '已完成' },
  PAID_PENDING_FULFILLMENT: { color: 'gold', label: '待履约' },
  PENDING_PAYMENT: { color: 'default', label: '待支付' },
  REFUNDED: { color: 'blue', label: '已退款' },
  REFUND_PROCESSING: { color: 'cyan', label: '退款处理中' },
  REFUND_REVIEWING: { color: 'orange', label: '退款审核中' },
  SUBMITTED_TO_VENDOR: { color: 'purple', label: '已提交渠道' },
  TICKET_FAILED: { color: 'red', label: '出票失败' },
  TICKET_ISSUED: { color: 'green', label: '已出票' },
};

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat('zh-CN', {
    currency,
    style: 'currency',
  }).format(amount / 100);
}

function formatDateTime(value: string | undefined) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString('zh-CN', {
    hour12: false,
  });
}

function SectionCard({
  children,
  extra,
  title,
}: {
  children: ReactNode;
  extra?: ReactNode;
  title: string;
}) {
  return (
    <Card className='admin-dashboard__panel' extra={extra} title={title} variant='borderless'>
      {children}
    </Card>
  );
}

function itemColumns() {
  return [
    {
      dataIndex: 'sessionName',
      key: 'sessionName',
      title: '场次 / 层级',
      render: (_value: string, record: AdminOrderDetail['items'][number]) => (
        <Space direction='vertical' size={0}>
          <Typography.Text strong>{record.sessionName}</Typography.Text>
          <Typography.Text type='secondary'>{record.tierName}</Typography.Text>
        </Space>
      ),
    },
    {
      dataIndex: 'viewer',
      key: 'viewer',
      title: '观众',
      render: (
        _value: AdminOrderDetail['items'][number]['viewer'],
        record: AdminOrderDetail['items'][number],
      ) => (
        <Space direction='vertical' size={0}>
          <Typography.Text strong>{record.viewer.name}</Typography.Text>
          <Typography.Text type='secondary'>{record.viewer.mobile}</Typography.Text>
        </Space>
      ),
    },
    {
      dataIndex: 'quantity',
      key: 'quantity',
      title: '数量',
    },
    {
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      title: '金额',
      render: (_value: number, record: AdminOrderDetail['items'][number]) =>
        formatAmount(record.totalAmount, 'CNY'),
    },
  ];
}

export function OrdersDetailPage() {
  const params = useParams();
  const orderId = params.orderId;
  const [detail, setDetail] = useState<AdminOrderDetail>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string>();
  const [reloadVersion, setReloadVersion] = useState(0);
  const [savingAction, setSavingAction] = useState<'flag' | 'note' | null>(null);
  const [noteForm] = Form.useForm<{ content: string }>();
  const [flagForm] = Form.useForm<{ note?: string; type: string }>();

  useEffect(() => {
    if (!orderId) {
      setError('缺少订单编号，无法加载详情。');
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(undefined);

    void (async () => {
      try {
        const nextDetail = await getAdminOrderDetail(orderId);
        if (active) {
          setDetail(nextDetail);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error ? loadError.message : '无法加载订单详情。',
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [orderId, reloadVersion]);

  async function submitNote() {
    if (!orderId) {
      return;
    }

    setSavingAction('note');
    setNotice(undefined);
    setError(undefined);

    try {
      const values = await noteForm.validateFields();
      await addAdminOrderNote(orderId, {
        content: values.content.trim(),
      });
      noteForm.resetFields();
      setNotice('内部备注已添加。');
      setReloadVersion((value) => value + 1);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : '添加备注失败。',
      );
    } finally {
      setSavingAction(null);
    }
  }

  async function submitFlag() {
    if (!orderId) {
      return;
    }

    setSavingAction('flag');
    setNotice(undefined);
    setError(undefined);

    try {
      const values = await flagForm.validateFields();
      await addAdminOrderFlag(orderId, {
        note: values.note?.trim() ? values.note.trim() : undefined,
        type: values.type.trim(),
      });
      flagForm.resetFields();
      setNotice('异常标记已添加。');
      setReloadVersion((value) => value + 1);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : '新增标记失败。',
      );
    } finally {
      setSavingAction(null);
    }
  }

  return (
    <Space
      direction='vertical'
      size={16}
      style={{ display: 'flex', width: '100%' }}
    >
      <div className='admin-page__header'>
        <div>
          <Typography.Title className='admin-page__title' level={2}>
            订单详情
          </Typography.Title>
          <Typography.Paragraph className='admin-page__subtitle'>
            同时查看履约、退款历史、内部备注和异常标记，支持现场补充处理。
          </Typography.Paragraph>
        </div>

        <Space wrap>
          {orderId ? <Tag color='blue'>ID: {orderId}</Tag> : null}
          {detail ? (
            <Tag color={orderStatusMeta[detail.status]?.color ?? 'default'}>
              {orderStatusMeta[detail.status]?.label ?? detail.status}
            </Tag>
          ) : null}
          {detail ? (
            <Link to='/orders'>
              <Button>返回列表</Button>
            </Link>
          ) : null}
        </Space>
      </div>

      {error ? <Alert message={error} showIcon type='error' /> : null}
      {notice ? <Alert message={notice} showIcon type='success' /> : null}
      {loading ? <Alert message='正在加载订单详情...' showIcon type='info' /> : null}

      {detail ? (
        <>
          <Card className='admin-dashboard__panel' variant='borderless'>
            <Space direction='vertical' size={12} style={{ display: 'flex' }}>
              <Space wrap>
                <Tag color={detail.refundEntryEnabled ? 'green' : 'default'}>
                  {detail.refundEntryEnabled ? '可退票' : '关闭退票'}
                </Tag>
                <Tag color='blue'>{detail.ticketType}</Tag>
                <Tag color='geekblue'>{detail.userId}</Tag>
              </Space>
              <Typography.Title level={3} style={{ margin: 0 }}>
                {detail.orderNumber}
              </Typography.Title>
              <Typography.Text className='admin-page__subtitle'>
                {detail.event?.title ?? '未知活动'} / {detail.event?.city ?? '-'} /{' '}
                {detail.event?.venueName ?? '-'}
              </Typography.Text>
              <Descriptions column={2} size='small'>
                <Descriptions.Item label='总金额'>
                  {formatAmount(detail.totalAmount, detail.currency)}
                </Descriptions.Item>
                <Descriptions.Item label='创建时间'>
                  {formatDateTime(detail.createdAt)}
                </Descriptions.Item>
                <Descriptions.Item label='履约节点'>
                  {detail.timeline.title}
                </Descriptions.Item>
                <Descriptions.Item label='履约说明'>
                  {detail.timeline.description}
                </Descriptions.Item>
              </Descriptions>
            </Space>
          </Card>

          <SectionCard title='履约信息'>
            <Space direction='vertical' size={16} style={{ display: 'flex' }}>
              <Table
                columns={itemColumns()}
                dataSource={detail.items}
                pagination={false}
                rowKey='id'
                size='small'
              />
                <Table
                  columns={[
                  {
                    dataIndex: 'status',
                    key: 'status',
                    title: '支付状态',
                    render: (value: string) => (
                      <Tag color={value === 'SUCCEEDED' ? 'green' : 'default'}>
                        {value}
                      </Tag>
                    ),
                  },
                  {
                    dataIndex: 'providerTxnId',
                    key: 'providerTxnId',
                    title: '渠道单号',
                  },
                  {
                    dataIndex: 'paidAt',
                    key: 'paidAt',
                    title: '支付时间',
                    render: (value: string | undefined) => formatDateTime(value),
                  },
                  {
                    dataIndex: 'createdAt',
                    key: 'createdAt',
                    title: '记录时间',
                    render: (value: string) => formatDateTime(value),
                  },
                ]}
                dataSource={detail.payments}
                pagination={false}
                rowKey={(record) => `${record.status}-${record.createdAt}`}
                size='small'
              />
            </Space>
          </SectionCard>

          <SectionCard title='退款历史'>
            <Table<AdminOrderDetail['refundRequests'][number]>
              columns={[
                {
                  dataIndex: 'refundNo',
                  key: 'refundNo',
                  title: '退款单号',
                  render: (
                    _value: string,
                    record: AdminOrderDetail['refundRequests'][number],
                  ) => (
                    <Link to={`/refunds/${record.id}`}>{record.refundNo}</Link>
                  ),
                },
                {
                  dataIndex: 'status',
                  key: 'status',
                  title: '状态',
                  render: (value: string) => (
                    <Tag color={value === 'REJECTED' ? 'red' : value === 'APPROVED' ? 'blue' : value === 'PROCESSING' ? 'cyan' : value === 'COMPLETED' ? 'green' : 'gold'}>
                      {value}
                    </Tag>
                  ),
                },
                {
                  dataIndex: 'refundAmount',
                  key: 'refundAmount',
                  title: '退款金额',
                  render: (value: number) => formatAmount(value, detail.currency),
                },
                {
                  dataIndex: 'requestedAt',
                  key: 'requestedAt',
                  title: '申请时间',
                  render: (value: string) => formatDateTime(value),
                },
                {
                  dataIndex: 'processedAt',
                  key: 'processedAt',
                  title: '处理时间',
                  render: (value: string | undefined) => formatDateTime(value),
                },
              ]}
              dataSource={detail.refundRequests}
              locale={{ emptyText: '暂无退款记录。' }}
              pagination={false}
              rowKey='id'
              size='small'
            />
          </SectionCard>

          <SectionCard title='内部备注'>
            <Space direction='vertical' size={16} style={{ display: 'flex' }}>
              <Space direction='vertical' size={8} style={{ display: 'flex' }}>
                {detail.notes.map((note) => (
                  <Card key={note.id} size='small' type='inner'>
                    <Space direction='vertical' size={4} style={{ display: 'flex' }}>
                      <Space wrap>
                        <Typography.Text strong>{note.createdByName}</Typography.Text>
                        <Typography.Text type='secondary'>
                          {formatDateTime(note.createdAt)}
                        </Typography.Text>
                      </Space>
                      <Typography.Paragraph style={{ marginBottom: 0 }}>
                        {note.content}
                      </Typography.Paragraph>
                    </Space>
                  </Card>
                ))}
              </Space>

              <Form form={noteForm} layout='vertical'>
                <Form.Item
                  label='内部备注'
                  name='content'
                  rules={[{ required: true, message: '请输入内部备注。' }]}
                >
                  <Input.TextArea autoSize={{ minRows: 3, maxRows: 5 }} />
                </Form.Item>
                <Button
                  loading={savingAction === 'note'}
                  onClick={() => void submitNote()}
                  type='primary'
                >
                  添加备注
                </Button>
              </Form>
            </Space>
          </SectionCard>

          <SectionCard title='异常标记'>
            <Space direction='vertical' size={16} style={{ display: 'flex' }}>
              <Space direction='vertical' size={8} style={{ display: 'flex' }}>
                {detail.flags.map((flag: AdminOrderFlag) => (
                  <Card key={flag.id} size='small' type='inner'>
                    <Space direction='vertical' size={4} style={{ display: 'flex' }}>
                      <Space wrap>
                        <Tag color='volcano'>{flag.type}</Tag>
                        <Typography.Text type='secondary'>
                          {flag.createdByName} / {formatDateTime(flag.createdAt)}
                        </Typography.Text>
                      </Space>
                      <Typography.Paragraph style={{ marginBottom: 0 }}>
                        {flag.note ?? '未填写备注'}
                      </Typography.Paragraph>
                    </Space>
                  </Card>
                ))}
              </Space>

              <Form form={flagForm} layout='vertical'>
                <Space align='start' style={{ display: 'flex', width: '100%' }} wrap>
                  <Form.Item
                    label='标记类型'
                    name='type'
                    rules={[{ required: true, message: '请输入标记类型。' }]}
                    style={{ minWidth: 220, flex: 1 }}
                  >
                    <Input placeholder='异常单 / 人工复核 / 跟进中' />
                  </Form.Item>
                  <Form.Item label='标记说明' name='note' style={{ flex: 2 }}>
                    <Input.TextArea autoSize={{ minRows: 3, maxRows: 5 }} />
                  </Form.Item>
                </Space>
                <Button
                  loading={savingAction === 'flag'}
                  onClick={() => void submitFlag()}
                >
                  新增标记
                </Button>
              </Form>
            </Space>
          </SectionCard>
        </>
      ) : null}
    </Space>
  );
}
