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
        title: '缺少订单编号',
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
        title: '缺少订单编号',
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
          <EmptyState
            description='请从订单详情页进入售后申请。'
            title='缺少订单信息'
          />
        </SurfaceCard>
      </PageShell>
    );
  }

  return (
    <PageShell dense>
      <PageHero
        description='提前确认扣费规则、退款金额预估和售后原因，再提交申请。'
        eyebrow='After-sales'
        title='退款申请'
      >
        <View className='pill-row'>
          <View className='pill-row__item'>{orderDetail?.orderNumber ?? orderId}</View>
          {refundSummary ? <View className='pill-row__item'>{refundSummary.title}</View> : null}
        </View>
      </PageHero>

      <SurfaceCard>
        <SectionHeading
          description='先确认当前订单是否已经开放售后入口。'
          eyebrow='Eligibility'
          title='当前售后状态'
        />
        {refundSummary ? (
          <>
            <Text className='calendar-item__title'>{refundSummary.title}</Text>
            <Text className='calendar-item__meta'>{refundSummary.description}</Text>
          </>
        ) : (
          <Text className='calendar-item__meta'>正在同步订单售后状态。</Text>
        )}
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeading
          description='不同原因和演出开始时间，会影响服务费和退款金额。'
          eyebrow='Reason'
          title='申请原因'
        />
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

        <Text className='section-caption'>距开演剩余天数</Text>
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
          placeholder='请输入剩余天数'
          className='soft-input'
        />
        <Text className='calendar-item__meta'>
          若因身份信息错误且距开演 3 天内发起售后，会按规则扣除 20% 服务费。
        </Text>
      </SurfaceCard>

      <SurfaceCard muted>
        <SectionHeading
          description='计算结果会随着原因和时间变化实时刷新。'
          eyebrow='Preview'
          title='退款测算'
        />
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
