module.exports = {
  defineConstants: {
    'process.env.TARO_APP_API_BASE_URL': JSON.stringify(
      process.env.TARO_APP_API_BASE_URL ?? 'http://127.0.0.1:3100/api',
    ),
    'process.env.TARO_APP_MOCK_WECHAT_PAY': JSON.stringify(
      process.env.TARO_APP_MOCK_WECHAT_PAY ?? 'true',
    ),
  },
};
