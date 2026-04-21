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
import { getOrderStatusMeta } from '../../ui/status';

export default function MePage() {
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
      <PageHero
        description='把观演人、订单、购票须知和隐私政策聚合成一个高效工具面板。'
        eyebrow='Me'
        title='我的'
      >
        <View className='pill-row'>
          <View className='pill-row__item'>{dashboard.totalOrders} 笔订单</View>
          <View className='pill-row__item'>{dashboard.pendingActionCount} 笔待处理</View>
        </View>
      </PageHero>

      <SurfaceCard>
        <SectionHeading
          description='个人中心不做社区感，而是优先服务购票后的高频操作。'
          eyebrow='Overview'
          title='账号概览'
        />
        <View className='summary-grid'>
          <View className='summary-grid__item'>
            <Text className='summary-grid__label'>最近订单</Text>
            <Text className='summary-grid__value summary-grid__value--small'>
              {dashboard.latestOrderLabel}
            </Text>
          </View>
          <View className='summary-grid__item'>
            <Text className='summary-grid__label'>可售后订单</Text>
            <Text className='summary-grid__value'>{dashboard.openAfterSalesCount}</Text>
          </View>
          <View className='summary-grid__item'>
            <Text className='summary-grid__label'>待处理</Text>
            <Text className='summary-grid__value'>{dashboard.pendingActionCount}</Text>
          </View>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          description='高频入口固定在第一屏即可触达。'
          eyebrow='Tools'
          title='常用工具'
        />
        <View className='toolbar-grid'>
          <View
            className='toolbar-grid__item'
            onClick={() => Taro.navigateTo({ url: '/pages/viewers/index' })}
          >
            <Text className='toolbar-grid__title'>观演人管理</Text>
            <Text className='toolbar-grid__description'>维护实名观演人资料</Text>
          </View>
          <View
            className='toolbar-grid__item'
            onClick={() => Taro.reLaunch({ url: '/pages/orders/index' })}
          >
            <Text className='toolbar-grid__title'>我的订单</Text>
            <Text className='toolbar-grid__description'>查看支付、出票和售后状态</Text>
          </View>
          <View
            className='toolbar-grid__item'
            onClick={() => Taro.navigateTo({ url: '/pages/policies/purchase/index' })}
          >
            <Text className='toolbar-grid__title'>购票须知</Text>
            <Text className='toolbar-grid__description'>查看实名、退款和出票规则</Text>
          </View>
          <View
            className='toolbar-grid__item'
            onClick={() => Taro.navigateTo({ url: '/pages/policies/privacy/index' })}
          >
            <Text className='toolbar-grid__title'>隐私政策</Text>
            <Text className='toolbar-grid__description'>了解信息使用与授权范围</Text>
          </View>
        </View>
      </SurfaceCard>

      <SurfaceCard muted>
        <SectionHeading
          description='最近一笔订单放在个人中心，方便用户快速回到履约状态。'
          eyebrow='Latest order'
          title='最近订单'
        />
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
                查看最近订单
              </PrimaryButton>
            </View>
          </>
        ) : (
          <EmptyState
            description='完成首次下单后，这里会展示最近订单和处理入口。'
            title='还没有订单记录'
          />
        )}
      </SurfaceCard>

      <AppBottomNav activeKey='me' />
    </PageShell>
  );
}
