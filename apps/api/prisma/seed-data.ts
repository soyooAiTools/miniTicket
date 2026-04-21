import { SaleStatus, TicketType } from '@prisma/client';

export const adminUserSeed = [
  {
    email: 'admin@miniticket.local',
    id: 'seed-admin-super',
    name: '超级管理员',
    password: 'Admin123!',
    role: 'ADMIN',
  },
  {
    email: 'ops@miniticket.local',
    id: 'seed-admin-ops',
    name: '现场运营',
    password: 'Ops12345!',
    role: 'OPERATIONS',
  },
] as const;

export const ticketingDemoSeed = {
  event: {
    city: 'Shanghai',
    coverImageUrl:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    description:
      'Local miniapp development seed event for catalog browsing, viewer creation, draft-order checkout, and mock payment verification.',
    id: 'seed-event-beta-shanghai',
    minPrice: 399,
    published: true,
    refundEntryEnabled: true,
    saleStatus: SaleStatus.ON_SALE,
    title: 'Beta Livehouse Night',
    venueAddress: 'No. 3000 Longteng Avenue, Xuhui District, Shanghai',
    venueName: 'West Bund Arena',
  },
  sessions: [
    {
      endsAt: new Date('2026-05-01T13:30:00.000Z'),
      eventId: 'seed-event-beta-shanghai',
      id: 'seed-session-beta-night-1',
      name: '2026-05-01 19:30',
      saleEndsAt: new Date('2026-05-01T11:00:00.000Z'),
      saleStartsAt: new Date('2026-04-18T02:00:00.000Z'),
      startsAt: new Date('2026-05-01T11:30:00.000Z'),
    },
  ],
  ticketTiers: [
    {
      id: 'seed-tier-beta-vip',
      inventory: 120,
      name: 'VIP Standing',
      price: 799,
      purchaseLimit: 4,
      refundDeadlineAt: new Date('2026-04-29T16:00:00.000Z'),
      refundable: true,
      requiresRealName: true,
      sessionId: 'seed-session-beta-night-1',
      sortOrder: 1,
      ticketType: TicketType.E_TICKET,
    },
    {
      id: 'seed-tier-beta-standard',
      inventory: 360,
      name: 'Standard Standing',
      price: 399,
      purchaseLimit: 4,
      refundDeadlineAt: undefined,
      refundable: false,
      requiresRealName: true,
      sessionId: 'seed-session-beta-night-1',
      sortOrder: 2,
      ticketType: TicketType.E_TICKET,
    },
  ],
} as const;
