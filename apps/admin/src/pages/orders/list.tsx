import {
  Alert,
  Button,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

import {
  getAdminOrders,
  type AdminOrderListItem,
} from '../../services/admin-orders';

const orderStatusMeta: Record<
  AdminOrderListItem['status'],
  { color: string; label: string }
> = {
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

const paymentStatusMeta: Record<string, { color: string; label: string }> = {
  FAILED: { color: 'red', label: '支付失败' },
  PENDING: { color: 'default', label: '支付中' },
  REFUNDED: { color: 'blue', label: '已退款' },
  SUCCEEDED: { color: 'green', label: '已支付' },
};

const refundStatusMeta: Record<string, { color: string; label: string }> = {
  APPROVED: { color: 'blue', label: '已通过' },
  COMPLETED: { color: 'green', label: '已完成' },
  PROCESSING: { color: 'cyan', label: '处理中' },
  REJECTED: { color: 'red', label: '已驳回' },
  REVIEWING: { color: 'gold', label: '审核中' },
};

const orderStatusOptions = Object.entries(orderStatusMeta).map(
  ([value, meta]) => ({
    label: meta.label,
    value,
  }),
);

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

export function OrdersListPage() {
  const [rows, setRows] = useState<AdminOrderListItem[]>([]);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdminOrderListItem['status']>();

  async function loadOrders() {
    setLoading(true);
    setError(undefined);

    try {
      setRows(await getAdminOrders());
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : '无法加载订单列表。',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (statusFilter && row.status !== statusFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [
        row.orderNumber,
        row.userId,
        row.event?.title,
        row.sessionName,
        row.latestRefundRequest?.refundNo,
      ]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalizedQuery));
    });
  }, [normalizedQuery, rows, statusFilter]);

  return (
    <Space
      direction='vertical'
      size={16}
      style={{ display: 'flex', width: '100%' }}
    >
      <div className='admin-page__header'>
        <div>
          <Typography.Title className='admin-page__title' level={2}>
            订单工作台
          </Typography.Title>
          <Typography.Paragraph className='admin-page__subtitle'>
            订单、履约、出票与退款异常统一在这里处理，保留高密度操作入口。
          </Typography.Paragraph>
        </div>

        <Space wrap>
          <Tag color='blue'>{rows.length} 笔订单</Tag>
          <Button loading={loading} onClick={() => void loadOrders()}>
            刷新
          </Button>
        </Space>
      </div>

      {error ? <Alert message={error} showIcon type='error' /> : null}

      <Space wrap>
        <Input
          allowClear
          onChange={(event) => setQuery(event.target.value)}
          placeholder='搜索订单号、客户、活动、场次或退款单号'
          style={{ width: 320 }}
          value={query}
        />
        <Select
          allowClear
          onChange={(value) => setStatusFilter(value)}
          options={orderStatusOptions}
          placeholder='按订单状态筛选'
          style={{ width: 200 }}
          value={statusFilter}
        />
      </Space>

      <Table<AdminOrderListItem>
        columns={[
          {
            dataIndex: 'orderNumber',
            key: 'orderNumber',
            title: '订单',
            render: (_value: string, record) => (
              <Space direction='vertical' size={0}>
                <Link
                  style={{ color: '#2459d6', fontWeight: 600 }}
                  to={`/orders/${record.id}`}
                >
                  {record.orderNumber}
                </Link>
                <Typography.Text type='secondary'>
                  {record.userId} / {record.id}
                </Typography.Text>
              </Space>
            ),
          },
          {
            dataIndex: 'event',
            key: 'event',
            title: '履约',
            render: (_value: AdminOrderListItem['event'], record) => (
              <Space direction='vertical' size={0}>
                <Typography.Text strong>
                  {record.event?.title ?? '未知活动'}
                </Typography.Text>
                <Typography.Text type='secondary'>
                  {record.sessionName ?? '-'} / {record.itemCount} 张
                </Typography.Text>
                <Typography.Text type='secondary'>
                  {record.timeline.title}
                </Typography.Text>
              </Space>
            ),
          },
          {
            dataIndex: 'status',
            key: 'status',
            title: '状态',
            render: (_value: string, record) => (
              <Space direction='vertical' size={4}>
                <Space wrap>
                  <Tag color={orderStatusMeta[record.status]?.color ?? 'default'}>
                    {orderStatusMeta[record.status]?.label ?? record.status}
                  </Tag>
                  {record.latestPayment ? (
                    <Tag
                      color={
                        paymentStatusMeta[record.latestPayment.status]?.color ??
                        'default'
                      }
                    >
                      {paymentStatusMeta[record.latestPayment.status]?.label ??
                        record.latestPayment.status}
                    </Tag>
                  ) : null}
                  {record.latestRefundRequest ? (
                    <Tag
                      color={
                        refundStatusMeta[record.latestRefundRequest.status]?.color ??
                        'default'
                      }
                    >
                      {refundStatusMeta[record.latestRefundRequest.status]?.label ??
                        record.latestRefundRequest.status}
                    </Tag>
                  ) : null}
                  <Tag color={record.refundEntryEnabled ? 'green' : 'default'}>
                    {record.refundEntryEnabled ? '可退票' : '关闭退票'}
                  </Tag>
                </Space>
                <Typography.Text type='secondary'>
                  {record.latestRefundRequest?.refundNo ??
                    record.latestPayment?.providerTxnId ??
                    '-'}
                </Typography.Text>
              </Space>
            ),
          },
          {
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            title: '金额',
            render: (_value: number, record) => (
              <Space direction='vertical' size={0}>
                <Typography.Text strong>
                  {formatAmount(record.totalAmount, record.currency)}
                </Typography.Text>
                <Typography.Text type='secondary'>
                  {record.ticketType}
                </Typography.Text>
              </Space>
            ),
          },
          {
            dataIndex: 'createdAt',
            key: 'createdAt',
            title: '时间',
            render: (_value: string, record) => (
              <Space direction='vertical' size={0}>
                <Typography.Text>{formatDateTime(record.createdAt)}</Typography.Text>
                <Typography.Text type='secondary'>
                  支付：{formatDateTime(record.latestPayment?.paidAt)}
                </Typography.Text>
              </Space>
            ),
          },
          {
            key: 'actions',
            title: '操作',
            render: (_value: unknown, record) => (
              <Space size={8} wrap>
                <Link to={`/orders/${record.id}`}>查看</Link>
              </Space>
            ),
          },
        ]}
        dataSource={filteredRows}
        loading={loading}
        locale={{ emptyText: '暂无符合条件的订单。' }}
        rowKey='id'
      />
    </Space>
  );
}
