import { Text, View } from '@tarojs/components';
import Taro, { useLoad } from '@tarojs/taro';
import { useState } from 'react';

import type { WechatPaymentIntent } from '../../../../../packages/contracts/src';
import {
  PageHero,
  PageShell,
  PrimaryButton,
  StickyActionBar,
  SurfaceCard,
} from '../../components/ui';
import { request } from '../../services/request';
import { startWechatPay } from '../../utils/pay';
import { type CheckoutParams, parseCheckoutParams } from './checkout-state';
import {
  clearStoredDraftOrderId,
  readStoredDraftOrderId,
  resolvePayableOrderId,
  writeStoredDraftOrderId,
} from './payment-session';

export default function CheckoutPage() {
  const [checkoutParams, setCheckoutParams] = useState<CheckoutParams | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payableOrderId, setPayableOrderId] = useState('');

  useLoad((params) => {
    const nextCheckoutParams = parseCheckoutParams(params ?? {});
    setCheckoutParams(nextCheckoutParams);
    setPayableOrderId(
      nextCheckoutParams ? readStoredDraftOrderId(nextCheckoutParams) : '',
    );

    if (!nextCheckoutParams) {
      clearStoredDraftOrderId();
      Taro.showToast({
        icon: 'none',
        title: '请先选择票档和观演人',
      });
    }
  });

  const handlePay = async () => {
    if (!checkoutParams) {
      Taro.showToast({
        icon: 'none',
        title: '缺少有效购票信息',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const createDraftOrder = async () => {
        const draftOrder = await request<{ id: string }>({
          data: {
            quantity: checkoutParams.quantity,
            ticketType: checkoutParams.ticketType,
            tierId: checkoutParams.tierId,
            viewerIds: checkoutParams.viewerIds,
          },
          method: 'POST',
          url: '/orders/draft',
        });

        setPayableOrderId(draftOrder.id);
        writeStoredDraftOrderId(checkoutParams, draftOrder.id);

        return draftOrder.id;
      };
      let orderId = await resolvePayableOrderId({
        createDraftOrder,
        currentOrderId: payableOrderId,
      });
      let paymentIntent: WechatPaymentIntent;

      try {
        paymentIntent = await request<WechatPaymentIntent>({
          data: {
            orderId,
          },
          method: 'POST',
          url: '/payments/wechat/intent',
        });
      } catch (error) {
        if (
          payableOrderId &&
          error instanceof Error &&
          error.message === 'Pending order not found.'
        ) {
          clearStoredDraftOrderId();
          setPayableOrderId('');
          orderId = await createDraftOrder();
          paymentIntent = await request<WechatPaymentIntent>({
            data: {
              orderId,
            },
            method: 'POST',
            url: '/payments/wechat/intent',
          });
        } else {
          throw error;
        }
      }

      await startWechatPay(paymentIntent);

      await Taro.navigateTo({
        url: `/pages/payment-result/index?orderId=${orderId}`,
      });
    } catch (error) {
      Taro.showToast({
        icon: 'none',
        title:
          error instanceof Error && error.message
            ? error.message
            : '支付发起失败',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell dense>
      <PageHero title='确认支付' />

      <SurfaceCard>
        <Text className='section-heading__title'>当前选择</Text>
        {checkoutParams ? (
          <View style={{ marginTop: '18px' }}>
            <Text className='calendar-item__meta'>
              观演人：已选 {checkoutParams.viewerIds.length} 位
            </Text>
            <Text className='calendar-item__meta'>
              数量：{checkoutParams.quantity} · 票种：
              {checkoutParams.ticketType === 'PAPER_TICKET' ? '纸质票' : '电子票'}
            </Text>
            {payableOrderId ? (
              <Text className='calendar-item__meta'>支付订单已生成</Text>
            ) : null}
          </View>
        ) : (
          <Text className='calendar-item__meta'>当前没有可支付信息</Text>
        )}
      </SurfaceCard>

      <SurfaceCard muted>
        <Text className='section-heading__title'>购票规则</Text>
        <Text className='calendar-item__meta'>
          下单前请确认观演人信息与证件一致。
        </Text>
        <Text className='calendar-item__meta'>
          售后入口以订单状态和活动规则为准。
        </Text>
      </SurfaceCard>

      <StickyActionBar>
        <PrimaryButton
          disabled={isSubmitting || !checkoutParams}
          loading={isSubmitting}
          onClick={() => {
            void handlePay();
          }}
        >
          {isSubmitting ? '正在发起支付' : payableOrderId ? '继续支付' : '立即支付'}
        </PrimaryButton>
      </StickyActionBar>
    </PageShell>
  );
}
