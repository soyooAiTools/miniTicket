import { describe, expect, it } from 'vitest';

import { buildAppNavigation } from './navigation';

describe('buildAppNavigation', () => {
  it('marks the current key as active', () => {
    const items = buildAppNavigation('orders');

    expect(items.map((item) => item.key)).toEqual([
      'home',
      'events',
      'orders',
      'me',
    ]);
    expect(items.find((item) => item.key === 'orders')).toMatchObject({
      active: true,
      label: 'Orders',
      url: '/pages/orders/index',
    });
  });

  it('keeps other entries inactive', () => {
    const items = buildAppNavigation('home');

    expect(items.filter((item) => item.active)).toHaveLength(1);
    expect(items.find((item) => item.key === 'events')).toMatchObject({
      active: false,
    });
  });
});
