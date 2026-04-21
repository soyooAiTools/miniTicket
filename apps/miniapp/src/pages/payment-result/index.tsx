import { Text, View } from '@tarojs/components';
import Taro, { useLoad, useUnload } from '@tarojs/taro';
import { useRef, useState } from 'react';

import type { OrderDetail, OrderStatus } from '../../../../../packages/contracts/src';
import {
  PageHero,
  PageShell,
  PrimaryButton,
  StatusChip,
  StickyActionBar,
  SurfaceCard,
} from '../../components/ui';
import { request } from '../../services/request';
import { clearStoredDraftOrderId } from '../checkout/payment-session';
import { waitForOrderProcessing } from './polling';
import {
  resolvePaymentResultRedirectUrl,
  schedulePaymentResultRedirect,
} from './redirect';
import { getPaymentResultMeta } from '../../ui/order-presenters';
import { getOrderStatusMeta } from '../../ui/status';

export default function PaymentResultPage() {
  const [orderId, setOrderId] = useState('');
  const [paymentStatus, setPaymentStatus] =
    useState<OrderStatus>('PENDING_PAYMENT');
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const isDisposedRef = useRef(false);

  useLoad((params) => {
    const nextOrderId = (params?.orderId ?? '').trim();
    setOrderId(nextOrderId);

    if (!nextOrderId) {
      return;
    }

    void waitForOrderProcessing({
      loadOrder: (targetOrderId) =>
        request<OrderDetail>({
          url: `/orders/${targetOrderId}`,
        }),
      maxAttempts: 6,
      orderId: nextOrderId,
    })
      .then((result) => {
        if (isDisposedRef.current) {
          return;
        }

        setPaymentStatus(result.status as OrderStatus);

        if (!result.ready) {
          return;
        }

        clearStoredDraftOrderId();
        redirectTimerRef.current = schedulePaymentResultRedirect({
          delayMs: 300,
          navigate: (url) => {
            void Taro.navigateTo({ url });
          },
          orderId: nextOrderId,
        });
      })
      .catch(() => {
        if (isDisposedRef.current) {
          return;
        }

        Taro.showToast({
          icon: 'none',
          title: '支付状态确认中，请稍后查看订单',
        });
      });
  });

  useUnload(() => {
    isDisposedRef.current = true;

    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
    }
  });

  const paymentMeta = getPaymentResultMeta(paymentStatus);

  return (
    <PageShell dense>
      <PageHero
        meta={<Text className='calendar-item__meta'>{orderId || '未获取订单号'}</Text>}
        title={paymentMeta.title}
      />

      <SurfaceCard>
        <View className='stack-header'>
          <View className='stack-header__content'>
            <Text className='stack-header__title'>{paymentMeta.title}</Text>
            <Text className='stack-header__meta'>{paymentMeta.description}</Text>
          </View>
          <StatusChip meta={getOrderStatusMeta(paymentStatus)} />
        </View>
      </SurfaceCard>

      <SurfaceCard muted>
        <View className='detail-list'>
          <View className='detail-list__row'>
            <Text className='detail-list__label'>订单号</Text>
            <Text className='detail-list__value'>{orderId || '未获取订单号'}</Text>
          </View>
          <View className='detail-list__row'>
            <Text className='detail-list__label'>当前状态</Text>
            <Text className='detail-list__value'>
              {getOrderStatusMeta(paymentStatus).label}
            </Text>
          </View>
        </View>
      </SurfaceCard>

      <StickyActionBar>
        <PrimaryButton
          onClick={() =>
            Taro.navigateTo({
              url: resolvePaymentResultRedirectUrl(orderId),
            })
          }
        >
          查看订单详情
        </PrimaryButton>
      </StickyActionBar>
    </PageShell>
  );
}
