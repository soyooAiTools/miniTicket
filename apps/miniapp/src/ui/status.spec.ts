import { describe, expect, it } from 'vitest';

import { getOrderStatusMeta, getSaleStatusMeta } from './status';

describe('status meta', () => {
  it('maps on-sale status to a highlighted meta object', () => {
    expect(getSaleStatusMeta('ON_SALE')).toMatchObject({
      tone: 'accent',
      label: '热卖中',
    });
  });

  it('maps pending fulfillment orders to trust-oriented copy', () => {
    expect(getOrderStatusMeta('PAID_PENDING_FULFILLMENT')).toMatchObject({
      tone: 'info',
      label: '待出票',
    });
  });
});
