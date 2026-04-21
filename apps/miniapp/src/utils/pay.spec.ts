import { beforeEach, describe, expect, it, vi } from 'vitest';

const requestPayment = vi.fn();

vi.mock('@tarojs/taro', () => ({
  default: {
    requestPayment,
  },
}));

describe('startWechatPay', () => {
  beforeEach(() => {
    requestPayment.mockReset();
    delete process.env.TARO_APP_MOCK_WECHAT_PAY;
  });

  it('delegates to Taro.requestPayment in real payment mode', async () => {
    requestPayment.mockResolvedValue({ errMsg: 'requestPayment:ok' });

    const { startWechatPay } = await import('./pay');

    await expect(
      startWechatPay({
        appId: 'wx-app-id',
        nonceStr: 'nonce',
        packageValue: 'prepay_id=wx123',
        paySign: 'signature',
        signType: 'RSA',
        timeStamp: '1713355200',
      }),
    ).resolves.toEqual({ errMsg: 'requestPayment:ok' });
    expect(requestPayment).toHaveBeenCalledWith({
      nonceStr: 'nonce',
      package: 'prepay_id=wx123',
      paySign: 'signature',
      signType: 'RSA',
      timeStamp: '1713355200',
    });
  });

  it('short-circuits payment in mock mode so local miniapp flows can continue', async () => {
    process.env.TARO_APP_MOCK_WECHAT_PAY = 'true';

    const { startWechatPay } = await import('./pay');

    await expect(
      startWechatPay({
        appId: 'wx-app-id',
        nonceStr: 'nonce',
        packageValue: 'prepay_id=wx123',
        paySign: 'signature',
        signType: 'RSA',
        timeStamp: '1713355200',
      }),
    ).resolves.toEqual({
      errMsg: 'requestPayment:ok',
      mock: true,
    });
    expect(requestPayment).not.toHaveBeenCalled();
  });
});
