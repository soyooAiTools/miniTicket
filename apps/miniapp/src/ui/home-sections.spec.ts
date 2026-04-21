import { describe, expect, it } from 'vitest';

import { buildHomeCollections } from './home-sections';

describe('buildHomeCollections', () => {
  it('orders the main catalog by sale priority and price', () => {
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
      {
        city: 'Shenzhen',
        id: '3',
        minPrice: 699,
        published: true,
        refundEntryEnabled: true,
        saleStatus: 'ON_SALE',
        title: 'C',
        venueName: 'Center',
      },
    ]);

    expect(result.catalog.map((item) => item.id)).toEqual(['3', '1', '2']);
    expect(result.hotSale).toHaveLength(2);
    expect(result.upcoming).toHaveLength(1);
  });
});
