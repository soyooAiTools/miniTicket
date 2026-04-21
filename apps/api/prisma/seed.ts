import { createHash, scryptSync } from 'node:crypto';
import { PrismaClient } from '@prisma/client';

import { adminUserSeed, ticketingDemoSeed } from './seed-data';

function hashPassword(password: string, seed: string) {
  const salt = createHash('sha256')
    .update(`admin-seed:${seed}`)
    .digest('hex')
    .slice(0, 32);
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  const prisma = new PrismaClient();

  try {
    for (const user of adminUserSeed) {
      await prisma.user.upsert({
        where: {
          email: user.email,
        },
        create: {
          email: user.email,
          enabled: true,
          id: user.id,
          name: user.name,
          passwordHash: hashPassword(user.password, user.id),
          role: user.role,
        },
        update: {
          enabled: true,
          name: user.name,
          passwordHash: hashPassword(user.password, user.id),
          role: user.role,
        },
      });
    }

    await prisma.event.upsert({
      where: {
        id: ticketingDemoSeed.event.id,
      },
      create: ticketingDemoSeed.event,
      update: {
        city: ticketingDemoSeed.event.city,
        coverImageUrl: ticketingDemoSeed.event.coverImageUrl,
        description: ticketingDemoSeed.event.description,
        minPrice: ticketingDemoSeed.event.minPrice,
        published: ticketingDemoSeed.event.published,
        refundEntryEnabled: ticketingDemoSeed.event.refundEntryEnabled,
        saleStatus: ticketingDemoSeed.event.saleStatus,
        title: ticketingDemoSeed.event.title,
        venueAddress: ticketingDemoSeed.event.venueAddress,
        venueName: ticketingDemoSeed.event.venueName,
      },
    });

    for (const session of ticketingDemoSeed.sessions) {
      await prisma.eventSession.upsert({
        where: {
          id: session.id,
        },
        create: session,
        update: {
          endsAt: session.endsAt,
          eventId: session.eventId,
          name: session.name,
          saleEndsAt: session.saleEndsAt,
          saleStartsAt: session.saleStartsAt,
          startsAt: session.startsAt,
        },
      });
    }

    for (const tier of ticketingDemoSeed.ticketTiers) {
      await prisma.ticketTier.upsert({
        where: {
          id: tier.id,
        },
        create: tier,
        update: {
          inventory: tier.inventory,
          name: tier.name,
          price: tier.price,
          purchaseLimit: tier.purchaseLimit,
          refundDeadlineAt: tier.refundDeadlineAt,
          refundable: tier.refundable,
          requiresRealName: tier.requiresRealName,
          sessionId: tier.sessionId,
          sortOrder: tier.sortOrder,
          ticketType: tier.ticketType,
        },
      });
    }

    console.log(
      `Seeded ${adminUserSeed.length} admin users, event ${ticketingDemoSeed.event.id}, and ${ticketingDemoSeed.ticketTiers.length} ticket tiers.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
