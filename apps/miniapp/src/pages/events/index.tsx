import { View } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useState } from 'react';

import type { EventCatalogSummary } from '../../../../../packages/contracts/src';
import {
  AppBottomNav,
  EmptyState,
  PageHero,
  PageShell,
  PosterEventCard,
  PrimaryButton,
  SectionHeading,
  SurfaceCard,
} from '../../components/ui';
import { request } from '../../services/request';
import { formatCurrencyCny } from '../../ui/formatters';
import { getSaleStatusMeta } from '../../ui/status';

export default function EventsPage() {
  const [events, setEvents] = useState<EventCatalogSummary[]>([]);

  const loadEvents = async () => {
    try {
      const response = await request<{ items?: EventCatalogSummary[] }>({
        url: '/catalog/events',
      });

      setEvents(response.items ?? []);
    } catch {
      Taro.showToast({
        icon: 'none',
        title: '加载演出列表失败',
      });
    }
  };

  useDidShow(() => {
    void loadEvents();
  });

  return (
    <PageShell>
      <PageHero
        description='用单列大海报卡片流浏览平台内的全部活动，找票效率和官方质感同时成立。'
        eyebrow='Events'
        title='全部演出'
      >
        <View className='pill-row'>
          <View className='pill-row__item'>热卖中</View>
          <View className='pill-row__item'>即将开售</View>
          <View className='pill-row__item'>大型场馆</View>
          <View className='pill-row__item'>官方票务</View>
        </View>
      </PageHero>

      <SectionHeading
        description='优先让用户通过大图海报、时间地点和票档价格快速做出点击决策。'
        eyebrow='Discovery'
        title='演出列表'
      />

      {events.length === 0 ? (
        <SurfaceCard>
          <EmptyState
            description='当前还没有可浏览的演出，稍后回来刷新试试。'
            title='暂无演出'
          />
        </SurfaceCard>
      ) : (
        events.map((event) => (
          <PosterEventCard
            key={event.id}
            coverImageUrl={event.coverImageUrl}
            description={event.description ?? '查看场次、票档、购票须知与最新售卖状态。'}
            eyebrow={event.saleStatus === 'UPCOMING' ? '即将开售' : '平台在售'}
            footer={
              <PrimaryButton
                variant='secondary'
                onClick={() =>
                  Taro.navigateTo({
                    url: `/pages/event-detail/index?id=${event.id}`,
                  })
                }
              >
                进入详情
              </PrimaryButton>
            }
            metaLine={`${event.city} · ${event.venueName}`}
            secondaryMeta={`起售价格 ${formatCurrencyCny(event.minPrice)}`}
            statusMeta={getSaleStatusMeta(event.saleStatus)}
            title={event.title}
          />
        ))
      )}

      <AppBottomNav activeKey='events' />
    </PageShell>
  );
}
