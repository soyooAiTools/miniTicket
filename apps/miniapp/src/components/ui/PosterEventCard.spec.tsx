import React from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@tarojs/components', () => ({
  Image: 'image',
  Text: 'text',
  View: 'view',
}));

globalThis.React = React;

import { PosterEventCard } from './PosterEventCard';

describe('PosterEventCard', () => {
  it('renders the event information inside a dedicated poster info band', () => {
    const element = PosterEventCard({
      metaLine: '上海 · 梅赛德斯-奔驰文化中心',
      secondaryMeta: '起售 ¥580',
      statusMeta: {
        label: '热卖中',
        tone: 'accent',
      },
      title: 'Aurora Arena 巡回演唱会 上海站',
    });

    const rendered = JSON.stringify(element);

    expect(rendered).toContain('poster-card__info-band');
    expect(rendered).toContain('poster-card__title');
  });

  it('omits the description block when no description is provided', () => {
    const element = PosterEventCard({
      statusMeta: {
        label: '热卖中',
        tone: 'accent',
      },
      title: 'Aurora Arena 巡回演唱会 上海站',
    });

    expect(JSON.stringify(element)).not.toContain('poster-card__description');
  });
});
