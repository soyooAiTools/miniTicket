import Taro from '@tarojs/taro';

import type { WechatPaymentIntent } from '../../../../packages/contracts/src';

export function startWechatPay({
  timeStamp,
  nonceStr,
  packageValue,
  signType,
  paySign,
}: WechatPaymentIntent) {
  if (process.env.TARO_APP_MOCK_WECHAT_PAY === 'true') {
    return Promise.resolve({
      errMsg: 'requestPayment:ok',
      mock: true,
    });
  }

  return Taro.requestPayment({
    timeStamp,
    nonceStr,
    package: packageValue,
    signType,
    paySign,
  });
}
