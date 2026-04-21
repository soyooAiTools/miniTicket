import type {
  EventCatalogSummary,
  EventDetail,
  EventSummary,
  OrderDetail,
  OrderListItem,
} from '../../../../../packages/contracts/src';
import auroraArenaPoster from '../assets/posters/aurora-arena.svg';
import blueEchoPoster from '../assets/posters/blue-echo.svg';
import daylightClubPoster from '../assets/posters/daylight-club.svg';
import galaxyMeetPoster from '../assets/posters/galaxy-meet.svg';
import midnightSignalPoster from '../assets/posters/midnight-signal.svg';
import nordStagePoster from '../assets/posters/nord-stage.svg';

type ShowcaseViewer = {
  id: string;
  idCard: string;
  mobile: string;
  name: string;
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const showcaseViewers: ShowcaseViewer[] = [
  {
    id: 'viewer-lin-xia',
    idCard: '310101199302143216',
    mobile: '13800138001',
    name: '林夏',
  },
  {
    id: 'viewer-zhou-yi',
    idCard: '110101199406263412',
    mobile: '13800138002',
    name: '周屹',
  },
  {
    id: 'viewer-shen-qi',
    idCard: '440101199512044238',
    mobile: '13800138003',
    name: '沈祺',
  },
];

const showcaseEventDetails: EventDetail[] = [
  {
    city: '上海',
    coverImageUrl: auroraArenaPoster,
    description: '冷白主视觉与全屏幕升降台，适合展示大海报卡片节奏。',
    id: 'event-aurora-shanghai',
    minPrice: 580,
    published: true,
    refundEntryEnabled: true,
    saleStatus: 'ON_SALE',
    sessions: [
      {
        id: 'session-aurora-sh-0518',
        name: '05.18 周一 19:30',
        saleEndsAt: '2026-05-18T11:00:00.000Z',
        saleStartsAt: '2026-04-20T12:00:00.000Z',
        startsAt: '2026-05-18T11:30:00.000Z',
        ticketTiers: [
          {
            id: 'tier-aurora-vip',
            inventory: 62,
            name: '内场 VIP',
            price: 1280,
            ticketType: 'E_TICKET',
          },
          {
            id: 'tier-aurora-a',
            inventory: 154,
            name: '看台 A 档',
            price: 880,
            ticketType: 'E_TICKET',
          },
        ],
      },
      {
        id: 'session-aurora-sh-0519',
        name: '05.19 周二 19:30',
        saleEndsAt: '2026-05-19T11:00:00.000Z',
        saleStartsAt: '2026-04-21T12:00:00.000Z',
        startsAt: '2026-05-19T11:30:00.000Z',
        ticketTiers: [
          {
            id: 'tier-aurora-b',
            inventory: 208,
            name: '看台 B 档',
            price: 680,
            ticketType: 'E_TICKET',
          },
          {
            id: 'tier-aurora-c',
            inventory: 320,
            name: '看台 C 档',
            price: 580,
            ticketType: 'E_TICKET',
          },
        ],
      },
    ],
    title: 'Aurora Arena 巡回演唱会 上海站',
    venueName: '梅赛德斯-奔驰文化中心',
  },
  {
    city: '北京',
    coverImageUrl: midnightSignalPoster,
    description: '主屏横向展开，适合票务平台首页的高信息密度海报流。',
    id: 'event-midnight-beijing',
    minPrice: 480,
    published: true,
    refundEntryEnabled: true,
    saleStatus: 'ON_SALE',
    sessions: [
      {
        id: 'session-midnight-bj-0601',
        name: '06.01 周一 20:00',
        saleEndsAt: '2026-06-01T12:00:00.000Z',
        saleStartsAt: '2026-04-22T12:00:00.000Z',
        startsAt: '2026-06-01T12:00:00.000Z',
        ticketTiers: [
          {
            id: 'tier-midnight-floor',
            inventory: 88,
            name: '内场站席',
            price: 980,
            ticketType: 'PAPER_TICKET',
          },
          {
            id: 'tier-midnight-seat',
            inventory: 240,
            name: '看台座席',
            price: 480,
            ticketType: 'PAPER_TICKET',
          },
        ],
      },
      {
        id: 'session-midnight-bj-0602',
        name: '06.02 周二 20:00',
        saleEndsAt: '2026-06-02T12:00:00.000Z',
        saleStartsAt: '2026-04-23T12:00:00.000Z',
        startsAt: '2026-06-02T12:00:00.000Z',
        ticketTiers: [
          {
            id: 'tier-midnight-premium',
            inventory: 66,
            name: '看台前排',
            price: 780,
            ticketType: 'PAPER_TICKET',
          },
          {
            id: 'tier-midnight-standard',
            inventory: 280,
            name: '标准看台',
            price: 580,
            ticketType: 'PAPER_TICKET',
          },
        ],
      },
    ],
    title: 'Midnight Signal 亚洲巡演 北京站',
    venueName: '国家体育馆',
  },
  {
    city: '广州',
    coverImageUrl: blueEchoPoster,
    description: '带纪念票夹与限定入场权益，适合观察订单卡片层级。',
    id: 'event-blueecho-guangzhou',
    minPrice: 399,
    published: true,
    refundEntryEnabled: true,
    saleStatus: 'ON_SALE',
    sessions: [
      {
        id: 'session-blueecho-gz-0524',
        name: '05.24 周日 19:00',
        saleEndsAt: '2026-05-24T11:00:00.000Z',
        saleStartsAt: '2026-04-19T12:00:00.000Z',
        startsAt: '2026-05-24T11:00:00.000Z',
        ticketTiers: [
          {
            id: 'tier-blueecho-front',
            inventory: 102,
            name: '前区套票',
            price: 899,
            ticketType: 'E_TICKET',
          },
          {
            id: 'tier-blueecho-general',
            inventory: 312,
            name: '普通票',
            price: 399,
            ticketType: 'E_TICKET',
          },
        ],
      },
      {
        id: 'session-blueecho-gz-0525',
        name: '05.25 周一 19:00',
        saleEndsAt: '2026-05-25T11:00:00.000Z',
        saleStartsAt: '2026-04-20T12:00:00.000Z',
        startsAt: '2026-05-25T11:00:00.000Z',
        ticketTiers: [
          {
            id: 'tier-blueecho-floor',
            inventory: 120,
            name: '内场票',
            price: 699,
            ticketType: 'E_TICKET',
          },
          {
            id: 'tier-blueecho-upper',
            inventory: 290,
            name: '上层看台',
            price: 499,
            ticketType: 'E_TICKET',
          },
        ],
      },
    ],
    title: 'Blue Echo Anniversary Showcase 广州站',
    venueName: '广州体育馆 2 号馆',
  },
  {
    city: '深圳',
    coverImageUrl: galaxyMeetPoster,
    description: '限定应援场，适合验证开售日历与待开售状态展示。',
    id: 'event-galaxy-shenzhen',
    minPrice: 520,
    published: true,
    refundEntryEnabled: false,
    saleStatus: 'UPCOMING',
    sessions: [
      {
        id: 'session-galaxy-sz-0615',
        name: '06.15 周一 19:30',
        saleEndsAt: '2026-06-15T11:00:00.000Z',
        saleStartsAt: '2026-04-28T12:00:00.000Z',
        startsAt: '2026-06-15T11:30:00.000Z',
        ticketTiers: [
          {
            id: 'tier-galaxy-vvip',
            inventory: 48,
            name: '应援 VVIP',
            price: 1288,
            ticketType: 'E_TICKET',
          },
          {
            id: 'tier-galaxy-seat',
            inventory: 260,
            name: '标准座席',
            price: 520,
            ticketType: 'E_TICKET',
          },
        ],
      },
      {
        id: 'session-galaxy-sz-0616',
        name: '06.16 周二 19:30',
        saleEndsAt: '2026-06-16T11:00:00.000Z',
        saleStartsAt: '2026-04-29T12:00:00.000Z',
        startsAt: '2026-06-16T11:30:00.000Z',
        ticketTiers: [
          {
            id: 'tier-galaxy-floor',
            inventory: 120,
            name: '内场站席',
            price: 888,
            ticketType: 'E_TICKET',
          },
          {
            id: 'tier-galaxy-stand',
            inventory: 300,
            name: '看台票',
            price: 620,
            ticketType: 'E_TICKET',
          },
        ],
      },
    ],
    title: '银河少女限定见面会 深圳站',
    venueName: '深圳湾体育中心 春茧',
  },
  {
    city: '成都',
    coverImageUrl: nordStagePoster,
    description: '电子票直出，色温偏冷灰，适合检视票务平台的留白感。',
    id: 'event-nordstage-chengdu',
    minPrice: 460,
    published: true,
    refundEntryEnabled: true,
    saleStatus: 'UPCOMING',
    sessions: [
      {
        id: 'session-nordstage-cd-0621',
        name: '06.21 周日 20:00',
        saleEndsAt: '2026-06-21T12:00:00.000Z',
        saleStartsAt: '2026-05-02T12:00:00.000Z',
        startsAt: '2026-06-21T12:00:00.000Z',
        ticketTiers: [
          {
            id: 'tier-nordstage-svip',
            inventory: 54,
            name: 'SVIP 套票',
            price: 1180,
            ticketType: 'E_TICKET',
          },
          {
            id: 'tier-nordstage-a',
            inventory: 260,
            name: 'A 档',
            price: 680,
            ticketType: 'E_TICKET',
          },
        ],
      },
      {
        id: 'session-nordstage-cd-0622',
        name: '06.22 周一 20:00',
        saleEndsAt: '2026-06-22T12:00:00.000Z',
        saleStartsAt: '2026-05-03T12:00:00.000Z',
        startsAt: '2026-06-22T12:00:00.000Z',
        ticketTiers: [
          {
            id: 'tier-nordstage-b',
            inventory: 300,
            name: 'B 档',
            price: 560,
            ticketType: 'E_TICKET',
          },
          {
            id: 'tier-nordstage-c',
            inventory: 360,
            name: 'C 档',
            price: 460,
            ticketType: 'E_TICKET',
          },
        ],
      },
    ],
    title: 'Nord Stage Live 2026 成都站',
    venueName: '东安湖体育公园多功能馆',
  },
  {
    city: '杭州',
    coverImageUrl: daylightClubPoster,
    description: '俱乐部特别场，适合看短标题、长标题和按钮的混排平衡。',
    id: 'event-daylight-hangzhou',
    minPrice: 320,
    published: true,
    refundEntryEnabled: true,
    saleStatus: 'ON_SALE',
    sessions: [
      {
        id: 'session-daylight-hz-0509',
        name: '05.09 周六 20:30',
        saleEndsAt: '2026-05-09T12:30:00.000Z',
        saleStartsAt: '2026-04-18T12:00:00.000Z',
        startsAt: '2026-05-09T12:30:00.000Z',
        ticketTiers: [
          {
            id: 'tier-daylight-front',
            inventory: 90,
            name: '前区票',
            price: 520,
            ticketType: 'PAPER_TICKET',
          },
          {
            id: 'tier-daylight-general',
            inventory: 240,
            name: '普通票',
            price: 320,
            ticketType: 'PAPER_TICKET',
          },
        ],
      },
      {
        id: 'session-daylight-hz-0510',
        name: '05.10 周日 20:30',
        saleEndsAt: '2026-05-10T12:30:00.000Z',
        saleStartsAt: '2026-04-19T12:00:00.000Z',
        startsAt: '2026-05-10T12:30:00.000Z',
        ticketTiers: [
          {
            id: 'tier-daylight-late',
            inventory: 120,
            name: '晚场套票',
            price: 620,
            ticketType: 'PAPER_TICKET',
          },
          {
            id: 'tier-daylight-seat',
            inventory: 220,
            name: '座席票',
            price: 420,
            ticketType: 'PAPER_TICKET',
          },
        ],
      },
    ],
    title: '白昼俱乐部特别专场 杭州站',
    venueName: '大麦 66 Livehouse',
  },
];

function toEventSummary(event: EventDetail): EventSummary {
  return {
    city: event.city,
    coverImageUrl: event.coverImageUrl,
    id: event.id,
    minPrice: event.minPrice,
    saleStatus: event.saleStatus,
    title: event.title,
    venueName: event.venueName,
  };
}

function toCatalogSummary(event: EventDetail): EventCatalogSummary {
  return {
    city: event.city,
    coverImageUrl: event.coverImageUrl,
    description: event.description,
    id: event.id,
    minPrice: event.minPrice,
    published: event.published,
    refundEntryEnabled: event.refundEntryEnabled,
    saleStatus: event.saleStatus,
    title: event.title,
    venueName: event.venueName,
  };
}

const showcaseOrders: OrderDetail[] = [
  {
    createdAt: '2026-04-20T13:12:00.000Z',
    currency: 'CNY',
    event: toEventSummary(showcaseEventDetails[0]),
    id: 'order-aurora-issued',
    items: [
      {
        id: 'order-item-aurora-issued',
        quantity: 2,
        sessionId: 'session-aurora-sh-0518',
        sessionName: '05.18 周一 19:30',
        tierName: '看台 A 档',
        totalAmount: 1760,
        unitPrice: 880,
        viewer: showcaseViewers[0],
      },
    ],
    orderNumber: 'MT202604200001',
    refundEntryEnabled: true,
    status: 'TICKET_ISSUED',
    ticketType: 'E_TICKET',
    timeline: {
      description: '电子票二维码已生成，可在开演前三小时查看入场码。',
      title: '已出票',
    },
    totalAmount: 1760,
  },
  {
    createdAt: '2026-04-19T09:45:00.000Z',
    currency: 'CNY',
    event: toEventSummary(showcaseEventDetails[1]),
    id: 'order-midnight-pending',
    items: [
      {
        id: 'order-item-midnight-pending',
        quantity: 1,
        sessionId: 'session-midnight-bj-0601',
        sessionName: '06.01 周一 20:00',
        tierName: '内场站席',
        totalAmount: 980,
        unitPrice: 980,
        viewer: showcaseViewers[1],
      },
    ],
    orderNumber: 'MT202604190017',
    refundEntryEnabled: false,
    status: 'PENDING_PAYMENT',
    ticketType: 'PAPER_TICKET',
    timeline: {
      description: '请在 15 分钟内完成支付，超时后订单将自动释放。',
      title: '待支付',
    },
    totalAmount: 980,
  },
  {
    createdAt: '2026-04-18T15:30:00.000Z',
    currency: 'CNY',
    event: toEventSummary(showcaseEventDetails[2]),
    id: 'order-blueecho-refund',
    items: [
      {
        id: 'order-item-blueecho-refund',
        quantity: 2,
        sessionId: 'session-blueecho-gz-0524',
        sessionName: '05.24 周日 19:00',
        tierName: '普通票',
        totalAmount: 798,
        unitPrice: 399,
        viewer: showcaseViewers[2],
      },
    ],
    orderNumber: 'MT202604180026',
    refundEntryEnabled: true,
    status: 'REFUND_PROCESSING',
    ticketType: 'E_TICKET',
    timeline: {
      description: '退款申请已提交，平台正在与上游渠道同步处理。',
      title: '退款处理中',
    },
    totalAmount: 798,
  },
  {
    createdAt: '2026-04-17T07:10:00.000Z',
    currency: 'CNY',
    event: toEventSummary(showcaseEventDetails[5]),
    id: 'order-daylight-completed',
    items: [
      {
        id: 'order-item-daylight-completed',
        quantity: 1,
        sessionId: 'session-daylight-hz-0509',
        sessionName: '05.09 周六 20:30',
        tierName: '前区票',
        totalAmount: 520,
        unitPrice: 520,
        viewer: showcaseViewers[0],
      },
    ],
    orderNumber: 'MT202604170043',
    refundEntryEnabled: true,
    status: 'COMPLETED',
    ticketType: 'PAPER_TICKET',
    timeline: {
      description: '演出已结束，订单已归档，可继续查看票务记录。',
      title: '已完成',
    },
    totalAmount: 520,
  },
];

export function shouldUseShowcaseContent() {
  return process.env.TARO_APP_SHOWCASE_DATA === 'true';
}

export function getShowcaseViewers() {
  return clone(showcaseViewers);
}

export function getShowcaseEventCatalog() {
  return clone(showcaseEventDetails.map(toCatalogSummary));
}

export function getShowcaseEventDetail(eventId?: string) {
  const matchedEvent =
    showcaseEventDetails.find((event) => event.id === eventId) ?? showcaseEventDetails[0];

  return clone(matchedEvent);
}

export function getShowcaseOrders(): OrderListItem[] {
  return clone(
    showcaseOrders.map((order) => ({
      createdAt: order.createdAt,
      currency: order.currency,
      event: order.event,
      id: order.id,
      orderNumber: order.orderNumber,
      refundEntryEnabled: order.refundEntryEnabled,
      status: order.status,
      ticketType: order.ticketType,
      timeline: order.timeline,
      totalAmount: order.totalAmount,
    })),
  );
}

export function getShowcaseOrderDetail(orderId?: string) {
  const matchedOrder =
    showcaseOrders.find((order) => order.id === orderId) ?? showcaseOrders[0];

  return clone(matchedOrder);
}
