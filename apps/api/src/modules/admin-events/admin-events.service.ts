import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import type {
  AdminEventDraft,
  AdminEventEditor,
  AdminEventListItem,
  AdminEventSessionDraft,
  AdminRegionalTierDraft,
} from '../../../../../packages/contracts/src';
import { PrismaService } from '../../common/prisma/prisma.service';

const adminEventTicketTierOrderBy = [
  {
    sortOrder: 'asc' as const,
  },
  {
    price: 'asc' as const,
  },
];

const adminEventDetailSelect = {
  city: true,
  coverImageUrl: true,
  description: true,
  id: true,
  published: true,
  title: true,
  venueAddress: true,
  venueName: true,
  sessions: {
    orderBy: {
      startsAt: 'asc' as const,
    },
    select: {
      endsAt: true,
      id: true,
      name: true,
      saleEndsAt: true,
      saleStartsAt: true,
      startsAt: true,
      ticketTiers: {
        orderBy: adminEventTicketTierOrderBy,
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
} as const;

const adminEventListSelect = {
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
} as const;

type PrismaAdminEventTier = {
  id: string;
  inventory: number;
  name: string;
  price: number;
  purchaseLimit: number;
  refundable: boolean;
  refundDeadlineAt: Date | string | null;
  requiresRealName: boolean;
  sortOrder: number;
  ticketType: 'E_TICKET' | 'PAPER_TICKET';
};

type PrismaAdminEventSession = {
  endsAt: Date | string | null;
  id: string;
  name: string;
  saleEndsAt: Date | string | null;
  saleStartsAt: Date | string | null;
  startsAt: Date | string;
  ticketTiers: PrismaAdminEventTier[];
};

type PrismaAdminEvent = {
  city: string;
  coverImageUrl: string | null;
  description: string | null;
  id: string;
  published: boolean;
  sessions?: PrismaAdminEventSession[];
  title: string;
  venueAddress: string;
  venueName: string;
};

type PrismaAdminEventListRow = {
  _count: {
    sessions: number;
  };
  city: string;
  coverImageUrl: string | null;
  id: string;
  minPrice: number;
  published: boolean;
  refundEntryEnabled: boolean;
  saleStatus: AdminEventListItem['saleStatus'];
  title: string;
  updatedAt: Date;
  venueName: string;
};

function normalizeNullableText(value: string | null | undefined) {
  return value === null ? undefined : value;
}

function normalizeDate(value: Date | string | null | undefined) {
  if (value === null || value === undefined) {
    return undefined;
  }

  return value instanceof Date ? value.toISOString() : value;
}

function normalizeRequiredDate(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value;
}

function normalizeTier(tier: PrismaAdminEventTier) {
  return {
    id: tier.id,
    inventory: tier.inventory,
    name: tier.name,
    price: tier.price,
    purchaseLimit: tier.purchaseLimit,
    refundable: tier.refundable,
    refundDeadlineAt: normalizeDate(tier.refundDeadlineAt),
    requiresRealName: tier.requiresRealName,
    sortOrder: tier.sortOrder,
    ticketType: tier.ticketType,
  };
}

function normalizeSession(session: PrismaAdminEventSession) {
  return {
    endsAt: normalizeDate(session.endsAt),
    id: session.id,
    name: session.name,
    saleEndsAt: normalizeDate(session.saleEndsAt),
    saleStartsAt: normalizeDate(session.saleStartsAt),
    startsAt: normalizeRequiredDate(session.startsAt),
    tiers: session.ticketTiers.map(normalizeTier),
  };
}

function normalizeEvent(event: PrismaAdminEvent): AdminEventEditor {
  return {
    city: event.city,
    coverImageUrl: normalizeNullableText(event.coverImageUrl),
    description: normalizeNullableText(event.description),
    id: event.id,
    published: event.published,
    sessions: event.sessions?.map(normalizeSession) ?? [],
    title: event.title,
    venueAddress: event.venueAddress,
    venueName: event.venueName,
  };
}

function normalizeListItem(event: PrismaAdminEventListRow): AdminEventListItem {
  return {
    city: event.city,
    coverImageUrl: normalizeNullableText(event.coverImageUrl),
    id: event.id,
    minPrice: event.minPrice,
    published: event.published,
    refundEntryEnabled: event.refundEntryEnabled,
    saleStatus: event.saleStatus,
    sessionsCount: event._count.sessions,
    title: event.title,
    updatedAt: event.updatedAt.toISOString(),
    venueName: event.venueName,
  };
}

type EventLifecycleTier = {
  inventory: number;
  name: string;
  price: number;
  purchaseLimit: number;
  refundable: boolean;
  refundDeadlineAt?: Date | string | null;
  requiresRealName: boolean;
  sortOrder: number;
  ticketType: 'E_TICKET' | 'PAPER_TICKET';
};

type EventLifecycleSession = {
  endsAt?: Date | string | null;
  name: string;
  saleEndsAt?: Date | string | null;
  saleStartsAt?: Date | string | null;
  startsAt: Date | string;
  tiers: EventLifecycleTier[];
};

type EventLifecycleSource = {
  city: string;
  coverImageUrl?: string | null;
  description?: string | null;
  sessions: EventLifecycleSession[];
  title: string;
  venueAddress?: string | null;
  venueName: string;
};

type EventLifecycleAnalysis = {
  minPrice: number;
  refundEntryEnabled: boolean;
  structure: {
    sessions: Array<{
      endsAt?: string;
      name: string;
      saleEndsAt?: string;
      saleStartsAt?: string;
      startsAt: string;
      tiers: Array<{
        inventory: number;
        name: string;
        price: number;
        purchaseLimit: number;
        refundable: boolean;
        refundDeadlineAt?: string;
        requiresRealName: boolean;
        sortOrder: number;
        ticketType: 'E_TICKET' | 'PAPER_TICKET';
      }>;
    }>;
  };
};

function normalizeLifecycleText(value: string | undefined | null) {
  return value?.trim() ?? '';
}

function toLifecycleIso(value: Date | string | null | undefined) {
  return normalizeDate(value);
}

function compareLifecycleStrings(left: string | undefined, right: string | undefined) {
  if (left === right) {
    return 0;
  }

  if (left === undefined) {
    return -1;
  }

  if (right === undefined) {
    return 1;
  }

  return left.localeCompare(right);
}

function compareLifecycleDates(
  left: Date | string | null | undefined,
  right: Date | string | null | undefined,
) {
  const leftTime = left === null || left === undefined ? undefined : new Date(left).getTime();
  const rightTime = right === null || right === undefined ? undefined : new Date(right).getTime();

  if (leftTime === rightTime) {
    return 0;
  }

  if (leftTime === undefined) {
    return -1;
  }

  if (rightTime === undefined) {
    return 1;
  }

  return leftTime - rightTime;
}

function validateAndAnalyzeEventLifecycle(
  source: EventLifecycleSource,
  options: {
    requireBasicInfo: boolean;
    requireSaleWindows: boolean;
  },
): EventLifecycleAnalysis {
  if (options.requireBasicInfo) {
    if (
      !normalizeLifecycleText(source.title) ||
      !normalizeLifecycleText(source.city) ||
      !normalizeLifecycleText(source.venueName) ||
      !normalizeLifecycleText(source.venueAddress)
    ) {
      throw new BadRequestException('活动基础信息不完整。');
    }
  }

  if (source.sessions.length === 0) {
    throw new BadRequestException('活动至少需要配置一个场次。');
  }

  const structureSessions: EventLifecycleAnalysis['structure']['sessions'] = [];
  let minPrice = Number.POSITIVE_INFINITY;
  let refundEntryEnabled = false;

  for (const session of source.sessions) {
    if (session.tiers.length === 0) {
      throw new BadRequestException('每个场次至少需要配置一个区域票档。');
    }

    if (options.requireSaleWindows) {
      if (session.saleStartsAt === undefined || session.saleEndsAt === undefined) {
        throw new BadRequestException('每个场次都需要填写开售时间和停售时间。');
      }
    }

    if (
      session.saleStartsAt !== undefined &&
      session.saleEndsAt !== undefined &&
      compareLifecycleDates(session.saleStartsAt, session.saleEndsAt) > 0
    ) {
      throw new BadRequestException('开售时间不能晚于停售时间。');
    }

    const seenTierNames = new Set<string>();
    const normalizedTiers = session.tiers.map((tier) => {
      const normalizedTierName = normalizeLifecycleText(tier.name);

      if (seenTierNames.has(normalizedTierName)) {
        throw new BadRequestException('同一场次下区域票档名称不能重复。');
      }

      seenTierNames.add(normalizedTierName);

      if (
        tier.refundDeadlineAt !== undefined &&
        tier.refundDeadlineAt !== null &&
        compareLifecycleDates(tier.refundDeadlineAt, session.startsAt) > 0
      ) {
        throw new BadRequestException('退款截止时间不能晚于场次开始时间。');
      }

      minPrice = Math.min(minPrice, tier.price);
      refundEntryEnabled = refundEntryEnabled || tier.refundable;

      return {
        inventory: tier.inventory,
        name: normalizedTierName,
        price: tier.price,
        purchaseLimit: tier.purchaseLimit,
        refundable: tier.refundable,
        refundDeadlineAt: toLifecycleIso(tier.refundDeadlineAt),
        requiresRealName: tier.requiresRealName,
        sortOrder: tier.sortOrder,
        ticketType: tier.ticketType,
      };
    });

    const normalizedSession = {
      endsAt: toLifecycleIso(session.endsAt),
      name: normalizeLifecycleText(session.name),
      saleEndsAt: toLifecycleIso(session.saleEndsAt),
      saleStartsAt: toLifecycleIso(session.saleStartsAt),
      startsAt: normalizeRequiredDate(session.startsAt),
      tiers: normalizedTiers.sort(
        (left, right) =>
          left.sortOrder - right.sortOrder ||
          left.price - right.price ||
          left.name.localeCompare(right.name),
      ),
    };

    structureSessions.push(normalizedSession);
  }

  if (!Number.isFinite(minPrice)) {
    throw new BadRequestException('每个场次至少需要配置一个区域票档。');
  }

  return {
    minPrice,
    refundEntryEnabled,
    structure: {
      sessions: structureSessions.sort(
        (left, right) =>
          compareLifecycleDates(left.startsAt, right.startsAt) ||
          left.name.localeCompare(right.name),
      ),
    },
  };
}

function buildEventStructure(source: EventLifecycleSource) {
  return {
    sessions: source.sessions
      .map((session) => ({
        endsAt: toLifecycleIso(session.endsAt),
        name: normalizeLifecycleText(session.name),
        saleEndsAt: toLifecycleIso(session.saleEndsAt),
        saleStartsAt: toLifecycleIso(session.saleStartsAt),
        startsAt: normalizeRequiredDate(session.startsAt),
        tiers: session.tiers
          .map((tier) => ({
            inventory: tier.inventory,
            name: normalizeLifecycleText(tier.name),
            price: tier.price,
            purchaseLimit: tier.purchaseLimit,
            refundable: tier.refundable,
            refundDeadlineAt: toLifecycleIso(tier.refundDeadlineAt),
            requiresRealName: tier.requiresRealName,
            sortOrder: tier.sortOrder,
            ticketType: tier.ticketType,
          }))
          .sort(
            (left, right) =>
              left.sortOrder - right.sortOrder ||
              left.price - right.price ||
              left.name.localeCompare(right.name),
          ),
      }))
      .sort(
        (left, right) =>
          compareLifecycleDates(left.startsAt, right.startsAt) ||
          left.name.localeCompare(right.name),
      ),
  };
}

function buildCurrentEventLifecycleSource(event: PrismaAdminEvent): EventLifecycleSource {
  return {
    city: event.city,
    coverImageUrl: event.coverImageUrl,
    description: event.description,
    sessions:
      event.sessions?.map((session) => ({
        endsAt: session.endsAt,
        name: session.name,
        saleEndsAt: session.saleEndsAt,
        saleStartsAt: session.saleStartsAt,
        startsAt: session.startsAt,
        tiers: session.ticketTiers.map((tier) => ({
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
      })) ?? [],
    title: event.title,
    venueAddress: event.venueAddress,
    venueName: event.venueName,
  };
}

function buildInputEventLifecycleSource(
  input: AdminEventDraft | AdminEventEditor,
): EventLifecycleSource {
  return {
    city: input.city,
    coverImageUrl: input.coverImageUrl,
    description: input.description,
    sessions: input.sessions.map((session) => ({
      endsAt: session.endsAt,
      name: session.name,
      saleEndsAt: session.saleEndsAt,
      saleStartsAt: session.saleStartsAt,
      startsAt: session.startsAt,
      tiers: session.tiers.map((tier) => ({
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
    })),
    title: input.title,
    venueAddress: input.venueAddress,
    venueName: input.venueName,
  };
}

function hasDifferentEventStructure(
  currentEvent: PrismaAdminEvent,
  input: AdminEventDraft | AdminEventEditor,
) {
  const currentStructure = buildEventStructure(
    buildCurrentEventLifecycleSource(currentEvent),
  );

  const inputStructure = validateAndAnalyzeEventLifecycle(
    buildInputEventLifecycleSource(input),
    {
      requireBasicInfo: true,
      requireSaleWindows: false,
    },
  ).structure;

  return JSON.stringify(currentStructure) !== JSON.stringify(inputStructure);
}

function buildTierCreateData(tier: AdminRegionalTierDraft) {
  return {
    ...(tier.id === undefined ? {} : { id: tier.id }),
    inventory: tier.inventory,
    name: tier.name,
    price: tier.price,
    purchaseLimit: tier.purchaseLimit,
    refundable: tier.refundable,
    refundDeadlineAt:
      tier.refundDeadlineAt === undefined ? undefined : new Date(tier.refundDeadlineAt),
    requiresRealName: tier.requiresRealName,
    sortOrder: tier.sortOrder,
    ticketType: tier.ticketType,
  };
}

function buildSessionCreateData(session: AdminEventSessionDraft) {
  return {
    ...(session.id === undefined ? {} : { id: session.id }),
    endsAt: session.endsAt === undefined ? undefined : new Date(session.endsAt),
    name: session.name,
    saleEndsAt:
      session.saleEndsAt === undefined ? undefined : new Date(session.saleEndsAt),
    saleStartsAt:
      session.saleStartsAt === undefined ? undefined : new Date(session.saleStartsAt),
    startsAt: new Date(session.startsAt),
    ticketTiers: {
      create: session.tiers.map(buildTierCreateData),
    },
  };
}

function buildEventCreateData(input: AdminEventDraft) {
  const derived = validateAndAnalyzeEventLifecycle(
    buildInputEventLifecycleSource(input),
    {
      requireBasicInfo: true,
      requireSaleWindows: false,
    },
  );

  return {
    city: input.city,
    coverImageUrl: input.coverImageUrl,
    description: input.description,
    minPrice: derived.minPrice,
    published: false,
    refundEntryEnabled: derived.refundEntryEnabled,
    saleStatus: 'UPCOMING' as const,
    sessions: {
      create: input.sessions.map(buildSessionCreateData),
    },
    title: input.title,
    venueAddress: input.venueAddress,
    venueName: input.venueName,
  };
}

function buildEventUpdateData(input: AdminEventEditor) {
  const derived = validateAndAnalyzeEventLifecycle(
    buildInputEventLifecycleSource(input),
    {
      requireBasicInfo: true,
      requireSaleWindows: false,
    },
  );

  return {
    city: input.city,
    ...(input.coverImageUrl === undefined
      ? {}
      : { coverImageUrl: input.coverImageUrl }),
    ...(input.description === undefined ? {} : { description: input.description }),
    minPrice: derived.minPrice,
    refundEntryEnabled: derived.refundEntryEnabled,
    sessions: {
      create: input.sessions.map(buildSessionCreateData),
      deleteMany: {},
    },
    title: input.title,
    venueAddress: input.venueAddress,
    venueName: input.venueName,
  };
}

function buildEventMetadataOnlyUpdateData(input: AdminEventEditor) {
  const derived = validateAndAnalyzeEventLifecycle(
    buildInputEventLifecycleSource(input),
    {
      requireBasicInfo: true,
      requireSaleWindows: false,
    },
  );

  return {
    city: input.city,
    ...(input.coverImageUrl === undefined
      ? {}
      : { coverImageUrl: input.coverImageUrl }),
    ...(input.description === undefined ? {} : { description: input.description }),
    minPrice: derived.minPrice,
    refundEntryEnabled: derived.refundEntryEnabled,
    title: input.title,
    venueAddress: input.venueAddress,
    venueName: input.venueName,
  };
}

@Injectable()
export class AdminEventsService {
  constructor(private readonly prisma: PrismaService) {}

  private async loadEventForValidation(eventId: string) {
    const event = await this.prisma.event.findUnique({
      select: adminEventDetailSelect,
      where: {
        id: eventId,
      },
    });

    if (!event) {
      throw new NotFoundException('活动不存在。');
    }

    return event as PrismaAdminEvent;
  }

  async listEvents(): Promise<AdminEventListItem[]> {
    const events = await this.prisma.event.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
      select: adminEventListSelect,
    });

    return events.map(normalizeListItem);
  }

  async createEvent(input: AdminEventDraft): Promise<AdminEventEditor> {
    const event = await this.prisma.event.create({
      data: buildEventCreateData(input),
      select: adminEventDetailSelect,
    });

    return normalizeEvent(event as PrismaAdminEvent);
  }

  async updateEvent(
    eventId: string,
    input: AdminEventEditor,
  ): Promise<AdminEventEditor> {
    const currentEvent = await this.loadEventForValidation(eventId);
    const structureChanged = hasDifferentEventStructure(currentEvent, input);

    if (structureChanged) {
      const orderCount = await this.prisma.orderItem.count({
        where: {
          ticketTier: {
            session: {
              eventId,
            },
          },
        },
      });

      if (orderCount > 0) {
        throw new BadRequestException(
          '活动已有订单，暂不支持修改场次或区域票档。',
        );
      }
    }

    try {
      const data = structureChanged
        ? buildEventUpdateData(input)
        : buildEventMetadataOnlyUpdateData(input);

      const event = await this.prisma.event.update({
        data,
        select: adminEventDetailSelect,
        where: {
          id: eventId,
        },
      });

      return normalizeEvent(event as PrismaAdminEvent);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('活动不存在。');
      }

      throw error;
    }
  }

  async publishEvent(eventId: string): Promise<AdminEventEditor> {
    return this.updatePublicationState(eventId, true);
  }

  async unpublishEvent(eventId: string): Promise<AdminEventEditor> {
    return this.updatePublicationState(eventId, false);
  }

  private async updatePublicationState(
    eventId: string,
    published: boolean,
  ): Promise<AdminEventEditor> {
    const currentEvent = await this.loadEventForValidation(eventId);
    if (published) {
      validateAndAnalyzeEventLifecycle(
        buildCurrentEventLifecycleSource(currentEvent),
        {
          requireBasicInfo: true,
          requireSaleWindows: true,
        },
      );
    }

    try {
      const event = await this.prisma.event.update({
        data: {
          published,
        },
        select: adminEventDetailSelect,
        where: {
          id: eventId,
        },
      });

      return normalizeEvent(event as PrismaAdminEvent);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('活动不存在。');
      }

      throw error;
    }
  }
}
