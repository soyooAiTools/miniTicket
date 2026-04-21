import { describe, expect, it } from 'vitest';

import {
  getShowcaseEventCatalog,
  getShowcaseEventDetail,
  getShowcaseOrderDetail,
  getShowcaseOrders,
  shouldUseShowcaseContent,
} from './showcase-data';

describe('showcase data', () => {
  it('provides enough event density for the discovery screen', () => {
    const events = getShowcaseEventCatalog();

    expect(events.length).toBeGreaterThanOrEqual(6);
    expect(new Set(events.map((event) => event.city)).size).toBeGreaterThanOrEqual(4);
    expect(
      events.filter((event) => event.saleStatus === 'ON_SALE').length,
    ).toBeGreaterThanOrEqual(3);
    expect(
      events.filter((event) => event.saleStatus === 'UPCOMING').length,
    ).toBeGreaterThanOrEqual(2);
    expect(events.every((event) => Boolean(event.description))).toBe(true);
  });

  it('keeps event and order detail views connected to list records', () => {
    const [firstEvent] = getShowcaseEventCatalog();
    const eventDetail = getShowcaseEventDetail(firstEvent.id);
    const [firstOrder] = getShowcaseOrders();
    const orderDetail = getShowcaseOrderDetail(firstOrder.id);

    expect(eventDetail.title).toBe(firstEvent.title);
    expect(eventDetail.sessions.length).toBeGreaterThanOrEqual(2);
    expect(eventDetail.sessions[0]?.ticketTiers.length).toBeGreaterThanOrEqual(2);
    expect(orderDetail.orderNumber).toBe(firstOrder.orderNumber);
    expect(orderDetail.items.length).toBeGreaterThanOrEqual(1);
    expect(orderDetail.items[0]?.viewer.name.length).toBeGreaterThanOrEqual(2);
  });

  it('respects the showcase-mode environment switch', () => {
    process.env.TARO_APP_SHOWCASE_DATA = 'true';
    expect(shouldUseShowcaseContent()).toBe(true);

    process.env.TARO_APP_SHOWCASE_DATA = 'false';
    expect(shouldUseShowcaseContent()).toBe(false);
  });
});
