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
import { buildOrderDashboard } from '../../ui/order-presenters';
import { getOrderStatusMeta, getTicketTypeLabel } from '../../ui/status';

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);

  const loadOrders = async () => {
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
      <PageHero
        description='集中查看支付结果、出票进度和售后入口，不需要在多个页面之间反复跳转。'
        eyebrow='Orders'
        title='订单中心'
      >
        <View className='pill-row'>
          <View className='pill-row__item'>{dashboard.totalOrders} 笔订单</View>
          <View className='pill-row__item'>{dashboard.pendingActionCount} 笔待处理</View>
          <View className='pill-row__item'>
            {dashboard.openAfterSalesCount} 笔可发起售后
          </View>
        </View>
      </PageHero>

      <SurfaceCard>
        <SectionHeading
          description='先看到最关键的数量变化，再进入具体订单。'
          eyebrow='Overview'
          title='当前概览'
        />
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
            <Text className='summary-grid__label'>可售后订单</Text>
            <Text className='summary-grid__value'>{dashboard.openAfterSalesCount}</Text>
          </View>
          <View className='summary-grid__item'>
            <Text className='summary-grid__label'>最近一笔</Text>
            <Text className='summary-grid__value summary-grid__value--small'>
              {dashboard.latestOrderLabel}
            </Text>
          </View>
        </View>
      </SurfaceCard>

      <SectionHeading
        description='订单以高信息密度卡片呈现，直接给出状态、时间和后续动作。'
        eyebrow='List'
        title='订单列表'
      />

      {orders.length === 0 ? (
        <SurfaceCard>
          <EmptyState
            action={
              <PrimaryButton
                onClick={() => {
                  void Taro.reLaunch({ url: '/pages/events/index' });
                }}
              >
                去看演出
              </PrimaryButton>
            }
            description='还没有同步到订单数据，先去浏览演出并完成一次下单流程。'
            title='暂无订单'
          />
        </SurfaceCard>
      ) : (
        orders.map((order) => (
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
                  {getTicketTypeLabel(order.ticketType)} · {formatCurrencyCny(order.totalAmount)}
                </Text>
              </View>
              <View className='detail-list__row'>
                <Text className='detail-list__label'>创建时间</Text>
                <Text className='detail-list__value'>
                  {formatCompactDateTime(order.createdAt)}
                </Text>
              </View>
            </View>

            <View className='note-strip'>
              <Text className='note-strip__title'>{order.timeline.title}</Text>
              <Text className='note-strip__description'>{order.timeline.description}</Text>
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
                查看订单
              </PrimaryButton>
            </View>
          </SurfaceCard>
        ))
      )}

      <AppBottomNav activeKey='orders' />
    </PageShell>
  );
}
