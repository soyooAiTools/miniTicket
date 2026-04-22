import { Alert, Button, Card, List, Space, Tag, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

import {
  getAdminDashboardSummary,
  type AdminDashboardRecentAction,
  type AdminDashboardSummary,
} from '../../services/admin-dashboard';

type FocusQueueItem = {
  count: number;
  description: string;
  href: string;
  label: string;
  tag: string;
};

type SummaryCardItem = {
  count: number;
  href: string;
  label: string;
  note: string;
  tone: 'danger' | 'warning' | 'neutral' | 'positive';
};

const summaryCardToneLabel: Record<SummaryCardItem['tone'], string> = {
  danger: '高优先级',
  neutral: '稳定',
  positive: '推进中',
  warning: '待确认',
};

const recentActionLabelMap: Record<string, string> = {
  ADMIN_LOGIN: '后台登录',
  ADMIN_USER_CREATED: '新增账号',
  EVENT_PUBLISHED: '活动已发布',
  EVENT_UPDATED: '活动已更新',
  ORDER_FLAGGED: '订单已标记',
  REFUND_APPROVED: '退款已通过',
  REFUND_PROCESSING: '退款处理中',
  REFUND_REJECTED: '退款已驳回',
};

const targetTypeLabelMap: Record<string, string> = {
  ADMIN_USER: '账号',
  EVENT: '活动',
  ORDER: '订单',
  REFUND: '退款',
  REFUND_REQUEST: '退款',
};

const dateTimeFormatter = new Intl.DateTimeFormat('zh-CN', {
  dateStyle: 'medium',
  hour12: false,
  timeStyle: 'short',
});

function getRecentActionLabel(action: AdminDashboardRecentAction) {
  return recentActionLabelMap[action.action] ?? action.action;
}

function getTargetTypeLabel(targetType: string) {
  return targetTypeLabelMap[targetType] ?? targetType;
}

function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

function useDashboardSummary() {
  const [summary, setSummary] = useState<AdminDashboardSummary>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const nextSummary = await getAdminDashboardSummary();
          setSummary(nextSummary);
        } catch (loadError) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : '无法加载运营概览。',
          );
        } finally {
          setLoading(false);
        }
      })();
    }, 100);

    return () => window.clearTimeout(timer);
  }, []);

  return { error, loading, summary };
}

function DashboardSummaryCard({ item }: { item: SummaryCardItem }) {
  return (
    <Card className={`admin-dashboard__summary-card admin-dashboard__summary-card--${item.tone}`} variant='borderless'>
      <div className='admin-dashboard__summary-head'>
        <Typography.Text className='admin-dashboard__summary-label'>
          {item.label}
        </Typography.Text>
        <Tag className='admin-dashboard__summary-tag' color='default'>
          {summaryCardToneLabel[item.tone]}
        </Tag>
      </div>

      <div className='admin-dashboard__summary-count'>
        {item.count.toLocaleString('zh-CN')}
      </div>

      <Typography.Paragraph className='admin-dashboard__summary-note'>
        {item.note}
      </Typography.Paragraph>

      <Link className='admin-dashboard__summary-link' to={item.href}>
        进入处理
      </Link>
    </Card>
  );
}

function FocusQueueCard({ summary }: { summary: AdminDashboardSummary }) {
  const items: FocusQueueItem[] = [
    {
      count: summary.pendingRefundCount,
      description: '优先清理 REVIEWING / PROCESSING 队列，先看凭证再看结论。',
      href: '/refunds',
      label: '待审核退款',
      tag: 'P1',
    },
    {
      count: summary.flaggedOrderCount,
      description: '关注支付成功未出票、重复标记和需要人工回查的订单。',
      href: '/orders',
      label: '异常订单',
      tag: 'P1',
    },
    {
      count: summary.upcomingEventCount,
      description: '确认今日开售窗口、发布状态和票档配置是否同步。',
      href: '/events',
      label: '今日开售活动',
      tag: 'P2',
    },
    {
      count: summary.activeEventCount,
      description: '巡检售卖中的活动，保持库存、退票入口和运营节奏稳定。',
      href: '/events',
      label: '售卖中活动',
      tag: 'P2',
    },
  ];

  return (
    <Card className='admin-dashboard__panel' variant='borderless'>
      <div className='admin-dashboard__panel-head'>
        <div>
          <Typography.Title className='admin-dashboard__panel-title' level={4}>
            重点处理
          </Typography.Title>
          <Typography.Text className='admin-dashboard__panel-subtitle'>
            先把会阻塞现场处理的事项处理掉，再看常规巡检。
          </Typography.Text>
        </div>
        <Tag color='blue'>待办优先</Tag>
      </div>

      <div className='admin-dashboard__queue-list'>
        {items.map((item) => (
          <div className='admin-dashboard__queue-item' key={item.label}>
            <div className='admin-dashboard__queue-copy'>
              <Space size={8} wrap>
                <Tag className='admin-dashboard__queue-tag' color='default'>
                  {item.tag}
                </Tag>
                <Typography.Text className='admin-dashboard__queue-label'>
                  {item.label}
                </Typography.Text>
              </Space>
              <Typography.Paragraph className='admin-dashboard__queue-description'>
                {item.description}
              </Typography.Paragraph>
            </div>

            <div className='admin-dashboard__queue-meta'>
              <Typography.Text className='admin-dashboard__queue-count'>
                {item.count.toLocaleString('zh-CN')}
              </Typography.Text>
              <Link className='admin-dashboard__queue-link' to={item.href}>
                进入
              </Link>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function OperationalOverviewCard({ summary }: { summary: AdminDashboardSummary }) {
  const blocks = [
    {
      description: '当前售卖中的活动，关注库存和售卖状态。',
      label: '售卖中活动',
      value: summary.activeEventCount,
    },
    {
      description: '已进入开售窗口，等待确认发布和联动。',
      label: '今日开售活动',
      value: summary.upcomingEventCount,
    },
    {
      description: '需要进入审核流程的退款请求。',
      label: '待审核退款',
      value: summary.pendingRefundCount,
    },
    {
      description: '需要人工回查或异常处理的订单。',
      label: '异常订单',
      value: summary.flaggedOrderCount,
    },
  ];

  return (
    <Card className='admin-dashboard__panel' variant='borderless'>
      <div className='admin-dashboard__panel-head'>
        <div>
          <Typography.Title className='admin-dashboard__panel-title' level={4}>
            运营概况
          </Typography.Title>
          <Typography.Text className='admin-dashboard__panel-subtitle'>
            只保留处理节奏和风险信号，不做展示型大盘。
          </Typography.Text>
        </div>
        <Tag color='gold'>高密度视图</Tag>
      </div>

      <div className='admin-dashboard__overview-grid'>
        {blocks.map((block) => (
          <div className='admin-dashboard__overview-block' key={block.label}>
            <Typography.Text className='admin-dashboard__overview-label'>
              {block.label}
            </Typography.Text>
            <div className='admin-dashboard__overview-value'>
              {block.value.toLocaleString('zh-CN')}
            </div>
            <Typography.Text className='admin-dashboard__overview-description'>
              {block.description}
            </Typography.Text>
          </div>
        ))}
      </div>

      <Alert
        className='admin-dashboard__overview-callout'
        message='优先级建议'
        description='先处理待审核退款和异常订单，再检查开售活动和售卖中的活动是否同步。'
        showIcon
        type='info'
      />
    </Card>
  );
}

function RecentActionsCard({ summary }: { summary: AdminDashboardSummary }) {
  return (
    <Card className='admin-dashboard__panel' variant='borderless'>
      <div className='admin-dashboard__panel-head'>
        <div>
          <Typography.Title className='admin-dashboard__panel-title' level={4}>
            最近操作
          </Typography.Title>
          <Typography.Text className='admin-dashboard__panel-subtitle'>
            记录最近发生的运营动作，方便回溯和定位。
          </Typography.Text>
        </div>
        <Tag color='geekblue'>{summary.recentActions.length} 条</Tag>
      </div>

      {summary.recentActions.length > 0 ? (
        <List
          className='admin-dashboard__action-list'
          dataSource={summary.recentActions}
          itemLayout='vertical'
          renderItem={(item) => (
            <List.Item className='admin-dashboard__action-item'>
              <Space className='admin-dashboard__action-head' size={8} wrap>
                <Tag color='blue'>{getRecentActionLabel(item)}</Tag>
                <Typography.Text className='admin-dashboard__action-target'>
                  {getTargetTypeLabel(item.targetType)} · {item.targetId}
                </Typography.Text>
              </Space>

              <Typography.Text className='admin-dashboard__action-meta'>
                {item.actorName} · {formatDateTime(item.createdAt)}
              </Typography.Text>
            </List.Item>
          )}
        />
      ) : (
        <div className='admin-dashboard__empty'>
          暂无最近操作，页面会在有新动作后自动补充记录。
        </div>
      )}
    </Card>
  );
}

function RiskRemindersCard({ summary }: { summary: AdminDashboardSummary }) {
  const reminders = [
    summary.pendingRefundCount > 0
      ? {
          description: `还有 ${summary.pendingRefundCount} 笔退款等待审核，优先确认原因与凭证。`,
          label: '待审退款堆积',
          tone: 'danger' as const,
        }
      : null,
    summary.flaggedOrderCount > 0
      ? {
          description: `还有 ${summary.flaggedOrderCount} 笔异常订单需要回查，避免漏处理。`,
          label: '异常订单未清理',
          tone: 'warning' as const,
        }
      : null,
    summary.upcomingEventCount > 0
      ? {
          description: `今日有 ${summary.upcomingEventCount} 场活动进入开售节奏，确认发布状态。`,
          label: '今日开售活动',
          tone: 'neutral' as const,
        }
      : null,
  ].filter(
    (
      item,
    ): item is {
      description: string;
      label: string;
      tone: 'danger' | 'neutral' | 'warning';
    } => item !== null,
  );

  return (
    <Card className='admin-dashboard__panel' variant='borderless'>
      <div className='admin-dashboard__panel-head'>
        <div>
          <Typography.Title className='admin-dashboard__panel-title' level={4}>
            风险提醒
          </Typography.Title>
          <Typography.Text className='admin-dashboard__panel-subtitle'>
            只展示会影响处理节奏的提醒。
          </Typography.Text>
        </div>
        <Tag color='volcano'>{reminders.length} 项</Tag>
      </div>

      {reminders.length > 0 ? (
        <div className='admin-dashboard__risk-list'>
          {reminders.map((item) => (
            <div
              className={`admin-dashboard__risk-item admin-dashboard__risk-item--${item.tone}`}
              key={item.label}
            >
              <Typography.Text className='admin-dashboard__risk-label'>
                {item.label}
              </Typography.Text>
              <Typography.Paragraph className='admin-dashboard__risk-description'>
                {item.description}
              </Typography.Paragraph>
            </div>
          ))}
        </div>
      ) : (
        <div className='admin-dashboard__empty'>
          当前没有需要立刻处理的高风险项。
        </div>
      )}
    </Card>
  );
}

export function DashboardPage() {
  const { error, loading, summary } = useDashboardSummary();

  const cards = useMemo<SummaryCardItem[]>(
    () => [
      {
        count: summary?.pendingRefundCount ?? 0,
        href: '/refunds',
        label: '待审核退款',
        note: '优先清理 REVIEWING / PROCESSING 队列。',
        tone: 'danger',
      },
      {
        count: summary?.flaggedOrderCount ?? 0,
        href: '/orders',
        label: '异常订单',
        note: '支付后未出票、重复标记、人工回查都在这里。',
        tone: 'warning',
      },
      {
        count: summary?.upcomingEventCount ?? 0,
        href: '/events',
        label: '今日开售活动',
        note: '先确认发布和售卖窗口，再做细节检查。',
        tone: 'neutral',
      },
      {
        count: summary?.activeEventCount ?? 0,
        href: '/events',
        label: '售卖中活动',
        note: '持续巡检库存和退票入口，保持节奏稳定。',
        tone: 'positive',
      },
    ],
    [summary],
  );

  return (
    <div className='admin-dashboard'>
      <header className='admin-dashboard__hero'>
        <div>
          <Typography.Text className='admin-dashboard__hero-eyebrow'>
            总控台
          </Typography.Text>
          <Typography.Title className='admin-dashboard__hero-title' level={2}>
            运营概览
          </Typography.Title>
          <Typography.Paragraph className='admin-dashboard__hero-subtitle'>
            优先处理待审退款和异常订单，再巡检开售中的活动和售卖中的活动。
          </Typography.Paragraph>
        </div>

        <div className='admin-dashboard__hero-meta'>
          <Tag color='blue'>待办优先</Tag>
          <Tag color='default'>{loading ? '同步中' : '已同步'}</Tag>
        </div>
      </header>

      {error ? (
        <Alert
          className='admin-dashboard__alert'
          message='运营概览加载失败'
          description={error}
          showIcon
          type='error'
        />
      ) : null}

      <section className='admin-dashboard__summary-grid'>
        {cards.map((item) => (
          <DashboardSummaryCard key={item.label} item={item} />
        ))}
      </section>

      {summary ? (
        <>
          <section className='admin-dashboard__main-grid'>
            <FocusQueueCard summary={summary} />
            <OperationalOverviewCard summary={summary} />
          </section>

          <section className='admin-dashboard__support-grid'>
            <RecentActionsCard summary={summary} />
            <RiskRemindersCard summary={summary} />
          </section>
        </>
      ) : (
        <Card className='admin-dashboard__panel admin-dashboard__panel--loading' variant='borderless'>
          <Typography.Text className='admin-dashboard__loading-text'>
            {loading ? '正在同步运营概览...' : '暂无运营概览数据。'}
          </Typography.Text>
        </Card>
      )}
    </div>
  );
}
