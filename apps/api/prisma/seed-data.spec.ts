import { describe, expect, it } from '@jest/globals';

import { ticketingDemoSeed } from './seed-data';

describe('ticketingDemoSeed', () => {
  it('defines a published on-sale event with one session and two ticket tiers for local miniapp testing', () => {
    expect(ticketingDemoSeed.event).toMatchObject({
      city: 'Shanghai',
      id: 'seed-event-beta-shanghai',
      minPrice: 399,
      published: true,
      refundEntryEnabled: true,
      saleStatus: 'ON_SALE',
      title: 'Beta Livehouse Night',
      venueName: 'West Bund Arena',
    });
    expect(ticketingDemoSeed.sessions).toHaveLength(1);
    expect(ticketingDemoSeed.sessions[0]).toMatchObject({
      eventId: 'seed-event-beta-shanghai',
      id: 'seed-session-beta-night-1',
      name: '2026-05-01 19:30',
    });
    expect(ticketingDemoSeed.ticketTiers).toEqual([
      expect.objectContaining({
        id: 'seed-tier-beta-vip',
        inventory: 120,
        price: 799,
        ticketType: 'E_TICKET',
      }),
      expect.objectContaining({
        id: 'seed-tier-beta-standard',
        inventory: 360,
        price: 399,
        ticketType: 'E_TICKET',
      }),
    ]);
  });
});
