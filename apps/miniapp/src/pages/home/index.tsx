import { Text, View } from '@tarojs/components';
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
import { buildHomeCollections } from '../../ui/home-sections';
import { formatCurrencyCny } from '../../ui/formatters';
import { getSaleStatusMeta } from '../../ui/status';

export default function HomePage() {
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
        title: '加载演出失败',
      });
    }
  };

  useDidShow(() => {
    void loadEvents();
  });

  const { hotSale, ranking, saleCalendar, upcoming } = buildHomeCollections(events);

  return (
    <PageShell>
      <PageHero
        description='一眼看到平台正在热卖、即将开售和值得优先决策的热门演出。'
        eyebrow='MiniTicket'
        title='官方票务平台'
      >
        <View className='pill-row'>
          <View className='pill-row__item'>多场活动同屏管理</View>
          <View className='pill-row__item'>官方票务链路</View>
          <View className='pill-row__item'>实名购票</View>
          <View className='pill-row__item'>售后规则透明</View>
        </View>
      </PageHero>

      <SectionHeading
        description='优先展示现在就能进入购票链路的热卖场次。'
        eyebrow='Hot sale'
        title='正在热卖'
      />
      {hotSale.length === 0 ? (
        <SurfaceCard>
          <EmptyState
            description='当前还没有热卖中的演出，稍后刷新看看新的上架场次。'
            title='暂无热卖演出'
          />
        </SurfaceCard>
      ) : (
        hotSale.map((event) => (
          <PosterEventCard
            key={event.id}
            coverImageUrl={event.coverImageUrl}
            description={event.description ?? '已同步该场次的官方票务信息和售卖状态。'}
            eyebrow={event.city}
            footer={
              <PrimaryButton
                onClick={() =>
                  Taro.navigateTo({
                    url: `/pages/event-detail/index?id=${event.id}`,
                  })
                }
              >
                查看详情
              </PrimaryButton>
            }
            metaLine={`${event.city} · ${event.venueName}`}
            secondaryMeta={`起售价格 ${formatCurrencyCny(event.minPrice)}`}
            statusMeta={getSaleStatusMeta(event.saleStatus)}
            title={event.title}
          />
        ))
      )}

      <SurfaceCard>
        <SectionHeading
          description='提前看清近期平台的开售节奏，方便安排提醒和抢票准备。'
          eyebrow='Calendar'
          title='开售日历'
        />
        {saleCalendar.length === 0 ? (
          <EmptyState
            description='暂时没有新的待开售场次。'
            title='暂无开售提醒'
          />
        ) : (
          saleCalendar.map((event) => (
            <View key={event.id} className='calendar-item'>
              <Text className='calendar-item__title'>{event.title}</Text>
              <Text className='calendar-item__meta'>
                {event.city} · {event.venueName} · 即将开售
              </Text>
            </View>
          ))
        )}
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          description='帮助用户先锁定当前平台关注度最高的场次。'
          eyebrow='Ranking'
          title='热门榜单'
        />
        {ranking.length === 0 ? (
          <EmptyState
            description='榜单会随着热卖场次自动更新。'
            title='暂无榜单数据'
          />
        ) : (
          <View className='rank-list'>
            {ranking.map((event, index) => (
              <View key={event.id} className='rank-list__item'>
                <Text className='rank-list__index'>{index + 1}</Text>
                <View>
                  <Text className='calendar-item__title'>{event.title}</Text>
                  <Text className='calendar-item__meta'>
                    {event.city} · {formatCurrencyCny(event.minPrice)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </SurfaceCard>

      <SurfaceCard muted>
        <SectionHeading
          description='先浏览还未开售的场次，决定是否提前准备观演人信息。'
          eyebrow='Upcoming'
          title='即将开售'
        />
        {upcoming.length === 0 ? (
          <EmptyState
            description='近期没有新的待开售场次。'
            title='暂无即将开售演出'
          />
        ) : (
          upcoming.map((event) => (
            <View key={event.id} className='calendar-item'>
              <Text className='calendar-item__title'>{event.title}</Text>
              <Text className='calendar-item__meta'>
                {event.city} · {event.venueName} · 起售价格 {formatCurrencyCny(event.minPrice)}
              </Text>
            </View>
          ))
        )}
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          description='核心入口保持清晰，方便快速返回找票和处理订单。'
          eyebrow='Quick access'
          title='快捷入口'
        />
        <View className='toolbar-grid'>
          <View
            className='toolbar-grid__item'
            onClick={() => Taro.reLaunch({ url: '/pages/events/index' })}
          >
            <Text className='toolbar-grid__title'>全部演出</Text>
            <Text className='toolbar-grid__description'>进入平台完整的演出卡片流</Text>
          </View>
          <View
            className='toolbar-grid__item'
            onClick={() => Taro.reLaunch({ url: '/pages/orders/index' })}
          >
            <Text className='toolbar-grid__title'>订单中心</Text>
            <Text className='toolbar-grid__description'>查看支付、出票和售后状态</Text>
          </View>
        </View>
      </SurfaceCard>

      <AppBottomNav activeKey='home' />
    </PageShell>
  );
}
