import Taro, { useDidShow } from '@tarojs/taro';
import { useState } from 'react';

import type { EventCatalogSummary } from '../../../../../packages/contracts/src';
import {
  AppBottomNav,
  EmptyState,
  PageHero,
  PageShell,
  PosterEventCard,
  SurfaceCard,
} from '../../components/ui';
import { request } from '../../services/request';
import { buildHomeEventCardAction } from '../../ui/home-card-presenters';
import { buildHomeCollections } from '../../ui/home-sections';
import { formatCurrencyCny } from '../../ui/formatters';
import {
  getShowcaseEventCatalog,
  shouldUseShowcaseContent,
} from '../../ui/showcase-data';
import { getSaleStatusMeta } from '../../ui/status';

export default function HomePage() {
  const [events, setEvents] = useState<EventCatalogSummary[]>([]);

  const loadEvents = async () => {
    if (shouldUseShowcaseContent()) {
      setEvents(getShowcaseEventCatalog());
      return;
    }

    try {
      const response = await request<{ items?: EventCatalogSummary[] }>({
        url: '/catalog/events',
      });

      setEvents(response.items ?? []);
    } catch {
      Taro.showToast({
        icon: 'none',
        title: '加载演出失败',
      });
    }
  };

  useDidShow(() => {
    void loadEvents();
  });

  const { catalog } = buildHomeCollections(events);

  return (
    <PageShell>
      <PageHero title='演出' />

      {catalog.length === 0 ? (
        <SurfaceCard>
          <EmptyState title='暂无演出' />
        </SurfaceCard>
      ) : (
        catalog.map((event) => (
          (() => {
            const action = buildHomeEventCardAction(event, Taro.navigateTo);

            return (
              <PosterEventCard
                key={event.id}
                coverImageUrl={event.coverImageUrl}
                metaLine={`${event.city} · ${event.venueName}`}
                onClick={action.onNavigate}
                secondaryMeta={`起售 ${formatCurrencyCny(event.minPrice)}`}
                statusMeta={getSaleStatusMeta(event.saleStatus)}
                title={event.title}
              />
            );
          })()
        ))
      )}

      <AppBottomNav activeKey='home' />
    </PageShell>
  );
}
