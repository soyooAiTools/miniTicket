import {
  Alert,
  Button,
  Card,
  Divider,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
} from 'antd';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  adminEventDraftSchema,
  adminEventEditorSchema,
  eventDetailSchema,
  type AdminEventDraft,
  type AdminEventEditor,
  type EventDetail,
} from '@ticketing/contracts';

import {
  createAdminEvent,
  getAdminEventDetail,
  getAdminEventEditorDetail,
  publishAdminEvent,
  unpublishAdminEvent,
  updateAdminEvent,
} from '../../services/admin-events';

type EventEditorMode = 'create' | 'edit';

type EventTierFormValue = {
  id?: string;
  inventory: number;
  name: string;
  price: number;
  purchaseLimit: number;
  refundable: boolean;
  refundDeadlineAt?: string;
  requiresRealName: boolean;
  sortOrder: number;
  ticketType: 'E_TICKET' | 'PAPER_TICKET';
};

type EventSessionFormValue = {
  endsAt?: string;
  id?: string;
  name: string;
  saleEndsAt?: string;
  saleStartsAt?: string;
  startsAt: string;
  tiers: EventTierFormValue[];
};

type EventEditorFormValue = {
  city: string;
  coverImageUrl?: string;
  description?: string;
  sessions: EventSessionFormValue[];
  title: string;
  venueAddress: string;
  venueName: string;
};

const ticketTypeOptions: Array<{
  label: string;
  value: 'E_TICKET' | 'PAPER_TICKET';
}> = [
  { label: '电子票', value: 'E_TICKET' },
  { label: '纸质票', value: 'PAPER_TICKET' },
];

function createDefaultTier(): EventTierFormValue {
  return {
    inventory: 0,
    name: '',
    price: 0,
    purchaseLimit: 1,
    refundable: false,
    requiresRealName: true,
    sortOrder: 0,
    ticketType: 'E_TICKET',
  };
}

function createDefaultSession(): EventSessionFormValue {
  return {
    name: '',
    startsAt: '',
    tiers: [createDefaultTier()],
  };
}

function createDefaultValues(): EventEditorFormValue {
  return {
    city: '',
    description: '',
    sessions: [createDefaultSession()],
    title: '',
    venueAddress: '',
    venueName: '',
  };
}

function trimToUndefined(value: string | undefined) {
  const nextValue = value?.trim();
  return nextValue ? nextValue : undefined;
}

function detailToFormValue(detail: AdminEventEditor): EventEditorFormValue {
  return {
    city: detail.city,
    coverImageUrl: detail.coverImageUrl,
    description: detail.description,
    sessions: detail.sessions.length
      ? detail.sessions.map((session) => ({
          endsAt: session.endsAt,
          id: session.id,
          name: session.name,
          saleEndsAt: session.saleEndsAt,
          saleStartsAt: session.saleStartsAt,
          startsAt: session.startsAt,
          tiers: session.tiers.map((tier) => ({
            id: tier.id,
            inventory: tier.inventory,
            name: tier.name,
            price: tier.price,
            purchaseLimit: tier.purchaseLimit,
            refundable: tier.refundable,
            refundDeadlineAt: tier.refundDeadlineAt,
            requiresRealName: tier.requiresRealName,
            sortOrder: tier.sortOrder,
            ticketType: tier.ticketType,
          })),
        }))
      : [createDefaultSession()],
    title: detail.title,
    venueAddress: detail.venueAddress,
    venueName: detail.venueName,
  };
}

function buildDraftPayload(values: EventEditorFormValue) {
  return {
    city: values.city.trim(),
    coverImageUrl: trimToUndefined(values.coverImageUrl),
    description: trimToUndefined(values.description),
    sessions: values.sessions.map((session) => ({
      endsAt: trimToUndefined(session.endsAt),
      id: session.id,
      name: session.name.trim(),
      saleEndsAt: trimToUndefined(session.saleEndsAt),
      saleStartsAt: trimToUndefined(session.saleStartsAt),
      startsAt: session.startsAt.trim(),
      tiers: session.tiers.map((tier) => ({
        id: tier.id,
        inventory: tier.inventory,
        name: tier.name.trim(),
        price: tier.price,
        purchaseLimit: tier.purchaseLimit,
        refundable: tier.refundable,
        refundDeadlineAt: trimToUndefined(tier.refundDeadlineAt),
        requiresRealName: tier.requiresRealName,
        sortOrder: tier.sortOrder,
        ticketType: tier.ticketType,
      })),
    })),
    title: values.title.trim(),
    venueAddress: values.venueAddress.trim(),
    venueName: values.venueName.trim(),
  };
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
  title,
  extra,
}: {
  children: ReactNode;
  extra?: ReactNode;
  title: string;
}) {
  return (
    <Card
      className='admin-dashboard__panel'
      extra={extra}
      title={title}
      variant='borderless'
    >
      {children}
    </Card>
  );
}

export function EventEditorPage({ mode }: { mode: EventEditorMode }) {
  const params = useParams();
  const eventId = params.eventId;
  const [form] = Form.useForm<EventEditorFormValue>();
  const [loading, setLoading] = useState(mode !== 'create');
  const [savingAction, setSavingAction] = useState<
    'save' | 'publish' | 'unpublish' | null
  >(null);
  const [published, setPublished] = useState(false);
  const [banner, setBanner] = useState<string>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;

    if (mode === 'create') {
      form.setFieldsValue(createDefaultValues());
      setLoading(false);
      setPublished(false);
      return () => {
        active = false;
      };
    }

    if (!eventId) {
      setError('缺少活动编号，无法加载编辑器。');
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setLoading(true);
    setError(undefined);

    void (async () => {
      try {
        const detail = adminEventEditorSchema.parse(
          await getAdminEventEditorDetail(eventId),
        );
        if (!active) {
          return;
        }

        form.setFieldsValue(detailToFormValue(detail));
        setPublished(Boolean(detail.published));
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : '无法加载活动详情。',
        );
        form.setFieldsValue(createDefaultValues());
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [eventId, form, mode]);

  async function submitAction(action: 'save' | 'publish' | 'unpublish') {
    setSavingAction(action);
    setBanner(undefined);
    setError(undefined);

    try {
      const values = await form.validateFields();
      const basePayload = buildDraftPayload(values);

      if (mode === 'create') {
        const payload = adminEventDraftSchema.parse(basePayload);
        await createAdminEvent(payload);
        setBanner('已保存草稿。');
        return;
      }

      if (!eventId) {
        throw new Error('缺少活动编号。');
      }

      const payload: AdminEventEditor = adminEventEditorSchema.parse({
        ...basePayload,
        id: eventId,
      });

      const updatedEvent = await updateAdminEvent(eventId, payload);
      setPublished(Boolean(updatedEvent.published));

      if (action === 'publish') {
        await publishAdminEvent(eventId);
        setPublished(true);
        setBanner('已发布。');
      } else if (action === 'unpublish') {
        await unpublishAdminEvent(eventId);
        setPublished(false);
        setBanner('已下架。');
      } else {
        setBanner('已保存草稿。');
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : '保存活动失败。',
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
            {mode === 'create' ? '新建活动' : '活动编辑'}
          </Typography.Title>
          <Typography.Paragraph className='admin-page__subtitle'>
            以结构化方式维护基础信息、销售规则和区域票档。
          </Typography.Paragraph>
        </div>

        <Space wrap>
          {eventId ? <Tag color='blue'>ID: {eventId}</Tag> : null}
          <Tag color={published ? 'green' : 'gold'}>
            {published ? '已发布' : '草稿'}
          </Tag>
        </Space>
      </div>

      {error ? <Alert message={error} showIcon type='error' /> : null}
      {banner ? <Alert message={banner} showIcon type='success' /> : null}
      <Alert
        message='保存顺序'
        description='先保存草稿，再按需执行发布或下架。每个场次至少要保留一个区域票档。'
        showIcon
        type='info'
      />

      <Form
        form={form}
        initialValues={createDefaultValues()}
        layout='vertical'
      >
        <SectionCard title='基本信息'>
          <Space direction='vertical' size={12} style={{ display: 'flex' }}>
            <Form.Item
              label='活动标题'
              name='title'
              rules={[{ required: true, message: '请输入活动标题。' }]}
            >
              <Input placeholder='例如：Mini Ticket 春季特别场' />
            </Form.Item>
            <Space size={12} style={{ display: 'flex' }} wrap>
              <Form.Item
                label='城市'
                name='city'
                rules={[{ required: true, message: '请输入城市。' }]}
                style={{ minWidth: 240 }}
              >
                <Input placeholder='上海' />
              </Form.Item>
              <Form.Item
                label='场馆名称'
                name='venueName'
                rules={[{ required: true, message: '请输入场馆名称。' }]}
                style={{ minWidth: 320 }}
              >
                <Input placeholder='西岸艺术中心' />
              </Form.Item>
            </Space>
            <Form.Item
              label='场馆地址'
              name='venueAddress'
              rules={[{ required: true, message: '请输入场馆地址。' }]}
            >
              <Input placeholder='上海市徐汇区...' />
            </Form.Item>
            <Form.Item label='封面链接' name='coverImageUrl'>
              <Input placeholder='https://example.com/cover.jpg' />
            </Form.Item>
            <Form.Item label='活动说明' name='description'>
              <Input.TextArea
                autoSize={{ minRows: 4, maxRows: 8 }}
                placeholder='面向运营团队的简要说明'
              />
            </Form.Item>
          </Space>
        </SectionCard>

        <SectionCard title='销售规则'>
          <Typography.Paragraph className='admin-page__subtitle'>
            场次售卖窗口和结束时间在这里统一维护，发布前请确认每场的开始与结束顺序。
          </Typography.Paragraph>
          <Form.List name='sessions'>
            {(sessionFields, sessionOperations) => (
              <Space direction='vertical' size={16} style={{ display: 'flex' }}>
                {sessionFields.map((sessionField, sessionIndex) => (
                  <Card
                    key={sessionField.key}
                    size='small'
                    title={`场次 ${sessionIndex + 1}`}
                    extra={
                      sessionFields.length > 1 ? (
                        <Button
                          danger
                          onClick={() => sessionOperations.remove(sessionField.name)}
                          size='small'
                          type='text'
                        >
                          移除场次
                        </Button>
                      ) : null
                    }
                  >
                    <Space direction='vertical' size={12} style={{ display: 'flex' }}>
                      <Form.Item
                        label='场次名称'
                        name={[sessionField.name, 'name']}
                        rules={[{ required: true, message: '请输入场次名称。' }]}
                      >
                        <Input placeholder='2026-05-01 19:30' />
                      </Form.Item>
                      <Space size={12} style={{ display: 'flex' }} wrap>
                        <Form.Item
                          label='开始时间'
                          name={[sessionField.name, 'startsAt']}
                          rules={[{ required: true, message: '请输入开始时间。' }]}
                          style={{ minWidth: 260 }}
                        >
                          <Input placeholder='2026-05-01T11:30:00.000Z' />
                        </Form.Item>
                        <Form.Item
                          label='结束时间'
                          name={[sessionField.name, 'endsAt']}
                          style={{ minWidth: 260 }}
                        >
                          <Input placeholder='2026-05-01T13:30:00.000Z' />
                        </Form.Item>
                        <Form.Item
                          label='开售开始'
                          name={[sessionField.name, 'saleStartsAt']}
                          style={{ minWidth: 260 }}
                        >
                          <Input placeholder='2026-04-18T02:00:00.000Z' />
                        </Form.Item>
                        <Form.Item
                          label='开售结束'
                          name={[sessionField.name, 'saleEndsAt']}
                          style={{ minWidth: 260 }}
                        >
                          <Input placeholder='2026-05-01T11:00:00.000Z' />
                        </Form.Item>
                      </Space>

                      <Divider style={{ margin: '8px 0 0' }} />
                      <Typography.Title level={5} style={{ marginBottom: 0 }}>
                        区域票档
                      </Typography.Title>

                      <Form.List name={[sessionField.name, 'tiers']}>
                        {(tierFields, tierOperations) => (
                          <Space direction='vertical' size={12} style={{ display: 'flex' }}>
                            {tierFields.map((tierField, tierIndex) => (
                              <Card
                                key={tierField.key}
                                size='small'
                                title={`区域票档 ${tierIndex + 1}`}
                                extra={
                                  tierFields.length > 1 ? (
                                    <Button
                                      danger
                                      onClick={() => tierOperations.remove(tierField.name)}
                                      size='small'
                                      type='text'
                                    >
                                      移除票档
                                    </Button>
                                  ) : null
                                }
                              >
                                <Space
                                  direction='vertical'
                                  size={12}
                                  style={{ display: 'flex' }}
                                >
                                  <Form.Item
                                    label='区域名称'
                                    name={[tierField.name, 'name']}
                                    rules={[
                                      { required: true, message: '请输入区域名称。' },
                                    ]}
                                  >
                                    <Input placeholder='内场站席' />
                                  </Form.Item>
                                  <Space size={12} style={{ display: 'flex' }} wrap>
                                    <Form.Item
                                      label='价格'
                                      name={[tierField.name, 'price']}
                                      rules={[
                                        { required: true, message: '请输入价格。' },
                                      ]}
                                      style={{ minWidth: 180 }}
                                    >
                                      <InputNumber min={0} style={{ width: '100%' }} />
                                    </Form.Item>
                                    <Form.Item
                                      label='库存'
                                      name={[tierField.name, 'inventory']}
                                      rules={[
                                        { required: true, message: '请输入库存。' },
                                      ]}
                                      style={{ minWidth: 180 }}
                                    >
                                      <InputNumber min={0} style={{ width: '100%' }} />
                                    </Form.Item>
                                    <Form.Item
                                      label='每单限购'
                                      name={[tierField.name, 'purchaseLimit']}
                                      rules={[
                                        { required: true, message: '请输入限购数量。' },
                                      ]}
                                      style={{ minWidth: 180 }}
                                    >
                                      <InputNumber min={1} style={{ width: '100%' }} />
                                    </Form.Item>
                                    <Form.Item
                                      label='排序'
                                      name={[tierField.name, 'sortOrder']}
                                      style={{ minWidth: 180 }}
                                    >
                                      <InputNumber min={0} style={{ width: '100%' }} />
                                    </Form.Item>
                                  </Space>
                                  <Space size={12} style={{ display: 'flex' }} wrap>
                                    <Form.Item
                                      label='票种'
                                      name={[tierField.name, 'ticketType']}
                                      rules={[
                                        { required: true, message: '请选择票种。' },
                                      ]}
                                      style={{ minWidth: 180 }}
                                    >
                                      <Select options={ticketTypeOptions} />
                                    </Form.Item>
                                    <Form.Item
                                      label='可退票'
                                      name={[tierField.name, 'refundable']}
                                      valuePropName='checked'
                                    >
                                      <Switch />
                                    </Form.Item>
                                    <Form.Item
                                      label='实名制'
                                      name={[tierField.name, 'requiresRealName']}
                                      valuePropName='checked'
                                    >
                                      <Switch />
                                    </Form.Item>
                                    <Form.Item
                                      label='退票截止'
                                      name={[tierField.name, 'refundDeadlineAt']}
                                      style={{ minWidth: 320 }}
                                    >
                                      <Input placeholder='2026-04-29T16:00:00.000Z' />
                                    </Form.Item>
                                  </Space>
                                </Space>
                              </Card>
                            ))}

                            <Button
                              onClick={() => tierOperations.add(createDefaultTier())}
                              type='dashed'
                            >
                              新增区域票档
                            </Button>
                          </Space>
                        )}
                      </Form.List>
                    </Space>
                  </Card>
                ))}

                <Button
                  onClick={() => sessionOperations.add(createDefaultSession())}
                  type='dashed'
                >
                  新增场次
                </Button>
              </Space>
            )}
          </Form.List>
        </SectionCard>

        <SectionCard title='操作'>
          <Space wrap>
            <Button
              loading={savingAction === 'save'}
              onClick={() => void submitAction('save')}
              type='primary'
            >
              保存草稿
            </Button>
            {mode === 'edit' ? (
              <Button
                loading={savingAction === 'publish'}
                onClick={() => void submitAction('publish')}
              >
                发布
              </Button>
            ) : null}
            {mode === 'edit' ? (
              <Button
                loading={savingAction === 'unpublish'}
                onClick={() => void submitAction('unpublish')}
              >
                下架
              </Button>
            ) : null}
            {eventId ? <Link to={`/events/${eventId}`}>返回详情</Link> : null}
          </Space>
        </SectionCard>
      </Form>

      {loading ? <Alert message='正在加载活动信息...' showIcon type='info' /> : null}
      {mode === 'edit' && eventId ? (
        <Typography.Text className='admin-page__meta'>
          {published ? '当前为已发布活动，可直接下架。' : '当前为草稿，可先保存再发布。'}
        </Typography.Text>
      ) : null}
    </Space>
  );
}

function EventDetailSessions({ detail }: { detail: EventDetail }) {
  return (
    <Space direction='vertical' size={12} style={{ display: 'flex' }}>
      {detail.sessions.map((session, sessionIndex) => (
        <Card
          key={session.id}
          size='small'
          title={`场次 ${sessionIndex + 1} · ${session.name}`}
        >
          <Space direction='vertical' size={8} style={{ display: 'flex' }}>
            <Typography.Text className='admin-page__meta'>
              开始：{formatDateTime(session.startsAt)} · 结束：
              {formatDateTime(session.endsAt)}
            </Typography.Text>
            <Typography.Text className='admin-page__meta'>
              开售：{formatDateTime(session.saleStartsAt)} · 截止：
              {formatDateTime(session.saleEndsAt)}
            </Typography.Text>

            <Space direction='vertical' size={8} style={{ display: 'flex' }}>
              {session.ticketTiers.map((tier) => (
                <Card key={tier.id} size='small' type='inner'>
                  <Space direction='vertical' size={4} style={{ display: 'flex' }}>
                    <Space wrap>
                      <Typography.Text strong>{tier.name}</Typography.Text>
                      <Tag color='blue'>{tier.ticketType}</Tag>
                      <Tag color={tier.refundable ? 'green' : 'default'}>
                        {tier.refundable ? '可退' : '不可退'}
                      </Tag>
                      <Tag color={tier.requiresRealName ? 'gold' : 'default'}>
                        {tier.requiresRealName ? '实名' : '匿名'}
                      </Tag>
                    </Space>
                    <Typography.Text className='admin-page__meta'>
                      价格：{tier.price} · 库存：{tier.inventory} · 每单限购：
                      {tier.purchaseLimit}
                    </Typography.Text>
                    <Typography.Text className='admin-page__meta'>
                      排序：{tier.sortOrder} · 退票截止：
                      {formatDateTime(tier.refundDeadlineAt)}
                    </Typography.Text>
                  </Space>
                </Card>
              ))}
            </Space>
          </Space>
        </Card>
      ))}
    </Space>
  );
}

export function EventDetailPage() {
  const params = useParams();
  const eventId = params.eventId;
  const [detail, setDetail] = useState<EventDetail>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [actionPending, setActionPending] = useState<'publish' | 'unpublish'>();
  const [notice, setNotice] = useState<string>();

  useEffect(() => {
    if (!eventId) {
      setError('缺少活动编号。');
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError(undefined);

    void (async () => {
      try {
        const nextDetail = await getAdminEventDetail(eventId);
        if (active) {
          setDetail(nextDetail);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : '无法加载活动详情。',
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
  }, [eventId]);

  async function handlePublication(nextAction: 'publish' | 'unpublish') {
    if (!eventId) {
      return;
    }

    setActionPending(nextAction);
    setNotice(undefined);
    setError(undefined);

    try {
      const nextDetail =
        nextAction === 'publish'
          ? await publishAdminEvent(eventId)
          : await unpublishAdminEvent(eventId);

      const nextPublished = Boolean(nextDetail.published);
      setDetail(
        detail
          ? { ...detail, published: nextPublished }
          : {
              ...eventDetailSchema.parse(await getAdminEventDetail(eventId)),
              published: nextPublished,
            },
      );
      setNotice(nextAction === 'publish' ? '已发布。' : '已下架。');
    } catch (publicationError) {
      setError(
        publicationError instanceof Error
          ? publicationError.message
          : '操作失败。',
      );
    } finally {
      setActionPending(undefined);
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
            活动详情
          </Typography.Title>
          <Typography.Paragraph className='admin-page__subtitle'>
            查看活动结构、区域票档和关键运营状态。
          </Typography.Paragraph>
        </div>

        <Space wrap>
          {eventId ? <Tag color='blue'>ID: {eventId}</Tag> : null}
          <Link to={eventId ? `/events/${eventId}/edit` : '/events/new'}>
            <Button type='primary'>编辑</Button>
          </Link>
        </Space>
      </div>

      {error ? <Alert message={error} showIcon type='error' /> : null}
      {notice ? <Alert message={notice} showIcon type='success' /> : null}
      {loading ? <Alert message='正在加载活动详情...' showIcon type='info' /> : null}

      {detail ? (
        <>
          <Card className='admin-dashboard__panel' variant='borderless'>
            <Space direction='vertical' size={12} style={{ display: 'flex' }}>
              <Space wrap>
                <Tag color={detail.published ? 'green' : 'gold'}>
                  {detail.published ? '已发布' : '草稿'}
                </Tag>
                <Tag color={detail.saleStatus === 'ON_SALE' ? 'green' : 'default'}>
                  {detail.saleStatus}
                </Tag>
                <Tag color={detail.refundEntryEnabled ? 'blue' : 'default'}>
                  {detail.refundEntryEnabled ? '可退票' : '关闭退票'}
                </Tag>
              </Space>
              <Typography.Title level={3} style={{ margin: 0 }}>
                {detail.title}
              </Typography.Title>
              <Typography.Text className='admin-page__subtitle'>
                {detail.city} / {detail.venueName}
              </Typography.Text>
              <Typography.Text className='admin-page__meta'>
                最低票价：{detail.minPrice}
              </Typography.Text>
            </Space>
          </Card>

          <SectionCard title='区域票档概览'>
            <EventDetailSessions detail={detail} />
          </SectionCard>

          <SectionCard
            title='操作'
            extra={
              <Space wrap>
                <Button
                  loading={actionPending === 'publish'}
                  onClick={() => void handlePublication('publish')}
                >
                  发布
                </Button>
                <Button
                  loading={actionPending === 'unpublish'}
                  onClick={() => void handlePublication('unpublish')}
                >
                  下架
                </Button>
              </Space>
            }
          >
            <Typography.Text className='admin-page__meta'>
              操作会直接同步到后台状态，编辑前请先确认活动结构是否完整。
            </Typography.Text>
          </SectionCard>
        </>
      ) : null}
    </Space>
  );
}
