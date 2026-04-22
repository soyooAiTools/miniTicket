import {
  Alert,
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Space,
  Tag,
  Typography,
} from 'antd';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  approveAdminRefund,
  getAdminRefundDetail,
  processAdminRefund,
  rejectAdminRefund,
  type AdminRefundDetail,
} from '../../services/admin-refunds';

const refundStatusMeta: Record<string, { color: string; label: string }> = {
  APPROVED: { color: 'blue', label: '已通过' },
  COMPLETED: { color: 'green', label: '已完成' },
  PROCESSING: { color: 'cyan', label: '处理中' },
  REJECTED: { color: 'red', label: '已驳回' },
  REVIEWING: { color: 'gold', label: '待审核' },
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

export function RefundDetailPage() {
  const params = useParams();
  const refundId = params.refundId;
  const [detail, setDetail] = useState<AdminRefundDetail>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string>();
  const [reloadVersion, setReloadVersion] = useState(0);
  const [actionLoading, setActionLoading] = useState<
    'approve' | 'reject' | 'process' | null
  >(null);
  const [form] = Form.useForm<{ note?: string; reason?: string }>();

  useEffect(() => {
    if (!refundId) {
      setError('缺少退款编号，无法加载详情。');
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(undefined);

    void (async () => {
      try {
        const nextDetail = await getAdminRefundDetail(refundId);
        if (active) {
          setDetail(nextDetail);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error ? loadError.message : '无法加载退款详情。',
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
  }, [refundId, reloadVersion]);

  async function submitApprove() {
    if (!refundId) {
      return;
    }

    setActionLoading('approve');
    setNotice(undefined);
    setError(undefined);

    try {
      const note = form.getFieldValue('note') as string | undefined;
      await approveAdminRefund(refundId, {
        note: note?.trim() ? note.trim() : undefined,
      });
      form.resetFields(['note']);
      setNotice('退款已批准。');
      setReloadVersion((value) => value + 1);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : '批准退款失败。',
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function submitReject() {
    if (!refundId) {
      return;
    }

    setActionLoading('reject');
    setNotice(undefined);
    setError(undefined);

    try {
      const values = await form.validateFields(['reason']);
      await rejectAdminRefund(refundId, {
        reason: values.reason?.trim() ?? '',
      });
      form.resetFields(['reason']);
      setNotice('退款已驳回。');
      setReloadVersion((value) => value + 1);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : '驳回退款失败。',
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function submitProcess() {
    if (!refundId) {
      return;
    }

    setActionLoading('process');
    setNotice(undefined);
    setError(undefined);

    try {
      const note = form.getFieldValue('note') as string | undefined;
      await processAdminRefund(refundId, {
        note: note?.trim() ? note.trim() : undefined,
      });
      setNotice('退款处理已发起。');
      setReloadVersion((value) => value + 1);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : '发起处理失败。',
      );
    } finally {
      setActionLoading(null);
    }
  }

  const canReview = detail?.status === 'REVIEWING';
  const canProcess = detail?.status === 'APPROVED';

  return (
    <Space
      direction='vertical'
      size={16}
      style={{ display: 'flex', width: '100%' }}
    >
      <div className='admin-page__header'>
        <div>
          <Typography.Title className='admin-page__title' level={2}>
            退款详情
          </Typography.Title>
          <Typography.Paragraph className='admin-page__subtitle'>
            审核备注、驳回原因和处理入口都保留在一个高密度页面中。
          </Typography.Paragraph>
        </div>

        <Space wrap>
          {refundId ? <Tag color='blue'>ID: {refundId}</Tag> : null}
          {detail ? (
            <Tag color={refundStatusMeta[detail.status]?.color ?? 'default'}>
              {refundStatusMeta[detail.status]?.label ?? detail.status}
            </Tag>
          ) : null}
          <Link to='/refunds'>返回列表</Link>
        </Space>
      </div>

      {error ? <Alert message={error} showIcon type='error' /> : null}
      {notice ? <Alert message={notice} showIcon type='success' /> : null}
      {loading ? <Alert message='正在加载退款详情...' showIcon type='info' /> : null}

      {detail ? (
        <>
          <SectionCard title='退款审核'>
            <Space direction='vertical' size={12} style={{ display: 'flex' }}>
              <Space wrap>
                <Tag color='blue'>{detail.orderStatus}</Tag>
                <Tag color='geekblue'>{detail.requesterName}</Tag>
                <Tag color={detail.status === 'REJECTED' ? 'red' : 'default'}>
                  {detail.reason}
                </Tag>
              </Space>
              <Typography.Title level={3} style={{ margin: 0 }}>
                {detail.refundNo}
              </Typography.Title>
              <Typography.Text className='admin-page__subtitle'>
                {detail.event?.title ?? '未知活动'} / {detail.event?.city ?? '-'} /{' '}
                {detail.event?.venueName ?? '-'}
              </Typography.Text>
              <Descriptions column={2} size='small'>
                <Descriptions.Item label='退款金额'>
                  {formatAmount(detail.amount, detail.currency)}
                </Descriptions.Item>
                <Descriptions.Item label='申请金额'>
                  {formatAmount(detail.requestedAmount, detail.currency)}
                </Descriptions.Item>
                <Descriptions.Item label='手续费'>
                  {formatAmount(detail.serviceFee, detail.currency)}
                </Descriptions.Item>
                <Descriptions.Item label='申请时间'>
                  {formatDateTime(detail.requestedAt)}
                </Descriptions.Item>
                <Descriptions.Item label='场次'>
                  {detail.sessionName ?? '-'}
                </Descriptions.Item>
                <Descriptions.Item label='最后处理时间'>
                  {formatDateTime(detail.lastHandledAt)}
                </Descriptions.Item>
              </Descriptions>
            </Space>
          </SectionCard>

          <SectionCard title='订单信息'>
            <Descriptions column={2} size='small'>
              <Descriptions.Item label='订单号'>
                <Link to={`/orders/${detail.orderId}`}>{detail.orderNumber}</Link>
              </Descriptions.Item>
              <Descriptions.Item label='订单编号'>
                {detail.orderId}
              </Descriptions.Item>
              <Descriptions.Item label='订单状态'>
                {detail.orderStatus}
              </Descriptions.Item>
              <Descriptions.Item label='退款单状态'>
                {detail.status}
              </Descriptions.Item>
              <Descriptions.Item label='审核人'>
                {detail.reviewedByUserId ?? '-'}
              </Descriptions.Item>
              <Descriptions.Item label='处理人'>
                {detail.processedByUserId ?? '-'}
              </Descriptions.Item>
            </Descriptions>
          </SectionCard>

          <SectionCard title='审批处理'>
            <Form form={form} layout='vertical'>
              <Space direction='vertical' size={16} style={{ display: 'flex' }}>
                <Form.Item label='审核备注' name='note'>
                  <Input.TextArea autoSize={{ minRows: 3, maxRows: 5 }} />
                </Form.Item>
                <Form.Item
                  label='驳回原因'
                  name='reason'
                  rules={[{ required: true, message: '请输入驳回原因。' }]}
                >
                  <Input.TextArea autoSize={{ minRows: 3, maxRows: 5 }} />
                </Form.Item>
                <Space wrap>
                  <Button
                    disabled={!canReview}
                    loading={actionLoading === 'approve'}
                    onClick={() => void submitApprove()}
                    type='primary'
                  >
                    批准退款
                  </Button>
                  <Button
                    danger
                    disabled={!canReview}
                    loading={actionLoading === 'reject'}
                    onClick={() => void submitReject()}
                  >
                    驳回退款
                  </Button>
                  <Button
                    disabled={!canProcess}
                    loading={actionLoading === 'process'}
                    onClick={() => void submitProcess()}
                  >
                    发起处理
                  </Button>
                </Space>
                <Typography.Text className='admin-page__meta'>
                  仅在待审核状态下可批准或驳回，已通过后才能发起渠道退款处理。
                </Typography.Text>
              </Space>
            </Form>
          </SectionCard>
        </>
      ) : null}
    </Space>
  );
}
