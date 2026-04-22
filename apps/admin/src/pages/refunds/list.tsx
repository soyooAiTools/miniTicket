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
  getAdminRefunds,
  type AdminRefundQueueItem,
} from '../../services/admin-refunds';

const refundStatusMeta: Record<
  AdminRefundQueueItem['status'],
  { color: string; label: string }
> = {
  APPROVED: { color: 'blue', label: '已通过' },
  COMPLETED: { color: 'green', label: '已完成' },
  PROCESSING: { color: 'cyan', label: '处理中' },
  REJECTED: { color: 'red', label: '已驳回' },
  REVIEWING: { color: 'gold', label: '待审核' },
};

const statusOptions = Object.entries(refundStatusMeta).map(([value, meta]) => ({
  label: meta.label,
  value,
}));

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

export function RefundsListPage() {
  const [rows, setRows] = useState<AdminRefundQueueItem[]>([]);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdminRefundQueueItem['status']>();

  async function loadRefunds() {
    setLoading(true);
    setError(undefined);

    try {
      setRows(await getAdminRefunds());
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : '无法加载退款列表。',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRefunds();
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
        row.refundNo,
        row.orderNumber,
        row.requesterName,
        row.reason,
        row.event?.title,
        row.sessionName,
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
            退款工作台
          </Typography.Title>
          <Typography.Paragraph className='admin-page__subtitle'>
            审核、驳回和处理退款请求，保留队列感和高密度处理入口。
          </Typography.Paragraph>
        </div>

        <Space wrap>
          <Tag color='blue'>{rows.length} 笔退款</Tag>
          <Button loading={loading} onClick={() => void loadRefunds()}>
            刷新
          </Button>
        </Space>
      </div>

      {error ? <Alert message={error} showIcon type='error' /> : null}

      <Space wrap>
        <Input
          allowClear
          onChange={(event) => setQuery(event.target.value)}
          placeholder='搜索退款单、订单、客户、活动或原因'
          style={{ width: 320 }}
          value={query}
        />
        <Select
          allowClear
          onChange={(value) => setStatusFilter(value)}
          options={statusOptions}
          placeholder='按退款状态筛选'
          style={{ width: 200 }}
          value={statusFilter}
        />
      </Space>

      <Table<AdminRefundQueueItem>
        columns={[
          {
            dataIndex: 'refundNo',
            key: 'refundNo',
            title: '退款单',
            render: (_value: string, record) => (
              <Space direction='vertical' size={0}>
                <Link
                  style={{ color: '#2459d6', fontWeight: 600 }}
                  to={`/refunds/${record.id}`}
                >
                  {record.refundNo}
                </Link>
                <Typography.Text type='secondary'>
                  {record.orderNumber} / {record.requesterName}
                </Typography.Text>
              </Space>
            ),
          },
          {
            dataIndex: 'event',
            key: 'event',
            title: '上下文',
            render: (_value: AdminRefundQueueItem['event'], record) => (
              <Space direction='vertical' size={0}>
                <Typography.Text strong>
                  {record.event?.title ?? '未知活动'}
                </Typography.Text>
                <Typography.Text type='secondary'>
                  {record.sessionName ?? '-'} / {record.orderStatus}
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
                <Tag color={refundStatusMeta[record.status]?.color ?? 'default'}>
                  {refundStatusMeta[record.status]?.label ?? record.status}
                </Tag>
                <Typography.Text type='secondary'>{record.reason}</Typography.Text>
              </Space>
            ),
          },
          {
            dataIndex: 'amount',
            key: 'amount',
            title: '金额',
            render: (_value: number, record) => (
              <Space direction='vertical' size={0}>
                <Typography.Text strong>
                  退款：{formatAmount(record.amount, record.currency)}
                </Typography.Text>
                <Typography.Text type='secondary'>
                  申请：{formatAmount(record.requestedAmount, record.currency)} / 手续费：
                  {formatAmount(record.serviceFee, record.currency)}
                </Typography.Text>
              </Space>
            ),
          },
          {
            dataIndex: 'requestedAt',
            key: 'requestedAt',
            title: '时间',
            render: (_value: string, record) => (
              <Space direction='vertical' size={0}>
                <Typography.Text>
                  申请：{formatDateTime(record.requestedAt)}
                </Typography.Text>
                <Typography.Text type='secondary'>
                  处理：{formatDateTime(record.processedAt)}
                </Typography.Text>
              </Space>
            ),
          },
          {
            key: 'actions',
            title: '操作',
            render: (_value: unknown, record) => (
              <Space size={8} wrap>
                <Link to={`/refunds/${record.id}`}>查看</Link>
              </Space>
            ),
          },
        ]}
        dataSource={filteredRows}
        loading={loading}
        locale={{ emptyText: '暂无符合条件的退款。' }}
        rowKey='id'
      />
    </Space>
  );
}
