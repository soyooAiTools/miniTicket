import { Text, View } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useState } from 'react';

import type { OrderListItem } from '../../../../../packages/contracts/src';
import {
  AppBottomNav,
  EmptyState,
  PageHero,
  PageShell,
  PrimaryButton,
  SectionHeading,
  StatusChip,
  SurfaceCard,
} from '../../components/ui';
import { request } from '../../services/request';
import { formatCompactDateTime } from '../../ui/formatters';
import { buildOrderDashboard } from '../../ui/order-presenters';
import { getShowcaseOrders, shouldUseShowcaseContent } from '../../ui/showcase-data';
import { getOrderStatusMeta } from '../../ui/status';

export default function MePage() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);

  const loadOrders = async () => {
    if (shouldUseShowcaseContent()) {
      setOrders(getShowcaseOrders());
      return;
    }

    try {
      const response = await request<{ items?: OrderListItem[] }>({
        url: '/orders/my',
      });

      setOrders(response.items ?? []);
    } catch {
      Taro.showToast({
        icon: 'none',
        title: '加载个人中心失败',
      });
    }
  };

  useDidShow(() => {
    void loadOrders();
  });

  const latestOrder = orders[0];
  const dashboard = buildOrderDashboard(orders);

  return (
    <PageShell>
      <PageHero title='我的' />

      <SurfaceCard>
        <View className='summary-grid'>
          <View className='summary-grid__item'>
            <Text className='summary-grid__label'>最近订单</Text>
            <Text className='summary-grid__value summary-grid__value--small'>
              {dashboard.latestOrderLabel}
            </Text>
          </View>
          <View className='summary-grid__item'>
            <Text className='summary-grid__label'>可售后</Text>
            <Text className='summary-grid__value'>{dashboard.openAfterSalesCount}</Text>
          </View>
          <View className='summary-grid__item'>
            <Text className='summary-grid__label'>待处理</Text>
            <Text className='summary-grid__value'>{dashboard.pendingActionCount}</Text>
          </View>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading title='常用入口' />
        <View className='toolbar-grid'>
          <View
            className='toolbar-grid__item'
            onClick={() => Taro.navigateTo({ url: '/pages/viewers/index' })}
          >
            <Text className='toolbar-grid__title'>观演人</Text>
          </View>
          <View
            className='toolbar-grid__item'
            onClick={() => Taro.reLaunch({ url: '/pages/orders/index' })}
          >
            <Text className='toolbar-grid__title'>订单</Text>
          </View>
          <View
            className='toolbar-grid__item'
            onClick={() => Taro.navigateTo({ url: '/pages/policies/purchase/index' })}
          >
            <Text className='toolbar-grid__title'>购票规则</Text>
          </View>
          <View
            className='toolbar-grid__item'
            onClick={() => Taro.navigateTo({ url: '/pages/policies/privacy/index' })}
          >
            <Text className='toolbar-grid__title'>隐私政策</Text>
          </View>
        </View>
      </SurfaceCard>

      <SurfaceCard muted>
        <SectionHeading title='最近订单' />
        {latestOrder ? (
          <>
            <View className='stack-header'>
              <View className='stack-header__content'>
                <Text className='stack-header__title'>{latestOrder.event.title}</Text>
                <Text className='stack-header__meta'>
                  {formatCompactDateTime(latestOrder.createdAt)}
                </Text>
              </View>
              <StatusChip meta={getOrderStatusMeta(latestOrder.status)} />
            </View>
            <View className='action-row'>
              <PrimaryButton
                variant='secondary'
                onClick={() =>
                  Taro.navigateTo({
                    url: `/pages/order-detail/index?id=${latestOrder.id}`,
                  })
                }
              >
                查看详情
              </PrimaryButton>
            </View>
          </>
        ) : (
          <EmptyState title='暂无订单' />
        )}
      </SurfaceCard>

      <AppBottomNav activeKey='me' />
    </PageShell>
  );
}
