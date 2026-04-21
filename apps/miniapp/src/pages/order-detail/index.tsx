import { Text, View } from '@tarojs/components';
import Taro, { useDidShow, useRouter } from '@tarojs/taro';
import { useState } from 'react';

import type { OrderDetail } from '../../../../../packages/contracts/src';
import {
  EmptyState,
  PageHero,
  PageShell,
  PrimaryButton,
  SectionHeading,
  StatusChip,
  StickyActionBar,
  SurfaceCard,
} from '../../components/ui';
import { request } from '../../services/request';
import { formatCompactDateTime, formatCurrencyCny } from '../../ui/formatters';
import {
  getOrderTimelineMeta,
  getRefundEntrySummary,
} from '../../ui/order-presenters';
import {
  getShowcaseOrderDetail,
  shouldUseShowcaseContent,
} from '../../ui/showcase-data';
import { getOrderStatusMeta, getTicketTypeLabel } from '../../ui/status';

export default function OrderDetailPage() {
  const router = useRouter();
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);

  useDidShow(() => {
    const orderId = router.params?.id;

    if (shouldUseShowcaseContent()) {
      setOrderDetail(getShowcaseOrderDetail(orderId));
      return;
    }

    if (!orderId) {
      return;
    }

    void request<OrderDetail>({
      url: `/orders/${orderId}`,
    })
      .then(setOrderDetail)
      .catch(() => {
        Taro.showToast({
          icon: 'none',
          title: '订单加载失败',
        });
      });
  });

  if (!orderDetail) {
    return (
      <PageShell dense>
        <SurfaceCard>
          <EmptyState title='订单加载中' />
        </SurfaceCard>
      </PageShell>
    );
  }

  const refundSummary = getRefundEntrySummary({
    refundEntryEnabled: orderDetail.refundEntryEnabled,
    status: orderDetail.status,
  });
  const timelineMeta = getOrderTimelineMeta(orderDetail.status, orderDetail.ticketType);

  return (
    <PageShell dense>
      <PageHero title='订单详情' />

      <SurfaceCard>
        <View className='stack-header'>
          <View className='stack-header__content'>
            <Text className='stack-header__title'>{orderDetail.event.title}</Text>
            <Text className='stack-header__meta'>
              {orderDetail.event.city} · {orderDetail.event.venueName}
            </Text>
          </View>
          <StatusChip meta={getOrderStatusMeta(orderDetail.status)} />
        </View>

        <View className='detail-list'>
          <View className='detail-list__row'>
            <Text className='detail-list__label'>票种</Text>
            <Text className='detail-list__value'>
              {getTicketTypeLabel(orderDetail.ticketType)}
            </Text>
          </View>
          <View className='detail-list__row'>
            <Text className='detail-list__label'>创建时间</Text>
            <Text className='detail-list__value'>
              {formatCompactDateTime(orderDetail.createdAt)}
            </Text>
          </View>
          <View className='detail-list__row'>
            <Text className='detail-list__label'>订单金额</Text>
            <Text className='detail-list__value'>
              {formatCurrencyCny(orderDetail.totalAmount)}
            </Text>
          </View>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading title='票档明细' />
        {orderDetail.items.map((item) => (
          <View key={item.id} className='detail-ticket'>
            <Text className='detail-ticket__title'>
              {item.sessionName} · {item.tierName}
            </Text>
            <Text className='detail-ticket__meta'>
              {item.quantity} 张 · 单价 {formatCurrencyCny(item.unitPrice)} · 小计{' '}
              {formatCurrencyCny(item.totalAmount)}
            </Text>
            <Text className='detail-ticket__meta'>
              观演人 {item.viewer.name} · {item.viewer.mobile}
            </Text>
          </View>
        ))}
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading title='订单进度' />
        <View className='note-strip'>
          <Text className='note-strip__title'>{timelineMeta.title}</Text>
          <Text className='note-strip__description'>
            {timelineMeta.description}
          </Text>
        </View>
      </SurfaceCard>

      <SurfaceCard muted>
        <SectionHeading title='售后状态' />
        <Text className='calendar-item__title'>{refundSummary.title}</Text>
        <Text className='calendar-item__meta'>{refundSummary.description}</Text>
      </SurfaceCard>

      <StickyActionBar>
        <PrimaryButton
          variant={refundSummary.eligible ? 'primary' : 'secondary'}
          onClick={() => {
            if (refundSummary.eligible) {
              void Taro.navigateTo({
                url: `/pages/after-sales/index?orderId=${orderDetail.id}`,
              });
              return;
            }

            void Taro.navigateTo({
              url: '/pages/orders/index',
            });
          }}
        >
          {refundSummary.ctaLabel}
        </PrimaryButton>
      </StickyActionBar>
    </PageShell>
  );
}
