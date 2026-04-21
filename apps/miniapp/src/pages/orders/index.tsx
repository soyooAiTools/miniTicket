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
import { formatCompactDateTime, formatCurrencyCny } from '../../ui/formatters';
import {
  buildOrderDashboard,
  getOrderTimelineMeta,
} from '../../ui/order-presenters';
import { getShowcaseOrders, shouldUseShowcaseContent } from '../../ui/showcase-data';
import { getOrderStatusMeta, getTicketTypeLabel } from '../../ui/status';

export default function OrdersPage() {
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
        title: '加载订单失败',
      });
    }
  };

  useDidShow(() => {
    void loadOrders();
  });

  const dashboard = buildOrderDashboard(orders);

  return (
    <PageShell>
      <PageHero title='订单' />

      <SurfaceCard>
        <View className='summary-grid'>
          <View className='summary-grid__item'>
            <Text className='summary-grid__label'>订单总数</Text>
            <Text className='summary-grid__value'>{dashboard.totalOrders}</Text>
          </View>
          <View className='summary-grid__item'>
            <Text className='summary-grid__label'>待处理</Text>
            <Text className='summary-grid__value'>{dashboard.pendingActionCount}</Text>
          </View>
          <View className='summary-grid__item'>
            <Text className='summary-grid__label'>可售后</Text>
            <Text className='summary-grid__value'>{dashboard.openAfterSalesCount}</Text>
          </View>
          <View className='summary-grid__item'>
            <Text className='summary-grid__label'>最近订单</Text>
            <Text className='summary-grid__value summary-grid__value--small'>
              {dashboard.latestOrderLabel}
            </Text>
          </View>
        </View>
      </SurfaceCard>

      <SectionHeading title='全部订单' />

      {orders.length === 0 ? (
        <SurfaceCard>
          <EmptyState
            action={
              <PrimaryButton
                onClick={() => {
                  void Taro.reLaunch({ url: '/pages/home/index' });
                }}
              >
                去看演出
              </PrimaryButton>
            }
            title='暂无订单'
          />
        </SurfaceCard>
      ) : (
        orders.map((order) => {
          const timelineMeta = getOrderTimelineMeta(order.status, order.ticketType);

          return (
            <SurfaceCard key={order.id}>
              <View className='stack-header'>
                <View className='stack-header__content'>
                  <Text className='stack-header__title'>{order.event.title}</Text>
                  <Text className='stack-header__meta'>{order.orderNumber}</Text>
                </View>
                <StatusChip meta={getOrderStatusMeta(order.status)} />
              </View>

              <View className='detail-list'>
                <View className='detail-list__row'>
                  <Text className='detail-list__label'>场馆</Text>
                  <Text className='detail-list__value'>
                    {order.event.city} · {order.event.venueName}
                  </Text>
                </View>
                <View className='detail-list__row'>
                  <Text className='detail-list__label'>票种</Text>
                  <Text className='detail-list__value'>
                    {getTicketTypeLabel(order.ticketType)}
                  </Text>
                </View>
                <View className='detail-list__row'>
                  <Text className='detail-list__label'>金额</Text>
                  <Text className='detail-list__value'>
                    {formatCurrencyCny(order.totalAmount)}
                  </Text>
                </View>
                <View className='detail-list__row'>
                  <Text className='detail-list__label'>下单时间</Text>
                  <Text className='detail-list__value'>
                    {formatCompactDateTime(order.createdAt)}
                  </Text>
                </View>
              </View>

              <View className='note-strip'>
                <Text className='note-strip__title'>{timelineMeta.title}</Text>
                <Text className='note-strip__description'>
                  {timelineMeta.description}
                </Text>
              </View>

              <View className='action-row'>
                <PrimaryButton
                  variant='secondary'
                  onClick={() =>
                    Taro.navigateTo({
                      url: `/pages/order-detail/index?id=${order.id}`,
                    })
                  }
                >
                  查看详情
                </PrimaryButton>
              </View>
            </SurfaceCard>
          );
        })
      )}

      <AppBottomNav activeKey='orders' />
    </PageShell>
  );
}
