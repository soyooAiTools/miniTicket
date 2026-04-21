import { PrismaClient } from '@prisma/client';

import { ticketingDemoSeed } from './seed-data';

async function main() {
  const prisma = new PrismaClient();

  try {
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
          sessionId: tier.sessionId,
          ticketType: tier.ticketType,
        },
      });
    }

    console.log(
      `Seeded event ${ticketingDemoSeed.event.id} with ${ticketingDemoSeed.ticketTiers.length} ticket tiers.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
