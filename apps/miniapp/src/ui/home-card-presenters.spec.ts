import type { EventCatalogSummary } from '../../../../../packages/contracts/src';
import { describe, expect, it, vi } from 'vitest';

import { buildHomeEventCardAction } from './home-card-presenters';

const baseEvent: EventCatalogSummary = {
  city: '上海',
  coverImageUrl: undefined,
  id: 'event-aurora',
  minPrice: 580,
  saleStatus: 'ON_SALE',
  title: 'Aurora Arena 巡回演唱会 上海站',
  venueName: '梅赛德斯-奔驰文化中心',
};

describe('buildHomeEventCardAction', () => {
  it('navigates to the event detail page for the whole card interaction', () => {
    const navigate = vi.fn();
    const action = buildHomeEventCardAction(baseEvent, navigate);

    action.onNavigate();

    expect(action.detailUrl).toBe('/pages/event-detail/index?id=event-aurora');
    expect(navigate).toHaveBeenCalledWith({
      url: '/pages/event-detail/index?id=event-aurora',
    });
  });
});
