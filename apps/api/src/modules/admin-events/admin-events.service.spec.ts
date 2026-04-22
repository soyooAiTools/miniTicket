import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { AdminEventsController } from './admin-events.controller';
import { AdminEventsService } from './admin-events.service';

describe('AdminEventsService', () => {
  const prismaMock = {
    event: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    orderItem: {
      count: jest.fn(),
    },
  } as never;

  beforeEach(() => {
    jest.clearAllMocks();
    (prismaMock.event.create as jest.Mock).mockReset();
    (prismaMock.event.findMany as jest.Mock).mockReset();
    (prismaMock.event.findUnique as jest.Mock).mockReset();
    (prismaMock.event.update as jest.Mock).mockReset();
    (prismaMock.orderItem.count as jest.Mock).mockReset();
  });

  function buildPublishableEvent() {
    return {
      city: 'Shanghai',
      coverImageUrl: 'https://example.com/poster.jpg',
      description: 'Livehouse night',
      id: 'event_001',
      published: false,
      title: 'Beta Livehouse Night',
      venueAddress: 'No. 3000 Longteng Avenue',
      venueName: 'West Bund Arena',
      sessions: [
        {
          endsAt: new Date('2026-05-01T13:30:00.000Z'),
          id: 'session_001',
          name: '2026-05-01 19:30',
          saleEndsAt: new Date('2026-05-01T11:00:00.000Z'),
          saleStartsAt: new Date('2026-04-18T02:00:00.000Z'),
          startsAt: new Date('2026-05-01T11:30:00.000Z'),
          ticketTiers: [
            {
              id: 'tier_vip',
              inventory: 120,
              name: 'VIP Standing',
              price: 799,
              purchaseLimit: 4,
              refundable: true,
              refundDeadlineAt: new Date('2026-04-29T16:00:00.000Z'),
              requiresRealName: true,
              sortOrder: 1,
              ticketType: 'E_TICKET',
            },
          ],
        },
      ],
    };
  }

  it('lists admin events with session counts and ISO timestamps', async () => {
    (prismaMock.event.findMany as jest.Mock).mockResolvedValue([
      {
        city: 'Shanghai',
        coverImageUrl: null,
        description: 'Livehouse night',
        id: 'event_001',
        minPrice: 399,
        published: true,
        refundEntryEnabled: true,
        saleStatus: 'ON_SALE',
        title: 'Beta Livehouse Night',
        updatedAt: new Date('2026-04-21T08:00:00.000Z'),
        venueName: 'West Bund Arena',
        _count: {
          sessions: 2,
        },
      },
    ]);

    const service = new AdminEventsService(prismaMock);
    const result = await service.listEvents();

    expect(prismaMock.event.findMany).toHaveBeenCalledWith({
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        _count: {
          select: {
            sessions: true,
          },
        },
        city: true,
        coverImageUrl: true,
        id: true,
        minPrice: true,
        published: true,
        refundEntryEnabled: true,
        saleStatus: true,
        title: true,
        updatedAt: true,
        venueName: true,
      },
    });
    expect(result).toEqual([
      {
        city: 'Shanghai',
        coverImageUrl: undefined,
        id: 'event_001',
        minPrice: 399,
        published: true,
        refundEntryEnabled: true,
        saleStatus: 'ON_SALE',
        sessionsCount: 2,
        title: 'Beta Livehouse Night',
        updatedAt: '2026-04-21T08:00:00.000Z',
        venueName: 'West Bund Arena',
      },
    ]);
  });

  it('creates an event with derived pricing and refund settings', async () => {
    (prismaMock.event.create as jest.Mock).mockResolvedValue({
      city: 'Shanghai',
      coverImageUrl: 'https://example.com/poster.jpg',
      description: 'Livehouse night',
      id: 'event_001',
      published: false,
      title: 'Beta Livehouse Night',
      venueAddress: 'No. 3000 Longteng Avenue',
      venueName: 'West Bund Arena',
      sessions: [
        {
          endsAt: new Date('2026-05-01T13:30:00.000Z'),
          id: 'session_001',
          name: '2026-05-01 19:30',
          saleEndsAt: new Date('2026-05-01T11:00:00.000Z'),
          saleStartsAt: new Date('2026-04-18T02:00:00.000Z'),
          startsAt: new Date('2026-05-01T11:30:00.000Z'),
          ticketTiers: [
            {
              id: 'tier_vip',
              inventory: 120,
              name: 'VIP Standing',
              price: 799,
              purchaseLimit: 4,
              refundable: true,
              refundDeadlineAt: new Date('2026-04-29T16:00:00.000Z'),
              requiresRealName: true,
              sortOrder: 1,
              ticketType: 'E_TICKET',
            },
            {
              id: 'tier_standard',
              inventory: 360,
              name: 'Standard Standing',
              price: 399,
              purchaseLimit: 4,
              refundable: false,
              requiresRealName: true,
              sortOrder: 2,
              ticketType: 'E_TICKET',
            },
          ],
        },
      ],
    });

    const service = new AdminEventsService(prismaMock);
    const result = await service.createEvent({
      city: 'Shanghai',
      coverImageUrl: 'https://example.com/poster.jpg',
      description: 'Livehouse night',
      published: false,
      sessions: [
        {
          endsAt: '2026-05-01T13:30:00.000Z',
          name: '2026-05-01 19:30',
          saleEndsAt: '2026-05-01T11:00:00.000Z',
          saleStartsAt: '2026-04-18T02:00:00.000Z',
          startsAt: '2026-05-01T11:30:00.000Z',
          tiers: [
            {
              inventory: 120,
              name: 'VIP Standing',
              price: 799,
              purchaseLimit: 4,
              refundable: true,
              refundDeadlineAt: '2026-04-29T16:00:00.000Z',
              requiresRealName: true,
              sortOrder: 1,
              ticketType: 'E_TICKET',
            },
            {
              inventory: 360,
              name: 'Standard Standing',
              price: 399,
              purchaseLimit: 4,
              refundable: false,
              requiresRealName: true,
              sortOrder: 2,
              ticketType: 'E_TICKET',
            },
          ],
        },
      ],
      title: 'Beta Livehouse Night',
      venueAddress: 'No. 3000 Longteng Avenue',
      venueName: 'West Bund Arena',
    });

    expect(prismaMock.event.create).toHaveBeenCalledWith({
      data: {
        city: 'Shanghai',
        coverImageUrl: 'https://example.com/poster.jpg',
        description: 'Livehouse night',
        minPrice: 399,
        published: false,
        refundEntryEnabled: true,
        saleStatus: 'UPCOMING',
        sessions: {
          create: [
            {
              endsAt: new Date('2026-05-01T13:30:00.000Z'),
              name: '2026-05-01 19:30',
              saleEndsAt: new Date('2026-05-01T11:00:00.000Z'),
              saleStartsAt: new Date('2026-04-18T02:00:00.000Z'),
              startsAt: new Date('2026-05-01T11:30:00.000Z'),
              ticketTiers: {
                create: [
                  {
                    inventory: 120,
                    name: 'VIP Standing',
                    price: 799,
                    purchaseLimit: 4,
                    refundable: true,
                    refundDeadlineAt: new Date('2026-04-29T16:00:00.000Z'),
                    requiresRealName: true,
                    sortOrder: 1,
                    ticketType: 'E_TICKET',
                  },
                  {
                    inventory: 360,
                    name: 'Standard Standing',
                    price: 399,
                    purchaseLimit: 4,
                    refundable: false,
                    requiresRealName: true,
                    sortOrder: 2,
                    ticketType: 'E_TICKET',
                  },
                ],
              },
            },
          ],
        },
        title: 'Beta Livehouse Night',
        venueAddress: 'No. 3000 Longteng Avenue',
        venueName: 'West Bund Arena',
      },
      select: {
        city: true,
        coverImageUrl: true,
        description: true,
        id: true,
        published: true,
        sessions: {
          orderBy: {
            startsAt: 'asc',
          },
          select: {
            endsAt: true,
            id: true,
            name: true,
            saleEndsAt: true,
            saleStartsAt: true,
            startsAt: true,
            ticketTiers: {
              orderBy: [
                {
                  sortOrder: 'asc',
                },
                {
                  price: 'asc',
                },
              ],
              select: {
                id: true,
                inventory: true,
                name: true,
                price: true,
                purchaseLimit: true,
                refundable: true,
                refundDeadlineAt: true,
                requiresRealName: true,
                sortOrder: true,
                ticketType: true,
              },
            },
          },
        },
        title: true,
        venueAddress: true,
        venueName: true,
      },
    });
    expect(result).toEqual({
      city: 'Shanghai',
      coverImageUrl: 'https://example.com/poster.jpg',
      description: 'Livehouse night',
      id: 'event_001',
      published: false,
      sessions: [
        {
          endsAt: '2026-05-01T13:30:00.000Z',
          id: 'session_001',
          name: '2026-05-01 19:30',
          saleEndsAt: '2026-05-01T11:00:00.000Z',
          saleStartsAt: '2026-04-18T02:00:00.000Z',
          startsAt: '2026-05-01T11:30:00.000Z',
          tiers: [
            {
              id: 'tier_vip',
              inventory: 120,
              name: 'VIP Standing',
              price: 799,
              purchaseLimit: 4,
              refundable: true,
              refundDeadlineAt: '2026-04-29T16:00:00.000Z',
              requiresRealName: true,
              sortOrder: 1,
              ticketType: 'E_TICKET',
            },
            {
              id: 'tier_standard',
              inventory: 360,
              name: 'Standard Standing',
              price: 399,
              purchaseLimit: 4,
              refundable: false,
              refundDeadlineAt: undefined,
              requiresRealName: true,
              sortOrder: 2,
              ticketType: 'E_TICKET',
            },
          ],
        },
      ],
      title: 'Beta Livehouse Night',
      venueAddress: 'No. 3000 Longteng Avenue',
      venueName: 'West Bund Arena',
    });
  });

  it('rejects event creation when a session does not include any tiers', async () => {
    const service = new AdminEventsService(prismaMock);

    await expect(
      service.createEvent({
        city: 'Shanghai',
        sessions: [
          {
            name: '2026-05-01 19:30',
            startsAt: '2026-05-01T11:30:00.000Z',
            tiers: [],
          },
        ],
        title: 'Beta Livehouse Night',
        venueAddress: 'No. 3000 Longteng Avenue',
        venueName: 'West Bund Arena',
      }),
    ).rejects.toThrow('每个场次至少需要配置一个区域票档。');
    expect(prismaMock.event.create).not.toHaveBeenCalled();
  });

  it('rejects duplicate tier names within one session', async () => {
    const service = new AdminEventsService(prismaMock);

    await expect(
      service.createEvent({
        city: 'Shanghai',
        sessions: [
          {
            name: '2026-05-01 19:30',
            startsAt: '2026-05-01T11:30:00.000Z',
            tiers: [
              {
                inventory: 120,
                name: 'VIP Standing',
                price: 799,
                purchaseLimit: 4,
                refundable: true,
                refundDeadlineAt: '2026-04-29T16:00:00.000Z',
                requiresRealName: true,
                sortOrder: 1,
                ticketType: 'E_TICKET',
              },
              {
                inventory: 360,
                name: 'VIP Standing',
                price: 399,
                purchaseLimit: 4,
                refundable: false,
                requiresRealName: true,
                sortOrder: 2,
                ticketType: 'E_TICKET',
              },
            ],
          },
        ],
        title: 'Beta Livehouse Night',
        venueAddress: 'No. 3000 Longteng Avenue',
        venueName: 'West Bund Arena',
      }),
    ).rejects.toThrow('同一场次下区域票档名称不能重复。');
    expect(prismaMock.event.create).not.toHaveBeenCalled();
  });

  it('rejects a refund deadline that is later than the session start', async () => {
    const service = new AdminEventsService(prismaMock);

    await expect(
      service.createEvent({
        city: 'Shanghai',
        sessions: [
          {
            name: '2026-05-01 19:30',
            startsAt: '2026-05-01T11:30:00.000Z',
            tiers: [
              {
                inventory: 120,
                name: 'VIP Standing',
                price: 799,
                purchaseLimit: 4,
                refundable: true,
                refundDeadlineAt: '2026-05-02T11:30:00.000Z',
                requiresRealName: true,
                sortOrder: 1,
                ticketType: 'E_TICKET',
              },
            ],
          },
        ],
        title: 'Beta Livehouse Night',
        venueAddress: 'No. 3000 Longteng Avenue',
        venueName: 'West Bund Arena',
      }),
    ).rejects.toThrow('退款截止时间不能晚于场次开始时间。');
    expect(prismaMock.event.create).not.toHaveBeenCalled();
  });

  it('rejects a sale window that starts after it ends', async () => {
    const service = new AdminEventsService(prismaMock);

    await expect(
      service.createEvent({
        city: 'Shanghai',
        sessions: [
          {
            name: '2026-05-01 19:30',
            saleEndsAt: '2026-04-18T02:00:00.000Z',
            saleStartsAt: '2026-04-18T03:00:00.000Z',
            startsAt: '2026-05-01T11:30:00.000Z',
            tiers: [
              {
                inventory: 120,
                name: 'VIP Standing',
                price: 799,
                purchaseLimit: 4,
                refundable: true,
                refundDeadlineAt: '2026-04-29T16:00:00.000Z',
                requiresRealName: true,
                sortOrder: 1,
                ticketType: 'E_TICKET',
              },
            ],
          },
        ],
        title: 'Beta Livehouse Night',
        venueAddress: 'No. 3000 Longteng Avenue',
        venueName: 'West Bund Arena',
      }),
    ).rejects.toThrow('开售时间不能晚于停售时间。');
    expect(prismaMock.event.create).not.toHaveBeenCalled();
  });

  it('updates an event and recomputes the derived fields from the new tiers', async () => {
    (prismaMock.event.findUnique as jest.Mock).mockResolvedValue(
      buildPublishableEvent(),
    );
    (prismaMock.orderItem.count as jest.Mock).mockResolvedValue(0);
    (prismaMock.event.update as jest.Mock).mockResolvedValue({
      city: 'Shanghai',
      coverImageUrl: null,
      description: 'Updated event',
      id: 'event_001',
      published: true,
      title: 'Beta Livehouse Night',
      venueAddress: 'No. 3000 Longteng Avenue',
      venueName: 'West Bund Arena',
      sessions: [
        {
          endsAt: new Date('2026-05-01T13:30:00.000Z'),
          id: 'session_001',
          name: '2026-05-01 19:30',
          saleEndsAt: new Date('2026-05-01T11:00:00.000Z'),
          saleStartsAt: new Date('2026-04-18T02:00:00.000Z'),
          startsAt: new Date('2026-05-01T11:30:00.000Z'),
          ticketTiers: [
            {
              id: 'tier_standard',
              inventory: 360,
              name: 'Standard Standing',
              price: 399,
              purchaseLimit: 2,
              refundable: false,
              requiresRealName: true,
              sortOrder: 1,
              ticketType: 'E_TICKET',
            },
            {
              id: 'tier_vip',
              inventory: 120,
              name: 'VIP Standing',
              price: 799,
              purchaseLimit: 4,
              refundable: true,
              refundDeadlineAt: new Date('2026-04-29T16:00:00.000Z'),
              requiresRealName: true,
              sortOrder: 2,
              ticketType: 'E_TICKET',
            },
          ],
        },
      ],
    });

    const service = new AdminEventsService(prismaMock);
    const result = await service.updateEvent('event_001', {
      city: 'Shanghai',
      description: 'Updated event',
      id: 'event_001',
      published: true,
      sessions: [
        {
          id: 'session_001',
          name: '2026-05-01 19:30',
          startsAt: '2026-05-01T11:30:00.000Z',
          endsAt: '2026-05-01T13:30:00.000Z',
          saleStartsAt: '2026-04-18T02:00:00.000Z',
          saleEndsAt: '2026-05-01T11:00:00.000Z',
          tiers: [
            {
              id: 'tier_standard',
              inventory: 360,
              name: 'Standard Standing',
              price: 399,
              purchaseLimit: 2,
              refundable: false,
              requiresRealName: true,
              sortOrder: 1,
              ticketType: 'E_TICKET',
            },
            {
              id: 'tier_vip',
              inventory: 120,
              name: 'VIP Standing',
              price: 799,
              purchaseLimit: 4,
              refundable: true,
              refundDeadlineAt: '2026-04-29T16:00:00.000Z',
              requiresRealName: true,
              sortOrder: 2,
              ticketType: 'E_TICKET',
            },
          ],
        },
      ],
      title: 'Beta Livehouse Night',
      venueAddress: 'No. 3000 Longteng Avenue',
      venueName: 'West Bund Arena',
    });

    expect(prismaMock.event.findUnique).toHaveBeenCalledWith({
      select: expect.any(Object),
      where: {
        id: 'event_001',
      },
    });
    expect(prismaMock.orderItem.count).toHaveBeenCalledWith({
      where: {
        ticketTier: {
          session: {
            eventId: 'event_001',
          },
        },
      },
    });
    expect(prismaMock.event.update).toHaveBeenCalledWith({
      data: {
        city: 'Shanghai',
        description: 'Updated event',
        minPrice: 399,
        published: true,
        refundEntryEnabled: true,
        sessions: {
          create: [
            {
              endsAt: new Date('2026-05-01T13:30:00.000Z'),
              id: 'session_001',
              name: '2026-05-01 19:30',
              saleEndsAt: new Date('2026-05-01T11:00:00.000Z'),
              saleStartsAt: new Date('2026-04-18T02:00:00.000Z'),
              startsAt: new Date('2026-05-01T11:30:00.000Z'),
              ticketTiers: {
                create: [
                  {
                    id: 'tier_standard',
                    inventory: 360,
                    name: 'Standard Standing',
                    price: 399,
                    purchaseLimit: 2,
                    refundable: false,
                    requiresRealName: true,
                    sortOrder: 1,
                    ticketType: 'E_TICKET',
                  },
                  {
                    id: 'tier_vip',
                    inventory: 120,
                    name: 'VIP Standing',
                    price: 799,
                    purchaseLimit: 4,
                    refundable: true,
                    refundDeadlineAt: new Date('2026-04-29T16:00:00.000Z'),
                    requiresRealName: true,
                    sortOrder: 2,
                    ticketType: 'E_TICKET',
                  },
                ],
              },
            },
          ],
          deleteMany: {},
        },
        title: 'Beta Livehouse Night',
        venueAddress: 'No. 3000 Longteng Avenue',
        venueName: 'West Bund Arena',
      },
      select: {
        city: true,
        coverImageUrl: true,
        description: true,
        id: true,
        published: true,
        sessions: {
          orderBy: {
            startsAt: 'asc',
          },
          select: {
            endsAt: true,
            id: true,
            name: true,
            saleEndsAt: true,
            saleStartsAt: true,
            startsAt: true,
            ticketTiers: {
              orderBy: [
                {
                  sortOrder: 'asc',
                },
                {
                  price: 'asc',
                },
              ],
              select: {
                id: true,
                inventory: true,
                name: true,
                price: true,
                purchaseLimit: true,
                refundable: true,
                refundDeadlineAt: true,
                requiresRealName: true,
                sortOrder: true,
                ticketType: true,
              },
            },
          },
        },
        title: true,
        venueAddress: true,
        venueName: true,
      },
      where: {
        id: 'event_001',
      },
    });
    expect(result).toEqual({
      city: 'Shanghai',
      coverImageUrl: undefined,
      description: 'Updated event',
      id: 'event_001',
      published: true,
      sessions: [
        {
          endsAt: '2026-05-01T13:30:00.000Z',
          id: 'session_001',
          name: '2026-05-01 19:30',
          saleEndsAt: '2026-05-01T11:00:00.000Z',
          saleStartsAt: '2026-04-18T02:00:00.000Z',
          startsAt: '2026-05-01T11:30:00.000Z',
          tiers: [
            {
              id: 'tier_standard',
              inventory: 360,
              name: 'Standard Standing',
              price: 399,
              purchaseLimit: 2,
              refundable: false,
              refundDeadlineAt: undefined,
              requiresRealName: true,
              sortOrder: 1,
              ticketType: 'E_TICKET',
            },
            {
              id: 'tier_vip',
              inventory: 120,
              name: 'VIP Standing',
              price: 799,
              purchaseLimit: 4,
              refundable: true,
              refundDeadlineAt: '2026-04-29T16:00:00.000Z',
              requiresRealName: true,
              sortOrder: 2,
              ticketType: 'E_TICKET',
            },
          ],
        },
      ],
      title: 'Beta Livehouse Night',
      venueAddress: 'No. 3000 Longteng Avenue',
      venueName: 'West Bund Arena',
    });
  });

  it('updates metadata without rewriting sessions when an event already has orders', async () => {
    (prismaMock.event.findUnique as jest.Mock).mockResolvedValue(
      buildPublishableEvent(),
    );
    (prismaMock.orderItem.count as jest.Mock).mockResolvedValue(3);
    (prismaMock.event.update as jest.Mock).mockResolvedValue({
      city: 'Shanghai',
      coverImageUrl: null,
      description: 'Updated event description',
      id: 'event_001',
      published: true,
      title: 'Updated Livehouse Night',
      venueAddress: 'No. 3000 Longteng Avenue',
      venueName: 'West Bund Arena',
      sessions: [
        {
          endsAt: new Date('2026-05-01T13:30:00.000Z'),
          id: 'session_001',
          name: '2026-05-01 19:30',
          saleEndsAt: new Date('2026-05-01T11:00:00.000Z'),
          saleStartsAt: new Date('2026-04-18T02:00:00.000Z'),
          startsAt: new Date('2026-05-01T11:30:00.000Z'),
          ticketTiers: [
            {
              id: 'tier_vip',
              inventory: 120,
              name: 'VIP Standing',
              price: 799,
              purchaseLimit: 4,
              refundable: true,
              refundDeadlineAt: new Date('2026-04-29T16:00:00.000Z'),
              requiresRealName: true,
              sortOrder: 1,
              ticketType: 'E_TICKET',
            },
          ],
        },
      ],
    });

    const service = new AdminEventsService(prismaMock);
    const result = await service.updateEvent('event_001', {
      city: 'Shanghai',
      description: 'Updated event description',
      id: 'event_001',
      published: true,
      sessions: [
        {
          id: 'session_001',
          name: '2026-05-01 19:30',
          startsAt: '2026-05-01T11:30:00.000Z',
          endsAt: '2026-05-01T13:30:00.000Z',
          saleStartsAt: '2026-04-18T02:00:00.000Z',
          saleEndsAt: '2026-05-01T11:00:00.000Z',
          tiers: [
            {
              id: 'tier_vip',
              inventory: 120,
              name: 'VIP Standing',
              price: 799,
              purchaseLimit: 4,
              refundable: true,
              refundDeadlineAt: '2026-04-29T16:00:00.000Z',
              requiresRealName: true,
              sortOrder: 1,
              ticketType: 'E_TICKET',
            },
          ],
        },
      ],
      title: 'Updated Livehouse Night',
      venueAddress: 'No. 3000 Longteng Avenue',
      venueName: 'West Bund Arena',
    });

    expect(prismaMock.event.update).toHaveBeenCalledWith({
      data: expect.not.objectContaining({
        sessions: expect.anything(),
      }),
      select: expect.any(Object),
      where: {
        id: 'event_001',
      },
    });
    expect(result).toEqual({
      city: 'Shanghai',
      coverImageUrl: undefined,
      description: 'Updated event description',
      id: 'event_001',
      published: true,
      sessions: [
        {
          endsAt: '2026-05-01T13:30:00.000Z',
          id: 'session_001',
          name: '2026-05-01 19:30',
          saleEndsAt: '2026-05-01T11:00:00.000Z',
          saleStartsAt: '2026-04-18T02:00:00.000Z',
          startsAt: '2026-05-01T11:30:00.000Z',
          tiers: [
            {
              id: 'tier_vip',
              inventory: 120,
              name: 'VIP Standing',
              price: 799,
              purchaseLimit: 4,
              refundable: true,
              refundDeadlineAt: '2026-04-29T16:00:00.000Z',
              requiresRealName: true,
              sortOrder: 1,
              ticketType: 'E_TICKET',
            },
          ],
        },
      ],
      title: 'Updated Livehouse Night',
      venueAddress: 'No. 3000 Longteng Avenue',
      venueName: 'West Bund Arena',
    });
  });

  it('maps missing event updates to a Chinese not found error', async () => {
    (prismaMock.event.findUnique as jest.Mock).mockResolvedValue(
      buildPublishableEvent(),
    );
    (prismaMock.event.update as jest.Mock).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Record not found.', {
        code: 'P2025',
        clientVersion: '5.22.0',
      }),
    );

    const service = new AdminEventsService(prismaMock);

    await expect(
      service.updateEvent('event_missing', {
        city: 'Shanghai',
        id: 'event_missing',
        sessions: [
          {
            name: '2026-05-01 19:30',
            startsAt: '2026-05-01T11:30:00.000Z',
            tiers: [
              {
                inventory: 120,
                name: 'VIP Standing',
                price: 799,
                purchaseLimit: 4,
                refundable: true,
                refundDeadlineAt: '2026-04-29T16:00:00.000Z',
                requiresRealName: true,
                sortOrder: 1,
                ticketType: 'E_TICKET',
              },
            ],
          },
        ],
        title: 'Beta Livehouse Night',
        venueAddress: 'No. 3000 Longteng Avenue',
        venueName: 'West Bund Arena',
      }),
    ).rejects.toThrow('活动不存在。');
  });

  it('publishes and unpublishes events without touching the session payload', async () => {
    (prismaMock.event.findUnique as jest.Mock)
      .mockResolvedValueOnce(buildPublishableEvent())
      .mockResolvedValueOnce(buildPublishableEvent());
    (prismaMock.event.update as jest.Mock)
      .mockResolvedValueOnce({
        city: 'Shanghai',
        coverImageUrl: null,
        description: null,
        id: 'event_001',
        published: true,
        title: 'Beta Livehouse Night',
        venueAddress: 'No. 3000 Longteng Avenue',
        venueName: 'West Bund Arena',
        sessions: [],
      })
      .mockResolvedValueOnce({
        city: 'Shanghai',
        coverImageUrl: null,
        description: null,
        id: 'event_001',
        published: false,
        title: 'Beta Livehouse Night',
        venueAddress: 'No. 3000 Longteng Avenue',
        venueName: 'West Bund Arena',
        sessions: [],
      });

    const service = new AdminEventsService(prismaMock);

    await service.publishEvent('event_001');
    await service.unpublishEvent('event_001');

    expect(prismaMock.event.findUnique).toHaveBeenNthCalledWith(1, {
      select: expect.any(Object),
      where: {
        id: 'event_001',
      },
    });
    expect(prismaMock.event.update).toHaveBeenNthCalledWith(1, {
      data: {
        published: true,
      },
      select: expect.any(Object),
      where: {
        id: 'event_001',
      },
    });
    expect(prismaMock.event.update).toHaveBeenNthCalledWith(2, {
      data: {
        published: false,
      },
      select: expect.any(Object),
      where: {
        id: 'event_001',
      },
    });
  });

  it('allows unpublishing an incomplete event', async () => {
    (prismaMock.event.findUnique as jest.Mock).mockResolvedValue({
      city: 'Shanghai',
      coverImageUrl: 'https://example.com/poster.jpg',
      description: 'Livehouse night',
      id: 'event_001',
      published: false,
      title: 'Beta Livehouse Night',
      venueAddress: 'No. 3000 Longteng Avenue',
      venueName: 'West Bund Arena',
      sessions: [
        {
          endsAt: new Date('2026-05-01T13:30:00.000Z'),
          id: 'session_001',
          name: '2026-05-01 19:30',
          saleEndsAt: undefined,
          saleStartsAt: undefined,
          startsAt: new Date('2026-05-01T11:30:00.000Z'),
          ticketTiers: [
            {
              id: 'tier_vip',
              inventory: 120,
              name: 'VIP Standing',
              price: 799,
              purchaseLimit: 4,
              refundable: true,
              refundDeadlineAt: new Date('2026-04-29T16:00:00.000Z'),
              requiresRealName: true,
              sortOrder: 1,
              ticketType: 'E_TICKET',
            },
          ],
        },
      ],
    });
    (prismaMock.event.update as jest.Mock).mockResolvedValue({
      city: 'Shanghai',
      coverImageUrl: null,
      description: 'Livehouse night',
      id: 'event_001',
      published: false,
      title: 'Beta Livehouse Night',
      venueAddress: 'No. 3000 Longteng Avenue',
      venueName: 'West Bund Arena',
      sessions: [],
    });

    const service = new AdminEventsService(prismaMock);

    await expect(service.unpublishEvent('event_001')).resolves.toEqual({
      city: 'Shanghai',
      coverImageUrl: undefined,
      description: 'Livehouse night',
      id: 'event_001',
      published: false,
      sessions: [],
      title: 'Beta Livehouse Night',
      venueAddress: 'No. 3000 Longteng Avenue',
      venueName: 'West Bund Arena',
    });

    expect(prismaMock.event.update).toHaveBeenCalledWith({
      data: {
        published: false,
      },
      select: expect.any(Object),
      where: {
        id: 'event_001',
      },
    });
  });

  it('rejects publish when the stored event is incomplete', async () => {
    (prismaMock.event.findUnique as jest.Mock).mockResolvedValue({
      city: 'Shanghai',
      coverImageUrl: 'https://example.com/poster.jpg',
      description: 'Livehouse night',
      id: 'event_001',
      published: false,
      title: 'Beta Livehouse Night',
      venueAddress: 'No. 3000 Longteng Avenue',
      venueName: 'West Bund Arena',
      sessions: [
        {
          endsAt: new Date('2026-05-01T13:30:00.000Z'),
          id: 'session_001',
          name: '2026-05-01 19:30',
          saleEndsAt: undefined,
          saleStartsAt: undefined,
          startsAt: new Date('2026-05-01T11:30:00.000Z'),
          ticketTiers: [
            {
              id: 'tier_vip',
              inventory: 120,
              name: 'VIP Standing',
              price: 799,
              purchaseLimit: 4,
              refundable: true,
              refundDeadlineAt: new Date('2026-04-29T16:00:00.000Z'),
              requiresRealName: true,
              sortOrder: 1,
              ticketType: 'E_TICKET',
            },
          ],
        },
      ],
    });

    const service = new AdminEventsService(prismaMock);

    await expect(service.publishEvent('event_001')).rejects.toThrow(
      '每个场次都需要填写开售时间和停售时间。',
    );
    expect(prismaMock.event.update).not.toHaveBeenCalled();
  });

  it('rejects structural updates when an event already has orders', async () => {
    (prismaMock.event.findUnique as jest.Mock).mockResolvedValue(
      buildPublishableEvent(),
    );
    (prismaMock.orderItem.count as jest.Mock).mockResolvedValue(2);

    const service = new AdminEventsService(prismaMock);

    await expect(
      service.updateEvent('event_001', {
        city: 'Shanghai',
        description: 'Updated event',
        id: 'event_001',
        published: true,
        sessions: [
          {
            id: 'session_001',
            name: '2026-05-01 19:30',
            startsAt: '2026-05-01T11:30:00.000Z',
            endsAt: '2026-05-01T13:30:00.000Z',
            saleStartsAt: '2026-04-18T02:00:00.000Z',
            saleEndsAt: '2026-05-01T11:00:00.000Z',
            tiers: [
              {
                id: 'tier_standard',
                inventory: 360,
                name: 'Standard Standing',
                price: 399,
                purchaseLimit: 2,
                refundable: false,
                requiresRealName: true,
                sortOrder: 1,
                ticketType: 'E_TICKET',
              },
              {
                id: 'tier_vip',
                inventory: 120,
                name: 'VIP Standing',
                price: 799,
                purchaseLimit: 4,
                refundable: true,
                refundDeadlineAt: '2026-04-29T16:00:00.000Z',
                requiresRealName: true,
                sortOrder: 2,
                ticketType: 'E_TICKET',
              },
            ],
          },
        ],
        title: 'Beta Livehouse Night',
        venueAddress: 'No. 3000 Longteng Avenue',
        venueName: 'West Bund Arena',
      }),
    ).rejects.toThrow('活动已有订单，暂不支持修改场次或区域票档。');
    expect(prismaMock.event.update).not.toHaveBeenCalled();
  });
});

describe('AdminEventsController', () => {
  const serviceMock = {
    createEvent: jest.fn(),
    listEvents: jest.fn(),
    publishEvent: jest.fn(),
    unpublishEvent: jest.fn(),
    updateEvent: jest.fn(),
  } as unknown as AdminEventsService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('proxies the list call', async () => {
    (serviceMock.listEvents as jest.Mock).mockResolvedValue([
      {
        city: 'Shanghai',
        coverImageUrl: undefined,
        id: 'event_001',
        minPrice: 399,
        published: false,
        refundEntryEnabled: false,
        saleStatus: 'UPCOMING',
        sessionsCount: 1,
        title: 'Beta Livehouse Night',
        updatedAt: '2026-04-21T08:00:00.000Z',
        venueName: 'West Bund Arena',
      },
    ]);

    const controller = new AdminEventsController(serviceMock);
    const result = await controller.listEvents();

    expect(result).toEqual({
      items: [
      {
        city: 'Shanghai',
        coverImageUrl: undefined,
        id: 'event_001',
        minPrice: 399,
          published: false,
          refundEntryEnabled: false,
          saleStatus: 'UPCOMING',
          sessionsCount: 1,
          title: 'Beta Livehouse Night',
          updatedAt: '2026-04-21T08:00:00.000Z',
          venueName: 'West Bund Arena',
        },
      ],
    });
  });

  it('rejects malformed create payloads', async () => {
    const controller = new AdminEventsController(serviceMock);

    await expect(
      controller.createEvent({
        city: 'Shanghai',
        sessions: [],
        title: 'Beta Livehouse Night',
        venueAddress: 'No. 3000 Longteng Avenue',
        venueName: 'West Bund Arena',
      } as never),
    ).rejects.toThrow(BadRequestException);
  });
});
