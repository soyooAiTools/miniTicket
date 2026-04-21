import { Input, Text, View } from '@tarojs/components';
import Taro, { useDidShow, useLoad, useRouter } from '@tarojs/taro';
import { useState } from 'react';

import type { OrderDetail } from '../../../../../packages/contracts/src';
import {
  EmptyState,
  PageHero,
  PageShell,
  PrimaryButton,
  SectionHeading,
  StickyActionBar,
  SurfaceCard,
} from '../../components/ui';
import { request } from '../../services/request';
import { formatCurrencyCny } from '../../ui/formatters';
import { getRefundEntrySummary } from '../../ui/order-presenters';

type RefundReasonCode = 'USER_IDENTITY_ERROR' | 'OTHER';

type RefundPreview = {
  refundAmount: number;
  serviceFee: number;
};

function parseDaysBeforeStart(value: string) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
}

export default function AfterSalesPage() {
  const router = useRouter();
  const [daysBeforeStartText, setDaysBeforeStartText] = useState('2');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
  const [preview, setPreview] = useState<RefundPreview | null>(null);
  const [reasonCode, setReasonCode] =
    useState<RefundReasonCode>('USER_IDENTITY_ERROR');

  const orderId = router.params?.orderId?.trim() ?? '';
  const daysBeforeStart = parseDaysBeforeStart(daysBeforeStartText);

  const refreshPreview = async (
    nextReasonCode: RefundReasonCode,
    nextDaysBeforeStart: number,
    totalAmount?: number,
  ) => {
    if (!totalAmount) {
      setPreview(null);
      return;
    }

    try {
      const result = await request<RefundPreview>({
        data: {
          daysBeforeStart: nextDaysBeforeStart,
          reasonCode: nextReasonCode,
          totalAmount,
        },
        method: 'POST',
        url: '/refunds/calculate',
      });

      setPreview(result);
    } catch {
      setPreview(null);
    }
  };

  useLoad(() => {
    if (!orderId) {
      Taro.showToast({
        icon: 'none',
        title: '缺少订单号',
      });
    }
  });

  useDidShow(() => {
    if (!orderId) {
      return;
    }

    void request<OrderDetail>({
      url: `/orders/${orderId}`,
    })
      .then((result) => {
        setOrderDetail(result);
        return refreshPreview(reasonCode, daysBeforeStart, result.totalAmount);
      })
      .catch(() => {
        Taro.showToast({
          icon: 'none',
          title: '订单加载失败',
        });
      });
  });

  const refundSummary = orderDetail
    ? getRefundEntrySummary({
        refundEntryEnabled: orderDetail.refundEntryEnabled,
        status: orderDetail.status,
      })
    : null;

  const handleSubmit = async () => {
    if (!orderId) {
      Taro.showToast({
        icon: 'none',
        title: '缺少订单号',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await request({
        data: {
          daysBeforeStart,
          orderId,
          reasonCode,
        },
        method: 'POST',
        url: '/refunds/request',
      });

      Taro.showToast({
        icon: 'success',
        title: '退款申请已提交',
      });

      setTimeout(() => {
        void Taro.redirectTo({
          url: `/pages/order-detail/index?id=${orderId}`,
        });
      }, 300);
    } catch (error) {
      Taro.showToast({
        icon: 'none',
        title:
          error instanceof Error && error.message
            ? error.message
            : '退款申请提交失败',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!orderId) {
    return (
      <PageShell dense>
        <SurfaceCard>
          <EmptyState title='缺少订单信息' />
        </SurfaceCard>
      </PageShell>
    );
  }

  return (
    <PageShell dense>
      <PageHero
        meta={
          <Text className='calendar-item__meta'>{orderDetail?.orderNumber ?? orderId}</Text>
        }
        title='售后申请'
      />

      <SurfaceCard>
        <SectionHeading title='售后状态' />
        {refundSummary ? (
          <>
            <Text className='calendar-item__title'>{refundSummary.title}</Text>
            <Text className='calendar-item__meta'>{refundSummary.description}</Text>
          </>
        ) : (
          <Text className='calendar-item__meta'>订单状态同步中</Text>
        )}
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading title='退款原因' />
        <View className='selector-row'>
          <View
            className={
              reasonCode === 'USER_IDENTITY_ERROR'
                ? 'selector-chip selector-chip--active'
                : 'selector-chip'
            }
            onClick={() => {
              setReasonCode('USER_IDENTITY_ERROR');
              void refreshPreview(
                'USER_IDENTITY_ERROR',
                daysBeforeStart,
                orderDetail?.totalAmount,
              );
            }}
          >
            <Text className='selector-chip__label'>身份信息错误</Text>
          </View>
          <View
            className={
              reasonCode === 'OTHER'
                ? 'selector-chip selector-chip--active'
                : 'selector-chip'
            }
            onClick={() => {
              setReasonCode('OTHER');
              void refreshPreview('OTHER', daysBeforeStart, orderDetail?.totalAmount);
            }}
          >
            <Text className='selector-chip__label'>其他原因</Text>
          </View>
        </View>

        <Text className='section-caption'>距开演天数</Text>
        <Input
          type='number'
          value={daysBeforeStartText}
          onInput={(event) => {
            const nextValue = event.detail.value;
            setDaysBeforeStartText(nextValue);
            void refreshPreview(
              reasonCode,
              parseDaysBeforeStart(nextValue),
              orderDetail?.totalAmount,
            );
          }}
          placeholder='请输入天数'
          className='soft-input'
        />
        <Text className='calendar-item__meta'>
          身份信息错误且距开演 3 天内申请，将按规则扣除 20% 服务费。
        </Text>
      </SurfaceCard>

      <SurfaceCard muted>
        <SectionHeading title='退款测算' />
        <View className='summary-grid'>
          <View className='summary-grid__item'>
            <Text className='summary-grid__label'>原支付金额</Text>
            <Text className='summary-grid__value'>
              {orderDetail ? formatCurrencyCny(orderDetail.totalAmount) : '--'}
            </Text>
          </View>
          <View className='summary-grid__item'>
            <Text className='summary-grid__label'>服务费</Text>
            <Text className='summary-grid__value'>
              {preview ? formatCurrencyCny(preview.serviceFee) : '--'}
            </Text>
          </View>
          <View className='summary-grid__item'>
            <Text className='summary-grid__label'>预计退款</Text>
            <Text className='summary-grid__value'>
              {preview ? formatCurrencyCny(preview.refundAmount) : '--'}
            </Text>
          </View>
        </View>
      </SurfaceCard>

      <StickyActionBar>
        <PrimaryButton
          disabled={!refundSummary?.eligible || isSubmitting}
          loading={isSubmitting}
          onClick={() => {
            void handleSubmit();
          }}
        >
          {isSubmitting ? '提交中' : '提交退款申请'}
        </PrimaryButton>
      </StickyActionBar>
    </PageShell>
  );
}
