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
  getAdminEvents,
  type AdminEventListItem,
} from '../../services/admin-events';

const saleStatusMeta: Record<
  AdminEventListItem['saleStatus'],
  { color: string; label: string }
> = {
  ON_SALE: { color: 'green', label: '销售中' },
  SOLD_OUT: { color: 'red', label: '已售罄' },
  UPCOMING: { color: 'gold', label: '待开售' },
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('zh-CN', {
    currency: 'CNY',
    style: 'currency',
  }).format(value / 100);
}

function formatDateTime(value: string | undefined) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString('zh-CN', {
    hour12: false,
  });
}

export function EventsListPage() {
  const [rows, setRows] = useState<AdminEventListItem[]>([]);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [saleStatusFilter, setSaleStatusFilter] =
    useState<AdminEventListItem['saleStatus']>();
  const [publicationFilter, setPublicationFilter] = useState<
    'published' | 'unpublished'
  >();

  async function loadEvents() {
    setLoading(true);
    setError(undefined);

    try {
      setRows(await getAdminEvents());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : '无法加载活动列表。',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadEvents();
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (saleStatusFilter && row.saleStatus !== saleStatusFilter) {
        return false;
      }

      if (publicationFilter === 'published' && !row.published) {
        return false;
      }

      if (publicationFilter === 'unpublished' && row.published) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [row.title, row.city, row.venueName]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [normalizedQuery, publicationFilter, rows, saleStatusFilter]);

  return (
    <Space
      direction='vertical'
      size={16}
      style={{ display: 'flex', width: '100%' }}
    >
      <div className='admin-page__header'>
        <div>
          <Typography.Title className='admin-page__title' level={2}>
            活动
          </Typography.Title>
          <Typography.Paragraph className='admin-page__subtitle'>
            活动列表、发布状态、区域票档和编辑入口。
          </Typography.Paragraph>
        </div>

        <Space wrap>
          <Tag color='blue'>{rows.length} 条活动</Tag>
          <Link to='/events/new'>
            <Button type='primary'>新建活动</Button>
          </Link>
        </Space>
      </div>

      {error ? <Alert message={error} showIcon type='error' /> : null}

      <Space wrap>
        <Input
          allowClear
          onChange={(event) => setQuery(event.target.value)}
          placeholder='搜索活动标题、城市或场馆'
          style={{ width: 300 }}
          value={query}
        />
        <Select
          allowClear
          onChange={(value) => setSaleStatusFilter(value)}
          options={Object.entries(saleStatusMeta).map(([value, meta]) => ({
            label: meta.label,
            value,
          }))}
          placeholder='筛选售卖状态'
          style={{ width: 160 }}
          value={saleStatusFilter}
        />
        <Select
          allowClear
          onChange={(value) => setPublicationFilter(value)}
          options={[
            { label: '已发布', value: 'published' },
            { label: '未发布', value: 'unpublished' },
          ]}
          placeholder='筛选发布状态'
          style={{ width: 160 }}
          value={publicationFilter}
        />
        <Button loading={loading} onClick={() => void loadEvents()}>
          刷新
        </Button>
      </Space>

      <Table<AdminEventListItem>
        columns={[
          {
            dataIndex: 'title',
            key: 'title',
            title: '活动',
            render: (_value: string, record) => (
              <Space direction='vertical' size={0}>
                <Link
                  style={{ color: '#2055dc', fontWeight: 600 }}
                  to={`/events/${record.id}`}
                >
                  {record.title}
                </Link>
                <Typography.Text type='secondary'>
                  {record.city} / {record.venueName}
                </Typography.Text>
              </Space>
            ),
          },
          {
            dataIndex: 'saleStatus',
            key: 'saleStatus',
            title: '售卖状态',
            render: (value: AdminEventListItem['saleStatus'], record) => (
              <Space wrap>
                <Tag color={saleStatusMeta[value].color}>
                  {saleStatusMeta[value].label}
                </Tag>
                <Tag color={record.published ? 'blue' : 'default'}>
                  {record.published ? '已发布' : '未发布'}
                </Tag>
              </Space>
            ),
          },
          {
            dataIndex: 'minPrice',
            key: 'minPrice',
            title: '最低票价',
            render: (value: number) => formatCurrency(value),
          },
          {
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            title: '更新时间',
            render: (value: string | undefined) => formatDateTime(value),
          },
          {
            dataIndex: 'sessionsCount',
            key: 'sessionsCount',
            title: '场次数',
          },
          {
            key: 'actions',
            title: '操作',
            render: (_value: unknown, record) => (
              <Space size={8} wrap>
                <Link to={`/events/${record.id}`}>查看</Link>
                <Link to={`/events/${record.id}/edit`}>编辑</Link>
              </Space>
            ),
          },
        ]}
        dataSource={filteredRows}
        loading={loading}
        locale={{ emptyText: '暂无符合条件的活动。' }}
        rowKey='id'
      />
    </Space>
  );
}
