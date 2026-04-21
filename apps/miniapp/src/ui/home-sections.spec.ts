import { describe, expect, it } from 'vitest';

import { buildHomeCollections } from './home-sections';

describe('buildHomeCollections', () => {
  it('splits events into hot sale and upcoming sections', () => {
    const result = buildHomeCollections([
      {
        city: 'Shanghai',
        id: '1',
        minPrice: 399,
        published: true,
        refundEntryEnabled: true,
        saleStatus: 'ON_SALE',
        title: 'A',
        venueName: 'Arena',
      },
      {
        city: 'Beijing',
        id: '2',
        minPrice: 299,
        published: true,
        refundEntryEnabled: true,
        saleStatus: 'UPCOMING',
        title: 'B',
        venueName: 'Dome',
      },
    ]);

    expect(result.hotSale).toHaveLength(1);
    expect(result.upcoming).toHaveLength(1);
  });
});
