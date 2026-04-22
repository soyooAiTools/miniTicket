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

function assertHasTiers(input: AdminEventDraft | AdminEventEditor) {
  if (input.sessions.some((session) => session.tiers.length === 0)) {
    throw new BadRequestException('每个场次至少需要配置一个区域票档。');
  }
}

function deriveEventFields(input: AdminEventDraft | AdminEventEditor) {
  const tiers = input.sessions.flatMap((session) => session.tiers);

  if (tiers.length === 0) {
    throw new BadRequestException('每个场次至少需要配置一个区域票档。');
  }

  return {
    minPrice: Math.min(...tiers.map((tier) => tier.price)),
    refundEntryEnabled: tiers.some((tier) => tier.refundable),
  };
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
  const derived = deriveEventFields(input);

  return {
    city: input.city,
    coverImageUrl: input.coverImageUrl,
    description: input.description,
    minPrice: derived.minPrice,
    published: input.published ?? false,
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
  const derived = deriveEventFields(input);

  return {
    city: input.city,
    ...(input.coverImageUrl === undefined
      ? {}
      : { coverImageUrl: input.coverImageUrl }),
    ...(input.description === undefined ? {} : { description: input.description }),
    minPrice: derived.minPrice,
    ...(input.published === undefined ? {} : { published: input.published }),
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

@Injectable()
export class AdminEventsService {
  constructor(private readonly prisma: PrismaService) {}

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
    assertHasTiers(input);

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
    assertHasTiers(input);

    try {
      const event = await this.prisma.event.update({
        data: buildEventUpdateData(input),
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
